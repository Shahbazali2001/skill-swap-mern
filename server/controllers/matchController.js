const User = require("../models/User");

/**
 * GET /api/v1/matches
 *
 * FR5 - Skill Matching Logic
 * ----------------------------------------------------------------
 * Automatically suggests potential exchange partners where:
 * - Candidate teaches a skill the current user wants to learn (theyTeachIWant)
 * - Candidate wants to learn a skill the current user teaches (iTeachTheyWant)
 *
 * Reciprocal (two-way) matches receive significant bonus weighting.
 * Ranking algorithm combines:
 *  1. Reciprocity (+20 bonus)
 *  2. Mutual skill overlap count (+5 per skill)
 *  3. Candidate's Trust Score (0-100 scaled to 0-10 pts)
 *  4. Geographic proximity bonus (+5 if same location keyword)
 */
exports.getMatches = async (req, res) => {
  try {
    const me = await User.findById(req.user.id)
      .populate("skillsToTeach.skill")
      .populate("skillsToLearn.skill");

    if (!me)
      return res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "User not found" },
        });

    const myTeachIds = me.skillsToTeach
      .filter((s) => s.skill)
      .map((s) => String(s.skill._id));
    const myLearnIds = me.skillsToLearn
      .filter((s) => s.skill)
      .map((s) => String(s.skill._id));

    if (myTeachIds.length === 0 && myLearnIds.length === 0) {
      return res.json({ success: true, data: { matches: [] } });
    }

    const candidates = await User.find({
      _id: { $ne: me._id },
      isSuspended: false,
    })
      .select("-passwordHash")
      .populate("skillsToTeach.skill")
      .populate("skillsToLearn.skill");

    const scored = candidates
      .map((candidate) => {
        const theirTeachIds = candidate.skillsToTeach
          .filter((s) => s.skill)
          .map((s) => String(s.skill._id));
        const theirLearnIds = candidate.skillsToLearn
          .filter((s) => s.skill)
          .map((s) => String(s.skill._id));

        // Skills THEY teach that I want to learn
        const theyTeachIWant = candidate.skillsToTeach
          .filter((s) => s.skill && myLearnIds.includes(String(s.skill._id)))
          .map((s) => ({ skill: s.skill, level: s.level }));

        // Skills I teach that THEY want to learn
        const iTeachTheyWant = me.skillsToTeach
          .filter((s) => s.skill && theirLearnIds.includes(String(s.skill._id)))
          .map((s) => ({ skill: s.skill, level: s.level }));

        const reciprocal =
          theyTeachIWant.length > 0 && iTeachTheyWant.length > 0;
        const directMatch =
          theyTeachIWant.length > 0 || iTeachTheyWant.length > 0;

        if (!directMatch) return null;

        // Scoring Formula
        let score = (theyTeachIWant.length + iTeachTheyWant.length) * 5;
        if (reciprocal) score += 20;

        // Trust score factor (up to 10 points)
        score += Math.round((candidate.trustScore || 50) / 10);

        // Location proximity bonus (+5 points)
        if (
          me.location &&
          candidate.location &&
          me.location.toLowerCase().trim() ===
            candidate.location.toLowerCase().trim()
        ) {
          score += 5;
        }

        // Calculate Compatibility Percentage (0 - 100%)
        const compatibilityPercentage = Math.min(
          99,
          Math.max(
            45,
            Math.round(
              reciprocal
                ? 80 + (theyTeachIWant.length + iTeachTheyWant.length) * 5
                : 60,
            ),
          ),
        );

        return {
          user: candidate,
          theyTeachIWant: theyTeachIWant.map((t) => t.skill),
          theyTeachLevels: theyTeachIWant,
          iTeachTheyWant: iTeachTheyWant.map((t) => t.skill),
          iTeachLevels: iTeachTheyWant,
          reciprocal,
          compatibilityPercentage,
          score,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    res.json({ success: true, data: { matches: scored } });
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
