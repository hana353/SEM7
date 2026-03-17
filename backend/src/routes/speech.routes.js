const express = require("express");
const { transcribe } = require("../controllers/speech.controller");

const router = express.Router();

router.post("/transcribe", transcribe);

module.exports = router;

