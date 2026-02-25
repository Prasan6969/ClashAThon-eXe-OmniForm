export type Organization = {
  _id: string;
  name: string;
  slug: string;
  status: string;
  panNumber?: string;
  licenseNumber?: string;
  location?: string;
  subscriptionStatus?: string;
  subscriptionStartsAt?: string;
  subscriptionEndsAt?: string;
};

export type FormField = {
  id: string;
  label: string;
  type: string;
  tag?: string;
  iconName?: string;
  required?: boolean;
  options?: string[];
};

export type Form = {
  _id: string;
  name: string;
  description?: string;
  organizationId?: string;
  components?: FormField[];
  fields?: FormField[];
};

export type Submission = {
  _id: string;
  formId: string | { _id: string; name: string; fields?: FormField[] };
  status: "pending" | "completed" | "rejected" | "canceled";
  createdAt: string;
  data?: Record<string, string>;
  reviewNotes?: string;
  cooldownUntil?: string;
};

export type UserSubmissionDetail = Submission & {
  formId: string | { _id: string; name: string; fields?: FormField[] };
};

export type OrgSubmissionSummary = {
  _id: string;
  formId: string | { _id: string; name: string };
  status: "pending" | "completed" | "rejected" | "canceled";
  createdAt: string;
};

export type OrgSubmissionDetail = Submission & {
  formId: string | { _id: string; name: string; fields?: FormField[] };
};

export type TagDefinition = {
  _id: string;
  label: string;
  tag: string;
  type: "text" | "email" | "date" | "number" | "image" | "select" | "map";
  options?: string[];
};

export type Profile = {
  fullName?: string;
  workEmail?: string;
  personalEmail?: string;
  address?: string;
  phone?: string;
  citizenshipNumber?: string;
  profilePhotoUrl?: string;
  citizenshipPhotoUrl?: string;
  customFields?: Record<string, string>;
};

export type ProfileImageField = `${string}PhotoUrl`;

export type View = "user" | "profile" | "admin" | "org";
export type AdminView = "dashboard" | "builder" | "manage-orgs" | "manage-forms";

export type FormBuilderComponent = {
  id: string;
  type: string;
  label: string;
  tag: string;
  iconName?: string;
  required: boolean;
  options: string;
};

export type BuilderPaletteComponent = {
  id: string;
  type: string;
  label: string;
  tag: string;
  iconName: string;
  options: string;
  removable: boolean;
};

export type CustomComponentDraft = {
  label: string;
  type: string;
  tag: string;
  iconName: string;
  required: boolean;
  options: string;
};
