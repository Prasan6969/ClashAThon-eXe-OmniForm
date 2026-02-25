const express = require("express");
const crypto = require("crypto");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

const firstDefined = (...values) =>
  values.find((value) => typeof value === "string" && value.trim().length > 0) ||
  "";

const getImageKitAuthHeader = (privateKey) =>
  `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;

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

router.delete(
  "/imagekit-file",
  requireRole(["user", "admin", "organization"]),
  async (req, res) => {
    try {
      const privateKey = firstDefined(process.env.IMAGEKIT_PRIVATE_KEY);
      if (!privateKey) {
        return res.status(500).json({
          error: "Image deletion is not configured. Missing: IMAGEKIT_PRIVATE_KEY",
        });
      }

      const imageUrl = String(req.body?.url || "").trim();
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }

      if (typeof fetch !== "function") {
        return res.status(500).json({ error: "Server fetch API is unavailable" });
      }

      let fileName = "";
      try {
        const parsed = new URL(imageUrl);
        fileName = decodeURIComponent(parsed.pathname.split("/").pop() || "");
      } catch {
        fileName = imageUrl.split("?")[0].split("/").pop() || "";
      }

      const queryCandidates = [
        `url = "${imageUrl.replace(/"/g, '\\"')}"`,
        fileName ? `name = "${fileName.replace(/"/g, '\\"')}"` : "",
      ].filter(Boolean);

      let fileId = "";
      for (const searchQuery of queryCandidates) {
        const listResponse = await fetch(
          `https://api.imagekit.io/v1/files?limit=1&searchQuery=${encodeURIComponent(
            searchQuery
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: getImageKitAuthHeader(privateKey),
            },
          }
        );

        if (!listResponse.ok) continue;
        const files = await listResponse.json().catch(() => []);
        const matched = Array.isArray(files) ? files[0] : null;
        if (matched?.fileId) {
          fileId = String(matched.fileId);
          break;
        }
      }

      if (!fileId) {
        return res.json({ data: { deleted: false, reason: "not_found" } });
      }

      const deleteResponse = await fetch(
        `https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: getImageKitAuthHeader(privateKey),
          },
        }
      );

      if (!deleteResponse.ok) {
        const payload = await deleteResponse.json().catch(() => ({}));
        return res.status(500).json({
          error: payload?.message || "Failed to delete image from ImageKit",
        });
      }

      return res.json({ data: { deleted: true, fileId } });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete image" });
    }
  }
);

module.exports = router;
