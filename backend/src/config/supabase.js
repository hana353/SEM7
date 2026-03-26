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

function splitTopLevelByComma(input) {
  const parts = [];
  let depth = 0;
  let current = "";

  for (const ch of String(input || "")) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth = Math.max(0, depth - 1);

    if (ch === "," && depth === 0) {
      const item = current.trim();
      if (item) parts.push(item);
      current = "";
      continue;
    }

    current += ch;
  }

  const tail = current.trim();
  if (tail) parts.push(tail);
  return parts;
}

const RELATION_MAP = {
  users: {
    roles: { localKey: "role_id", remoteKey: "id" },
  },
  courses: {
    users: { localKey: "teacher_id", remoteKey: "id" },
  },
  enrollments: {
    users: { localKey: "student_id", remoteKey: "id" },
    courses: { localKey: "course_id", remoteKey: "id" },
  },
  lectures: {
    courses: { localKey: "course_id", remoteKey: "id" },
    users: { localKey: "teacher_id", remoteKey: "id" },
  },
  payments: {
    users: { localKey: "student_id", remoteKey: "id" },
    courses: { localKey: "course_id", remoteKey: "id" },
  },
  flashcard_cards: {
    flashcard_sets: { localKey: "set_id", remoteKey: "id" },
  },
  test_attempts: {
    users: { localKey: "student_id", remoteKey: "id" },
    tests: { localKey: "test_id", remoteKey: "id" },
  },
  test_attempt_answers: {
    test_questions: { localKey: "question_id", remoteKey: "id" },
  },
};

function inferLocalKey(baseTable, relationName, hint, aliasRef) {
  if (aliasRef && /_id$/i.test(aliasRef)) {
    return aliasRef;
  }

  if (hint && hint !== "inner") {
    const m = String(hint).match(/^[A-Za-z0-9]+_(.+)_fkey$/i);
    if (m?.[1]) return m[1];
  }

  const mapped = RELATION_MAP?.[baseTable]?.[relationName];
  if (mapped?.localKey) return mapped.localKey;

  if (/s$/i.test(relationName)) {
    return `${relationName.slice(0, -1)}_id`;
  }

  return `${relationName}_id`;
}

function inferExplicitLocalKey(hint, aliasRef) {
  if (aliasRef && /_id$/i.test(aliasRef)) {
    return aliasRef;
  }

  if (hint && hint !== "inner") {
    const m = String(hint).match(/^[A-Za-z0-9]+_(.+)_fkey$/i);
    if (m?.[1]) return m[1];
  }

  return null;
}

function parseSelectColumns(columns) {
  if (!columns || columns.trim() === "*") {
    return { raw: "*", fields: null, relations: [] };
  }

  const compact = columns.replace(/\s+/g, " ").trim();
  const tokens = splitTopLevelByComma(compact);
  const fields = [];
  const relations = [];

  for (const token of tokens) {
    if (token === "*") {
      return { raw: compact, fields: null, relations };
    }

    const relMatch = token.match(
      /^([A-Za-z_][A-Za-z0-9_]*)(?::([A-Za-z_][A-Za-z0-9_]*))?(?:!([A-Za-z_][A-Za-z0-9_]*))?\s*\((.*)\)$/i
    );

    if (!relMatch) {
      fields.push(token);
      continue;
    }

    const relationName = relMatch[1];
    const aliasRef = relMatch[2] || null;
    const hint = relMatch[3] || null;
    const innerRaw = relMatch[4] || "";
    const relationFields = splitTopLevelByComma(innerRaw)
      .map((x) => x.trim())
      .filter(Boolean);

    relations.push({
      name: relationName,
      outputKey: relationName,
      localKeyHint: inferExplicitLocalKey(hint, aliasRef),
      hint,
      joinType: hint === "inner" ? "inner" : "left",
      fields: relationFields,
    });
  }

  return { raw: compact, fields: fields.length ? fields : null, relations };
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

  resolveRelationConfig(baseTable, relation) {
    const mapCfg = RELATION_MAP?.[baseTable]?.[relation.name] || {};
    const localKey = relation.localKeyHint || mapCfg.localKey || inferLocalKey(baseTable, relation.name, relation.hint, null);

    return {
      ...relation,
      localKey,
      remoteKey: mapCfg.remoteKey || "id",
      joinType: relation.joinType || "left",
    };
  }

  collectRelationPlan(parsed) {
    const byName = new Map();

    for (const rel of parsed.relations || []) {
      byName.set(rel.name, { ...rel });
    }

    for (const filter of this.filters) {
      const col = String(filter.column || "");
      if (!col.includes(".")) continue;
      const relName = col.split(".")[0];
      if (!byName.has(relName)) {
        byName.set(relName, {
          name: relName,
          outputKey: relName,
          hint: null,
          joinType: "left",
          fields: [],
        });
      }
    }

    return [...byName.values()].map((r, idx) => {
      const cfg = this.resolveRelationConfig(this.tableName, r);
      return {
        ...cfg,
        alias: `j${idx}`,
      };
    });
  }

  resolveColumnRef(rawColumn, relationPlan) {
    const col = String(rawColumn || "").trim();
    if (!col.includes(".")) {
      return `t.${quoteIdentifier(col)}`;
    }

    const [relationName, relationColumn] = col.split(".");
    const rel = relationPlan.find((r) => r.name === relationName);
    if (!rel) {
      return `t.${quoteIdentifier(col)}`;
    }

    return `${rel.alias}.${quoteIdentifier(relationColumn)}`;
  }

  buildJoinClause(relationPlan) {
    if (!relationPlan.length) return "";

    return relationPlan
      .map((rel) => {
        const joinType = rel.joinType === "inner" ? "INNER JOIN" : "LEFT JOIN";
        return `${joinType} ${quoteIdentifier(rel.name)} ${rel.alias} ON ${rel.alias}.${quoteIdentifier(
          rel.remoteKey
        )} = t.${quoteIdentifier(rel.localKey)}`;
      })
      .join("\n");
  }

  buildWhere(request, relationPlan = []) {
    const clauses = [];
    let idx = 0;

    const addParam = (value) => {
      const name = `p${idx++}`;
      request.input(name, value);
      return `@${name}`;
    };

    for (const filter of this.filters) {
      const col = this.resolveColumnRef(filter.column, relationPlan);

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

  buildOrderBy(relationPlan = []) {
    const orders = [...this.orders];

    if (!orders.length) return "";

    const sqlOrder = orders
      .map((o) => `${this.resolveColumnRef(o.column, relationPlan)} ${o.ascending ? "ASC" : "DESC"}`)
      .join(", ");

    return `ORDER BY ${sqlOrder}`;
  }

  async executeSelect() {
    const pool = await getPool();
    const request = pool.request();

    const parsed = parseSelectColumns(this.selectColumns);
    const relationPlan = this.collectRelationPlan(parsed);
    const joinClause = this.buildJoinClause(relationPlan);
    const whereClause = this.buildWhere(request, relationPlan);
    const orderClause = this.buildOrderBy(relationPlan);

    const topClause =
      this.limitValue != null && this.rangeValue == null ? `TOP (${this.limitValue})` : "";

    let selectList = "t.*";
    if (parsed.fields?.length) {
      selectList = parsed.fields.map((f) => this.resolveColumnRef(f, relationPlan)).join(", ");
    }

    for (const rel of parsed.relations || []) {
      const plan = relationPlan.find((p) => p.name === rel.name);
      if (!plan) continue;

      for (const field of rel.fields || []) {
        selectList += `${selectList ? ", " : ""}${plan.alias}.${quoteIdentifier(field)} AS [__rel_${rel.outputKey}__${field}]`;
      }
    }

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
        ${joinClause}
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
        ${joinClause}
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
      ${joinClause}
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

      for (const rel of parsed.relations || []) {
        const nested = {};
        let hasNonNull = false;

        for (const field of rel.fields || []) {
          const key = `__rel_${rel.outputKey}__${field}`;
          if (!Object.prototype.hasOwnProperty.call(item, key)) continue;

          nested[field] = item[key];
          if (item[key] != null) hasNonNull = true;
          delete item[key];
        }

        item[rel.outputKey] = hasNonNull ? nested : null;
      }

      for (const key of Object.keys(item)) {
        if (key.startsWith("__rel_")) {
          delete item[key];
        }
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