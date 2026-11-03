const Skill = require("../models/Skill");
const { CATEGORIES } = require("../models/Skill");

// GET /api/v1/skills -> categorized selection list (FR3)
exports.listSkills = async (req, res) => {
  try {
    const { category, q } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (q) filter.name = { $regex: q.trim(), $options: "i" };

    const skills = await Skill.find(filter).sort({ category: 1, name: 1 });
    res.json({ success: true, data: { skills, categories: CATEGORIES } });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        error: { code: "SERVER_ERROR", message: err.message },
      });
  }
};

// GET /api/v1/skills/categories -> list predefined categories (FR3)
exports.listCategories = async (req, res) => {
  res.json({ success: true, data: { categories: CATEGORIES } });
};

// POST /api/v1/skills -> add a skill to the catalog (FR3)
exports.createSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    if (!name || !category) {
      return res
        .status(400)
        .json({
          success: false,
          error: {
            code: "VALIDATION",
            message: "Name and category are required",
          },
        });
    }
    const skill = await Skill.create({
      name: name.trim(),
      category,
      description: description || "",
    });
    res.status(201).json({ success: true, data: { skill } });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({
          success: false,
          error: {
            code: "DUPLICATE",
            message: "Skill already exists in that category",
          },
        });
    }
    console.error(err);
    res
      .status(500)
      .json({
        success: false,
        error: { code: "SERVER_ERROR", message: err.message },
      });
  }
};
