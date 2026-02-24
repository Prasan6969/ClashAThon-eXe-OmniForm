const { getAuth, clerkClient } = require("@clerk/express");

const requireRole = (roles = []) => {
  const required = Array.isArray(roles) ? roles : [roles];
  return async (req, res, next) => {
    const { userId, sessionClaims } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const publicMetadata =
      sessionClaims?.publicMetadata || sessionClaims?.public_metadata || {};
    let role = publicMetadata?.role;
    let organizationId = publicMetadata?.organizationId;

    if (!role) {
      try {
        const user = await clerkClient.users.getUser(userId);
        const mergedMetadata = {
          ...(user?.publicMetadata || {}),
          ...(user?.unsafeMetadata || {}),
          ...(user?.privateMetadata || {}),
        };
        role = mergedMetadata?.role || role;
        organizationId = mergedMetadata?.organizationId || organizationId;
      } catch (error) {
        return res.status(500).json({ error: "Failed to resolve user role" });
      }
    }

    if (!role && organizationId) {
      role = "organization";
    }

    const resolvedRole = role || (required.includes("user") ? "user" : undefined);

    if (required.length && !resolvedRole) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (required.length && !required.includes(resolvedRole)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.auth = { userId, role: resolvedRole, organizationId, sessionClaims };
    return next();
  };
};

module.exports = { requireRole };
