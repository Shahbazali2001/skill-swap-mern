const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const reportController = require("../controllers/reportController");

router.post("/", requireAuth, reportController.submitReport);

module.exports = router;
