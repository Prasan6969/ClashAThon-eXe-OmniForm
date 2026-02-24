const express = require("express");
const Submission = require("../models/Submission");
const Form = require("../models/Form");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

const COOLDOWN_DAYS = 30;

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

router.post("/", requireRole("user"), async (req, res) => {
  try {
    const { formId, organizationId, data } = req.body;
    if (!formId || !organizationId) {
      return res.status(400).json({ error: "formId and organizationId required" });
    }

    const existingCompleted = await Submission.findOne({
      userId: req.auth.userId,
      formId,
      status: "completed",
      cooldownUntil: { $gt: new Date() },
    });

    if (existingCompleted) {
      return res.status(409).json({
        error: "Cooldown active",
        cooldownUntil: existingCompleted.cooldownUntil,
      });
    }

    const form = await Form.findById(formId).select("organizationId status");
    if (!form || String(form.organizationId) !== String(organizationId)) {
      return res.status(404).json({ error: "Form not found" });
    }

    const submission = await Submission.create({
      userId: req.auth.userId,
      organizationId,
      formId,
      data: data || {},
    });

    return res.status(201).json({ data: submission });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create submission" });
  }
});

router.get("/me", requireRole("user"), async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.auth.userId })
      .populate("formId", "name")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({ data: submissions });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

router.get("/org", requireRole("organization"), async (req, res) => {
  try {
    const { formId, status } = req.query;
    const filter = { organizationId: req.auth.organizationId };

    if (formId) {
      filter.formId = formId;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    const submissions = await Submission.find(filter)
      .populate("formId", "name fields")
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json({ data: submissions });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

router.post("/:id/accept", requireRole("organization"), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (String(submission.organizationId) !== String(req.auth.organizationId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({ error: "Submission not pending" });
    }

    submission.status = "completed";
    submission.reviewNotes = req.body.reviewNotes || "";
    submission.reviewedBy = req.auth.userId;
    submission.cooldownUntil = addDays(new Date(), COOLDOWN_DAYS);

    await submission.save();

    return res.json({ data: submission });
  } catch (error) {
    return res.status(500).json({ error: "Failed to accept submission" });
  }
});

router.post("/:id/reject", requireRole("organization"), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (String(submission.organizationId) !== String(req.auth.organizationId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({ error: "Submission not pending" });
    }

    submission.status = "rejected";
    submission.reviewNotes = req.body.reviewNotes || "";
    submission.reviewedBy = req.auth.userId;
    submission.cooldownUntil = null;

    await submission.save();

    return res.json({ data: submission });
  } catch (error) {
    return res.status(500).json({ error: "Failed to reject submission" });
  }
});

module.exports = router;
