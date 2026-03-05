// src/services/payment.service.js
const { pool, poolConnect, sql } = require("../config/db");
const { getCourseById } = require("./course.service");
const {
  vnpayConfig,
  formatVnpDate,
  signParams,
  verifySecureHash,
  parseVnpPayDate,
  buildVnpString, // ✅ dùng cái này thay buildQueryString
} = require("../config/vnpay");

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return String(xff).split(",")[0].trim();
  return req.socket?.remoteAddress || req.ip || "127.0.0.1";
}

function generateTxnRef() {
  const now = new Date();
  const stamp = formatVnpDate(now);
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `PAY_${stamp}_${rand}`;
}

async function isEnrolled(studentId, courseId) {
  await poolConnect;
  const rs = await pool
    .request()
    .input("student_id", sql.UniqueIdentifier, studentId)
    .input("course_id", sql.UniqueIdentifier, courseId)
    .query(`
      SELECT TOP 1 id
      FROM enrollments
      WHERE student_id = @student_id AND course_id = @course_id
    `);
  return rs.recordset.length > 0;
}

async function createEnrollmentIfNotExists(trxRequest, studentId, courseId) {
  const exist = await trxRequest
    .input("student_id", sql.UniqueIdentifier, studentId)
    .input("course_id", sql.UniqueIdentifier, courseId)
    .query(`
      SELECT TOP 1 id
      FROM enrollments
      WHERE student_id = @student_id AND course_id = @course_id
    `);

  if (exist.recordset[0]?.id) return exist.recordset[0].id;

  const ins = await trxRequest.query(`
    INSERT INTO enrollments (student_id, course_id, progress_percent, enrolled_at)
    OUTPUT INSERTED.id
    VALUES (@student_id, @course_id, 0, SYSDATETIMEOFFSET())
  `);

  return ins.recordset[0].id;
}

/**
 * Student creates VNPay payment URL for a course
 * - If course is free (price=0): enroll directly and return enrolled=true (no VNPay)
 */
async function createCoursePaymentUrl({ studentId, courseId, req }) {
  if (!vnpayConfig.tmnCode || !vnpayConfig.hashSecret || !vnpayConfig.returnUrl) {
    throw new Error(
      "Thiếu cấu hình VNPay (VNPAY_TMN_CODE / VNPAY_HASH_SECRET / VNPAY_RETURN_URL)"
    );
  }

  const course = await getCourseById(courseId);
  if (!course) throw new Error("course_id không tồn tại hoặc đã bị xóa");

  if (course.status !== "PUBLISHED") {
    throw new Error("Khóa học chưa được PUBLISHED nên không thể thanh toán");
  }

  if (await isEnrolled(studentId, courseId)) {
    throw new Error("Bạn đã sở hữu/đăng ký khóa học này rồi");
  }

  const price = Number(course.price || 0);
  if (Number.isNaN(price) || price < 0) throw new Error("Giá khóa học không hợp lệ");

  // Free course => enroll directly
  if (price === 0) {
    await poolConnect;
    const t = new sql.Transaction(pool);
    await t.begin();
    try {
      const r = new sql.Request(t);
      const enrollmentId = await createEnrollmentIfNotExists(r, studentId, courseId);
      await t.commit();
      return {
        message: "Khóa học miễn phí - đã đăng ký thành công",
        data: { enrolled: true, enrollment_id: enrollmentId, course_id: courseId },
      };
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  // Create payment record PENDING
  await poolConnect;
  const txnRef = generateTxnRef();

  // VNPay hay bị "Sai chữ ký" nếu OrderInfo có ký tự đặc biệt -> keep simple
  const orderInfo = `Thanh toan khoa hoc ${course.title}`;

  const insert = await pool
    .request()
    .input("student_id", sql.UniqueIdentifier, studentId)
    .input("course_id", sql.UniqueIdentifier, courseId)
    .input("payment_method", sql.NVarChar(30), "VNPAY")
    .input("txn_ref", sql.NVarChar(100), txnRef)
    .input("order_info", sql.NVarChar(255), orderInfo)
    .input("amount", sql.Decimal(12, 2), price)
    .query(`
      INSERT INTO payments
        (student_id, course_id, enrollment_id, payment_method, txn_ref, order_info, amount, status, created_at, updated_at)
      OUTPUT INSERTED.id
      VALUES
        (@student_id, @course_id, NULL, @payment_method, @txn_ref, @order_info, @amount, 'PENDING', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
    `);

  const paymentId = insert.recordset[0].id;

  // Build VNPay URL
  const now = new Date();
  const createDate = formatVnpDate(now);
  const expireDate = formatVnpDate(
    new Date(now.getTime() + vnpayConfig.expireMinutes * 60 * 1000)
  );

  // VNPay amount in VND * 100 (integer)
  const vnpAmount = Math.round(price * 100);

  const ipAddr = getClientIp(req);

  const vnpParams = {
    vnp_Version: vnpayConfig.version,
    vnp_Command: vnpayConfig.command,
    vnp_TmnCode: vnpayConfig.tmnCode,
    vnp_Amount: vnpAmount,
    vnp_CurrCode: vnpayConfig.currCode,
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: vnpayConfig.orderType,
    vnp_Locale: vnpayConfig.locale,
    vnp_ReturnUrl: vnpayConfig.returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  // ✅ ký đúng chuẩn VNPay
  const secureHash = signParams(vnpParams, vnpayConfig.hashSecret);

  // ✅ build querystring đúng chuẩn VNPay
  const queryString = buildVnpString({
    ...vnpParams,
    vnp_SecureHash: secureHash,
  });

  const paymentUrl = `${vnpayConfig.vnpUrl}?${queryString}`;

  return {
    message: "Tạo link thanh toán thành công",
    data: {
      payment_id: paymentId,
      txn_ref: txnRef,
      amount: price,
      course_id: courseId,
      payment_url: paymentUrl,
    },
  };
}

/**
 * Handle VNPay return (user redirect) or IPN
 */
async function handleVnpayCallback(vnpParams) {
  if (!verifySecureHash(vnpParams, vnpayConfig.hashSecret)) {
    return { ok: false, message: "Sai chữ ký (vnp_SecureHash)" };
  }

  const txnRef = vnpParams.vnp_TxnRef;
  if (!txnRef) return { ok: false, message: "Thiếu vnp_TxnRef" };

  await poolConnect;

  const paymentRs = await pool
    .request()
    .input("txn_ref", sql.NVarChar(100), txnRef)
    .query(`
      SELECT TOP 1 *
      FROM payments
      WHERE txn_ref = @txn_ref
    `);

  const payment = paymentRs.recordset[0];
  if (!payment) return { ok: false, message: "Không tìm thấy payment theo txn_ref" };

  const vnpAmount = Number(vnpParams.vnp_Amount);
  const expected = Math.round(Number(payment.amount) * 100);

  if (Number.isNaN(vnpAmount) || vnpAmount !== expected) {
    return { ok: false, message: "Sai số tiền thanh toán" };
  }

  const responseCode = vnpParams.vnp_ResponseCode;
  const transactionStatus = vnpParams.vnp_TransactionStatus;
  const isSuccess = responseCode === "00" && transactionStatus === "00";

  if (payment.status === "SUCCESS") {
    return {
      ok: true,
      message: "Payment đã SUCCESS trước đó",
      data: {
        payment_id: payment.id,
        status: payment.status,
        enrollment_id: payment.enrollment_id,
        txn_ref: payment.txn_ref,
      },
    };
  }

  const t = new sql.Transaction(pool);
  await t.begin();
  try {
    const r = new sql.Request(t);

    const payDate = parseVnpPayDate(vnpParams.vnp_PayDate);
    const gatewayResponse = JSON.stringify(vnpParams);

    const newStatus = isSuccess ? "SUCCESS" : responseCode === "24" ? "CANCELLED" : "FAILED";

    await r
      .input("id", sql.UniqueIdentifier, payment.id)
      .input("status", sql.NVarChar(20), newStatus)
      .input("vnp_transaction_no", sql.NVarChar(50), vnpParams.vnp_TransactionNo || null)
      .input("bank_code", sql.NVarChar(50), vnpParams.vnp_BankCode || null)
      .input("bank_tran_no", sql.NVarChar(100), vnpParams.vnp_BankTranNo || null)
      .input("card_type", sql.NVarChar(50), vnpParams.vnp_CardType || null)
      .input("response_code", sql.NVarChar(10), responseCode || null)
      .input("transaction_status", sql.NVarChar(10), transactionStatus || null)
      .input("pay_date", sql.DateTimeOffset, payDate ? payDate : null)
      .input("gateway_response", sql.NVarChar(sql.MAX), gatewayResponse)
      .query(`
        UPDATE payments
        SET
          status = @status,
          vnp_transaction_no = @vnp_transaction_no,
          bank_code = @bank_code,
          bank_tran_no = @bank_tran_no,
          card_type = @card_type,
          response_code = @response_code,
          transaction_status = @transaction_status,
          pay_date = @pay_date,
          gateway_response = @gateway_response,
          updated_at = SYSDATETIMEOFFSET()
        WHERE id = @id
      `);

    let enrollmentId = payment.enrollment_id;

    if (isSuccess) {
      enrollmentId = await createEnrollmentIfNotExists(r, payment.student_id, payment.course_id);

      await r
        .input("pid", sql.UniqueIdentifier, payment.id)
        .input("enrollment_id", sql.UniqueIdentifier, enrollmentId)
        .query(`
          UPDATE payments
          SET enrollment_id = @enrollment_id, updated_at = SYSDATETIMEOFFSET()
          WHERE id = @pid
        `);
    }

    await t.commit();

    return {
      ok: isSuccess,
      message: isSuccess ? "Thanh toán thành công" : "Thanh toán không thành công",
      data: {
        payment_id: payment.id,
        txn_ref: txnRef,
        status: newStatus,
        enrollment_id: enrollmentId,
        vnp_response_code: responseCode,
        vnp_transaction_status: transactionStatus,
      },
    };
  } catch (e) {
    await t.rollback();
    throw e;
  }
}

async function getMyPayments(studentId) {
  await poolConnect;
  const rs = await pool
    .request()
    .input("student_id", sql.UniqueIdentifier, studentId)
    .query(`
      SELECT
        p.id, p.course_id, c.title AS course_title,
        p.amount, p.status, p.payment_method, p.txn_ref,
        p.response_code, p.transaction_status, p.bank_code,
        p.created_at, p.updated_at, p.pay_date
      FROM payments p
      JOIN courses c ON c.id = p.course_id
      WHERE p.student_id = @student_id
      ORDER BY p.created_at DESC
    `);
  return rs.recordset;
}

async function getPaymentDetail(studentId, paymentId) {
  await poolConnect;
  const rs = await pool
    .request()
    .input("student_id", sql.UniqueIdentifier, studentId)
    .input("id", sql.UniqueIdentifier, paymentId)
    .query(`
      SELECT TOP 1
        p.*,
        c.title AS course_title
      FROM payments p
      JOIN courses c ON c.id = p.course_id
      WHERE p.id = @id AND p.student_id = @student_id
    `);
  return rs.recordset[0] || null;
}

module.exports = {
  createCoursePaymentUrl,
  handleVnpayCallback,
  getMyPayments,
  getPaymentDetail,
};