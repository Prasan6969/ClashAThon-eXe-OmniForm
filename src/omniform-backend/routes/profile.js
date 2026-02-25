const express = require("express");
const UserProfile = require("../models/UserProfile");
const ProfileTag = require("../models/ProfileTag");
const { requireRole } = require("../middleware/auth");
const { sanitizeProfilePayload } = require("../utils/validation");

const router = express.Router();

router.get("/me", requireRole("user"), async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.auth.userId });
    return res.json({ data: profile || null });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.get("/tags", requireRole("user"), async (req, res) => {
  try {
    const tags = await ProfileTag.find({ isActive: true })
      .select("label tag type options")
      .sort({ label: 1 })
      .limit(500);

    return res.json({ data: tags });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch profile tags" });
  }
});

router.put("/me", requireRole("user"), async (req, res) => {
  try {
    const sanitized = sanitizeProfilePayload(req.body);
    if (!sanitized.ok) {
      return res.status(400).json({ error: sanitized.error });
    }

    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.auth.userId },
      {
        ...sanitized.value,
      },
      { returnDocument: "after", upsert: true }
    );

    return res.json({ data: profile });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
