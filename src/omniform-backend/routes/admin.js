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
    const {
      name,
      organizationUserId,
      subscriptionStatus,
      subscriptionStartsAt,
      subscriptionEndsAt,
    } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Organization name is required" });
    }

    const slug = slugify(name);
    const existing = await Organization.findOne({ slug });
    if (existing) {
      return res.status(409).json({ error: "Organization already exists" });
    }

    const createPayload = {
      name: name.trim(),
      slug,
      createdBy: req.auth.userId,
    };

    if (["active", "canceled", "expired"].includes(subscriptionStatus)) {
      createPayload.subscriptionStatus = subscriptionStatus;
    }

    if (subscriptionStartsAt) {
      const parsedStart = new Date(subscriptionStartsAt);
      if (Number.isNaN(parsedStart.getTime())) {
        return res.status(400).json({ error: "Invalid subscription start date" });
      }
      createPayload.subscriptionStartsAt = parsedStart;
    }

    if (subscriptionEndsAt) {
      const parsedEnd = new Date(subscriptionEndsAt);
      if (Number.isNaN(parsedEnd.getTime())) {
        return res.status(400).json({ error: "Invalid subscription end date" });
      }
      createPayload.subscriptionEndsAt = parsedEnd;
    }

    const org = await Organization.create(createPayload);

    return res.status(201).json({ data: org, organizationUserId });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create organization" });
  }
});

router.get("/orgs", requireRole("admin"), async (req, res) => {
  try {
    const now = new Date();
    await Organization.updateMany(
      {
        $or: [
          { subscriptionStartsAt: { $exists: false } },
          { subscriptionStartsAt: null },
          { subscriptionEndsAt: { $exists: false } },
          { subscriptionEndsAt: null },
        ],
      },
      {
        $set: {
          subscriptionStartsAt: now,
          subscriptionEndsAt: new Date(now.getTime() + 30 * 86400000),
        },
      }
    );

    await Organization.updateMany(
      {
        subscriptionStatus: "active",
        subscriptionEndsAt: { $lt: now },
      },
      { $set: { subscriptionStatus: "expired" } }
    );
    const orgs = await Organization.find()
      .select("name slug status")
      .sort({ name: 1 })
      .limit(200);

    return res.json({ data: orgs });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch organizations" });
  }
});

router.get("/orgs/:orgId", requireRole("admin"), async (req, res) => {
  try {
    const { orgId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      return res.status(400).json({ error: "Invalid organization ID" });
    }

    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    return res.json({ data: org });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch organization" });
  }
});

router.put("/orgs/:orgId", requireRole("admin"), async (req, res) => {
  try {
    const { orgId } = req.params;
    const {
      name,
      status,
      panNumber,
      licenseNumber,
      location,
      subscriptionStatus,
      subscriptionStartsAt,
      subscriptionEndsAt,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      return res.status(400).json({ error: "Invalid organization ID" });
    }

    const updates = {};
    if (typeof name === "string" && name.trim()) {
      const nextSlug = slugify(name);
      const existing = await Organization.findOne({
        slug: nextSlug,
        _id: { $ne: orgId },
      }).select("_id");
      if (existing) {
        return res.status(409).json({ error: "Organization already exists" });
      }
      updates.name = name.trim();
      updates.slug = nextSlug;
    }

    if (["active", "inactive"].includes(status)) {
      updates.status = status;
    }

    if (typeof panNumber === "string") {
      updates.panNumber = panNumber.trim();
    }

    if (typeof licenseNumber === "string") {
      updates.licenseNumber = licenseNumber.trim();
    }

    if (typeof location === "string") {
      updates.location = location.trim();
    }

    if (["active", "canceled", "expired"].includes(subscriptionStatus)) {
      updates.subscriptionStatus = subscriptionStatus;
    }

    if (subscriptionStartsAt === null || subscriptionStartsAt === "") {
      updates.subscriptionStartsAt = null;
    } else if (subscriptionStartsAt) {
      const parsedStart = new Date(subscriptionStartsAt);
      if (Number.isNaN(parsedStart.getTime())) {
        return res.status(400).json({ error: "Invalid start date" });
      }
      updates.subscriptionStartsAt = parsedStart;
    }

    if (subscriptionEndsAt === null || subscriptionEndsAt === "") {
      updates.subscriptionEndsAt = null;
    } else if (subscriptionEndsAt) {
      const parsedEnd = new Date(subscriptionEndsAt);
      if (Number.isNaN(parsedEnd.getTime())) {
        return res.status(400).json({ error: "Invalid end date" });
      }
      updates.subscriptionEndsAt = parsedEnd;
    }

    const org = await Organization.findByIdAndUpdate(orgId, updates, {
      new: true,
    });

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    return res.json({ data: org });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update organization" });
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
    const { name, description, fields, components } = req.body;

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
      components: Array.isArray(components) ? components : [],
    });

    return res.status(201).json({ data: form });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create form" });
  }
});

router.get(
  "/orgs/:orgId/forms/:formId",
  requireRole("admin"),
  async (req, res) => {
    try {
      const { orgId, formId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(orgId)) {
        return res.status(400).json({ error: "Invalid organization ID" });
      }

      if (!mongoose.Types.ObjectId.isValid(formId)) {
        return res.status(400).json({ error: "Invalid form ID" });
      }

      const form = await Form.findOne({
        _id: formId,
        organizationId: orgId,
      });

      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }

      return res.json({ data: form });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch form" });
    }
  }
);

router.put(
  "/orgs/:orgId/forms/:formId",
  requireRole("admin"),
  async (req, res) => {
    try {
      const { orgId, formId } = req.params;
      const { name, description, fields, components } = req.body;

      if (!mongoose.Types.ObjectId.isValid(orgId)) {
        return res.status(400).json({ error: "Invalid organization ID" });
      }

      if (!mongoose.Types.ObjectId.isValid(formId)) {
        return res.status(400).json({ error: "Invalid form ID" });
      }

      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Form name is required" });
      }

      const form = await Form.findOneAndUpdate(
        { _id: formId, organizationId: orgId },
        {
          name: name.trim(),
          description: description ? description.trim() : undefined,
          fields: Array.isArray(fields) ? fields : [],
          components: Array.isArray(components) ? components : [],
        },
        { new: true }
      );

      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }

      return res.json({ data: form });
    } catch (error) {
      return res.status(500).json({ error: "Failed to update form" });
    }
  }
);

router.delete(
  "/orgs/:orgId/forms/:formId",
  requireRole("admin"),
  async (req, res) => {
    try {
      const { orgId, formId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(orgId)) {
        return res.status(400).json({ error: "Invalid organization ID" });
      }

      if (!mongoose.Types.ObjectId.isValid(formId)) {
        return res.status(400).json({ error: "Invalid form ID" });
      }

      const form = await Form.findOneAndDelete({
        _id: formId,
        organizationId: orgId,
      });

      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }

      return res.json({ data: { _id: formId } });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete form" });
    }
  }
);

module.exports = router;
