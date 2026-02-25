const express = require("express");
const { clerkClient } = require("@clerk/express");
const Submission = require("../models/Submission");
const Form = require("../models/Form");
const { requireRole } = require("../middleware/auth");
const {
  isValidObjectId,
  sanitizeSubmissionData,
} = require("../utils/validation");

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

    if (!isValidObjectId(formId) || !isValidObjectId(organizationId)) {
      return res.status(400).json({ error: "Invalid formId or organizationId" });
    }

    const sanitizedData = sanitizeSubmissionData(data);
    if (!sanitizedData.ok) {
      return res.status(400).json({ error: sanitizedData.error });
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

    if (form.status !== "active") {
      return res.status(400).json({ error: "Form is not active" });
    }

    const submission = await Submission.create({
      userId: req.auth.userId,
      userEmail: req.auth?.sessionClaims?.email || undefined,
      organizationId,
      formId,
      data: sanitizedData.value,
    });

    if (!submission.userEmail) {
      try {
        const user = await clerkClient.users.getUser(req.auth.userId);
        submission.userEmail =
          user.primaryEmailAddress?.emailAddress || submission.userEmail;
        await submission.save();
      } catch (error) {
        // ignore email lookup failures
      }
    }

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

router.get("/me/:id", requireRole("user"), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate(
      "formId",
      "name fields"
    );
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }
    if (String(submission.userId) !== String(req.auth.userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return res.json({ data: submission });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch submission" });
  }
});

router.post("/:id/cancel", requireRole("user"), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (String(submission.userId) !== String(req.auth.userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({ error: "Submission not pending" });
    }

    submission.status = "canceled";
    submission.cooldownUntil = null;
    await submission.save();

    return res.json({ data: submission });
  } catch (error) {
    return res.status(500).json({ error: "Failed to cancel submission" });
  }
});

router.post("/clear-canceled", requireRole("user"), async (req, res) => {
  try {
    await Submission.deleteMany({
      userId: req.auth.userId,
      status: "canceled",
    });
    return res.json({ data: { cleared: true } });
  } catch (error) {
    return res.status(500).json({ error: "Failed to clear canceled submissions" });
  }
});

router.get("/org", requireRole("organization"), async (req, res) => {
  try {
    const { formId, status, email, page, limit } = req.query;
    const filter = { organizationId: req.auth.organizationId };
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);

    if (formId) {
      filter.formId = formId;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (email) {
      const escaped = String(email).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filter.$or = [
        { userEmail: { $regex: regex } },
        { "data.workEmail": { $regex: regex } },
        { "data.personalEmail": { $regex: regex } },
      ];
    }

    const total = await Submission.countDocuments(filter);
    const submissions = await Submission.find(filter)
      .populate("formId", "name")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    return res.json({
      data: submissions,
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

router.get("/org/:id", requireRole("organization"), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate(
      "formId",
      "name fields"
    );
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }
    if (String(submission.organizationId) !== String(req.auth.organizationId)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return res.json({ data: submission });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch submission" });
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
