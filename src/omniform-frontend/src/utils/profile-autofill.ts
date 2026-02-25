type FormField = {
  id: string;
  label: string;
  type: string;
  tag?: string;
  required?: boolean;
};

type FormShape = {
  components?: FormField[];
  fields?: FormField[];
};

type ProfileShape = {
  fullName?: string;
  workEmail?: string;
  personalEmail?: string;
  address?: string;
  phone?: string;
  citizenshipNumber?: string;
  profilePhotoUrl?: string;
  citizenshipPhotoUrl?: string;
  citizenshipFrontPhotoUrl?: string;
  citizenshipBackPhotoUrl?: string;
  customFields?: Record<string, string>;
};

export const baseProfileKeys = [
  "fullName",
  "workEmail",
  "personalEmail",
  "address",
  "phone",
  "citizenshipNumber",
  "profilePhotoUrl",
  "citizenshipPhotoUrl",
  "citizenshipFrontPhotoUrl",
  "citizenshipBackPhotoUrl",
] as const;

type BaseProfileKey = (typeof baseProfileKeys)[number];

export type SaveCandidate = {
  key: string;
  value: string;
  label: string;
};

const aliases: Record<string, string[]> = {
  fullName: ["name", "fullname", "full_name", "legalname"],
  workEmail: ["workemail", "officeemail", "businessemail"],
  personalEmail: ["email", "personalemail", "privateemail"],
  address: ["homeaddress", "residentialaddress", "location"],
  phone: ["phonenumber", "mobile", "mobilenumber", "contactnumber"],
  citizenshipNumber: ["citizenship", "idnumber", "nationalid"],
  profilePhotoUrl: ["profilephoto", "avatar", "profileimage"],
  citizenshipPhotoUrl: ["citizenshipphoto", "idphoto", "documentphoto"],
  citizenshipFrontPhotoUrl: [
    "citizenshipfront",
    "citizenshipfrontphoto",
    "idfront",
    "frontid",
    "documentfront",
  ],
  citizenshipBackPhotoUrl: [
    "citizenshipback",
    "citizenshipbackphoto",
    "idback",
    "backid",
    "documentback",
  ],
};

export const normalizeKey = (value: string) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export const toProfileTag = (value: string) => {
  const cleaned = String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .replace(/\s+/g, " ");

  if (!cleaned) return "";

  return cleaned
    .split(/\s+/)
    .map((part, index) => {
      const lower = part.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
};

const baseKeyByAlias = (() => {
  const map = new Map<string, string>();
  Object.entries(aliases).forEach(([baseKey, values]) => {
    map.set(normalizeKey(baseKey), baseKey);
    values.forEach((alias) => map.set(normalizeKey(alias), baseKey));
  });
  return map;
})();

const resolveBaseKey = (key: string): BaseProfileKey | "" =>
  (baseKeyByAlias.get(normalizeKey(key)) as BaseProfileKey | undefined) || "";

const getComponents = (form: FormShape) => form.components || form.fields || [];

const readCustom = (profile: ProfileShape, lookupKey: string) => {
  const source = profile.customFields || {};
  const exact = source[lookupKey];
  if (exact) return exact;

  const normalizedLookup = normalizeKey(lookupKey);
  const matchKey = Object.keys(source).find(
    (item) => normalizeKey(item) === normalizedLookup
  );
  if (!matchKey) return "";
  return source[matchKey] || "";
};

const readProfileValue = (profile: ProfileShape, rawKey: string) => {
  const baseKey = resolveBaseKey(rawKey);
  if (baseKey && profile[baseKey]) {
    return String(profile[baseKey] || "");
  }

  const direct = profile[rawKey as keyof ProfileShape];
  if (direct) return String(direct || "");

  return readCustom(profile, rawKey);
};

export const buildAutofillPayload = (form: FormShape, profile: ProfileShape) => {
  const data: Record<string, string> = {};
  getComponents(form).forEach((field, index) => {
    const fieldKey = field.id || field.tag || `field-${index}`;
    const lookupKey = field.tag || field.id || field.label;
    data[fieldKey] = lookupKey ? readProfileValue(profile, lookupKey) : "";
  });
  return data;
};

export const mapSubmissionData = (
  form: FormShape,
  formValues: Record<string, string>
) => {
  const mapped: Record<string, string> = {};
  getComponents(form).forEach((field, index) => {
    const fieldKey = field.id || field.tag || `field-${index}`;
    const dataKey = field.tag || field.id || toProfileTag(field.label) || fieldKey;
    mapped[dataKey] = formValues[fieldKey] || "";
  });
  return mapped;
};

export const collectUnsavedCandidates = (
  form: FormShape,
  formValues: Record<string, string>,
  profile: ProfileShape
) => {
  const seen = new Set<string>();
  const candidates: SaveCandidate[] = [];

  getComponents(form).forEach((field, index) => {
    const fieldKey = field.id || field.tag || `field-${index}`;
    const value = String(formValues[fieldKey] || "").trim();
    if (!value) return;

    const logicalKey = field.tag || field.id || toProfileTag(field.label);
    if (!logicalKey) return;

    const dedupe = normalizeKey(logicalKey);
    if (!dedupe || seen.has(dedupe)) return;
    seen.add(dedupe);

    const existing = readProfileValue(profile, logicalKey).trim();
    if (existing) return;

    candidates.push({
      key: logicalKey,
      value,
      label: field.label || logicalKey,
    });
  });

  return candidates;
};

export const mergeCandidatesIntoProfile = (
  profile: ProfileShape,
  candidates: SaveCandidate[]
): ProfileShape => {
  const next: ProfileShape = {
    ...profile,
    customFields: { ...(profile.customFields || {}) },
  };

  candidates.forEach((item) => {
    const baseKey = resolveBaseKey(item.key);
    if (baseKey) {
      next[baseKey] = item.value;
      return;
    }

    const key = toProfileTag(item.key) || item.key;
    next.customFields = {
      ...(next.customFields || {}),
      [key]: item.value,
    };
  });

  return next;
};

export const ensureProfileCustomKeys = (
  profile: ProfileShape,
  form: FormShape
): ProfileShape => {
  const nextCustom = { ...(profile.customFields || {}) };
  let changed = false;

  getComponents(form).forEach((field) => {
    const logicalKey = field.tag || field.id || toProfileTag(field.label);
    if (!logicalKey) return;

    const baseKey = resolveBaseKey(logicalKey);
    if (baseKey) return;

    if (nextCustom[logicalKey] !== undefined) return;
    nextCustom[logicalKey] = "";
    changed = true;
  });

  if (!changed) return profile;
  return { ...profile, customFields: nextCustom };
};
