const User = require("../models/User");
const Skill = require("../models/Skill");
const Review = require("../models/Review");
const SwapRequest = require("../models/SwapRequest");
const { calculateTrustScore } = require("../services/trustScoreService");

// PUT /api/v1/users/me -> FR2: bio, location, profile image, headline
exports.updateProfile = async (req, res) => {
  try {
    const { bio, location, profileImageUrl, headline, name } = req.body;
    const update = {};
    if (bio !== undefined) update.bio = bio;
    if (location !== undefined) update.location = location;
    if (profileImageUrl !== undefined) update.profileImageUrl = profileImageUrl;
    if (headline !== undefined) update.headline = headline;
    if (name !== undefined) update.name = name;

    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
    })
      .populate("skillsToTeach.skill")
      .populate("skillsToLearn.skill");

    // Recalculate trust score to reflect profile completeness (FR9)
    await calculateTrustScore(req.user.id);

    const refreshed = await User.findById(req.user.id)
      .populate("skillsToTeach.skill")
      .populate("skillsToLearn.skill");

    res.json({ success: true, data: { user: refreshed.toSafeObject() } });
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

// PUT /api/v1/users/me/skills -> FR3: set Skills to Teach / Skills to Learn
exports.updateSkills = async (req, res) => {
  try {
    const { skillsToTeach, skillsToLearn } = req.body;
    const update = {};

    if (skillsToTeach) {
      const ids = skillsToTeach.map((s) => s.skill);
      const count = await Skill.countDocuments({ _id: { $in: ids } });
      if (count !== new Set(ids.map(String)).size) {
        return res
          .status(400)
          .json({
            success: false,
            error: {
              code: "INVALID_SKILL",
              message: "One or more taught skills are not in the catalog",
            },
          });
      }
      update.skillsToTeach = skillsToTeach.map((s) => ({
        skill: s.skill,
        level: s.level || "Intermediate",
      }));
    }

    if (skillsToLearn) {
      const ids = skillsToLearn.map((s) => s.skill);
      const count = await Skill.countDocuments({ _id: { $in: ids } });
      if (count !== new Set(ids.map(String)).size) {
        return res
          .status(400)
          .json({
            success: false,
            error: {
              code: "INVALID_SKILL",
              message: "One or more learn-skills are not in the catalog",
            },
          });
      }
      update.skillsToLearn = skillsToLearn.map((s) => ({ skill: s.skill }));
    }

    await User.findByIdAndUpdate(req.user.id, update, { new: true });
    await calculateTrustScore(req.user.id);

    const refreshed = await User.findById(req.user.id)
      .populate("skillsToTeach.skill")
      .populate("skillsToLearn.skill");

    res.json({ success: true, data: { user: refreshed.toSafeObject() } });
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

// GET /api/v1/users/search -> FR4: Advanced Search Engine
exports.searchUsers = async (req, res) => {
  try {
    const {
      q, // keyword (searches name, bio, skill names)
      category, // e.g. IT, Arts, Music
      mode = "teach", // 'teach' (users teaching skill) | 'learn' (users wanting to learn) | 'all'
      level, // 'Beginner', 'Intermediate', 'Advanced', 'Expert'
      location, // location substring
      minTrustScore, // minimum trust score (0 - 100)
    } = req.query;

    const currentUserId = req.user?.id;
    const userQuery = { isSuspended: false };

    if (currentUserId) {
      userQuery._id = { $ne: currentUserId };
    }

    if (location && location.trim()) {
      userQuery.location = { $regex: location.trim(), $options: "i" };
    }

    if (minTrustScore) {
      userQuery.trustScore = { $gte: Number(minTrustScore) };
    }

    // Step 1: Find matching skills if category or query keyword is given
    let matchingSkillIds = [];
    if (category || q) {
      const skillFilter = { isActive: true };
      if (category) skillFilter.category = category;
      if (q) skillFilter.name = { $regex: q.trim(), $options: "i" };

      const matchedSkills = await Skill.find(skillFilter).select("_id");
      matchingSkillIds = matchedSkills.map((s) => s._id);
    }

    // Step 2: Fetch users matching the base filter
    let users = await User.find(userQuery)
      .select("-passwordHash")
      .populate("skillsToTeach.skill")
      .populate("skillsToLearn.skill")
      .sort({ trustScore: -1, averageRating: -1 });

    // Step 3: Apply in-memory skill / level / keyword matching
    if (category || q || level || mode) {
      users = users.filter((u) => {
        const teaches = u.skillsToTeach || [];
        const learns = u.skillsToLearn || [];

        // Check keyword matches across User name/bio as well
        const textMatch = q
          ? (u.name && u.name.toLowerCase().includes(q.toLowerCase())) ||
            (u.bio && u.bio.toLowerCase().includes(q.toLowerCase())) ||
            (u.headline && u.headline.toLowerCase().includes(q.toLowerCase()))
          : false;

        let teachMatches = teaches.filter((t) => {
          if (!t.skill) return false;
          const catOk = !category || t.skill.category === category;
          const levelOk = !level || t.level === level;
          const queryOk =
            !q ||
            t.skill.name.toLowerCase().includes(q.toLowerCase()) ||
            textMatch;
          return catOk && levelOk && queryOk;
        });

        let learnMatches = learns.filter((l) => {
          if (!l.skill) return false;
          const catOk = !category || l.skill.category === category;
          const queryOk =
            !q ||
            l.skill.name.toLowerCase().includes(q.toLowerCase()) ||
            textMatch;
          return catOk && queryOk;
        });

        if (mode === "teach") {
          return teachMatches.length > 0 || (textMatch && teaches.length > 0);
        } else if (mode === "learn") {
          return learnMatches.length > 0 || (textMatch && learns.length > 0);
        } else {
          return (
            teachMatches.length > 0 || learnMatches.length > 0 || textMatch
          );
        }
      });
    }

    res.json({ success: true, data: { users, count: users.length } });
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

// GET /api/v1/users/:id -> view another user's public profile (FR2, FR8, FR9, FR10)
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-passwordHash")
      .populate("skillsToTeach.skill")
      .populate("skillsToLearn.skill");

    if (!user)
      return res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "User not found" },
        });

    // Fetch reviews for this user (FR8)
    const reviews = await Review.find({ reviewee: user._id })
      .populate("reviewer", "name profileImageUrl location trustTier")
      .populate("skillTaught", "name category")
      .sort({ createdAt: -1 });

    // FR10: Track recently viewed profiles for logged in user (if not viewing oneself)
    if (req.user && req.user.id !== String(user._id)) {
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { recentlyViewed: { user: user._id } },
      });
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          recentlyViewed: {
            $each: [{ user: user._id, viewedAt: new Date() }],
            $slice: -10, // keep latest 10
            $position: 0,
          },
        },
      });
    }

    res.json({
      success: true,
      data: {
        user,
        reviews,
        totalReviews: reviews.length,
      },
    });
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

// GET /api/v1/users/me/recently-viewed (FR10)
exports.getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "recentlyViewed.user",
      select:
        "name profileImageUrl location headline trustScore trustTier skillsToTeach skillsToLearn",
      populate: [
        { path: "skillsToTeach.skill" },
        { path: "skillsToLearn.skill" },
      ],
    });

    const list = (user.recentlyViewed || [])
      .filter((item) => item.user != null)
      .map((item) => ({
        user: item.user,
        viewedAt: item.viewedAt,
      }));

    res.json({ success: true, data: { recentlyViewed: list } });
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

// GET /api/v1/users -> list all users
exports.listUsers = async (req, res) => {
  const users = await User.find({ isSuspended: false })
    .select("-passwordHash")
    .populate("skillsToTeach.skill")
    .populate("skillsToLearn.skill")
    .sort({ trustScore: -1 });

  res.json({ success: true, data: { users } });
};
