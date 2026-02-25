import {
  useUser,
  useAuth,
  SignInButton,
  SignOutButton,
} from "@clerk/clerk-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, User } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { LandingPage } from "./components/layout/LandingPage";
import { FormSaveModal } from "./components/modals/FormSaveModal";
import { CooldownPromptModal } from "./components/modals/CooldownPromptModal";
import { SavePromptModal } from "./components/modals/SavePromptModal";
import { CustomComponentModal } from "./components/modals/CustomComponentModal";
import { SaveReusableComponentModal } from "./components/modals/SaveReusableComponentModal";
import { ComponentContextMenu } from "./components/menus/ComponentContextMenu";
import {
  baseProfileKeys,
  buildAutofillPayload,
  collectUnsavedCandidates,
  ensureProfileCustomKeys,
  mapSubmissionData,
  mergeCandidatesIntoProfile,
  toProfileTag,
} from "./utils/profile-autofill";
import type { SaveCandidate } from "./utils/profile-autofill";
import {
  type AdminView,
  type BuilderPaletteComponent,
  type CustomComponentDraft,
  type Form,
  type FormBuilderComponent,
  type FormField,
  type Organization,
  type OrgSubmissionDetail,
  type OrgSubmissionSummary,
  type Profile,
  type ProfileImageField,
  type Submission,
  type TagDefinition,
  type UserSubmissionDetail,
  type View,
} from "./types/app";
import { defaultBuilderComponents } from "./features/admin/builder/default-components";
import { AdminBuilderPage } from "./features/admin/builder/AdminBuilderPage";
import { UserMyFormsPage } from "./features/user/pages/UserMyFormsPage";
import { UserSearchFormsPage } from "./features/user/pages/UserSearchFormsPage";
import { AdminDashboardPage } from "./features/admin/pages/AdminDashboardPage";
import { OrganizationDashboardPage } from "./features/organization/pages/OrganizationDashboardPage";
import { ProfilePage } from "./features/user/pages/ProfilePage";
import { OnboardingPage } from "./features/user/pages/OnboardingPage";
import { UserSubmissionDetailPage } from "./features/user/pages/UserSubmissionDetailPage";
import { UserFormFillPage } from "./features/user/pages/UserFormFillPage";
import { UserOrganizationFormsPage } from "./features/user/pages/UserOrganizationFormsPage";
import { OrganizationSubmissionReviewPage } from "./features/organization/pages/OrganizationSubmissionReviewPage";
import { AdminOrganizationsPage } from "./features/admin/pages/AdminOrganizationsPage";
import { AdminTagsPage } from "./features/admin/pages/AdminTagsPage";
import { AdminOrganizationSettingsPage } from "./features/admin/pages/AdminOrganizationSettingsPage";
import { AdminManageOrganizationsPage } from "./features/admin/pages/AdminManageOrganizationsPage";
import { AdminManageFormsPage } from "./features/admin/pages/AdminManageFormsPage";
import { MapPreview } from "./components/ui/map-preview";
export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const role = user?.publicMetadata?.role || "user";
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_URL || "http://localhost:5000",
    []
  );

  const [orgName, setOrgName] = useState("");
  const [orgUserId, setOrgUserId] = useState("");
  const [createdOrgId, setCreatedOrgId] = useState("");
  const [orgCreateSubscriptionStartsAt, setOrgCreateSubscriptionStartsAt] =
    useState("");
  const [orgCreateSubscriptionEndsAt, setOrgCreateSubscriptionEndsAt] =
    useState("");
  const [roleUserEmail, setRoleUserEmail] = useState("");
  const [roleValue, setRoleValue] = useState("user");
  const [roleOrgId, setRoleOrgId] = useState("");
  const [orgMessage, setOrgMessage] = useState("");
  const [roleMessage, setRoleMessage] = useState("");
  const [formOrgId, setFormOrgId] = useState("");
  const [formId, setFormId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formComponents, setFormComponents] = useState<FormBuilderComponent[]>(
    []
  );
  const [draggingComponentId, setDraggingComponentId] = useState<string | null>(
    null
  );
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [showCustomComponent, setShowCustomComponent] = useState(false);
  const [savedCustomComponents, setSavedCustomComponents] = useState<
    BuilderPaletteComponent[]
  >([]);
  const [pendingReusableComponent, setPendingReusableComponent] = useState<
    BuilderPaletteComponent | null
  >(null);
  const [componentContextMenu, setComponentContextMenu] = useState<{
    x: number;
    y: number;
    componentId: string;
  } | null>(null);
  const [customComponent, setCustomComponent] = useState<CustomComponentDraft>({
    label: "",
    type: "text",
    tag: "",
    iconName: "type",
    required: false,
    options: "",
  });
  const [formMessage, setFormMessage] = useState("");
  const [showFormSave, setShowFormSave] = useState(false);
  const [formLastSavedAt, setFormLastSavedAt] = useState<number | null>(null);
  const [formDraftTouchedAt, setFormDraftTouchedAt] = useState<number | null>(null);
  const [adminOrgs, setAdminOrgs] = useState<Organization[]>([]);
  const [manageOrgQuery, setManageOrgQuery] = useState("");
  const [manageFormQuery, setManageFormQuery] = useState("");
  const [manageForms, setManageForms] = useState<Form[]>([]);
  const [manageFormsLoading, setManageFormsLoading] = useState(false);
  const [adminTags, setAdminTags] = useState<TagDefinition[]>([]);
  const [tagLabel, setTagLabel] = useState("");
  const [tagValue, setTagValue] = useState("");
  const [tagType, setTagType] = useState<TagDefinition["type"]>("text");
  const [tagOptions, setTagOptions] = useState("");
  const [tagMessage, setTagMessage] = useState("");
  const [editingTagId, setEditingTagId] = useState("");
  const [profileTags, setProfileTags] = useState<TagDefinition[]>([]);
  const [selectedManageOrg, setSelectedManageOrg] = useState<Organization | null>(
    null
  );
  const [orgSubmissions, setOrgSubmissions] = useState<OrgSubmissionSummary[]>(
    []
  );
  const [orgForms, setOrgForms] = useState<Form[]>([]);
  const [orgStatusFilter, setOrgStatusFilter] = useState("pending");
  const [orgFormFilter, setOrgFormFilter] = useState("");
  const [orgReviewNotes, setOrgReviewNotes] = useState<Record<string, string>>(
    {}
  );
  const [orgDashboardMessage, setOrgDashboardMessage] = useState("");
  const [orgMembership, setOrgMembership] = useState<Organization | null>(null);
  const [selectedOrgSubmission, setSelectedOrgSubmission] =
    useState<OrgSubmissionDetail | null>(null);
  const [orgSubmissionPage, setOrgSubmissionPage] = useState(1);
  const [orgSubmissionTotalPages, setOrgSubmissionTotalPages] = useState(1);
  const [orgSubmissionEmailQuery, setOrgSubmissionEmailQuery] = useState("");

  const [orgQuery, setOrgQuery] = useState("");
  const [orgResults, setOrgResults] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedAdminOrg, setSelectedAdminOrg] = useState<Organization | null>(
    null
  );
  const [orgSettingsName, setOrgSettingsName] = useState("");
  const [orgSettingsStatus, setOrgSettingsStatus] = useState("active");
  const [orgSettingsPanNumber, setOrgSettingsPanNumber] = useState("");
  const [orgSettingsLicenseNumber, setOrgSettingsLicenseNumber] = useState("");
  const [orgSettingsLocation, setOrgSettingsLocation] = useState("");
  const [orgSettingsSubscriptionStatus, setOrgSettingsSubscriptionStatus] =
    useState("active");
  const [orgSettingsSubscriptionStartsAt, setOrgSettingsSubscriptionStartsAt] =
    useState("");
  const [orgSettingsSubscriptionEndsAt, setOrgSettingsSubscriptionEndsAt] =
    useState("");
  const [orgSettingsMessage, setOrgSettingsMessage] = useState("");
  const [formQuery, setFormQuery] = useState("");
  const [forms, setForms] = useState<Form[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeForm, setActiveForm] = useState<Form | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [orgLoading, setOrgLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedUserSubmission, setSelectedUserSubmission] =
    useState<UserSubmissionDetail | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [componentSearch, setComponentSearch] = useState("");
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showCooldownPrompt, setShowCooldownPrompt] = useState(false);
  const [cooldownMessage, setCooldownMessage] = useState("");
  const [saveCandidates, setSaveCandidates] = useState<SaveCandidate[]>([]);
  const [selectedSaveCandidateKeys, setSelectedSaveCandidateKeys] = useState<
    Record<string, boolean>
  >({});
  const [pendingSubmissionData, setPendingSubmissionData] = useState<
    Record<string, string> | null
  >(null);
  const [uploadingImageTarget, setUploadingImageTarget] = useState("");
  const [profileImageFileNames, setProfileImageFileNames] = useState<
    Record<string, string>
  >({});
  const [formImageFileNames, setFormImageFileNames] = useState<
    Record<string, string>
  >({});
  const [profileDraft, setProfileDraft] = useState<Profile>({
    fullName: "",
    workEmail: "",
    personalEmail: "",
    address: "",
    phone: "",
    citizenshipNumber: "",
    profilePhotoUrl: "",
    citizenshipPhotoUrl: "",
    customFields: {},
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [view, setView] = useState<View>("user");
  const [, setAdminView] = useState<AdminView>("dashboard");
  const [resolvedRole, setResolvedRole] = useState<string | null>(null);
  const [resolvedOrganizationId, setResolvedOrganizationId] = useState<string>("");
  const [hasReloaded, setHasReloaded] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [roleResolved, setRoleResolved] = useState(false);
  const membershipEndsAt = orgMembership?.subscriptionEndsAt
    ? new Date(orgMembership.subscriptionEndsAt)
    : null;
  const membershipExpired = membershipEndsAt
    ? membershipEndsAt.getTime() < Date.now()
    : false;
  const membershipStatus = membershipExpired
    ? "expired"
    : orgMembership?.subscriptionStatus || "unknown";

  const profileNavName =
    profileDraft.fullName ||
    profile?.fullName ||
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress ||
    "Profile";

  const profileNavAvatar = useMemo(() => {
    const cleanedName = String(profileNavName || "").trim();
    const initials = cleanedName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "PR";

    const hash = cleanedName
      .split("")
      .reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);

    const hues = [12, 28, 44, 58, 78, 102, 126, 148, 172, 198, 222, 248, 272, 296, 318, 342];
    const hueA = hues[hash % hues.length];
    const hueB = hues[(hash * 7 + 3) % hues.length];
    const angle = 120 + (hash % 120);
    const patternDensity = 10 + (hash % 8);

    return {
      initials,
      backgroundImage: `repeating-linear-gradient(135deg, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 2px, transparent 2px, transparent ${patternDensity}px), linear-gradient(${angle}deg, hsl(${hueA} 70% 44%), hsl(${hueB} 75% 55%))`,
    };
  }, [profileNavName]);

  const filteredAdminOrgs = useMemo(() => {
    const query = manageOrgQuery.trim().toLowerCase();
    if (!query) return adminOrgs;
    return adminOrgs.filter((org) =>
      org.name.toLowerCase().includes(query)
    );
  }, [adminOrgs, manageOrgQuery]);
  const filteredManageForms = useMemo(() => {
    const query = manageFormQuery.trim().toLowerCase();
    if (!query) return manageForms;
    return manageForms.filter((form) => {
      const name = form.name?.toLowerCase() || "";
      const description = form.description?.toLowerCase() || "";
      return name.includes(query) || description.includes(query);
    });
  }, [manageForms, manageFormQuery]);

  const builderComponents = useMemo(
    () => [...defaultBuilderComponents, ...savedCustomComponents],
    [defaultBuilderComponents, savedCustomComponents]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const cached = window.localStorage.getItem("omniform:saved-builder-components");
      if (!cached) return;
      const parsed = JSON.parse(cached);
      if (!Array.isArray(parsed)) return;
      const sanitized = parsed
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          id: String(item.id || `custom-template-${Date.now()}`),
          type: String(item.type || "text"),
          label: String(item.label || "Custom field"),
          tag: String(item.tag || toProfileTag(String(item.label || "customField"))),
          iconName: String(item.iconName || "type"),
          options: String(item.options || ""),
          removable: true,
        }));
      setSavedCustomComponents(sanitized);
    } catch (error) {
      setSavedCustomComponents([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "omniform:saved-builder-components",
      JSON.stringify(savedCustomComponents)
    );
  }, [savedCustomComponents]);

  const adminFetch = async (path: string, options: RequestInit) => {
    const token = await getToken();
    if (!token) {
      throw new Error("Not authenticated. Please sign in again.");
    }
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...(options.headers || {}),
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "Request failed");
    }
    return payload;
  };

  const authedFetch = async (path: string, options?: RequestInit) => {
    const token = await getToken();
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...(options?.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "Request failed");
    }
    return payload;
  };

  const uploadToImageKit = async (file: File, folder: string) => {
    const authPayload = await authedFetch("/api/uploads/imagekit-auth");
    const auth = authPayload?.data;

    if (!auth?.token || !auth?.signature || !auth?.expire || !auth?.publicKey) {
      throw new Error("Image upload auth failed");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name || `upload-${Date.now()}`);
    formData.append("token", String(auth.token));
    formData.append("signature", String(auth.signature));
    formData.append("expire", String(auth.expire));
    formData.append("publicKey", String(auth.publicKey));
    formData.append("folder", folder);
    formData.append("useUniqueFileName", "true");

    const uploadResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body: formData,
    });

    const uploadPayload = await uploadResponse.json().catch(() => ({}));
    if (!uploadResponse.ok) {
      throw new Error(uploadPayload?.message || "Image upload failed");
    }

    const uploadedUrl = uploadPayload?.url || "";
    if (!uploadedUrl) {
      throw new Error("Image upload returned no URL");
    }

    return uploadedUrl as string;
  };

  const getFileNameFromUrl = (url?: string) => {
    if (!url) return "";
    try {
      const pathname = new URL(url).pathname;
      const name = pathname.split("/").pop() || "";
      return decodeURIComponent(name);
    } catch (error) {
      const clean = String(url).split("?")[0] || "";
      const name = clean.split("/").pop() || "";
      return decodeURIComponent(name);
    }
  };

  const getProfileImageValue = (
    source: Profile,
    key: "profilePhotoUrl"
  ) => {
    const direct = source[key];
    if (direct) return direct;

    const custom = source.customFields || {};
    if (custom[key]) return custom[key];
    return "";
  };

  const getSubmissionFieldType = (
    submission: UserSubmissionDetail | OrgSubmissionDetail,
    key: string
  ) => {
    if (!submission || typeof submission.formId === "string" || !submission.formId) {
      return "";
    }
    const formFields = (
      (submission.formId as {
        fields?: FormField[];
        components?: FormField[];
      }).fields ||
      (submission.formId as {
        fields?: FormField[];
        components?: FormField[];
      }).components ||
      []
    ) as FormField[];

    const match = formFields.find((field) => {
      const fieldKey = field.tag || toProfileTag(field.label || "");
      return fieldKey === key || field.id === key;
    });

    return String(match?.type || "").toLowerCase();
  };

  const isImageUrl = (value: string) => /^https?:\/\//i.test(value);

  const renderSubmissionValue = (
    submission: UserSubmissionDetail | OrgSubmissionDetail,
    key: string,
    rawValue: string
  ) => {
    const value = String(rawValue || "").trim();
    const fieldType = getSubmissionFieldType(submission, key);
    const isMapField = fieldType === "map";
    const isImageField =
      fieldType === "image" || (isImageUrl(value) && /(photo|image)/i.test(key));

    if (isMapField) {
      const mapLabel = (() => {
        try {
          const parsed = JSON.parse(value);
          if (parsed?.address) return String(parsed.address);
          if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number") {
            return `${parsed.lat.toFixed(6)}, ${parsed.lng.toFixed(6)}`;
          }
        } catch {
          return value || "No location submitted.";
        }
        return value || "No location submitted.";
      })();

      return (
        <div className="mt-1">
          <p className="text-sm text-sand-950">{mapLabel}</p>
          <MapPreview value={value} />
        </div>
      );
    }

    if (isImageField && isImageUrl(value)) {
      return (
        <div className="mt-2 space-y-2">
          <img
            src={value}
            alt={key}
            className="h-44 w-full rounded-xl border border-sand-200 object-cover"
          />
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-sand-700 underline"
          >
            Open image
          </a>
        </div>
      );
    }

    return <p className="mt-1 text-sm text-sand-950">{value || "—"}</p>;
  };

  const isBaseProfileKey = (key: string): key is keyof Profile =>
    (baseProfileKeys as readonly string[]).includes(key);

  const getProfileTagFieldValue = (tag: string) => {
    if (isBaseProfileKey(tag)) {
      return String(profileDraft[tag] || "");
    }
    return String(profileDraft.customFields?.[tag] || "");
  };

  const setProfileTagFieldValue = (tag: string, value: string) => {
    if (isBaseProfileKey(tag)) {
      setProfileDraft((prev) => ({ ...prev, [tag]: value }));
      return;
    }

    setProfileDraft((prev) => ({
      ...prev,
      customFields: {
        ...(prev.customFields || {}),
        [tag]: value,
      },
    }));
  };

  const handleProfileImageUpload = async (
    field: ProfileImageField,
    file?: File
  ) => {
    if (!file) return;
    try {
      setProfileMessage("");
      setUploadingImageTarget(field);
      setProfileImageFileNames((prev) => ({
        ...prev,
        [field]: file.name,
      }));
      const uploadedUrl = await uploadToImageKit(file, "/omniform/profile-documents");
      const nextProfileDraft: Profile = {
        ...profileDraft,
        [field]: uploadedUrl,
      };

      setProfileDraft(nextProfileDraft);

      const payload = await authedFetch("/api/profile/me", {
        method: "PUT",
        body: JSON.stringify(nextProfileDraft),
      });
      setProfile(payload.data || null);
      setProfileDraft((payload.data as Profile) || nextProfileDraft);
      setProfileMessage("Image uploaded and saved.");
    } catch (error) {
      setProfileMessage(
        error instanceof Error ? error.message : "Image upload failed."
      );
    } finally {
      setUploadingImageTarget("");
    }
  };

  const handleFormImageUpload = async (fieldKey: string, file?: File) => {
    if (!file) return;
    try {
      setSubmitMessage("");
      setUploadingImageTarget(`form:${fieldKey}`);
      setFormImageFileNames((prev) => ({
        ...prev,
        [fieldKey]: file.name,
      }));
      const uploadedUrl = await uploadToImageKit(file, "/omniform/form-submissions");
      setFormValues((prev) => ({
        ...prev,
        [fieldKey]: uploadedUrl,
      }));
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "Image upload failed."
      );
    } finally {
      setUploadingImageTarget("");
    }
  };

  const handleProfileTagImageUpload = async (tag: string, file?: File) => {
    if (!file) return;
    try {
      setProfileMessage("");
      setUploadingImageTarget(`tag:${tag}`);
      setProfileImageFileNames((prev) => ({ ...prev, [tag]: file.name }));
      const uploadedUrl = await uploadToImageKit(file, "/omniform/profile-documents");

      const nextProfileDraft: Profile = isBaseProfileKey(tag)
        ? { ...profileDraft, [tag]: uploadedUrl }
        : {
            ...profileDraft,
            customFields: {
              ...(profileDraft.customFields || {}),
              [tag]: uploadedUrl,
            },
          };

      setProfileDraft(nextProfileDraft);

      const payload = await authedFetch("/api/profile/me", {
        method: "PUT",
        body: JSON.stringify(nextProfileDraft),
      });
      setProfile(payload.data || null);
      setProfileDraft((payload.data as Profile) || nextProfileDraft);
      setProfileMessage("Image uploaded and saved.");
    } catch (error) {
      setProfileMessage(
        error instanceof Error ? error.message : "Image upload failed."
      );
    } finally {
      setUploadingImageTarget("");
    }
  };

  const loadAdminTags = async () => {
    try {
      const payload = await adminFetch("/api/admin/tags", { method: "GET" });
      setAdminTags(payload.data || []);
    } catch (error) {
      setAdminTags([]);
    }
  };

  const handleCreateTag = async () => {
    try {
      setTagMessage("");
      if (!tagLabel.trim()) {
        setTagMessage("Tag label is required.");
        return;
      }

      const payload = {
        label: tagLabel,
        tag: tagValue,
        type: tagType,
        options: tagOptions
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      if (editingTagId) {
        await adminFetch(`/api/admin/tags/${editingTagId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch("/api/admin/tags", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setTagLabel("");
      setTagValue("");
      setTagType("text");
      setTagOptions("");
      setEditingTagId("");
      setTagMessage(editingTagId ? "Tag updated." : "Tag created.");
      await loadAdminTags();
    } catch (error) {
      setTagMessage(error instanceof Error ? error.message : "Failed to create tag.");
    }
  };

  const handleStartEditTag = (item: TagDefinition) => {
    setEditingTagId(item._id);
    setTagLabel(item.label);
    setTagValue(item.tag);
    setTagType(item.type);
    setTagOptions((item.options || []).join(", "));
    setTagMessage("");
  };

  const handleCancelEditTag = () => {
    setEditingTagId("");
    setTagLabel("");
    setTagValue("");
    setTagType("text");
    setTagOptions("");
    setTagMessage("");
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      setTagMessage("");
      await adminFetch(`/api/admin/tags/${tagId}`, { method: "DELETE" });
      setAdminTags((prev) => prev.filter((item) => item._id !== tagId));
      setTagMessage("Tag removed.");
    } catch (error) {
      setTagMessage(error instanceof Error ? error.message : "Failed to remove tag.");
    }
  };

  const handleCreateOrg = async () => {
    try {
      setOrgMessage("");
      if (!orgName.trim()) {
        setOrgMessage("Organization name is required.");
        return;
      }
      const payload = await adminFetch("/api/admin/orgs", {
        method: "POST",
        body: JSON.stringify({
          name: orgName,
          organizationUserId: orgUserId,
          subscriptionStartsAt: orgCreateSubscriptionStartsAt || null,
          subscriptionEndsAt: orgCreateSubscriptionEndsAt || null,
        }),
      });
      const orgId = payload?.data?._id || "";
      setCreatedOrgId(orgId);
      setOrgMessage("Organization created.");
      if (orgId) {
        setFormOrgId(orgId);
      }

      if (orgUserId && orgId) {
        await adminFetch(`/api/admin/orgs/${orgId}/assign-user`, {
          method: "POST",
          body: JSON.stringify({ organizationUserId: orgUserId }),
        });
        setOrgMessage("Organization created and user assigned.");
      }

      const orgList = await adminFetch("/api/admin/orgs", { method: "GET" });
      setAdminOrgs(orgList.data || []);
    } catch (error) {
      setOrgMessage(
        error instanceof Error ? error.message : "Failed to create organization."
      );
    }
  };

  const handleSetRole = async () => {
    try {
      setRoleMessage("");
      if (!roleUserEmail.trim()) {
        setRoleMessage("User email is required.");
        return;
      }
      await adminFetch(`/api/admin/users/role-by-email`, {
        method: "POST",
        body: JSON.stringify({
          email: roleUserEmail,
          role: roleValue,
          organizationId: roleOrgId,
        }),
      });
      setRoleMessage("User role updated.");
    } catch (error) {
      setRoleMessage(
        error instanceof Error ? error.message : "Failed to update role."
      );
    }
  };

  const coerceTagType = (value: string): TagDefinition["type"] => {
    if (value === "email") return "email";
    if (value === "date") return "date";
    if (value === "number") return "number";
    if (value === "image") return "image";
    if (value === "select") return "select";
    if (value === "map") return "map";
    return "text";
  };

  const splitComponentOptions = (rawOptions: string) =>
    rawOptions
      ? rawOptions
          .split(",")
          .map((option) => option.trim())
          .filter(Boolean)
      : [];

  const upsertSystemTag = async (payload: {
    label: string;
    tag: string;
    type: TagDefinition["type"];
    options: string[];
  }) => {
    const normalizedTag = payload.tag.trim();
    if (!normalizedTag) return;
    if (baseProfileKeys.includes(normalizedTag as (typeof baseProfileKeys)[number])) {
      return;
    }

    if (adminTags.some((item) => item.tag === normalizedTag)) {
      return;
    }

    try {
      const created = await adminFetch("/api/admin/tags", {
        method: "POST",
        body: JSON.stringify({
          label: payload.label,
          tag: normalizedTag,
          type: payload.type,
          options: payload.type === "select" ? payload.options : [],
        }),
      });

      const nextTag = created?.data as TagDefinition | undefined;
      if (nextTag?._id) {
        setAdminTags((prev) => {
          if (prev.some((item) => item.tag === nextTag.tag)) return prev;
          return [...prev, nextTag].sort((a, b) =>
            (a.label || "").localeCompare(b.label || "")
          );
        });
      }
    } catch (error) {
      if (error instanceof Error && /already exists/i.test(error.message)) {
        return;
      }
      throw error;
    }
  };

  const handleCreateForm = async () => {
    try {
      setFormMessage("");
      if (!formOrgId.trim()) {
        setFormMessage("Organization ID is required.");
        return;
      }
      if (!formName.trim()) {
        setFormMessage("Form name is required.");
        return;
      }
      const sourceComponents = formComponents.filter((component) =>
        component.label.trim()
      );

      const components = await Promise.all(
        sourceComponents.map(async (component) => {
          const cleanLabel = component.label.trim();
          const normalizedTag = component.tag.trim() || toProfileTag(cleanLabel);
          const normalizedType = coerceTagType(component.type.trim() || "text");
          const normalizedOptions = splitComponentOptions(component.options);

          if (normalizedTag) {
            await upsertSystemTag({
              label: cleanLabel,
              tag: normalizedTag,
              type: normalizedType,
              options: normalizedOptions,
            });
          }

          return {
            id: component.id,
            type: normalizedType,
            label: cleanLabel,
            tag: normalizedTag || undefined,
            required: component.required,
            options: normalizedOptions,
          };
        })
      );

      if (formId) {
        await adminFetch(`/api/admin/orgs/${formOrgId}/forms/${formId}`, {
          method: "PUT",
          body: JSON.stringify({
            name: formName,
            description: formDescription,
            components,
          }),
        });
        setFormMessage("Form updated.");
      } else {
        await adminFetch(`/api/admin/orgs/${formOrgId}/forms`, {
          method: "POST",
          body: JSON.stringify({
            name: formName,
            description: formDescription,
            components,
          }),
        });
        setFormMessage("Form created.");
      }

      setFormLastSavedAt(Date.now());
      setFormDraftTouchedAt(null);

      setFormId(null);
      setFormName("");
      setFormDescription("");
      setFormComponents([]);
      setShowFormSave(false);
      navigate("/admin");
    } catch (error) {
      setFormMessage(
        error instanceof Error ? error.message : "Failed to create form."
      );
    }
  };

  const resetFormBuilderDraft = () => {
    setFormId(null);
    setFormName("");
    setFormDescription("");
    setFormComponents([]);
    setFormOrgId("");
    setFormMessage("");
    setShowCustomComponent(false);
    setComponentSearch("");
    setFormLastSavedAt(null);
    setFormDraftTouchedAt(null);
  };

  const handleLeaveBuilder = () => {
    const hasUnsaved =
      formDraftTouchedAt &&
      (!formLastSavedAt || formDraftTouchedAt > formLastSavedAt);
    if (hasUnsaved) {
      const confirmed = window.confirm(
        "You have unsaved form changes. Discard them and leave the builder?"
      );
      if (!confirmed) return;
      resetFormBuilderDraft();
    } else {
      resetFormBuilderDraft();
    }
    navigate("/admin");
  };

  const handleOrgDecision = async (
    submissionId: string,
    decision: "accept" | "reject"
  ) => {
    try {
      setOrgDashboardMessage("");
      await authedFetch(`/api/submissions/${submissionId}/${decision}`, {
        method: "POST",
        body: JSON.stringify({
          reviewNotes: orgReviewNotes[submissionId] || "",
        }),
      });
      setOrgDashboardMessage(
        decision === "accept" ? "Submission accepted." : "Submission rejected."
      );
      const refreshed = await authedFetch(
        `/api/submissions/org?status=${orgStatusFilter}&formId=${orgFormFilter}&page=${orgSubmissionPage}&limit=20&email=${encodeURIComponent(
          orgSubmissionEmailQuery
        )}`
      );
      setOrgSubmissions(refreshed.data || []);
      setOrgSubmissionTotalPages(refreshed.totalPages || 1);
      if (selectedOrgSubmission?._id === submissionId) {
        await fetchOrgSubmissionDetail(submissionId);
      }
    } catch (error) {
      setOrgDashboardMessage(
        error instanceof Error ? error.message : "Update failed."
      );
    }
  };

  const loadOrgSubmissions = async (
    formIdOverride?: string,
    statusOverride?: string,
    pageOverride?: number,
    emailOverride?: string
  ) => {
    try {
      setOrgDashboardMessage("");
      const nextStatus = statusOverride ?? orgStatusFilter;
      const nextPage = pageOverride ?? orgSubmissionPage;
      const nextEmail =
        emailOverride !== undefined ? emailOverride : orgSubmissionEmailQuery;
      const nextFormId =
        formIdOverride !== undefined ? formIdOverride : orgFormFilter;
      const payload = await authedFetch(
        `/api/submissions/org?status=${nextStatus}&formId=${nextFormId}&page=${nextPage}&limit=20&email=${encodeURIComponent(
          nextEmail
        )}`
      );
      setOrgSubmissions(payload.data || []);
      setOrgSubmissionTotalPages(payload.totalPages || 1);
    } catch (error) {
      setOrgDashboardMessage(
        error instanceof Error ? error.message : "Update failed."
      );
    }
  };

  const handleOrgDashboardRefresh = useCallback(async () => {
    if (!isLoaded || !user || role !== "organization") return;

    const organizationId =
      resolvedOrganizationId ||
      (user.publicMetadata?.organizationId as string | undefined) ||
      "";
    if (!organizationId) return;

    try {
      const formPayload = await authedFetch(
        `/api/orgs/${organizationId}/forms?query=`
      );
      setOrgForms(formPayload.data || []);
    } catch {
      // keep current values if refresh fails
    }

    try {
      const submissionPayload = await authedFetch(
        `/api/submissions/org?status=${orgStatusFilter}&formId=${orgFormFilter}&page=${orgSubmissionPage}&limit=20&email=${encodeURIComponent(
          orgSubmissionEmailQuery
        )}`
      );
      setOrgSubmissions(submissionPayload.data || []);
      setOrgSubmissionTotalPages(submissionPayload.totalPages || 1);
    } catch {
      // keep current values if refresh fails
    }
  }, [
    isLoaded,
    user,
    role,
    resolvedOrganizationId,
    orgStatusFilter,
    orgFormFilter,
    orgSubmissionPage,
    orgSubmissionEmailQuery,
  ]);

  const fetchOrgSubmissionDetail = async (submissionId: string) => {
    try {
      setOrgDashboardMessage("");
      const payload = await authedFetch(`/api/submissions/org/${submissionId}`);
      setSelectedOrgSubmission(payload.data || null);
      if (!payload.data) {
        setOrgDashboardMessage("Submission not found.");
      }
    } catch (error) {
      setOrgDashboardMessage(
        error instanceof Error ? error.message : "Failed to load submission."
      );
    }
  };

  const handleOrgSearch = async (queryOverride?: string) => {
    try {
      setOrgLoading(true);
      const queryValue =
        queryOverride !== undefined ? queryOverride : orgQuery;
      const payload = await authedFetch(
        `/api/orgs?query=${encodeURIComponent(queryValue)}`
      );
      setOrgResults(payload.data || []);
    } catch (error) {
      setOrgResults([]);
    } finally {
      setOrgLoading(false);
    }
  };

  const handleSelectOrg = async (org: Organization) => {
    setSelectedOrg(org);
    setFormQuery("");
    setActiveForm(null);
    navigate(`/orgs/${org._id}`);
  };

  const handleFormSearch = async (orgId: string, queryOverride?: string) => {
    if (!selectedOrg) return;
    try {
      setFormLoading(true);
      const queryValue =
        queryOverride !== undefined ? queryOverride : formQuery;
      const payload = await authedFetch(
        `/api/orgs/${orgId}/forms?query=${encodeURIComponent(queryValue)}`
      );
      setForms(payload.data || []);
    } catch (error) {
      setForms([]);
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenManageOrg = async (org: Organization) => {
    setSelectedManageOrg(org);
    setManageFormQuery("");
    setAdminView("manage-forms");
    navigate("/admin/manage/forms");
    try {
      setManageFormsLoading(true);
      const payload = await adminFetch(`/api/orgs/${org._id}/forms?query=`, {
        method: "GET",
      });
      setManageForms(payload.data || []);
    } catch (error) {
      setManageForms([]);
    } finally {
      setManageFormsLoading(false);
    }
  };

  const handleOpenOrgSettings = async (org: Organization) => {
    try {
      setOrgSettingsMessage("");
      setSelectedAdminOrg(org);
      const payload = await adminFetch(`/api/admin/orgs/${org._id}`, {
        method: "GET",
      });
      const fetchedOrg = payload.data as Organization & {
        panNumber?: string;
        licenseNumber?: string;
        location?: string;
        subscriptionStatus?: string;
        subscriptionStartsAt?: string;
        subscriptionEndsAt?: string;
      };
      setOrgSettingsName(fetchedOrg.name || "");
      setOrgSettingsStatus(fetchedOrg.status || "active");
      setOrgSettingsPanNumber(fetchedOrg.panNumber || "");
      setOrgSettingsLicenseNumber(fetchedOrg.licenseNumber || "");
      setOrgSettingsLocation(fetchedOrg.location || "");
      setOrgSettingsSubscriptionStatus(
        fetchedOrg.subscriptionStatus || "active"
      );
      setOrgSettingsSubscriptionStartsAt(
        fetchedOrg.subscriptionStartsAt
          ? new Date(fetchedOrg.subscriptionStartsAt)
              .toISOString()
              .slice(0, 10)
          : ""
      );
      setOrgSettingsSubscriptionEndsAt(
        fetchedOrg.subscriptionEndsAt
          ? new Date(fetchedOrg.subscriptionEndsAt)
              .toISOString()
              .slice(0, 10)
          : ""
      );
      navigate(`/admin/orgs/${org._id}`);
    } catch (error) {
      setOrgSettingsMessage(
        error instanceof Error ? error.message : "Failed to load organization."
      );
    }
  };

  const handleSaveOrgSettings = async () => {
    if (!selectedAdminOrg) return;
    try {
      setOrgSettingsMessage("");
      const payload = await adminFetch(
        `/api/admin/orgs/${selectedAdminOrg._id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: orgSettingsName,
            status: orgSettingsStatus,
            panNumber: orgSettingsPanNumber,
            licenseNumber: orgSettingsLicenseNumber,
            location: orgSettingsLocation,
            subscriptionStatus: orgSettingsSubscriptionStatus,
            subscriptionStartsAt: orgSettingsSubscriptionStartsAt || null,
            subscriptionEndsAt: orgSettingsSubscriptionEndsAt || null,
          }),
        }
      );
      const updated = payload.data as Organization;
      setSelectedAdminOrg(updated);
      setOrgSettingsMessage("Organization updated.");
      setAdminOrgs((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      );
    } catch (error) {
      setOrgSettingsMessage(
        error instanceof Error ? error.message : "Failed to update organization."
      );
    }
  };

  const handleDeleteOrganization = async () => {
    if (!selectedAdminOrg) return;

    const confirmed = window.confirm(
      `Delete organization "${selectedAdminOrg.name}"? This will remove its forms and submissions.`
    );
    if (!confirmed) return;

    try {
      setOrgSettingsMessage("");
      await adminFetch(`/api/admin/orgs/${selectedAdminOrg._id}`, {
        method: "DELETE",
      });

      setAdminOrgs((prev) => prev.filter((item) => item._id !== selectedAdminOrg._id));
      setSelectedAdminOrg(null);
      setOrgSettingsName("");
      setOrgSettingsStatus("active");
      setOrgSettingsPanNumber("");
      setOrgSettingsLicenseNumber("");
      setOrgSettingsLocation("");
      setOrgSettingsSubscriptionStatus("active");
      setOrgSettingsSubscriptionStartsAt("");
      setOrgSettingsSubscriptionEndsAt("");
      navigate("/admin/orgs");
    } catch (error) {
      setOrgSettingsMessage(
        error instanceof Error ? error.message : "Failed to delete organization."
      );
    }
  };

  const handleEditManageForm = async (form: Form) => {
    if (!selectedManageOrg) return;
    try {
      const payload = await adminFetch(
        `/api/admin/orgs/${selectedManageOrg._id}/forms/${form._id}`,
        { method: "GET" }
      );
      const fetchedForm = payload.data as Form;
      setFormId(fetchedForm._id);
      setFormOrgId(String(selectedManageOrg._id));
      setFormName(fetchedForm.name || "");
      setFormDescription(fetchedForm.description || "");
      const components = (fetchedForm.components || fetchedForm.fields || []).map(
        (component) => ({
          id: component.id,
          type: component.type,
          label: component.label || "",
          tag: component.tag || "",
          required: component.required ?? false,
          options: Array.isArray(component.options)
            ? component.options.join(", ")
            : "",
        })
      );
      setFormComponents(components);
      setFormLastSavedAt(Date.now());
      setFormDraftTouchedAt(null);
      setAdminView("builder");
      navigate("/admin/builder");
      setShowFormSave(false);
    } catch (error) {
      setFormMessage(
        error instanceof Error ? error.message : "Failed to load form."
      );
    }
  };

  const handleDeleteManageForm = async (form: Form) => {
    if (!selectedManageOrg) return;
    try {
      setFormMessage("");
      const confirmed = window.confirm(
        `Delete "${form.name}"? This cannot be undone.`
      );
      if (!confirmed) return;
      await adminFetch(`/api/admin/orgs/${selectedManageOrg._id}/forms/${form._id}`, {
        method: "DELETE",
      });
      setManageForms((prev) => prev.filter((item) => item._id !== form._id));
      setFormMessage("Form deleted.");
    } catch (error) {
      setFormMessage(
        error instanceof Error ? error.message : "Failed to delete form."
      );
    }
  };

  useEffect(() => {
    if (!isLoaded || !user || role !== "admin" || !selectedManageOrg) return;
    const timer = setTimeout(async () => {
      try {
        setManageFormsLoading(true);
        const payload = await adminFetch(
          `/api/orgs/${selectedManageOrg._id}/forms?query=${encodeURIComponent(
            manageFormQuery
          )}`,
          { method: "GET" }
        );
        setManageForms(payload.data || []);
      } catch (error) {
        setManageForms([]);
      } finally {
        setManageFormsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [isLoaded, user, role, selectedManageOrg, manageFormQuery]);

  const openForm = async (form: Form) => {
    const submission = submissions.find((item) => {
      if (typeof item.formId === "string") return item.formId === form._id;
      return item.formId?._id === form._id;
    });
    if (submission?.cooldownUntil && submission.status === "completed") {
      const cooldownDate = new Date(submission.cooldownUntil);
      const now = new Date();
      if (cooldownDate > now) {
        const diffMs = cooldownDate.getTime() - now.getTime();
        const cooldownDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        setCooldownMessage(
          `You recently filled this form. Please wait ${cooldownDays} day${
            cooldownDays === 1 ? "" : "s"
          } before submitting again.`
        );
        setShowCooldownPrompt(true);
        return;
      }
    }
    try {
      setFormLoading(true);
      const payload = await authedFetch(
        `/api/orgs/${selectedOrg?._id || form.organizationId}/forms/${form._id}`
      );
      const fullForm = payload.data || form;
      setActiveForm(fullForm);
      setProfileDraft((prev) => ensureProfileCustomKeys(prev, fullForm));
      const components = (fullForm.components || fullForm.fields || []) as FormField[];
      const initialValues = components.reduce<Record<string, string>>(
        (acc, field, index) => {
          const fieldKey = field.id || field.tag || `field-${index}`;
          acc[fieldKey] = "";
          return acc;
        },
        {}
      );
      setFormValues(initialValues);
      setFormErrors({});
      setSubmitMessage("");
      navigate(`/forms/${form._id}`);
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "Failed to load form."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleAutofill = () => {
    if (!activeForm) return;
    const autofilled = buildAutofillPayload(activeForm, profileDraft);
    setFormValues((prev) => ({ ...prev, ...autofilled }));
    setFormErrors({});
  };

  const completeSubmission = async (
    data: Record<string, string>,
    profileOverride?: Profile
  ) => {
    if (!selectedOrg || !activeForm) return;

    if (profileOverride) {
      const profilePayload = await authedFetch("/api/profile/me", {
        method: "PUT",
        body: JSON.stringify(profileOverride),
      });
      setProfile(profilePayload.data || null);
      setProfileDraft((profilePayload.data as Profile) || profileOverride);
    }

    await authedFetch("/api/submissions", {
      method: "POST",
      body: JSON.stringify({
        organizationId: selectedOrg._id,
        formId: activeForm._id,
        data,
      }),
    });

    setSubmitMessage("Submitted successfully.");
    setActiveForm(null);
    setShowSavePrompt(false);
    setSaveCandidates([]);
    setSelectedSaveCandidateKeys({});
    setPendingSubmissionData(null);
    navigate("/");

    const payload = await authedFetch("/api/submissions/me");
    setSubmissions(payload.data || []);
  };

  const handleSubmitForm = async () => {
    if (!selectedOrg || !activeForm) return;
    try {
      setSubmitMessage("");
      const components = activeForm.components || activeForm.fields || [];
      const missingRequired = components
        .filter((field) => field.required)
        .reduce<Record<string, string>>((acc, field, index) => {
          const fieldKey = field.id || field.tag || `field-${index}`;
          if (!formValues[fieldKey]) {
            acc[fieldKey] = `${field.label} is required`;
          }
          return acc;
        }, {});

      if (Object.keys(missingRequired).length) {
        setFormErrors(missingRequired);
        setSubmitMessage("Please complete required fields.");
        return;
      }
      const data = mapSubmissionData(activeForm, formValues);
      const candidates = collectUnsavedCandidates(activeForm, formValues, profileDraft);

      if (!candidates.length) {
        await completeSubmission(data);
        return;
      }

      setPendingSubmissionData(data);
      setSaveCandidates(candidates);
      setSelectedSaveCandidateKeys(
        candidates.reduce<Record<string, boolean>>((acc, item) => {
          acc[item.key] = true;
          return acc;
        }, {})
      );
      setShowSavePrompt(true);
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "Submission failed."
      );
    }
  };

  const handleCancelSubmission = async (submissionId: string) => {
    try {
      setSubmitMessage("");
      await authedFetch(`/api/submissions/${submissionId}/cancel`, {
        method: "POST",
      });
      const payload = await authedFetch("/api/submissions/me");
      setSubmissions(payload.data || []);
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "Failed to cancel submission."
      );
    }
  };

  const handleViewUserSubmission = async (submissionId: string) => {
    try {
      setSubmitMessage("");
      const payload = await authedFetch(`/api/submissions/me/${submissionId}`);
      setSelectedUserSubmission(payload.data || null);
      navigate(`/submissions/${submissionId}`);
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "Failed to load submission."
      );
    }
  };

  const handleClearCanceledSubmissions = async () => {
    try {
      setSubmitMessage("");
      await authedFetch("/api/submissions/clear-canceled", {
        method: "POST",
      });
      const payload = await authedFetch("/api/submissions/me");
      setSubmissions(payload.data || []);
    } catch (error) {
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "Failed to clear canceled submissions."
      );
    }
  };

  const handleProfileSave = async () => {
    try {
      setProfileMessage("");
      const payload = await authedFetch("/api/profile/me", {
        method: "PUT",
        body: JSON.stringify({
          ...profileDraft,
        }),
      });
      setProfile(payload.data || null);
      setProfileDraft((payload.data as Profile) || profileDraft);
      setProfileMessage("Profile saved.");
    } catch (error) {
      setProfileMessage(
        error instanceof Error ? error.message : "Failed to save profile."
      );
    }
  };

  const handleOnboardingNext = async () => {
    const missing =
      !profileDraft.fullName ||
      !profileDraft.workEmail ||
      !profileDraft.personalEmail ||
      !profileDraft.address;

    if (missing) {
      setProfileMessage("Please complete all required fields.");
      return;
    }

    await handleProfileSave();
    setOnboardingStep(2);
    navigate("/onboarding");
  };

  const handleOnboardingFinish = async () => {
    await handleProfileSave();
    setShowOnboarding(false);
    setView("user");
    navigate("/");
    navigate("/", { replace: true });
  };

  const handleSaveMissing = async () => {
    if (!pendingSubmissionData) return;
    const selected = saveCandidates.filter((item) => selectedSaveCandidateKeys[item.key]);
    const profileToSave = mergeCandidatesIntoProfile(profileDraft, selected);
    await completeSubmission(pendingSubmissionData, profileToSave);
  };

  const handleSubmitWithoutSaving = async () => {
    if (!pendingSubmissionData) return;
    await completeSubmission(pendingSubmissionData);
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setResolvedRole(null);
      setResolvedOrganizationId("");
      setView("user");
      navigate("/", { replace: true });
      setRoleResolved(true);
      return;
    }
    const activeRole = resolvedRole || role;
    if (activeRole === "admin") {
      setView("admin");
      if (!location.pathname.startsWith("/admin")) {
        setAdminView("dashboard");
        navigate("/admin", { replace: true });
      }
    } else if (activeRole === "organization") {
      setView("org");
      if (!location.pathname.startsWith("/org")) {
        navigate("/org", { replace: true });
      }
    } else {
      setView("user");
      if (
        location.pathname !== "/" &&
        location.pathname !== "/search" &&
        location.pathname !== "/profile" &&
        location.pathname !== "/onboarding" &&
        !location.pathname.startsWith("/forms/") &&
        !location.pathname.startsWith("/orgs/") &&
        !location.pathname.startsWith("/submissions/")
      ) {
        navigate("/", { replace: true });
      }
    }
  }, [isLoaded, user, role, resolvedRole, location.pathname, navigate]);

  useEffect(() => {
    if (!isLoaded || !user || hasReloaded) return;
    const refresh = async () => {
      try {
        await user.reload();
      } finally {
        setHasReloaded(true);
      }
    };

    refresh();
  }, [isLoaded, user, hasReloaded]);

  const showLanding = isLoaded && !user;
  const appReady = isLoaded && (!user || roleResolved);

  useEffect(() => {
    if (!isLoaded || !user) return;
    let isActive = true;
    setRoleResolved(false);
    const resolveRole = async () => {
      try {
        const payload = await authedFetch("/api/admin/whoami");
        setResolvedRole(payload?.resolvedRole || null);
        setResolvedOrganizationId(payload?.organizationId || "");
      } catch (error) {
        setResolvedRole(null);
        setResolvedOrganizationId("");
      } finally {
        if (isActive) {
          setRoleResolved(true);
        }
      }
    };

    resolveRole();
    return () => {
      isActive = false;
    };
  }, [isLoaded, user]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (role === "user") {
      setView("user");
    }
  }, [isLoaded, user, role, location.pathname]);

  useEffect(() => {
    if (!isLoaded || !user || role !== "admin") return;
    if (location.pathname === "/admin/builder") {
      setAdminView("builder");
    } else if (location.pathname === "/admin/manage") {
      setAdminView("manage-orgs");
    } else if (location.pathname === "/admin/manage/forms") {
      setAdminView("manage-forms");
    } else if (location.pathname === "/admin") {
      setAdminView("dashboard");
    }
  }, [isLoaded, user, role, location.pathname]);

  useEffect(() => {
    if (!isLoaded || !user || role !== "admin") return;
    const loadAdminOrgs = async () => {
      try {
        const [orgPayload, tagPayload] = await Promise.all([
          adminFetch("/api/admin/orgs", { method: "GET" }),
          adminFetch("/api/admin/tags", { method: "GET" }),
        ]);
        setAdminOrgs(orgPayload.data || []);
        setAdminTags(tagPayload.data || []);
      } catch (error) {
        setAdminOrgs([]);
        setAdminTags([]);
      }
    };

    loadAdminOrgs();
  }, [isLoaded, user, role]);

  useEffect(() => {
    if (!isLoaded || !user || role !== "user") return;
    const load = async () => {
      try {
        const [profilePayload, tagPayload] = await Promise.all([
          authedFetch("/api/profile/me"),
          authedFetch("/api/profile/tags"),
        ]);
        const loadedTags = (tagPayload?.data || []) as TagDefinition[];
        setProfileTags(loadedTags);
        setProfile(profilePayload.data || null);
        const loadedProfile = (profilePayload?.data || {}) as Profile;
        const customFieldDefaults = loadedTags.reduce<Record<string, string>>(
          (acc, item) => {
            if (!isBaseProfileKey(item.tag)) {
              acc[item.tag] = loadedProfile.customFields?.[item.tag] || "";
            }
            return acc;
          },
          {}
        );

        setProfileDraft({
          fullName: loadedProfile.fullName || "",
          workEmail: loadedProfile.workEmail || "",
          personalEmail: loadedProfile.personalEmail || "",
          address: loadedProfile.address || "",
          phone: loadedProfile.phone || "",
          citizenshipNumber: loadedProfile.citizenshipNumber || "",
          profilePhotoUrl: getProfileImageValue(loadedProfile, "profilePhotoUrl"),
          citizenshipPhotoUrl: loadedProfile.citizenshipPhotoUrl || "",
          customFields: {
            ...customFieldDefaults,
            ...(loadedProfile.customFields || {}),
          },
        });
        const hasBasics =
          profilePayload?.data?.fullName &&
          profilePayload?.data?.workEmail &&
          profilePayload?.data?.personalEmail &&
          profilePayload?.data?.address;
        setShowOnboarding(!hasBasics);
      } catch (error) {
        setProfile(null);
        setProfileTags([]);
      }

      try {
        const submissionPayload = await authedFetch("/api/submissions/me");
        setSubmissions(submissionPayload.data || []);
      } catch (error) {
        setSubmissions([]);
      }
    };

    load();
  }, [isLoaded, user, role, location.pathname, navigate]);

  useEffect(() => {
    if (!isLoaded || !user || role !== "user") return;
    if (!location.pathname.startsWith("/submissions/")) return;
    const submissionId = location.pathname.split("/submissions/")[1];
    if (!submissionId) return;
    if (selectedUserSubmission?._id === submissionId) return;
    handleViewUserSubmission(submissionId);
  }, [isLoaded, user, role, location.pathname, selectedUserSubmission]);

  useEffect(() => {
    if (!isLoaded || !user || role !== "user") return;
    if (!orgQuery.trim()) {
      handleOrgSearch("");
      return;
    }
  }, [isLoaded, user, role]);

  useEffect(() => {
    if (!isLoaded || !user || role !== "user") return;
    if (!location.pathname.startsWith("/orgs/")) return;
    const orgId = location.pathname.split("/orgs/")[1];
    if (!orgId) return;
    if (!selectedOrg || selectedOrg._id !== orgId) {
      const match = orgResults.find((org) => org._id === orgId) || null;
      setSelectedOrg(match);
    }
    handleFormSearch(orgId, formQuery);
  }, [
    isLoaded,
    user,
    role,
    location.pathname,
    formQuery,
    selectedOrg,
    orgResults,
  ]);

  useEffect(() => {
    if (!isLoaded || !user || role !== "user") return;
    if (showOnboarding && location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
      return;
    }
    if (!showOnboarding && location.pathname === "/onboarding") {
      navigate("/", { replace: true });
    }
  }, [isLoaded, user, role, showOnboarding, location.pathname, navigate]);

  useEffect(() => {
    if (!isLoaded || !user || role !== "user") return;
    const timer = setTimeout(() => {
      handleOrgSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [isLoaded, user, role, orgQuery]);

  useEffect(() => {
    if (!isLoaded || !user || role !== "organization") return;
    const organizationId =
      resolvedOrganizationId ||
      (user.publicMetadata?.organizationId as string | undefined) ||
      "";
    if (!organizationId) return;

    const loadOrgData = async () => {
      try {
        const formPayload = await authedFetch(
          `/api/orgs/${organizationId}/forms?query=`
        );
        setOrgForms(formPayload.data || []);
      } catch (error) {
        setOrgForms([]);
      }

      try {
        const orgPayload = await authedFetch("/api/orgs?query=");
        const org = Array.isArray(orgPayload.data) ? orgPayload.data[0] : null;
        setOrgMembership(org || null);
      } catch (error) {
        setOrgMembership(null);
      }

      try {
        const submissionPayload = await authedFetch(
          `/api/submissions/org?status=${orgStatusFilter}&formId=${orgFormFilter}&page=${orgSubmissionPage}&limit=20&email=${encodeURIComponent(
            orgSubmissionEmailQuery
          )}`
        );
        setOrgSubmissions(submissionPayload.data || []);
        setOrgSubmissionTotalPages(submissionPayload.totalPages || 1);
      } catch (error) {
        setOrgSubmissions([]);
      }
    };

    loadOrgData();
  }, [
    isLoaded,
    user,
    role,
    orgStatusFilter,
    orgFormFilter,
    orgSubmissionPage,
    orgSubmissionEmailQuery,
    resolvedOrganizationId,
  ]);

  useEffect(() => {
    if (!isLoaded || !user || role !== "organization") return;
    if (location.pathname !== "/org") return;

    const intervalId = window.setInterval(() => {
      handleOrgDashboardRefresh();
    }, 300000);

    return () => window.clearInterval(intervalId);
  }, [
    isLoaded,
    user,
    role,
    location.pathname,
    orgStatusFilter,
    orgFormFilter,
    orgSubmissionPage,
    orgSubmissionEmailQuery,
    resolvedOrganizationId,
    handleOrgDashboardRefresh,
  ]);

  useEffect(() => {
    if (!isLoaded || !user || role !== "organization") return;
    const currentId = location.pathname.startsWith("/org/submissions/")
      ? location.pathname.split("/org/submissions/")[1]
      : "";
    if (!currentId) return;
    if (selectedOrgSubmission?._id === currentId) return;
    fetchOrgSubmissionDetail(currentId);
  }, [isLoaded, user, role, location.pathname, selectedOrgSubmission]);

  return (
    <div className="min-h-screen">
      {!showLanding ? (
        <header className="sticky top-0 z-50 border-b border-sand-200/70 bg-white/95 px-4 py-4 backdrop-blur sm:px-10 sm:py-6">
          <nav className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.2em] text-sand-500">
                Omniform
              </p>
              <h1 className="text-2xl font-semibold text-sand-950 sm:text-3xl">
                Identity Forms, One Tap
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {showOnboarding ? null : (
                <>
                  {user && role === "user" ? (
                    <>
                      <Button
                        className="hidden sm:inline-flex"
                        variant={location.pathname === "/" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => navigate("/")}
                      >
                        My Forms
                      </Button>
                      <Button
                        className="hidden sm:inline-flex"
                        variant={location.pathname === "/search" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => navigate("/search")}
                      >
                        Search Forms
                      </Button>
                      <Button
                        className="hidden sm:inline-flex"
                        variant={location.pathname === "/profile" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => navigate("/profile")}
                      >
                        <span
                          aria-hidden="true"
                          className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/35 text-[9px] font-bold tracking-[0.04em] text-white"
                          style={{
                            backgroundImage: profileNavAvatar.backgroundImage,
                          }}
                        >
                          {profileNavAvatar.initials}
                        </span>
                        Profile
                      </Button>
                    </>
                  ) : null}
                  {user && role === "admin" ? (
                    <Button
                      variant={view === "admin" ? "secondary" : "ghost"}
                      size="sm"
                    onClick={() => navigate("/admin")}
                    >
                      Dashboard
                    </Button>
                  ) : null}
                  {user && role === "organization" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                    onClick={() => navigate("/org")}
                    >
                      Dashboard
                    </Button>
                  ) : null}
                </>
              )}
              {isLoaded && user ? (
                (location.pathname === "/profile" ||
                  (role === "admin" && location.pathname === "/admin") ||
                  (role === "organization" && location.pathname === "/org")) ? (
                  <SignOutButton>
                    <Button variant="secondary" size="sm">
                      Sign out
                    </Button>
                  </SignOutButton>
                ) : null
              ) : (
                <SignInButton>
                  <Button variant="secondary" size="sm">
                    Sign in
                  </Button>
                </SignInButton>
              )}
            </div>
          </nav>
        </header>
      ) : null}

      <main className="px-4 pb-24 sm:px-10 sm:pb-16">
        {showLanding ? <LandingPage /> : null}
        {!showLanding && user && !roleResolved ? (
          <section className="mx-auto mt-10 max-w-3xl">
            <Card className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-sand-500">
                Loading workspace
              </p>
              <h2 className="text-2xl font-semibold text-sand-950">
                Resolving your access
              </h2>
              <p className="text-sm text-sand-500">
                Just a moment while we personalize your dashboard.
              </p>
            </Card>
          </section>
        ) : null}
        {!showLanding && appReady ? (
          <Routes>
            <Route
              path="/"
              element={
                role === "user" && !showOnboarding ? (
                  <UserMyFormsPage
                    submissions={submissions}
                    handleClearCanceledSubmissions={handleClearCanceledSubmissions}
                    handleViewUserSubmission={handleViewUserSubmission}
                    handleCancelSubmission={handleCancelSubmission}
                    profileDraft={profileDraft}
                    navigateToProfile={() => navigate("/profile")}
                    navigateToSearch={() => navigate("/search")}
                  />
                ) : null
              }
            />
            <Route
              path="/search"
              element={
                role === "user" && !showOnboarding ? (
                  <UserSearchFormsPage
                    orgQuery={orgQuery}
                    setOrgQuery={setOrgQuery}
                    orgResults={orgResults}
                    handleSelectOrg={handleSelectOrg}
                    formLoading={formLoading}
                    orgLoading={orgLoading}
                  />
                ) : null
              }
            />
            <Route
              path="/profile"
              element={
                role === "user" && !showOnboarding ? (
                  <ProfilePage
                    registeredEmail={
                      user?.primaryEmailAddress?.emailAddress ||
                      user?.emailAddresses?.[0]?.emailAddress ||
                      ""
                    }
                    avatarInitials={profileNavAvatar.initials}
                    avatarBackgroundImage={profileNavAvatar.backgroundImage}
                    profileDraft={profileDraft}
                    setProfileDraft={setProfileDraft}
                    profileTags={profileTags}
                    isBaseProfileKey={isBaseProfileKey}
                    getProfileTagFieldValue={getProfileTagFieldValue}
                    setProfileTagFieldValue={setProfileTagFieldValue}
                    profileImageFileNames={profileImageFileNames}
                    getFileNameFromUrl={getFileNameFromUrl}
                    handleProfileTagImageUpload={handleProfileTagImageUpload}
                    uploadingImageTarget={uploadingImageTarget}
                    handleProfileSave={handleProfileSave}
                    profileMessage={profileMessage}
                  />
                ) : null
              }
            />
            <Route
              path="/onboarding"
              element={
                role === "user" && showOnboarding ? (
                  <OnboardingPage
                    onboardingStep={onboardingStep}
                    profileDraft={profileDraft}
                    setProfileDraft={setProfileDraft}
                    profileImageFileNames={profileImageFileNames}
                    getFileNameFromUrl={getFileNameFromUrl}
                    handleProfileImageUpload={handleProfileImageUpload}
                    handleOnboardingNext={handleOnboardingNext}
                    handleOnboardingFinish={handleOnboardingFinish}
                    setShowOnboarding={setShowOnboarding}
                    profileMessage={profileMessage}
                  />
                ) : null
              }
            />
            <Route
              path="/forms/:formId"
              element={
                role === "user" && !showOnboarding ? (
                  <UserFormFillPage
                    activeForm={activeForm}
                    formValues={formValues}
                    setFormValues={setFormValues}
                    formErrors={formErrors}
                    formImageFileNames={formImageFileNames}
                    getFileNameFromUrl={getFileNameFromUrl}
                    handleFormImageUpload={handleFormImageUpload}
                    uploadingImageTarget={uploadingImageTarget}
                    handleAutofill={handleAutofill}
                    handleSubmitForm={handleSubmitForm}
                    submitMessage={submitMessage}
                    onBack={() => navigate("/")}
                  />
                ) : null
              }
            />
            <Route
              path="/orgs/:orgId"
              element={
                role === "user" && !showOnboarding ? (
                  <UserOrganizationFormsPage
                    selectedOrg={selectedOrg}
                    formQuery={formQuery}
                    setFormQuery={setFormQuery}
                    forms={forms}
                    formLoading={formLoading}
                    openForm={openForm}
                    profileDraft={profileDraft}
                    onBack={() => navigate("/")}
                    onGoProfile={() => navigate("/profile")}
                  />
                ) : null
              }
            />
            <Route
              path="/submissions/:submissionId"
              element={
                role === "user" && !showOnboarding ? (
                  <UserSubmissionDetailPage
                    selectedUserSubmission={selectedUserSubmission}
                    renderSubmissionValue={renderSubmissionValue}
                    handleCancelSubmission={handleCancelSubmission}
                    onBack={() => navigate("/")}
                  />
                ) : null
              }
            />
            <Route
              path="/admin"
              element={
                role === "admin" ? (
                  <AdminDashboardPage
                    orgName={orgName}
                    setOrgName={setOrgName}
                    orgUserId={orgUserId}
                    setOrgUserId={setOrgUserId}
                    orgCreateSubscriptionStartsAt={orgCreateSubscriptionStartsAt}
                    setOrgCreateSubscriptionStartsAt={setOrgCreateSubscriptionStartsAt}
                    orgCreateSubscriptionEndsAt={orgCreateSubscriptionEndsAt}
                    setOrgCreateSubscriptionEndsAt={setOrgCreateSubscriptionEndsAt}
                    handleCreateOrg={handleCreateOrg}
                    createdOrgId={createdOrgId}
                    orgMessage={orgMessage}
                    roleUserEmail={roleUserEmail}
                    setRoleUserEmail={setRoleUserEmail}
                    roleValue={roleValue}
                    setRoleValue={setRoleValue}
                    roleOrgId={roleOrgId}
                    setRoleOrgId={setRoleOrgId}
                    adminOrgs={adminOrgs}
                    handleSetRole={handleSetRole}
                    roleMessage={roleMessage}
                    goTags={() => navigate("/admin/tags")}
                    goBuilder={() => navigate("/admin/builder")}
                    goManageForms={() => navigate("/admin/manage")}
                    goOrgs={() => navigate("/admin/orgs")}
                  />
                ) : null
              }
            />
            <Route
              path="/admin/orgs"
              element={
                role === "admin" ? (
                  <AdminOrganizationsPage
                    filteredAdminOrgs={filteredAdminOrgs}
                    manageOrgQuery={manageOrgQuery}
                    setManageOrgQuery={setManageOrgQuery}
                    handleOpenOrgSettings={handleOpenOrgSettings}
                    onBack={() => navigate("/admin")}
                  />
                ) : null
              }
            />
            <Route
              path="/admin/tags"
              element={
                role === "admin" ? (
                  <AdminTagsPage
                    editingTagId={editingTagId}
                    tagLabel={tagLabel}
                    setTagLabel={setTagLabel}
                    tagValue={tagValue}
                    setTagValue={setTagValue}
                    tagType={tagType}
                    setTagType={setTagType}
                    tagOptions={tagOptions}
                    setTagOptions={setTagOptions}
                    handleCreateTag={handleCreateTag}
                    handleCancelEditTag={handleCancelEditTag}
                    tagMessage={tagMessage}
                    adminTags={adminTags}
                    handleStartEditTag={handleStartEditTag}
                    handleDeleteTag={handleDeleteTag}
                    onBack={() => navigate("/admin")}
                  />
                ) : null
              }
            />
            <Route
              path="/admin/orgs/:orgId"
              element={
                role === "admin" ? (
                  <AdminOrganizationSettingsPage
                    selectedAdminOrg={selectedAdminOrg}
                    orgSettingsName={orgSettingsName}
                    setOrgSettingsName={setOrgSettingsName}
                    orgSettingsStatus={orgSettingsStatus}
                    setOrgSettingsStatus={setOrgSettingsStatus}
                    orgSettingsPanNumber={orgSettingsPanNumber}
                    setOrgSettingsPanNumber={setOrgSettingsPanNumber}
                    orgSettingsLicenseNumber={orgSettingsLicenseNumber}
                    setOrgSettingsLicenseNumber={setOrgSettingsLicenseNumber}
                    orgSettingsLocation={orgSettingsLocation}
                    setOrgSettingsLocation={setOrgSettingsLocation}
                    orgSettingsSubscriptionStatus={orgSettingsSubscriptionStatus}
                    setOrgSettingsSubscriptionStatus={setOrgSettingsSubscriptionStatus}
                    orgSettingsSubscriptionStartsAt={orgSettingsSubscriptionStartsAt}
                    setOrgSettingsSubscriptionStartsAt={setOrgSettingsSubscriptionStartsAt}
                    orgSettingsSubscriptionEndsAt={orgSettingsSubscriptionEndsAt}
                    setOrgSettingsSubscriptionEndsAt={setOrgSettingsSubscriptionEndsAt}
                    handleSaveOrgSettings={handleSaveOrgSettings}
                    handleDeleteOrganization={handleDeleteOrganization}
                    orgSettingsMessage={orgSettingsMessage}
                    onBack={() => navigate("/admin/orgs")}
                  />
                ) : null
              }
            />
            <Route
              path="/admin/builder"
              element={
                role === "admin" ? (
                  <AdminBuilderPage
                    handleLeaveBuilder={handleLeaveBuilder}
                    setShowFormSave={setShowFormSave}
                    componentSearch={componentSearch}
                    setComponentSearch={setComponentSearch}
                    draggingComponentId={draggingComponentId}
                    setDraggingComponentId={setDraggingComponentId}
                    dropIndex={dropIndex}
                    setDropIndex={setDropIndex}
                    setShowCustomComponent={setShowCustomComponent}
                    builderComponents={builderComponents}
                    setComponentContextMenu={setComponentContextMenu}
                    formComponents={formComponents}
                    setFormComponents={setFormComponents}
                    setFormDraftTouchedAt={setFormDraftTouchedAt}
                  />
                ) : null
              }
            />
            <Route
              path="/admin/manage"
              element={
                role === "admin" ? (
                  <AdminManageOrganizationsPage
                    filteredAdminOrgs={filteredAdminOrgs}
                    manageOrgQuery={manageOrgQuery}
                    setManageOrgQuery={setManageOrgQuery}
                    handleOpenManageOrg={handleOpenManageOrg}
                    onBack={() => navigate("/admin")}
                  />
                ) : null
              }
            />
            <Route
              path="/admin/manage/forms"
              element={
                role === "admin" ? (
                  <AdminManageFormsPage
                    selectedManageOrg={selectedManageOrg}
                    manageFormQuery={manageFormQuery}
                    setManageFormQuery={setManageFormQuery}
                    filteredManageForms={filteredManageForms}
                    handleEditManageForm={handleEditManageForm}
                    handleDeleteManageForm={handleDeleteManageForm}
                    manageFormsLoading={manageFormsLoading}
                    onBackToOrganizations={() => navigate("/admin/manage")}
                    onBackToDashboard={() => navigate("/admin")}
                  />
                ) : null
              }
            />
            <Route
              path="/org"
              element={
                role === "organization" ? (
                  <OrganizationDashboardPage
                    orgMembership={orgMembership}
                    membershipExpired={membershipExpired}
                    membershipStatus={membershipStatus}
                    orgFormFilter={orgFormFilter}
                    setOrgFormFilter={setOrgFormFilter}
                    orgForms={orgForms}
                    orgSubmissionEmailQuery={orgSubmissionEmailQuery}
                    setOrgSubmissionEmailQuery={setOrgSubmissionEmailQuery}
                    setOrgSubmissionPage={setOrgSubmissionPage}
                    orgStatusFilter={orgStatusFilter}
                    setOrgStatusFilter={setOrgStatusFilter}
                    loadOrgSubmissions={loadOrgSubmissions}
                    orgSubmissions={orgSubmissions}
                    orgSubmissionPage={orgSubmissionPage}
                    orgSubmissionTotalPages={orgSubmissionTotalPages}
                    orgDashboardMessage={orgDashboardMessage}
                    navigateToSubmission={(id) => navigate(`/org/submissions/${id}`)}
                    onRefresh={handleOrgDashboardRefresh}
                  />
                ) : null
              }
            />
            <Route
              path="/org/submissions/:submissionId"
              element={
                role === "organization" ? (
                  <OrganizationSubmissionReviewPage
                    selectedOrgSubmission={selectedOrgSubmission}
                    orgDashboardMessage={orgDashboardMessage}
                    renderSubmissionValue={renderSubmissionValue}
                    orgReviewNotes={orgReviewNotes}
                    setOrgReviewNotes={setOrgReviewNotes}
                    handleOrgDecision={handleOrgDecision}
                    onBack={() => navigate("/org")}
                  />
                ) : null
              }
            />
          </Routes>
        ) : null}

        {showFormSave ? (
          <FormSaveModal
            formId={formId}
            formOrgId={formOrgId}
            setFormOrgId={setFormOrgId}
            adminOrgs={adminOrgs}
            formName={formName}
            setFormName={setFormName}
            formDescription={formDescription}
            setFormDescription={setFormDescription}
            handleCreateForm={handleCreateForm}
            onCancel={() => setShowFormSave(false)}
            formMessage={formMessage}
          />
        ) : null}

        {showCooldownPrompt ? (
          <CooldownPromptModal
            cooldownMessage={cooldownMessage}
            onClose={() => setShowCooldownPrompt(false)}
          />
        ) : null}

        {showSavePrompt ? (
          <SavePromptModal
            saveCandidates={saveCandidates}
            selectedSaveCandidateKeys={selectedSaveCandidateKeys}
            setSelectedSaveCandidateKeys={setSelectedSaveCandidateKeys}
            handleSaveMissing={handleSaveMissing}
            handleSubmitWithoutSaving={handleSubmitWithoutSaving}
            onBack={() => {
              setShowSavePrompt(false);
              setSaveCandidates([]);
              setSelectedSaveCandidateKeys({});
              setPendingSubmissionData(null);
            }}
          />
        ) : null}

        {showCustomComponent ? (
          <CustomComponentModal
            customComponent={customComponent}
            setCustomComponent={setCustomComponent}
            adminTags={adminTags}
            onAddComponent={async () => {
              const selectedTag = adminTags.find(
                (item) => item.tag === customComponent.tag.trim()
              );
              const cleanLabel =
                customComponent.label.trim() || selectedTag?.label || "";
              if (!cleanLabel) return;

              const nextTag = selectedTag?.tag || toProfileTag(cleanLabel);
              const normalizedType = selectedTag
                ? selectedTag.type
                : coerceTagType(customComponent.type.trim() || "text");
              const normalizedOptions = selectedTag
                ? selectedTag.options || []
                : splitComponentOptions(customComponent.options);

              if (nextTag && !selectedTag) {
                try {
                  await upsertSystemTag({
                    label: cleanLabel,
                    tag: nextTag,
                    type: normalizedType,
                    options: normalizedOptions,
                  });
                } catch (error) {
                  setFormMessage(
                    error instanceof Error
                      ? error.message
                      : "Failed to auto-create tag."
                  );
                }
              }

              setFormComponents((prev) => [
                ...prev,
                {
                  id: `custom-${Date.now()}`,
                  type: normalizedType,
                  label: cleanLabel,
                  tag: nextTag,
                  iconName: customComponent.iconName,
                  required: customComponent.required,
                  options: normalizedOptions.join(", "),
                },
              ]);
              setPendingReusableComponent({
                id: `custom-template-${Date.now()}`,
                type: normalizedType,
                label: cleanLabel,
                tag: nextTag,
                iconName: customComponent.iconName,
                options: normalizedOptions.join(", "),
                removable: true,
              });
              setFormDraftTouchedAt(Date.now());
              setCustomComponent({
                label: "",
                type: "text",
                tag: "",
                iconName: "type",
                required: false,
                options: "",
              });
              setShowCustomComponent(false);
            }}
            onClose={() => {
              setShowCustomComponent(false);
            }}
          />
        ) : null}

        {pendingReusableComponent ? (
          <SaveReusableComponentModal
            componentLabel={pendingReusableComponent.label}
            onSave={() => {
              setSavedCustomComponents((prev) => [
                ...prev,
                pendingReusableComponent,
              ]);
              setPendingReusableComponent(null);
            }}
            onSkip={() => setPendingReusableComponent(null)}
          />
        ) : null}

        {componentContextMenu ? (
          <ComponentContextMenu
            x={componentContextMenu.x}
            y={componentContextMenu.y}
            onDelete={() => {
              setSavedCustomComponents((prev) =>
                prev.filter((item) => item.id !== componentContextMenu.componentId)
              );
              setComponentContextMenu(null);
            }}
          />
        ) : null}

      </main>

      {!showLanding && appReady && user && role === "user" && !showOnboarding ? (
        <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 sm:hidden">
          <div className="mx-auto grid max-w-md grid-cols-3 rounded-2xl border border-sand-200 bg-white/95 p-1 shadow-lg backdrop-blur">
            <button
              type="button"
              className={`inline-flex h-10 items-center justify-center rounded-xl transition ${
                location.pathname === "/"
                  ? "bg-sand-100 text-sand-950"
                  : "text-sand-700 hover:bg-sand-100"
              }`}
              onClick={() => navigate("/")}
              aria-label="My Forms"
            >
              <Home className="h-5 w-5 shrink-0" />
              <span className="sr-only">My Forms</span>
            </button>
            <button
              type="button"
              className={`inline-flex h-10 items-center justify-center rounded-xl transition ${
                location.pathname === "/search"
                  ? "bg-sand-100 text-sand-950"
                  : "text-sand-700 hover:bg-sand-100"
              }`}
              onClick={() => navigate("/search")}
              aria-label="Search Forms"
            >
              <Search className="h-5 w-5 shrink-0" />
              <span className="sr-only">Search Forms</span>
            </button>
            <button
              type="button"
              className={`inline-flex h-10 items-center justify-center rounded-xl transition ${
                location.pathname === "/profile"
                  ? "bg-sand-100 text-sand-950"
                  : "text-sand-700 hover:bg-sand-100"
              }`}
              onClick={() => navigate("/profile")}
              aria-label="Profile"
            >
              <User className="h-5 w-5 shrink-0" />
              <span className="sr-only">Profile</span>
            </button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
