const express = require("express");
const Organization = require("../models/Organization");
const Form = require("../models/Form");
const { requireRole } = require("../middleware/auth");
const { isValidObjectId } = require("../utils/validation");

const router = express.Router();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFuzzyPattern = (value) =>
  value
    .split("")
    .map((char) => escapeRegex(char))
    .join(".*");

router.get("/", requireRole(["admin", "user", "organization"]), async (req, res) => {
  try {
    const now = new Date();
    await Organization.updateMany(
      {
        subscriptionStatus: "active",
        subscriptionEndsAt: { $lt: now },
      },
      { $set: { subscriptionStatus: "expired" } }
    );
    const query = req.query.query ? req.query.query.trim() : "";
    const filter = {};
    if (query) {
      const terms = query.split(/\s+/).filter(Boolean);
      filter.$and = terms.map((term) => {
        const pattern = buildFuzzyPattern(term);
        return {
          $or: [
            { name: { $regex: pattern, $options: "i" } },
            { slug: { $regex: pattern, $options: "i" } },
          ],
        };
      });
    }
    const role = req.auth?.role;

    if (role !== "admin") {
      filter.status = "active";
    }

    if (role === "user") {
      filter.subscriptionStatus = "active";
      filter.subscriptionEndsAt = { $gte: new Date() };
    }

    if (role === "organization") {
      filter._id = req.auth?.organizationId;
    }

    const orgs = await Organization.find(filter)
      .select("name slug status subscriptionStatus subscriptionStartsAt subscriptionEndsAt")
      .sort({ name: 1 })
      .limit(50);

    return res.json({ data: orgs });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch organizations" });
  }
});

router.get(
  "/:orgId/forms",
  requireRole(["admin", "user", "organization"]),
  async (req, res) => {
    try {
      const { orgId } = req.params;
      const query = typeof req.query.query === "string" ? req.query.query.trim() : "";
      const role = req.auth?.role;

      if (!isValidObjectId(orgId)) {
        return res.json({ data: [] });
      }

      if (role === "organization" && String(req.auth?.organizationId || "") !== String(orgId)) {
        return res.json({ data: [] });
      }

      const filter = {
        organizationId: orgId,
      };

      if (role !== "admin") {
        filter.status = "active";
      }

      if (role === "user") {
        const org = await Organization.findById(orgId).select(
          "subscriptionStatus status subscriptionEndsAt"
        );
        if (
          !org ||
          org.status !== "active" ||
          org.subscriptionStatus !== "active" ||
          (org.subscriptionEndsAt && org.subscriptionEndsAt < new Date())
        ) {
          return res.json({ data: [] });
        }
      }
      if (query) {
        const safeQuery = escapeRegex(query);
        filter.$or = [
          { name: { $regex: safeQuery, $options: "i" } },
          { description: { $regex: safeQuery, $options: "i" } },
        ];
      }

      const forms = await Form.find(filter)
        .select("name description status fields components organizationId")
        .sort({ name: 1 })
        .limit(50);

      return res.json({ data: forms });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch forms" });
    }
  }
);

router.get(
  "/:orgId/forms/:formId",
  requireRole(["admin", "user", "organization"]),
  async (req, res) => {
    try {
      const { orgId, formId } = req.params;
      const role = req.auth?.role;

      if (role === "user") {
        const org = await Organization.findById(orgId).select(
          "subscriptionStatus status subscriptionEndsAt"
        );
        if (
          !org ||
          org.status !== "active" ||
          org.subscriptionStatus !== "active" ||
          (org.subscriptionEndsAt && org.subscriptionEndsAt < new Date())
        ) {
          return res.status(404).json({ error: "Form not found" });
        }
      }

      const filter = {
        _id: formId,
        organizationId: orgId,
      };

      if (role !== "admin") {
        filter.status = "active";
      }

      const form = await Form.findOne(filter).select(
        "name description status fields components organizationId"
      );

      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }

      return res.json({ data: form });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch form" });
    }
  }
);

module.exports = router;
