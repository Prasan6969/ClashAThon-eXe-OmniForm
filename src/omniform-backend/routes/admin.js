const express = require("express");
const mongoose = require("mongoose");
const { clerkClient } = require("@clerk/express");
const Organization = require("../models/Organization");
const Form = require("../models/Form");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

router.post("/orgs", requireRole("admin"), async (req, res) => {
  try {
    const { name, organizationUserId } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Organization name is required" });
    }

    const slug = slugify(name);
    const existing = await Organization.findOne({ slug });
    if (existing) {
      return res.status(409).json({ error: "Organization already exists" });
    }

    const org = await Organization.create({
      name: name.trim(),
      slug,
      createdBy: req.auth.userId,
    });

    return res.status(201).json({ data: org, organizationUserId });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create organization" });
  }
});

router.get("/orgs", requireRole("admin"), async (req, res) => {
  try {
    const orgs = await Organization.find()
      .select("name slug status")
      .sort({ name: 1 })
      .limit(200);

    return res.json({ data: orgs });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch organizations" });
  }
});

router.post(
  "/orgs/:orgId/assign-user",
  requireRole("admin"),
  async (req, res) => {
    try {
      const { orgId } = req.params;
      const { organizationUserId } = req.body;

      if (!organizationUserId) {
        return res
          .status(400)
          .json({ error: "organizationUserId is required" });
      }

      const organization = await Organization.findById(orgId);
      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }

      await clerkClient.users.updateUser(organizationUserId, {
        publicMetadata: {
          role: "organization",
          organizationId: organization._id.toString(),
        },
      });

      return res.json({
        data: {
          organizationId: organization._id,
          organizationUserId,
          role: "organization",
        },
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to assign organization" });
    }
  }
);

router.post("/users/:userId/role", requireRole("admin"), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, organizationId } = req.body;

    if (!role || !["admin", "user", "organization"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const publicMetadata = { role };
    if (organizationId) {
      publicMetadata.organizationId = String(organizationId);
    }

    await clerkClient.users.updateUser(userId, { publicMetadata });

    return res.json({ data: { userId, role, organizationId } });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update user role" });
  }
});

router.post("/users/role-by-email", requireRole("admin"), async (req, res) => {
  try {
    const { email, role, organizationId } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!role || !["admin", "user", "organization"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const users = await clerkClient.users.getUserList({
      emailAddress: [email],
      limit: 1,
    });

    if (!users.data.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users.data[0];
    const publicMetadata = { role };
    if (organizationId) {
      publicMetadata.organizationId = String(organizationId);
    }

    await clerkClient.users.updateUser(user.id, { publicMetadata });

    return res.json({ data: { userId: user.id, email, role, organizationId } });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update user role" });
  }
});

router.get(
  "/whoami",
  requireRole(["admin", "user", "organization"]),
  (req, res) => {
    return res.json({
      userId: req.auth?.userId,
      sessionClaims: req.auth?.sessionClaims,
      resolvedRole: req.auth?.role,
      organizationId: req.auth?.organizationId,
    });
  }
);

router.post("/orgs/:orgId/forms", requireRole("admin"), async (req, res) => {
  try {
    const { orgId } = req.params;
    const { name, description, fields } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      return res.status(400).json({ error: "Invalid organization ID" });
    }

    const orgExists = await Organization.findById(orgId).select("_id");
    if (!orgExists) {
      return res.status(404).json({ error: "Organization not found" });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Form name is required" });
    }

    const form = await Form.create({
      organizationId: orgId,
      name: name.trim(),
      description: description ? description.trim() : undefined,
      fields: Array.isArray(fields) ? fields : [],
    });

    return res.status(201).json({ data: form });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create form" });
  }
});

module.exports = router;
