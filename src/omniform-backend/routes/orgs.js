const express = require("express");
const Organization = require("../models/Organization");
const Form = require("../models/Form");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireRole(["admin", "user", "organization"]), async (req, res) => {
  try {
    const query = req.query.query ? req.query.query.trim() : "";
    const filter = query
      ? { $text: { $search: query }, status: "active" }
      : { status: "active" };

    const orgs = await Organization.find(filter)
      .select("name slug status")
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
      const filter = {
        organizationId: orgId,
        status: "active",
      };
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
