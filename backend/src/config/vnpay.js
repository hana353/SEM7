// src/config/vnpay.js
const crypto = require("crypto");

/**
 * VNPay config from env
 */
const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE,
  hashSecret: process.env.VNPAY_HASH_SECRET,
  vnpUrl: process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl: process.env.VNPAY_RETURN_URL, // backend return endpoint
  locale: process.env.VNPAY_LOCALE || "vn",
  currCode: "VND",
  version: process.env.VNPAY_VERSION || "2.1.0",
  command: "pay",
  orderType: process.env.VNPAY_ORDER_TYPE || "other",
  expireMinutes: Number(process.env.VNPAY_EXPIRE_MINUTES || 15),
};

function pad2(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

// VNPay uses format yyyyMMddHHmmss
function formatVnpDate(date) {
  const yyyy = date.getFullYear();
  const MM = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const HH = pad2(date.getHours());
  const mm = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

/**
 * Sort keys and build querystring with encodeURIComponent
 * (VNPay expects percent-encoding)
 */
function buildQueryString(params) {
  const keys = Object.keys(params).sort();
  return keys
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(String(params[k]))}`)
    .join("&");
}

function signParams(params, hashSecret) {
  const qs = buildQueryString(params);
  return crypto.createHmac("sha512", hashSecret).update(qs, "utf-8").digest("hex");
}

function verifySecureHash(vnpParams, hashSecret) {
  const secureHash = vnpParams.vnp_SecureHash;
  if (!secureHash) return false;

  const cloned = { ...vnpParams };
  delete cloned.vnp_SecureHash;
  delete cloned.vnp_SecureHashType;

  const signed = signParams(cloned, hashSecret);
  return String(signed).toLowerCase() === String(secureHash).toLowerCase();
}

function parseVnpPayDate(vnpPayDate) {
  // yyyyMMddHHmmss
  if (!vnpPayDate || typeof vnpPayDate !== "string" || vnpPayDate.length !== 14) return null;
  const yyyy = Number(vnpPayDate.slice(0, 4));
  const MM = Number(vnpPayDate.slice(4, 6));
  const dd = Number(vnpPayDate.slice(6, 8));
  const HH = Number(vnpPayDate.slice(8, 10));
  const mm = Number(vnpPayDate.slice(10, 12));
  const ss = Number(vnpPayDate.slice(12, 14));
  if ([yyyy, MM, dd, HH, mm, ss].some((x) => Number.isNaN(x))) return null;

  // interpret as local time
  return new Date(yyyy, MM - 1, dd, HH, mm, ss);
}

module.exports = {
  vnpayConfig,
  formatVnpDate,
  buildQueryString,
  signParams,
  verifySecureHash,
  parseVnpPayDate,
};