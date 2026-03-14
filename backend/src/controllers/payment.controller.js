// src/controllers/payment.controller.js
const paymentService = require("../services/payment.service");

async function createPayment(req, res) {
  try {
    const studentId = req.user?.id;
    const { course_id } = req.body || {};
    if (!course_id) return res.status(400).json({ message: "course_id là bắt buộc" });

    const result = await paymentService.createCoursePaymentUrl({
      studentId,
      courseId: course_id,
      req,
    });

    return res.json(result);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

// VNPay redirect return
async function vnpayReturn(req, res) {
  try {
    const vnpParams = { ...req.query };
    const result = await paymentService.handleVnpayCallback(vnpParams);

    // Redirect về frontend với query params
    const responseCode = vnpParams.vnp_ResponseCode || '99';
    return res.redirect(`${process.env.FRONTEND_URL}/student/payment-result?vnp_ResponseCode=${responseCode}`);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

// Optional: IPN endpoint (server-to-server). VNPay thường call GET query params.
async function vnpayIpn(req, res) {
  try {
    const vnpParams = { ...req.query };
    const result = await paymentService.handleVnpayCallback(vnpParams);

    // Theo convention VNPay IPN: trả JSON code/message
    // 00: success processed
    if (result.ok) {
      return res.json({ RspCode: "00", Message: "Confirm Success" });
    }
    return res.json({ RspCode: "97", Message: result.message || "Confirm Fail" });
  } catch (e) {
    return res.json({ RspCode: "99", Message: e.message });
  }
}

async function myPayments(req, res) {
  try {
    const studentId = req.user?.id;
    const data = await paymentService.getMyPayments(studentId);
    return res.json({ message: "OK", data });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

async function paymentDetail(req, res) {
  try {
    const studentId = req.user?.id;
    const { id } = req.params;
    const data = await paymentService.getPaymentDetail(studentId, id);
    if (!data) return res.status(404).json({ message: "Không tìm thấy payment" });
    return res.json({ message: "OK", data });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

module.exports = {
  createPayment,
  vnpayReturn,
  vnpayIpn,
  myPayments,
  paymentDetail,
};