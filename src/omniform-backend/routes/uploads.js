const express = require("express");
const crypto = require("crypto");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

const firstDefined = (...values) =>
  values.find((value) => typeof value === "string" && value.trim().length > 0) ||
  "";

router.get(
  "/imagekit-auth",
  requireRole(["user", "admin", "organization"]),
  (req, res) => {
    const publicKey = firstDefined(
      process.env.IMAGEKIT_PUBLIC_KEY,
      process.env.VITE_IMAGEKIT_PUBLIC_KEY
    );
    const privateKey = firstDefined(process.env.IMAGEKIT_PRIVATE_KEY);
    const urlEndpoint = firstDefined(
      process.env.IMAGEKIT_URL_ENDPOINT,
      process.env.IMAGEKIT_ENDPOINT,
      process.env.VITE_IMAGEKIT_URL_ENDPOINT
    );

    if (!publicKey || !privateKey) {
      const missing = [];
      if (!publicKey) missing.push("IMAGEKIT_PUBLIC_KEY");
      if (!privateKey) missing.push("IMAGEKIT_PRIVATE_KEY");
      return res.status(500).json({
        error: `Image upload is not configured. Missing: ${missing.join(", ")}`,
      });
    }

    const token = crypto.randomBytes(16).toString("hex");
    const expire = Math.floor(Date.now() / 1000) + 10 * 60;
    const signature = crypto
      .createHmac("sha1", privateKey)
      .update(`${token}${expire}`)
      .digest("hex");

    return res.json({
      data: {
        token,
        expire,
        signature,
        publicKey,
        urlEndpoint: urlEndpoint || undefined,
      },
    });
  }
);

module.exports = router;
