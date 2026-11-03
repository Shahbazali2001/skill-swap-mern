const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const skillController = require("../controllers/skillController");

router.get("/categories", requireAuth, skillController.listCategories);
router.get("/", requireAuth, skillController.listSkills);
router.post("/", requireAuth, skillController.createSkill);

module.exports = router;
