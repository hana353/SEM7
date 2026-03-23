const sql = require("mssql");

const dbConfig = {
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "12345",
  server: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_NAME || "SEM7",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise = null;

async function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig);
  }
  return poolPromise;
}

function quoteIdentifier(name) {
  return `[${String(name).replace(/]/g, "]]")}]`;
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function isValidTableName(name) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

function parseSelectColumns(columns) {
  if (!columns || columns.trim() === "*" || columns.includes("*")) {
    return { raw: "*", fields: null, includeRoleCode: false };
  }

  const compact = columns.replace(/\s+/g, " ").trim();
  const includeRoleCode = /roles:role_id\s*\(\s*code\s*\)/i.test(compact);

  const base = compact
    .replace(/roles:role_id\s*\(\s*code\s*\)/gi, "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  return {
    raw: compact,
    fields: base.length ? base : null,
    includeRoleCode,
  };
}

class QueryBuilder {
  constructor(tableName) {
    if (!isValidTableName(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`);
    }

    this.tableName = tableName;
    this.action = "select";
    this.selectColumns = "*";
    this.selectOptions = {};
    this.filters = [];
    this.orders = [];
    this.limitValue = null;
    this.rangeValue = null;
    this.payload = null;
    this.expectation = null;
  }

  select(columns = "*", options = {}) {
    this.action = "select";
    this.selectColumns = columns;
    this.selectOptions = options || {};
    return this;
  }

  insert(payload) {
    this.action = "insert";
    this.payload = payload;
    return this;
  }

  update(payload) {
    this.action = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.action = "delete";
    return this;
  }

  eq(column, value) {
    this.filters.push({ type: "eq", column, value });
    return this;
  }

  neq(column, value) {
    this.filters.push({ type: "neq", column, value });
    return this;
  }

  gte(column, value) {
    this.filters.push({ type: "gte", column, value });
    return this;
  }

  lt(column, value) {
    this.filters.push({ type: "lt", column, value });
    return this;
  }

  in(column, values) {
    this.filters.push({ type: "in", column, value: values });
    return this;
  }

  order(column, options = {}) {
    this.orders.push({
      column,
      ascending: options.ascending !== false,
    });
    return this;
  }

  limit(value) {
    this.limitValue = Number(value);
    return this;
  }

  range(from, to) {
    this.rangeValue = { from: Number(from), to: Number(to) };
    return this;
  }

  single() {
    this.expectation = "single";
    return this;
  }

  maybeSingle() {
    this.expectation = "maybeSingle";
    return this;
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  buildWhere(request) {
    const clauses = [];
    let idx = 0;

    const addParam = (value) => {
      const name = `p${idx++}`;
      request.input(name, value);
      return `@${name}`;
    };

    for (const filter of this.filters) {
      const col = `t.${quoteIdentifier(filter.column)}`;

      if (filter.type === "eq") {
        if (filter.value === null) {
          clauses.push(`${col} IS NULL`);
        } else {
          clauses.push(`${col} = ${addParam(filter.value)}`);
        }
      }

      if (filter.type === "neq") {
        if (filter.value === null) {
          clauses.push(`${col} IS NOT NULL`);
        } else {
          clauses.push(`${col} <> ${addParam(filter.value)}`);
        }
      }

      if (filter.type === "gte") {
        clauses.push(`${col} >= ${addParam(filter.value)}`);
      }

      if (filter.type === "lt") {
        clauses.push(`${col} < ${addParam(filter.value)}`);
      }

      if (filter.type === "in") {
        const values = Array.isArray(filter.value) ? filter.value : [];
        if (!values.length) {
          clauses.push("1 = 0");
        } else {
          const params = values.map((v) => addParam(v));
          clauses.push(`${col} IN (${params.join(", ")})`);
        }
      }
    }

    return clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  }

  buildOrderBy() {
    const orders = [...this.orders];

    if (!orders.length && (this.limitValue != null || this.rangeValue)) {
      orders.push({ column: "created_at", ascending: false });
    }

    if (!orders.length) return "";

    const sqlOrder = orders
      .map((o) => `t.${quoteIdentifier(o.column)} ${o.ascending ? "ASC" : "DESC"}`)
      .join(", ");

    return `ORDER BY ${sqlOrder}`;
  }

  async executeSelect() {
    const pool = await getPool();
    const request = pool.request();

    const parsed = parseSelectColumns(this.selectColumns);
    const whereClause = this.buildWhere(request);
    const orderClause = this.buildOrderBy();

    const topClause =
      this.limitValue != null && this.rangeValue == null ? `TOP (${this.limitValue})` : "";

    let selectList = "*";
    if (parsed.fields?.length) {
      selectList = parsed.fields.map((f) => `t.${quoteIdentifier(f)}`).join(", ");
    }

    if (parsed.includeRoleCode && this.tableName === "users") {
      selectList += `${selectList ? ", " : ""}r.[code] AS [__role_code]`;
    }

    const joinRole =
      parsed.includeRoleCode && this.tableName === "users"
        ? "LEFT JOIN [roles] r ON r.[id] = t.[role_id]"
        : "";

    let paginationClause = "";
    if (this.rangeValue) {
      const offset = Math.max(0, this.rangeValue.from);
      const fetch = Math.max(0, this.rangeValue.to - this.rangeValue.from + 1);
      paginationClause = ` OFFSET ${offset} ROWS FETCH NEXT ${fetch} ROWS ONLY`;
    }

    if (this.selectOptions?.count === "exact") {
      const countSql = `
        SELECT COUNT(*) AS [total_count]
        FROM ${quoteIdentifier(this.tableName)} t
        ${joinRole}
        ${whereClause};
      `;

      const countResult = await request.query(countSql);
      const count = countResult.recordset?.[0]?.total_count ?? 0;

      if (this.selectOptions?.head === true) {
        return { data: null, error: null, count };
      }

      const dataSql = `
        SELECT ${topClause} ${selectList}
        FROM ${quoteIdentifier(this.tableName)} t
        ${joinRole}
        ${whereClause}
        ${orderClause}
        ${paginationClause};
      `;

      const result = await request.query(dataSql);
      return this.finalizeSelect(result.recordset || [], count, parsed);
    }

    const dataSql = `
      SELECT ${topClause} ${selectList}
      FROM ${quoteIdentifier(this.tableName)} t
      ${joinRole}
      ${whereClause}
      ${orderClause}
      ${paginationClause};
    `;

    const result = await request.query(dataSql);
    return this.finalizeSelect(result.recordset || [], result.recordset?.length || 0, parsed);
  }

  finalizeSelect(rows, count, parsed) {
    const mapped = rows.map((row) => {
      const item = { ...row };
      if (parsed.includeRoleCode && Object.prototype.hasOwnProperty.call(item, "__role_code")) {
        item.roles = item.__role_code ? { code: item.__role_code } : null;
        delete item.__role_code;
      }
      return clone(item);
    });

    if (this.expectation === "single") {
      if (!mapped.length) {
        return { data: null, error: { message: "No rows found" }, count: 0 };
      }
      return { data: mapped[0], error: null, count: 1 };
    }

    if (this.expectation === "maybeSingle") {
      return { data: mapped[0] || null, error: null, count: mapped.length };
    }

    return { data: mapped, error: null, count };
  }

  async executeInsert() {
    const pool = await getPool();
    const rows = Array.isArray(this.payload) ? this.payload : [this.payload];

    if (!rows.length) {
      return { data: [], error: null };
    }

    const inserted = [];

    for (const row of rows) {
      const request = pool.request();
      const entries = Object.entries(row || {});
      const columns = [];
      const values = [];

      entries.forEach(([key, value], idx) => {
        columns.push(quoteIdentifier(key));
        values.push(`@p${idx}`);
        request.input(`p${idx}`, value);
      });

      const query = `
        INSERT INTO ${quoteIdentifier(this.tableName)} (${columns.join(", ")})
        OUTPUT INSERTED.*
        VALUES (${values.join(", ")});
      `;

      const result = await request.query(query);
      inserted.push(...(result.recordset || []));
    }

    if (this.expectation === "single" || this.expectation === "maybeSingle") {
      return { data: inserted[0] || null, error: null };
    }

    return { data: inserted, error: null };
  }

  async executeUpdate() {
    const pool = await getPool();
    const request = pool.request();
    const entries = Object.entries(this.payload || {});

    if (!entries.length) {
      return { data: [], error: null };
    }

    const setClauses = entries.map(([key, value], idx) => {
      request.input(`s${idx}`, value);
      return `${quoteIdentifier(key)} = @s${idx}`;
    });

    const whereClause = this.buildWhere(request);

    const query = `
      UPDATE ${quoteIdentifier(this.tableName)}
      SET ${setClauses.join(", ")}
      OUTPUT INSERTED.*
      ${whereClause.replace(/\bt\./g, "")};
    `;

    const result = await request.query(query);
    const rows = result.recordset || [];

    if (this.expectation === "single" || this.expectation === "maybeSingle") {
      return { data: rows[0] || null, error: null };
    }

    return { data: rows, error: null };
  }

  async executeDelete() {
    const pool = await getPool();
    const request = pool.request();
    const whereClause = this.buildWhere(request);

    const query = `
      DELETE FROM ${quoteIdentifier(this.tableName)}
      ${whereClause.replace(/\bt\./g, "")};
    `;

    await request.query(query);
    return { data: null, error: null };
  }

  async execute() {
    try {
      if (this.action === "select") return await this.executeSelect();
      if (this.action === "insert") return await this.executeInsert();
      if (this.action === "update") return await this.executeUpdate();
      if (this.action === "delete") return await this.executeDelete();

      return { data: null, error: { message: "Unsupported action" } };
    } catch (error) {
      return {
        data: null,
        error: { message: error?.message || String(error) },
      };
    }
  }
}

function from(tableName) {
  return new QueryBuilder(tableName);
}

module.exports = {
  from,
  sql,
  getPool,
};