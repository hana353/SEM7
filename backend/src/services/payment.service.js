const supabase = require("../config/supabase");
const { getCourseById } = require("./course.service");
const { createNotification } = require("./notification.service");
const {
  vnpayConfig,
  formatVnpDate,
  signParams,
  verifySecureHash,
  parseVnpPayDate,
  buildVnpString,
} = require("../config/vnpay");

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return String(xff).split(",")[0].trim();
  return req.socket?.remoteAddress || req.ip || "127.0.0.1";
}

function getBaseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host");
  return `${proto}://${host}`;
}

function generateTxnRef() {
  const now = new Date();
  const stamp = formatVnpDate(now);
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `PAY_${stamp}_${rand}`;
}

async function isEnrolled(studentId, courseId) {
  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return !!data;
}

async function createEnrollmentIfNotExists(studentId, courseId) {
  const { data: existing, error: existingError } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .limit(1)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);
  if (existing?.id) return existing.id;

  const { data: inserted, error: insertError } = await supabase
    .from("enrollments")
    .insert({
      student_id: studentId,
      course_id: courseId,
      progress_percent: 0,
      enrolled_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError) throw new Error(insertError.message);

  // Notify teacher: new student enrollment
  try {
    const [{ data: courseRow }, { data: studentRow }] = await Promise.all([
      supabase
        .from("courses")
        .select("id, title, teacher_id")
        .eq("id", courseId)
        .single(),
      supabase
        .from("users")
        .select("id, full_name, email")
        .eq("id", studentId)
        .single(),
    ]);

    if (courseRow?.teacher_id) {
      await createNotification({
        userId: courseRow.teacher_id,
        type: "ENROLLMENT_NEW",
        title: "Có học viên tham gia khóa học mới",
        body: `${studentRow?.full_name || "Một học viên"} đã tham gia khóa "${courseRow?.title || ""}"`,
        metadata: {
          student_id: studentId,
          student_email: studentRow?.email || null,
          course_id: courseId,
          course_title: courseRow?.title || null,
          enrollment_id: inserted.id,
        },
      });
    }
  } catch (e) {
    // ignore notification failures
  }

  return inserted.id;
}

async function createCoursePaymentUrl({ studentId, courseId, req }) {
  const isDemoMode = process.env.PAYMENT_DEMO === "true";

  if (!isDemoMode && !vnpayConfig.tmnCode) {
    throw new Error("Thiếu cấu hình VNPay (VNPAY_TMN_CODE / VNPAY_HASH_SECRET)");
  }

  const course = await getCourseById(courseId);
  if (!course) throw new Error("course_id không tồn tại hoặc đã bị xóa");

  if (course.status !== "ON_SALE") {
    throw new Error("Khóa học chưa ở trạng thái ON_SALE nên không thể thanh toán");
  }

  if (await isEnrolled(studentId, courseId)) {
    throw new Error("Bạn đã sở hữu/đăng ký khóa học này rồi");
  }

  const price = Number(course.price || 0);
  if (Number.isNaN(price) || price < 0) {
    throw new Error("Giá khóa học không hợp lệ");
  }

  if (price === 0) {
    const enrollmentId = await createEnrollmentIfNotExists(studentId, courseId);
    return {
      message: "Khóa học miễn phí - đã đăng ký thành công",
      data: { enrolled: true, enrollment_id: enrollmentId, course_id: courseId },
    };
  }

  if (isDemoMode) {
    const enrollmentId = await createEnrollmentIfNotExists(studentId, courseId);
    return {
      message: "Demo mode: đã đăng ký khóa học thành công (bypass VNPay)",
      data: { enrolled: true, enrollment_id: enrollmentId, course_id: courseId },
    };
  }

  const txnRef = generateTxnRef();
  const orderInfo = `Thanh toan khoa hoc ${course.title}`;

  const { data: paymentInsert, error: paymentInsertError } = await supabase
    .from("payments")
    .insert({
      student_id: studentId,
      course_id: courseId,
      enrollment_id: null,
      payment_method: "VNPAY",
      txn_ref: txnRef,
      order_info: orderInfo,
      amount: price,
      status: "PENDING",
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (paymentInsertError) throw new Error(paymentInsertError.message);

  const paymentId = paymentInsert.id;
  const now = new Date();
  const createDate = formatVnpDate(now);
  const expireDate = formatVnpDate(
    new Date(now.getTime() + vnpayConfig.expireMinutes * 60 * 1000)
  );

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
    vnp_ReturnUrl: `${getBaseUrl(req)}/api/payments/vnpay-return`,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  const secureHash = signParams(vnpParams, vnpayConfig.hashSecret);
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

async function handleVnpayCallback(vnpParams) {
  if (!verifySecureHash(vnpParams, vnpayConfig.hashSecret)) {
    return { ok: false, message: "Sai chữ ký (vnp_SecureHash)" };
  }

  const txnRef = vnpParams.vnp_TxnRef;
  if (!txnRef) return { ok: false, message: "Thiếu vnp_TxnRef" };

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("txn_ref", txnRef)
    .limit(1)
    .maybeSingle();

  if (paymentError) throw new Error(paymentError.message);
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

  const payDate = parseVnpPayDate(vnpParams.vnp_PayDate);
  const gatewayResponse = JSON.stringify(vnpParams);
  const newStatus = isSuccess
    ? "SUCCESS"
    : responseCode === "24"
      ? "CANCELLED"
      : "FAILED";

  let enrollmentId = payment.enrollment_id;

  if (isSuccess) {
    enrollmentId = await createEnrollmentIfNotExists(payment.student_id, payment.course_id);
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update({
      status: newStatus,
      vnp_transaction_no: vnpParams.vnp_TransactionNo || null,
      bank_code: vnpParams.vnp_BankCode || null,
      bank_tran_no: vnpParams.vnp_BankTranNo || null,
      card_type: vnpParams.vnp_CardType || null,
      response_code: responseCode || null,
      transaction_status: transactionStatus || null,
      pay_date: payDate ? new Date(payDate).toISOString() : null,
      gateway_response: gatewayResponse,
      enrollment_id: enrollmentId || null,
    })
    .eq("id", payment.id);

  if (updateError) throw new Error(updateError.message);

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
}

async function getMyPayments(studentId) {
  const { data, error } = await supabase
    .from("payments")
    .select(`
      id,
      course_id,
      amount,
      status,
      payment_method,
      txn_ref,
      response_code,
      transaction_status,
      bank_code,
      created_at,
      pay_date,
      courses (
        title
      )
    `)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((row) => ({
    id: row.id,
    course_id: row.course_id,
    course_title: row.courses?.title || null,
    amount: row.amount,
    status: row.status,
    payment_method: row.payment_method,
    txn_ref: row.txn_ref,
    response_code: row.response_code,
    transaction_status: row.transaction_status,
    bank_code: row.bank_code,
    created_at: row.created_at,
    pay_date: row.pay_date,
  }));
}

async function getPaymentDetail(studentId, paymentId) {
  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      courses (
        title
      )
    `)
    .eq("id", paymentId)
    .eq("student_id", studentId)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    ...data,
    course_title: data.courses?.title || null,
  };
}

module.exports = {
  createCoursePaymentUrl,
  handleVnpayCallback,
  getMyPayments,
  getPaymentDetail,
};