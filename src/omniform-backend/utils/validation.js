const mongoose = require("mongoose");

const PROFILE_KEYS = [
  "fullName",
  "workEmail",
  "personalEmail",
  "address",
  "phone",
  "citizenshipNumber",
  "profilePhotoUrl",
  "citizenshipPhotoUrl",
];

const isValidObjectId = (value) =>
  typeof value === "string" && mongoose.Types.ObjectId.isValid(value);

const sanitizeString = (value, maxLength = 300) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
};

const sanitizeKey = (value, maxLength = 80) =>
  sanitizeString(value, maxLength)
    .toLowerCase()
    .replace(/[^a-z0-9_\-.]/g, "")
    .slice(0, maxLength);

const parseDateValue = (value, fieldName) => {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }
  if (value === null || value === "") {
    return { ok: true, value: null };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, error: `Invalid ${fieldName}` };
  }

  return { ok: true, value: parsed };
};

const sanitizeFormComponents = (components) => {
  if (!Array.isArray(components)) {
    return { ok: false, error: "components must be an array" };
  }

  const allowedTypes = new Set([
    "text",
    "email",
    "date",
    "number",
    "select",
    "image",
  ]);

  const sanitized = components.map((component, index) => {
    const raw = component && typeof component === "object" ? component : {};
    const id = sanitizeString(raw.id || `field-${index + 1}`, 120);
    const label = sanitizeString(raw.label, 120);
    const tag = sanitizeKey(raw.tag || raw.label, 80);
    const type = sanitizeString(raw.type || "text", 40).toLowerCase();
    const required = Boolean(raw.required);
    const options = Array.isArray(raw.options)
      ? raw.options
          .map((option) => sanitizeString(option, 120))
          .filter(Boolean)
          .slice(0, 50)
      : [];

    return {
      id,
      label,
      tag,
      type: allowedTypes.has(type) ? type : "text",
      required,
      options,
    };
  });

  const invalid = sanitized.find((component) => !component.label);
  if (invalid) {
    return { ok: false, error: "Each form component requires a label" };
  }

  return { ok: true, value: sanitized };
};

const sanitizeSubmissionData = (data) => {
  if (data === undefined) {
    return { ok: true, value: {} };
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, error: "data must be an object" };
  }

  const entries = Object.entries(data).slice(0, 200);
  const sanitized = {};
  entries.forEach(([rawKey, rawValue]) => {
    const key = sanitizeKey(rawKey, 80);
    if (!key) return;
    sanitized[key] = sanitizeString(String(rawValue ?? ""), 4000);
  });

  return { ok: true, value: sanitized };
};

const sanitizeProfilePayload = (payload = {}) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "Invalid profile payload" };
  }

  const profile = {};
  PROFILE_KEYS.forEach((key) => {
    if (payload[key] !== undefined) {
      profile[key] = sanitizeString(payload[key], 400);
    }
  });

  const source = payload.customFields;
  if (source !== undefined) {
    const customFields = {};
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      return { ok: false, error: "customFields must be an object" };
    }

    Object.entries(source)
      .slice(0, 200)
      .forEach(([rawKey, rawValue]) => {
        const key = sanitizeKey(rawKey, 80);
        if (!key) return;
        customFields[key] = sanitizeString(String(rawValue ?? ""), 4000);
      });

    profile.customFields = customFields;
  }
  return { ok: true, value: profile };
};

module.exports = {
  PROFILE_KEYS,
  isValidObjectId,
  parseDateValue,
  sanitizeFormComponents,
  sanitizeKey,
  sanitizeProfilePayload,
  sanitizeString,
  sanitizeSubmissionData,
};
