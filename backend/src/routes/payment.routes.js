// src/routes/payment.routes.js
const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// Student creates payment
router.post(
  "/create",
  requireAuth,
  requireRole("STUDENT"),
  paymentController.createPayment
);

// VNPay callbacks (no auth)
router.get("/vnpay-return", paymentController.vnpayReturn);
router.get("/vnpay-ipn", paymentController.vnpayIpn);

// Student views history
router.get(
  "/my-payments",
  requireAuth,
  requireRole("STUDENT"),
  paymentController.myPayments
);

router.get(
  "/:id",
  requireAuth,
  requireRole("STUDENT"),
  paymentController.paymentDetail
);

module.exports = router;