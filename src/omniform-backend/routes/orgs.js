const express = require("express");
const Organization = require("../models/Organization");
const Form = require("../models/Form");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

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
    const filter = query ? { $text: { $search: query } } : {};
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
      const query = req.query.query ? req.query.query.trim() : "";
      const role = req.auth?.role;
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
        filter.$text = { $search: query };
      }

      const forms = await Form.find(filter)
        .select("name description status fields")
        .sort({ name: 1 })
        .limit(50);

      return res.json({ data: forms });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch forms" });
    }
  }
);

module.exports = router;
