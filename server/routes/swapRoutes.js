const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const swapController = require("../controllers/swapController");

router.post("/", requireAuth, swapController.sendSwapRequest);
router.get("/", requireAuth, swapController.listSwapRequests);
router.get("/:id", requireAuth, swapController.getSwapById);
router.patch("/:id", requireAuth, swapController.updateSwapStatus);

module.exports = router;
