import {
  useUser,
  useAuth,
  SignInButton,
  SignOutButton,
} from "@clerk/clerk-react";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Calendar } from "./components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { ComboBox } from "./components/ui/combobox";
import { Select } from "./components/ui/select";
import { SectionHeading } from "./components/ui/section-heading";
import { StatusPill } from "./components/ui/status-pill";
import {
  BadgeCheck,
  FileText,
  IdCard,
  Image,
  Mail,
  MapPin,
  Phone,
  Plus,
  Shield,
  Type,
  User,
  X,
} from "lucide-react";

type Organization = {
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
type FormField = {
  id: string;
  label: string;
  type: string;
  tag?: string;
  iconName?: string;
  required?: boolean;
  options?: string[];
};
type Form = {
  _id: string;
  name: string;
  description?: string;
  components?: FormField[];
  fields?: FormField[];
};
type Submission = {
  _id: string;
  formId:
    | string
    | { _id: string; name: string; fields?: FormField[] };
  status: "pending" | "completed" | "rejected";
  createdAt: string;
  data?: Record<string, string>;
  reviewNotes?: string;
  cooldownUntil?: string;
};
type Profile = {
  fullName?: string;
  workEmail?: string;
  personalEmail?: string;
  address?: string;
  phone?: string;
  citizenshipNumber?: string;
  profilePhotoUrl?: string;
  citizenshipPhotoUrl?: string;
};

type View = "user" | "profile" | "admin" | "org";
type AdminView = "dashboard" | "builder" | "manage-orgs" | "manage-forms";

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
  const [formComponents, setFormComponents] = useState<
    Array<{
      id: string;
      type: string;
      label: string;
      tag: string;
      required: boolean;
      options: string;
    }>
  >([]);
  const [draggingComponentId, setDraggingComponentId] = useState<string | null>(
    null
  );
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [showCustomComponent, setShowCustomComponent] = useState(false);
  const [customComponent, setCustomComponent] = useState({
    label: "",
    type: "text",
    tag: "",
    iconName: "type",
    required: false,
    options: "",
  });
  const [formMessage, setFormMessage] = useState("");
  const [showFormSave, setShowFormSave] = useState(false);
  const [adminOrgs, setAdminOrgs] = useState<Organization[]>([]);
  const [manageOrgQuery, setManageOrgQuery] = useState("");
  const [manageFormQuery, setManageFormQuery] = useState("");
  const [manageForms, setManageForms] = useState<Form[]>([]);
  const [manageFormsLoading, setManageFormsLoading] = useState(false);
  const [selectedManageOrg, setSelectedManageOrg] = useState<Organization | null>(
    null
  );
  const [orgSubmissions, setOrgSubmissions] = useState<Submission[]>([]);
  const [orgForms, setOrgForms] = useState<Form[]>([]);
  const [orgStatusFilter, setOrgStatusFilter] = useState("pending");
  const [orgFormFilter, setOrgFormFilter] = useState("");
  const [orgReviewNotes, setOrgReviewNotes] = useState<Record<string, string>>(
    {}
  );
  const [orgDashboardMessage, setOrgDashboardMessage] = useState("");
  const [orgMembership, setOrgMembership] = useState<Organization | null>(null);

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
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [componentSearch, setComponentSearch] = useState("");
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showCooldownPrompt, setShowCooldownPrompt] = useState(false);
  const [cooldownMessage, setCooldownMessage] = useState("");
  const [saveCandidates, setSaveCandidates] = useState<
    Array<{ key: string; value: string }>
  >([]);
  const [profileDraft, setProfileDraft] = useState<Profile>({
    fullName: "",
    workEmail: "",
    personalEmail: "",
    address: "",
    phone: "",
    citizenshipNumber: "",
    profilePhotoUrl: "",
    citizenshipPhotoUrl: "",
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [view, setView] = useState<View>("user");
  const [adminView, setAdminView] = useState<AdminView>("dashboard");
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
      const components = formComponents
        .filter((component) => component.label.trim())
        .map((component) => ({
          id: component.id,
          type: component.type.trim() || "text",
          label: component.label.trim(),
          tag: component.tag.trim() || undefined,
          required: component.required,
          options: component.options
            ? component.options.split(",").map((option) => option.trim())
            : [],
        }));

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
        `/api/submissions/org?status=${orgStatusFilter}&formId=${orgFormFilter}`
      );
      setOrgSubmissions(refreshed.data || []);
    } catch (error) {
      setOrgDashboardMessage(
        error instanceof Error ? error.message : "Update failed."
      );
    }
  };

  const loadOrgSubmissions = async (formIdOverride?: string) => {
    try {
      setOrgDashboardMessage("");
      const payload = await authedFetch(
        `/api/submissions/org?status=${orgStatusFilter}&formId=${
          formIdOverride ?? orgFormFilter
        }`
      );
      setOrgSubmissions(payload.data || []);
    } catch (error) {
      setOrgDashboardMessage(
        error instanceof Error ? error.message : "Update failed."
      );
    }
  };

  const handleOrgSearch = async () => {
    try {
      setOrgLoading(true);
      const payload = await authedFetch(
        `/api/orgs?query=${encodeURIComponent(orgQuery)}`
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
    try {
      setFormLoading(true);
      const payload = await authedFetch(`/api/orgs/${org._id}/forms?query=`);
      setForms(payload.data || []);
    } catch (error) {
      setForms([]);
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormSearch = async () => {
    if (!selectedOrg) return;
    try {
      setFormLoading(true);
      const payload = await authedFetch(
        `/api/orgs/${selectedOrg._id}/forms?query=${encodeURIComponent(
          formQuery
        )}`
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
      setAdminView("builder");
      navigate("/admin/builder");
      setShowFormSave(false);
    } catch (error) {
      setFormMessage(
        error instanceof Error ? error.message : "Failed to load form."
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

  const buildAutofillPayload = (form: Form) => {
    const data: Record<string, string> = {};
    const components = form.components || form.fields || [];
    components.forEach((field) => {
      const key = field.tag || field.id;
      const value = (profileDraft as Record<string, string | undefined>)[key];
      data[key] = value || "";
    });
    return data;
  };

  const openForm = (form: Form) => {
    const submission = submissions.find((item) => {
      if (typeof item.formId === "string") return item.formId === form._id;
      return item.formId?._id === form._id;
    });
    if (submission?.cooldownUntil) {
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
    setActiveForm(form);
    const components = form.components || form.fields || [];
    const initialValues = components.reduce<Record<string, string>>(
      (acc, field) => {
        const key = field.tag || field.id;
        acc[key] = "";
        return acc;
      },
      {}
    );
    setFormValues(initialValues);
    setFormErrors({});
    setSubmitMessage("");
    navigate(`/forms/${form._id}`);
  };

  const handleAutofill = () => {
    if (!activeForm) return;
    const autofilled = buildAutofillPayload(activeForm);
    setFormValues((prev) => ({ ...prev, ...autofilled }));
    setFormErrors({});
  };

  const handleSubmitForm = async () => {
    if (!selectedOrg || !activeForm) return;
    try {
      setSubmitMessage("");
      const components = activeForm.components || activeForm.fields || [];
      const missingRequired = components
        .filter((field) => field.required)
        .reduce<Record<string, string>>((acc, field) => {
          const key = field.tag || field.id;
          if (!formValues[key]) {
            acc[key] = `${field.label} is required`;
          }
          return acc;
        }, {});

      if (Object.keys(missingRequired).length) {
        setFormErrors(missingRequired);
        setSubmitMessage("Please complete required fields.");
        return;
      }
      const data = formValues;
      await authedFetch("/api/submissions", {
        method: "POST",
        body: JSON.stringify({
          organizationId: selectedOrg._id,
          formId: activeForm._id,
          data,
        }),
      });
      setSubmitMessage("Submitted successfully.");
      const profileKeys: Array<keyof Profile> = [
        "fullName",
        "workEmail",
        "personalEmail",
        "address",
        "phone",
        "citizenshipNumber",
        "profilePhotoUrl",
        "citizenshipPhotoUrl",
      ];
      const candidates = profileKeys
        .filter((key) => !profileDraft[key] && data[key as string])
        .map((key) => ({ key, value: data[key as string] }));
      if (candidates.length) {
        setSaveCandidates(candidates);
        setShowSavePrompt(true);
      } else {
        setActiveForm(null);
      }
      const payload = await authedFetch("/api/submissions/me");
      setSubmissions(payload.data || []);
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "Submission failed."
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
    const updates = saveCandidates.reduce<Profile>((acc, item) => {
      acc[item.key as keyof Profile] = item.value;
      return acc;
    }, {} as Profile);
    setProfileDraft((prev) => ({ ...prev, ...updates }));
    await handleProfileSave();
    setShowSavePrompt(false);
    setActiveForm(null);
    setSaveCandidates([]);
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
      if (location.pathname !== "/org") {
        navigate("/org", { replace: true });
      }
    } else {
      setView("user");
      if (
        location.pathname !== "/" &&
        location.pathname !== "/profile" &&
        location.pathname !== "/onboarding" &&
        !location.pathname.startsWith("/forms/")
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
      if (location.pathname === "/profile") {
        setView("profile");
      } else {
        setView("user");
      }
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
        const payload = await adminFetch("/api/admin/orgs", { method: "GET" });
        setAdminOrgs(payload.data || []);
      } catch (error) {
        setAdminOrgs([]);
      }
    };

    loadAdminOrgs();
  }, [isLoaded, user, role]);

  useEffect(() => {
    if (!isLoaded || !user || role !== "user") return;
    const load = async () => {
      try {
        const profilePayload = await authedFetch("/api/profile/me");
        setProfile(profilePayload.data || null);
        setProfileDraft({
          fullName: profilePayload?.data?.fullName || "",
          workEmail: profilePayload?.data?.workEmail || "",
          personalEmail: profilePayload?.data?.personalEmail || "",
          address: profilePayload?.data?.address || "",
          phone: profilePayload?.data?.phone || "",
          citizenshipNumber: profilePayload?.data?.citizenshipNumber || "",
          profilePhotoUrl: profilePayload?.data?.profilePhotoUrl || "",
          citizenshipPhotoUrl: profilePayload?.data?.citizenshipPhotoUrl || "",
        });
        const hasBasics =
          profilePayload?.data?.fullName &&
          profilePayload?.data?.workEmail &&
          profilePayload?.data?.personalEmail &&
          profilePayload?.data?.address;
        setShowOnboarding(!hasBasics);
      } catch (error) {
        setProfile(null);
      }

      try {
        const submissionPayload = await authedFetch("/api/submissions/me");
        setSubmissions(submissionPayload.data || []);
      } catch (error) {
        setSubmissions([]);
      }
    };

    load();
  }, [isLoaded, user, role]);

  useEffect(() => {
    if (!isLoaded || !user || role !== "user") return;
    if (!orgQuery.trim()) {
      setOrgResults([]);
      return;
    }
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
          `/api/submissions/org?status=${orgStatusFilter}&formId=${orgFormFilter}`
        );
        setOrgSubmissions(submissionPayload.data || []);
      } catch (error) {
        setOrgSubmissions([]);
      }
    };

    loadOrgData();
  }, [isLoaded, user, role, orgStatusFilter, orgFormFilter, resolvedOrganizationId]);

  return (
    <div className="min-h-screen">
      {!showLanding ? (
        <header className="px-6 py-6 sm:px-10">
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
                  {user ? (
                    <Badge tone="neutral">{String(resolvedRole || role)}</Badge>
                  ) : null}
                  {user && role === "user" ? (
                    <>
                      <Button
                        variant={view === "user" ? "secondary" : "ghost"}
                        size="sm"
                    onClick={() => navigate("/")}
                      >
                        Dashboard
                      </Button>
                      <Button
                        variant={view === "profile" ? "secondary" : "ghost"}
                        size="sm"
                    onClick={() => navigate("/profile")}
                      >
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
                      Admin
                    </Button>
                  ) : null}
                  {user && role === "organization" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                    onClick={() => navigate("/org")}
                    >
                      Review
                    </Button>
                  ) : null}
                </>
              )}
              {isLoaded && user ? (
                <SignOutButton>
                  <Button variant="secondary" size="sm">
                    Sign out
                  </Button>
                </SignOutButton>
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

      <main className="px-6 pb-16 sm:px-10">
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
                  <>
                    <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                      <Card className="space-y-6">
                      <SectionHeading
                        title="Find your organization"
                        subtitle="Search by organization name, then select a form to autofill."
                      />
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Input
                          placeholder="Search organizations"
                          value={orgQuery}
                          onChange={(event) => setOrgQuery(event.target.value)}
                        />
                      </div>
                      <div className="space-y-4">
                        {orgResults.map((org) => (
                          <div
                            key={org._id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand-200 bg-white p-4"
                          >
                            <div>
                              <p className="text-lg font-semibold text-sand-950">
                                {org.name}
                              </p>
                              <p className="text-sm text-sand-500">
                                Active organization
                              </p>
                            </div>
                            <Button
                              variant="secondary"
                              onClick={() => handleSelectOrg(org)}
                              disabled={formLoading}
                            >
                              View forms
                            </Button>
                          </div>
                        ))}
                        {orgLoading ? (
                          <p className="text-sm text-sand-500">Searching...</p>
                        ) : null}
                        {!orgLoading && !orgResults.length ? (
                          <p className="text-sm text-sand-500">
                            Search to see organizations.
                          </p>
                        ) : null}
                      </div>
                      </Card>

                      <Card className="space-y-5">
                      <SectionHeading
                        title={
                          selectedOrg
                            ? `Forms for ${selectedOrg.name}`
                            : "Select an organization"
                        }
                        subtitle="Pick a form, autofill, and confirm before submitting."
                      />
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Input
                          placeholder="Search forms"
                          value={formQuery}
                          onChange={(event) => setFormQuery(event.target.value)}
                        />
                        <Button
                          variant="secondary"
                          onClick={handleFormSearch}
                          disabled={formLoading}
                        >
                          {formLoading ? "Searching..." : "Search"}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {forms.map((form) => (
                          <div
                            key={form._id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand-200 bg-white p-4"
                          >
                            <div>
                              <p className="font-semibold text-sand-950">
                                {form.name}
                              </p>
                              <p className="text-sm text-sand-500">
                                Autofill ready
                              </p>
                            </div>
                            <Button size="sm" onClick={() => openForm(form)}>
                              Fill
                            </Button>
                          </div>
                        ))}
                        {formLoading ? (
                          <p className="text-sm text-sand-500">Loading forms...</p>
                        ) : null}
                        {!formLoading && !forms.length && selectedOrg ? (
                          <p className="text-sm text-sand-500">No forms yet.</p>
                        ) : null}
                      </div>
                      </Card>
                    </section>
                    <section className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-[1fr_1fr]">
                      <Card className="space-y-5">
                        <SectionHeading
                          title="Submission status"
                          subtitle="Track every form after submission."
                        />
                        <div className="space-y-4">
                          {submissions.map((submission) => (
                            <div
                              key={submission._id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand-200 bg-white p-4"
                            >
                              <div>
                                <p className="font-semibold text-sand-950">
                                  {typeof submission.formId === "string"
                                    ? `Form ${submission.formId}`
                                    : submission.formId.name}
                                </p>
                                <p className="text-sm text-sand-500">
                                  {new Date(submission.createdAt).toLocaleString()}
                                </p>
                                {submission.reviewNotes ? (
                                  <p className="text-sm text-sand-500">
                                    Notes: {submission.reviewNotes}
                                  </p>
                                ) : null}
                                {submission.cooldownUntil ? (
                                  <p className="text-sm text-sand-500">
                                    Cooldown until: {new Date(
                                      submission.cooldownUntil
                                    ).toLocaleDateString()}
                                  </p>
                                ) : null}
                              </div>
                              <StatusPill
                                status={
                                  submission.status as
                                    | "pending"
                                    | "completed"
                                    | "rejected"
                                }
                              />
                            </div>
                          ))}
                          {!submissions.length ? (
                            <p className="text-sm text-sand-500">
                              No submissions yet.
                            </p>
                          ) : null}
                        </div>
                      </Card>

                      <Card className="space-y-5">
                        <SectionHeading
                          title="Next steps"
                          subtitle="Confirm the autofilled details and submit in minutes."
                        />
                        <div className="space-y-4">
                          <div className="rounded-2xl border border-sand-200 bg-white p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-sand-500">
                              Step 1
                            </p>
                            <p className="mt-2 text-lg font-semibold text-sand-950">
                              Update your profile data once
                            </p>
                            <p className="text-sm text-sand-500">
                              Your saved profile drives every autofill request.
                            </p>
                          </div>
                          <div className="rounded-2xl border border-sand-200 bg-white p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-sand-500">
                              Step 2
                            </p>
                            <p className="mt-2 text-lg font-semibold text-sand-950">
                              Review and confirm before submit
                            </p>
                            <p className="text-sm text-sand-500">
                              Edits are always possible before delivery.
                            </p>
                          </div>
                          <div className="rounded-2xl border border-sand-200 bg-white p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-sand-500">
                              Step 3
                            </p>
                            <p className="mt-2 text-lg font-semibold text-sand-950">
                              Track approvals in real time
                            </p>
                            <p className="text-sm text-sand-500">
                              Accepted forms lock for 30 days.
                            </p>
                          </div>
                        </div>
                        <Button
                          size="lg"
                          className="w-full"
                          onClick={() => navigate("/profile")}
                        >
                          Go to profile
                        </Button>
                      </Card>
                    </section>
                  </>
                ) : null
              }
            />
            <Route
              path="/profile"
              element={
                role === "user" && !showOnboarding ? (
                  <section className="mx-auto mt-10 max-w-3xl">
                    <Card className="space-y-6">
                      <SectionHeading
                        title="Profile"
                        subtitle="Keep your data accurate for every autofill."
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          placeholder="Full name"
                          value={profileDraft.fullName || ""}
                          onChange={(event) =>
                            setProfileDraft((prev) => ({
                              ...prev,
                              fullName: event.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Work email"
                          value={profileDraft.workEmail || ""}
                          onChange={(event) =>
                            setProfileDraft((prev) => ({
                              ...prev,
                              workEmail: event.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Personal email"
                          value={profileDraft.personalEmail || ""}
                          onChange={(event) =>
                            setProfileDraft((prev) => ({
                              ...prev,
                              personalEmail: event.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Address"
                          value={profileDraft.address || ""}
                          onChange={(event) =>
                            setProfileDraft((prev) => ({
                              ...prev,
                              address: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          placeholder="Phone number"
                          value={profileDraft.phone || ""}
                          onChange={(event) =>
                            setProfileDraft((prev) => ({
                              ...prev,
                              phone: event.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Citizenship number"
                          value={profileDraft.citizenshipNumber || ""}
                          onChange={(event) =>
                            setProfileDraft((prev) => ({
                              ...prev,
                              citizenshipNumber: event.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Profile photo (placeholder)"
                          value={profileDraft.profilePhotoUrl || ""}
                          onChange={(event) =>
                            setProfileDraft((prev) => ({
                              ...prev,
                              profilePhotoUrl: event.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Citizenship photo (placeholder)"
                          value={profileDraft.citizenshipPhotoUrl || ""}
                          onChange={(event) =>
                            setProfileDraft((prev) => ({
                              ...prev,
                              citizenshipPhotoUrl: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button onClick={handleProfileSave}>Save profile</Button>
                      </div>
                      {profileMessage ? (
                        <p className="text-sm text-sand-500">{profileMessage}</p>
                      ) : null}
                    </Card>
                  </section>
                ) : null
              }
            />
            <Route
              path="/onboarding"
              element={
                role === "user" && showOnboarding ? (
                  <section className="mx-auto mt-10 max-w-2xl">
                    <Card className="space-y-6">
                      <div className="space-y-3">
                        <p className="text-xs uppercase tracking-[0.3em] text-sand-500">
                          Welcome to Omniform
                        </p>
                        <h2 className="text-3xl font-semibold text-sand-950">
                          Let’s set up your profile
                        </h2>
                        <p className="text-sm text-sand-500">
                          Complete the essentials to unlock form filling.
                        </p>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-sand-200">
                        <div
                          className="h-full rounded-full bg-sand-900 transition-all"
                          style={{ width: onboardingStep === 1 ? "50%" : "100%" }}
                        />
                      </div>

                      {onboardingStep === 1 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            placeholder="Full name *"
                            value={profileDraft.fullName || ""}
                            onChange={(event) =>
                              setProfileDraft((prev) => ({
                                ...prev,
                                fullName: event.target.value,
                              }))
                            }
                          />
                          <Input
                            placeholder="Work email *"
                            value={profileDraft.workEmail || ""}
                            onChange={(event) =>
                              setProfileDraft((prev) => ({
                                ...prev,
                                workEmail: event.target.value,
                              }))
                            }
                          />
                          <Input
                            placeholder="Personal email *"
                            value={profileDraft.personalEmail || ""}
                            onChange={(event) =>
                              setProfileDraft((prev) => ({
                                ...prev,
                                personalEmail: event.target.value,
                              }))
                            }
                          />
                          <Input
                            placeholder="Address *"
                            value={profileDraft.address || ""}
                            onChange={(event) =>
                              setProfileDraft((prev) => ({
                                ...prev,
                                address: event.target.value,
                              }))
                            }
                          />
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            placeholder="Phone number"
                            value={profileDraft.phone || ""}
                            onChange={(event) =>
                              setProfileDraft((prev) => ({
                                ...prev,
                                phone: event.target.value,
                              }))
                            }
                          />
                          <Input
                            placeholder="Citizenship number"
                            value={profileDraft.citizenshipNumber || ""}
                            onChange={(event) =>
                              setProfileDraft((prev) => ({
                                ...prev,
                                citizenshipNumber: event.target.value,
                              }))
                            }
                          />
                          <Input
                            placeholder="Profile photo (placeholder)"
                            value={profileDraft.profilePhotoUrl || ""}
                            onChange={(event) =>
                              setProfileDraft((prev) => ({
                                ...prev,
                                profilePhotoUrl: event.target.value,
                              }))
                            }
                          />
                          <Input
                            placeholder="Citizenship photo (placeholder)"
                            value={profileDraft.citizenshipPhotoUrl || ""}
                            onChange={(event) =>
                              setProfileDraft((prev) => ({
                                ...prev,
                                citizenshipPhotoUrl: event.target.value,
                              }))
                            }
                          />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {onboardingStep === 1 ? (
                          <Button onClick={handleOnboardingNext}>Next</Button>
                        ) : (
                          <>
                            <Button onClick={handleOnboardingFinish}>
                              Save and finish
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => setShowOnboarding(false)}
                            >
                              Skip for now
                            </Button>
                          </>
                        )}
                      </div>
                      {profileMessage ? (
                        <p className="text-sm text-sand-500">{profileMessage}</p>
                      ) : null}
                    </Card>
                  </section>
                ) : null
              }
            />
            <Route
              path="/forms/:formId"
              element={
                role === "user" && !showOnboarding ? (
                  <section className="mx-auto mt-10 max-w-4xl">
                    <Card className="space-y-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <SectionHeading
                          title={activeForm?.name || "Select a form"}
                          subtitle={
                            activeForm?.description ||
                            "Choose a form from the dashboard to start filling."
                          }
                        />
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/")}
                        >
                          Back to dashboard
                        </Button>
                      </div>
                      {activeForm ? (
                        <div className="space-y-6">
                          <div className="flex flex-wrap items-center gap-3">
                            <Button variant="secondary" onClick={handleAutofill}>
                              Autofill
                            </Button>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {(activeForm.components || activeForm.fields || []).map(
                              (field) => {
                                const key = field.tag || field.id;
                                const value = formValues[key] || "";
                                const error = formErrors[key];
                                return (
                                  <div key={key} className="space-y-2">
                                    <Input
                                      placeholder={
                                        field.required
                                          ? `${field.label} *`
                                          : field.label
                                      }
                                      value={value}
                                      onChange={(event) =>
                                        setFormValues((prev) => ({
                                          ...prev,
                                          [key]: event.target.value,
                                        }))
                                      }
                                    />
                                    {error ? (
                                      <p className="text-sm text-sand-500">
                                        {error}
                                      </p>
                                    ) : null}
                                  </div>
                                );
                              }
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <Button onClick={handleSubmitForm}>Submit</Button>
                            {submitMessage ? (
                              <p className="text-sm text-sand-500">
                                {submitMessage}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-sand-500">
                          Start by selecting an organization and form on the
                          dashboard.
                        </p>
                      )}
                    </Card>
                  </section>
                ) : null
              }
            />
            <Route
              path="/admin"
              element={
                role === "admin" ? (
                  <section className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-[1fr_1fr]">
                    <Card className="space-y-5">
                      <SectionHeading
                        title="Admin control center"
                        subtitle="Register organizations and assign org accounts."
                      />
                      <div className="space-y-3">
                        <p className="text-sm text-sand-500">
                          Roles must be exactly: admin, user, or organization.
                        </p>
                        <p className="text-sm text-sand-500">
                          Paste Clerk user IDs (example: user_abc123). Organization
                          users are assigned to an org ID after creation.
                        </p>
                        <Input
                          placeholder="Organization name"
                          value={orgName}
                          onChange={(event) => setOrgName(event.target.value)}
                        />
                        <Input
                          placeholder="Organization userId (optional)"
                          value={orgUserId}
                          onChange={(event) => setOrgUserId(event.target.value)}
                        />
                        <div className="space-y-2">
                          <p className="text-xs uppercase tracking-[0.2em] text-sand-500">
                            Subscription period
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  className="justify-between"
                                >
                                  {orgCreateSubscriptionStartsAt
                                    ? format(
                                        new Date(orgCreateSubscriptionStartsAt),
                                        "PPP"
                                      )
                                    : "Start date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={
                                    orgCreateSubscriptionStartsAt
                                      ? new Date(orgCreateSubscriptionStartsAt)
                                      : undefined
                                  }
                                  onSelect={(date) =>
                                    setOrgCreateSubscriptionStartsAt(
                                      date ? date.toISOString().slice(0, 10) : ""
                                    )
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  className="justify-between"
                                >
                                  {orgCreateSubscriptionEndsAt
                                    ? format(
                                        new Date(orgCreateSubscriptionEndsAt),
                                        "PPP"
                                      )
                                    : "End date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={
                                    orgCreateSubscriptionEndsAt
                                      ? new Date(orgCreateSubscriptionEndsAt)
                                      : undefined
                                  }
                                  onSelect={(date) =>
                                    setOrgCreateSubscriptionEndsAt(
                                      date ? date.toISOString().slice(0, 10) : ""
                                    )
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <Button onClick={handleCreateOrg}>
                          Create organization
                        </Button>
                        {createdOrgId ? (
                          <p className="text-sm text-sand-500">
                            Created org ID: {createdOrgId}
                          </p>
                        ) : null}
                        {orgMessage ? (
                          <p className="text-sm text-sand-500">{orgMessage}</p>
                        ) : null}
                      </div>
                    </Card>

                    <Card className="space-y-5">
                      <SectionHeading
                        title="Assign roles"
                        subtitle="Promote users or link org accounts."
                      />
                      <div className="space-y-3">
                        <p className="text-sm text-sand-500">
                          Find user IDs in Clerk Dashboard → Users (format: user_...).
                        </p>
                        <Input
                          placeholder="User email"
                          value={roleUserEmail}
                          onChange={(event) => setRoleUserEmail(event.target.value)}
                        />
                        <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
                          <Select
                            value={roleValue}
                            onChange={(event) => setRoleValue(event.target.value)}
                          >
                            <option value="user">user</option>
                            <option value="organization">organization</option>
                            <option value="admin">admin</option>
                          </Select>
                          <ComboBox
                            value={roleOrgId}
                            onChange={setRoleOrgId}
                            options={adminOrgs.map((org) => ({
                              value: org._id,
                              label: org.name,
                            }))}
                            placeholder="Search organization"
                          />
                        </div>
                        <Button variant="secondary" onClick={handleSetRole}>
                          Update role
                        </Button>
                        {roleMessage ? (
                          <p className="text-sm text-sand-500">{roleMessage}</p>
                        ) : null}
                      </div>
                    </Card>
                    <Card className="space-y-5">
                      <SectionHeading
                        title="Form builder"
                        subtitle="Launch the full-screen builder workspace."
                      />
                      <p className="text-sm text-sand-500">
                        Build forms in a dedicated canvas with drag-and-drop components.
                      </p>
                      <Button onClick={() => navigate("/admin/builder")}>
                        Open builder
                      </Button>
                    </Card>
                    <Card className="space-y-5">
                      <SectionHeading
                        title="Manage forms"
                        subtitle="Browse and organize form templates."
                      />
                      <p className="text-sm text-sand-500">
                        Review every organization and its form templates.
                      </p>
                      <Button onClick={() => navigate("/admin/manage")}>
                        Manage forms
                      </Button>
                    </Card>
                    <Card className="space-y-5">
                      <SectionHeading
                        title="Organization settings"
                        subtitle="View compliance and subscription details."
                      />
                      <p className="text-sm text-sand-500">
                        Update PAN, license, location, and renewals.
                      </p>
                      <Button onClick={() => navigate("/admin/orgs")}>
                        Manage organizations
                      </Button>
                    </Card>
                  </section>
                ) : null
              }
            />
            <Route
              path="/admin/orgs"
              element={
                role === "admin" ? (
                  <section className="mx-auto mt-6 max-w-6xl">
                    <Card className="space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <SectionHeading
                          title="Organizations"
                          subtitle="Select an organization to edit settings."
                        />
                        <Button variant="ghost" onClick={() => navigate("/admin")}>
                          Back to dashboard
                        </Button>
                      </div>
                      <Input
                        placeholder="Search organizations"
                        value={manageOrgQuery}
                        onChange={(event) => setManageOrgQuery(event.target.value)}
                      />
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredAdminOrgs.map((org) => (
                          <Card key={org._id} className="space-y-3">
                            <div className="space-y-1">
                              <p className="text-lg font-semibold text-sand-950">
                                {org.name}
                              </p>
                              <p className="text-sm text-sand-500">{org.slug}</p>
                            </div>
                            <Button
                              variant="secondary"
                              onClick={() => handleOpenOrgSettings(org)}
                            >
                              Manage organization
                            </Button>
                          </Card>
                        ))}
                        {!filteredAdminOrgs.length ? (
                          <p className="text-sm text-sand-500">
                            No organizations match that search.
                          </p>
                        ) : null}
                      </div>
                    </Card>
                  </section>
                ) : null
              }
            />
            <Route
              path="/admin/orgs/:orgId"
              element={
                role === "admin" ? (
                  <section className="mx-auto mt-6 max-w-4xl">
                    <Card className="space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <SectionHeading
                          title={
                            selectedAdminOrg
                              ? `Manage ${selectedAdminOrg.name}`
                              : "Organization settings"
                          }
                          subtitle="Update compliance details and subscription status."
                        />
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/admin/orgs")}
                        >
                          Back to organizations
                        </Button>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-sand-900">
                            Organization details
                          </p>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">
                                Organization name
                              </p>
                              <Input
                                placeholder="e.g., Omniform Labs"
                                value={orgSettingsName}
                                onChange={(event) =>
                                  setOrgSettingsName(event.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">
                                Organization status
                              </p>
                              <Select
                                value={orgSettingsStatus}
                                onChange={(event) =>
                                  setOrgSettingsStatus(event.target.value)
                                }
                              >
                                <option value="active">active</option>
                                <option value="inactive">inactive</option>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3 border-t border-sand-200 pt-4">
                          <p className="text-sm font-semibold text-sand-900">
                            Compliance & identity
                          </p>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">
                                PAN number
                              </p>
                              <Input
                                placeholder="Tax identifier"
                                value={orgSettingsPanNumber}
                                onChange={(event) =>
                                  setOrgSettingsPanNumber(event.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">
                                License number
                              </p>
                              <Input
                                placeholder="Regulatory license"
                                value={orgSettingsLicenseNumber}
                                onChange={(event) =>
                                  setOrgSettingsLicenseNumber(event.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">
                                Location
                              </p>
                              <Input
                                placeholder="City, country"
                                value={orgSettingsLocation}
                                onChange={(event) =>
                                  setOrgSettingsLocation(event.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3 border-t border-sand-200 pt-4">
                          <p className="text-sm font-semibold text-sand-900">
                            Subscription
                          </p>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">
                                Subscription status
                              </p>
                              <Select
                                value={orgSettingsSubscriptionStatus}
                                onChange={(event) =>
                                  setOrgSettingsSubscriptionStatus(event.target.value)
                                }
                              >
                                <option value="active">active</option>
                                <option value="canceled">canceled</option>
                                <option value="expired">expired</option>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">
                                Start date
                              </p>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    className="justify-between"
                                  >
                                    {orgSettingsSubscriptionStartsAt
                                      ? format(
                                          new Date(orgSettingsSubscriptionStartsAt),
                                          "PPP"
                                        )
                                      : "Select start date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={
                                      orgSettingsSubscriptionStartsAt
                                        ? new Date(
                                            orgSettingsSubscriptionStartsAt
                                          )
                                        : undefined
                                    }
                                    onSelect={(date) =>
                                      setOrgSettingsSubscriptionStartsAt(
                                        date ? date.toISOString().slice(0, 10) : ""
                                      )
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">
                                End date
                              </p>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    className="justify-between"
                                  >
                                    {orgSettingsSubscriptionEndsAt
                                      ? format(
                                          new Date(orgSettingsSubscriptionEndsAt),
                                          "PPP"
                                        )
                                      : "Select end date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={
                                      orgSettingsSubscriptionEndsAt
                                        ? new Date(orgSettingsSubscriptionEndsAt)
                                        : undefined
                                    }
                                    onSelect={(date) =>
                                      setOrgSettingsSubscriptionEndsAt(
                                        date ? date.toISOString().slice(0, 10) : ""
                                      )
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button onClick={handleSaveOrgSettings}>
                          Save changes
                        </Button>
                        {orgSettingsMessage ? (
                          <p className="text-sm text-sand-500">
                            {orgSettingsMessage}
                          </p>
                        ) : null}
                      </div>
                    </Card>
                  </section>
                ) : null
              }
            />
            <Route
              path="/admin/builder"
              element={
                role === "admin" ? (
                  <section className="mx-auto mt-6 min-h-[70vh] max-w-6xl">
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sand-200 bg-white px-4 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Button variant="ghost" onClick={() => navigate("/admin")}>
                          Back to dashboard
                        </Button>
                        <p className="text-sm text-sand-500">
                          Build and tag form components.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="secondary"
                          onClick={() => setShowFormSave(true)}
                        >
                          Save form
                        </Button>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
                      <div className="flex min-h-[70vh] max-h-[70vh] flex-col space-y-4">
                        <p className="text-xs uppercase tracking-[0.3em] text-sand-500">
                          Components
                        </p>
                        <Input
                          placeholder="Search components"
                          value={componentSearch}
                          onChange={(event) => setComponentSearch(event.target.value)}
                        />
                        <div
                          className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto pr-1"
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault();
                            if (!draggingComponentId) return;
                            setFormComponents((prev) =>
                              prev.filter((item) => item.id !== draggingComponentId)
                            );
                            setDraggingComponentId(null);
                            setDropIndex(null);
                          }}
                        >
                          <div
                            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-sand-300 bg-sand-50 p-2 text-center text-[10px] text-sand-700"
                            onClick={() => setShowCustomComponent(true)}
                          >
                            <Plus className="h-3.5 w-3.5 text-sand-900" />
                            <span className="text-[9px] uppercase tracking-[0.2em]">
                              Add new
                            </span>
                            <span className="text-[9px] uppercase tracking-[0.2em]">
                              component
                            </span>
                          </div>
                          {[
                            {
                              type: "text",
                              label: "Full name",
                              tag: "fullName",
                              icon: Type,
                              iconName: "type",
                            },
                            {
                              type: "email",
                              label: "Work email",
                              tag: "workEmail",
                              icon: Mail,
                              iconName: "mail",
                            },
                            {
                              type: "email",
                              label: "Personal email",
                              tag: "personalEmail",
                              icon: Mail,
                              iconName: "mail",
                            },
                            {
                              type: "text",
                              label: "Address",
                              tag: "address",
                              icon: MapPin,
                              iconName: "map-pin",
                            },
                            {
                              type: "text",
                              label: "Phone",
                              tag: "phone",
                              icon: Phone,
                              iconName: "phone",
                            },
                            {
                              type: "text",
                              label: "Citizenship",
                              tag: "citizenshipNumber",
                              icon: IdCard,
                              iconName: "id-card",
                            },
                          ]
                            .filter((component) => {
                              const query = componentSearch.trim().toLowerCase();
                              if (!query) return true;
                              const haystack = `${component.label} ${component.type} ${
                                component.tag
                              }`
                                .toLowerCase()
                                .trim();
                              if (haystack.includes(query)) return true;
                              let qIndex = 0;
                              for (let i = 0; i < haystack.length; i += 1) {
                                if (haystack[i] === query[qIndex]) {
                                  qIndex += 1;
                                  if (qIndex === query.length) return true;
                                }
                              }
                              return false;
                            })
                            .map((component) => (
                              <div
                                key={component.label}
                                draggable
                                onClick={() => {
                                  setFormComponents((prev) => [
                                    ...prev,
                                    {
                                      id: `${component.type}-${Date.now()}`,
                                      type: component.type,
                                      label: "",
                                      tag: component.tag || "",
                                      iconName: component.iconName,
                                      required: false,
                                      options: "",
                                    },
                                  ]);
                                }}
                                onDragStart={(event) => {
                                  event.dataTransfer.setData(
                                    "component",
                                    JSON.stringify(component)
                                  );
                                }}
                                className="flex aspect-square cursor-grab flex-col items-center justify-center gap-1 rounded-xl border border-sand-200 bg-white p-2 text-center text-[10px] text-sand-700"
                              >
                                <component.icon className="h-3.5 w-3.5 text-sand-900" />
                                <span className="text-[9px] uppercase tracking-[0.2em]">
                                  {component.label}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div
                        onDragOver={(event) => event.preventDefault()}
                        onDragEnter={() => setDropIndex(formComponents.length)}
                        onDrop={(event) => {
                          event.preventDefault();
                          const payload = event.dataTransfer.getData("component");
                          const insertAt =
                            dropIndex === null ? formComponents.length : dropIndex;

                          if (payload) {
                            const component = JSON.parse(payload) as {
                              type: string;
                              label: string;
                              tag?: string;
                              iconName?: string;
                            };
                            setFormComponents((prev) => {
                              const nextItem = {
                                id: `${component.type}-${Date.now()}`,
                                type: component.type,
                                label: "",
                                tag: component.tag || "",
                                iconName: component.iconName,
                                required: false,
                                options: "",
                              };
                              const updated = [...prev];
                              updated.splice(insertAt, 0, nextItem);
                              return updated;
                            });
                          } else if (draggingComponentId) {
                            setFormComponents((prev) => {
                              const fromIndex = prev.findIndex(
                                (item) => item.id === draggingComponentId
                              );
                              if (fromIndex === -1) return prev;
                              const updated = [...prev];
                              const [moved] = updated.splice(fromIndex, 1);
                              const targetIndex =
                                fromIndex < insertAt ? insertAt - 1 : insertAt;
                              updated.splice(targetIndex, 0, moved);
                              return updated;
                            });
                          }
                          setDropIndex(null);
                          setDraggingComponentId(null);
                        }}
                        className="min-h-[70vh] max-h-[70vh] overflow-y-auto rounded-3xl border border-dashed border-sand-300 bg-sand-50 p-6"
                      >
                        {formComponents.length ? (
                          <div className="space-y-4">
                            {formComponents.map((component, index) => (
                              <div key={component.id} className="space-y-3">
                                {dropIndex === index ? (
                                  <div className="h-1 w-full rounded-full bg-sand-900" />
                                ) : null}
                                <div
                                  draggable
                                  onDragStart={(event) => {
                                    event.dataTransfer.setData(
                                      "reorder",
                                      component.id
                                    );
                                    setDraggingComponentId(component.id);
                                  }}
                                  onDragEnd={() => {
                                    setDraggingComponentId(null);
                                    setDropIndex(null);
                                  }}
                                  onDragOver={(event) => {
                                    event.preventDefault();
                                    setDropIndex((prev) =>
                                      prev === index ? prev : index
                                    );
                                  }}
                                  className="rounded-2xl border border-sand-200 bg-white p-4"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        {component.iconName ? (
                                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-sand-200 bg-sand-50">
                                            {component.iconName === "type" ? (
                                              <Type className="h-3.5 w-3.5 text-sand-900" />
                                            ) : component.iconName === "mail" ? (
                                              <Mail className="h-3.5 w-3.5 text-sand-900" />
                                            ) : component.iconName === "calendar" ? (
                                              <Calendar className="h-3.5 w-3.5 text-sand-900" />
                                            ) : component.iconName === "map-pin" ? (
                                              <MapPin className="h-3.5 w-3.5 text-sand-900" />
                                            ) : component.iconName === "phone" ? (
                                              <Phone className="h-3.5 w-3.5 text-sand-900" />
                                            ) : component.iconName === "id-card" ? (
                                              <IdCard className="h-3.5 w-3.5 text-sand-900" />
                                            ) : component.iconName === "image" ? (
                                              <Image className="h-3.5 w-3.5 text-sand-900" />
                                            ) : component.iconName === "file-text" ? (
                                              <FileText className="h-3.5 w-3.5 text-sand-900" />
                                            ) : component.iconName === "user" ? (
                                              <User className="h-3.5 w-3.5 text-sand-900" />
                                            ) : component.iconName === "shield" ? (
                                              <Shield className="h-3.5 w-3.5 text-sand-900" />
                                            ) : (
                                              <BadgeCheck className="h-3.5 w-3.5 text-sand-900" />
                                            )}
                                          </span>
                                        ) : null}
                                        <p className="text-sm font-semibold text-sand-950">
                                          {component.label || "Untitled field"}
                                        </p>
                                      </div>
                                      <p className="text-xs text-sand-500">
                                        Tag: {component.tag || "none"}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant={
                                          component.required ? "primary" : "ghost"
                                        }
                                        type="button"
                                        onClick={() =>
                                          setFormComponents((prev) =>
                                            prev.map((item, idx) =>
                                              idx === index
                                                ? {
                                                    ...item,
                                                    required: !item.required,
                                                  }
                                                : item
                                            )
                                          )
                                        }
                                      >
                                        {component.required ? "Required" : "Optional"}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        type="button"
                                        onClick={() =>
                                          setFormComponents((prev) =>
                                            prev.filter((_, idx) => idx !== index)
                                          )
                                        }
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3 rounded-2xl border border-dashed border-sand-200 bg-sand-50 p-3">
                                  {component.type === "select" ? (
                                    <p className="text-xs text-sand-500">
                                      Select: {component.options || "No options"}
                                    </p>
                                  ) : component.type === "date" ? (
                                    <p className="text-xs text-sand-500">Date picker</p>
                                  ) : component.type === "email" ? (
                                    <p className="text-xs text-sand-500">Email input</p>
                                  ) : component.type === "image" ? (
                                    <p className="text-xs text-sand-500">
                                      Image upload
                                    </p>
                                  ) : (
                                    <p className="text-xs text-sand-500">Text input</p>
                                  )}
                                </div>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                  <Input
                                    placeholder="Label"
                                    value={component.label}
                                    onChange={(event) =>
                                      setFormComponents((prev) =>
                                        prev.map((item, idx) =>
                                          idx === index
                                            ? { ...item, label: event.target.value }
                                            : item
                                        )
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="Tag (maps to profile key)"
                                    value={component.tag}
                                    onChange={(event) =>
                                      setFormComponents((prev) =>
                                        prev.map((item, idx) =>
                                          idx === index
                                            ? { ...item, tag: event.target.value }
                                            : item
                                        )
                                      )
                                    }
                                  />
                                  <Select
                                    value={component.type}
                                    onChange={(event) =>
                                      setFormComponents((prev) =>
                                        prev.map((item, idx) =>
                                          idx === index
                                            ? { ...item, type: event.target.value }
                                            : item
                                        )
                                      )
                                    }
                                  >
                                    <option value="text">text</option>
                                    <option value="email">email</option>
                                    <option value="date">date</option>
                                    <option value="select">select</option>
                                    <option value="image">image</option>
                                  </Select>
                                  <Input
                                    placeholder="Options (comma)"
                                    value={component.options}
                                    onChange={(event) =>
                                      setFormComponents((prev) =>
                                        prev.map((item, idx) =>
                                          idx === index
                                            ? {
                                                ...item,
                                                options: event.target.value,
                                              }
                                            : item
                                        )
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sand-500">
                            <p className="text-sm uppercase tracking-[0.2em]">
                              Drop components here
                            </p>
                            <p className="text-base text-sand-700">
                              Drag tiles or click them to build a form.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                ) : null
              }
            />
            <Route
              path="/admin/manage"
              element={
                role === "admin" ? (
                  <section className="mx-auto mt-6 max-w-6xl">
                    <Card className="space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <SectionHeading
                          title="Manage forms"
                          subtitle="Select an organization to see its templates."
                        />
                        <Button variant="ghost" onClick={() => navigate("/admin")}>
                          Back to dashboard
                        </Button>
                      </div>
                      <Input
                        placeholder="Search organizations"
                        value={manageOrgQuery}
                        onChange={(event) => setManageOrgQuery(event.target.value)}
                      />
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredAdminOrgs.map((org) => (
                          <Card key={org._id} className="space-y-2">
                            <p className="text-lg font-semibold text-sand-950">
                              {org.name}
                            </p>
                            <p className="text-sm text-sand-500">{org.slug}</p>
                            <Button
                              variant="secondary"
                              onClick={() => handleOpenManageOrg(org)}
                            >
                              View forms
                            </Button>
                          </Card>
                        ))}
                        {!filteredAdminOrgs.length ? (
                          <p className="text-sm text-sand-500">
                            No organizations match that search.
                          </p>
                        ) : null}
                      </div>
                    </Card>
                  </section>
                ) : null
              }
            />
            <Route
              path="/admin/manage/forms"
              element={
                role === "admin" ? (
                  <section className="mx-auto mt-6 max-w-6xl">
                    <Card className="space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <SectionHeading
                          title={
                            selectedManageOrg
                              ? `Forms for ${selectedManageOrg.name}`
                              : "Organization forms"
                          }
                          subtitle="Search and review every template."
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => navigate("/admin/manage")}
                          >
                            Back to organizations
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => navigate("/admin")}
                          >
                            Back to dashboard
                          </Button>
                        </div>
                      </div>
                      <Input
                        placeholder="Search forms"
                        value={manageFormQuery}
                        onChange={(event) => setManageFormQuery(event.target.value)}
                      />
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredManageForms.map((form) => (
                          <Card key={form._id} className="space-y-3">
                            <div className="space-y-1">
                              <p className="text-lg font-semibold text-sand-950">
                                {form.name}
                              </p>
                              <p className="text-sm text-sand-500">
                                {form.description || "No description"}
                              </p>
                            </div>
                            <Button
                              variant="secondary"
                              onClick={() => handleEditManageForm(form)}
                            >
                              Edit form
                            </Button>
                          </Card>
                        ))}
                        {manageFormsLoading ? (
                          <p className="text-sm text-sand-500">Loading forms...</p>
                        ) : null}
                        {!manageFormsLoading && !filteredManageForms.length ? (
                          <p className="text-sm text-sand-500">
                            No forms match that search.
                          </p>
                        ) : null}
                      </div>
                    </Card>
                  </section>
                ) : null
              }
            />
            <Route
              path="/org"
              element={
                role === "organization" ? (
                  <section className="mx-auto mt-10 max-w-6xl">
                    <Card className="space-y-6">
                      {orgMembership &&
                      (membershipExpired ||
                        orgMembership.subscriptionStatus !== "active") ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                          <p className="text-sm text-amber-900">
                            Membership is {membershipStatus}. Your organization forms
                            are hidden from users until renewal.
                          </p>
                        </div>
                      ) : null}
                      <SectionHeading
                        title="Organization review"
                        subtitle="Review submitted forms and accept or reject."
                      />
                      <Card className="space-y-4 border border-sand-200 bg-sand-50/60">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-sand-950">
                              Membership status
                            </p>
                            <p className="text-sm text-sand-500">
                              {membershipStatus}
                              {orgMembership?.subscriptionStartsAt
                                ? ` · Starts ${new Date(
                                    orgMembership.subscriptionStartsAt
                                  ).toLocaleDateString()}`
                                : ""}
                              {orgMembership?.subscriptionEndsAt
                                ? ` · Ends ${new Date(
                                    orgMembership.subscriptionEndsAt
                                  ).toLocaleDateString()}`
                                : ""}
                            </p>
                          </div>
                          <Badge tone="neutral">
                            {orgMembership?.subscriptionStatus || "unknown"}
                          </Badge>
                        </div>
                      </Card>
                      <p className="text-sm text-sand-500">
                        Your organization ID is pulled from Clerk metadata. Use
                        filters to focus on a specific form.
                      </p>
                      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                        <Select
                          value={orgFormFilter}
                          onChange={(event) => setOrgFormFilter(event.target.value)}
                        >
                          <option value="">All forms</option>
                          {orgForms.map((form) => (
                            <option key={form._id} value={form._id}>
                              {form.name}
                            </option>
                          ))}
                        </Select>
                        <Select
                          value={orgStatusFilter}
                          onChange={(event) => setOrgStatusFilter(event.target.value)}
                        >
                          <option value="all">all</option>
                          <option value="pending">pending</option>
                          <option value="completed">accepted</option>
                          <option value="rejected">rejected</option>
                        </Select>
                        <Button
                          variant="secondary"
                          onClick={() => loadOrgSubmissions(orgFormFilter)}
                        >
                          Refresh
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-sand-500">
                          Showing {orgSubmissions.length} submissions
                          {orgStatusFilter !== "all"
                            ? ` · ${orgStatusFilter}`
                            : ""}
                        </p>
                      </div>
                      <div className="space-y-4">
                        {orgSubmissions.map((submission) => (
                          <div
                            key={submission._id}
                            className="rounded-2xl border border-sand-200 bg-white p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <p className="text-lg font-semibold text-sand-950">
                                  {typeof submission.formId === "string"
                                    ? "Form"
                                    : submission.formId.name}
                                </p>
                                <p className="text-sm text-sand-500">
                                  Submitted {new Date(submission.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <StatusPill status={submission.status} />
                            </div>
                             {submission.status === "pending" ? (
                               <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                                 <Input
                                   placeholder="Add review notes"
                                   value={orgReviewNotes[submission._id] || ""}
                                   onChange={(event) =>
                                     setOrgReviewNotes((prev) => ({
                                       ...prev,
                                       [submission._id]: event.target.value,
                                     }))
                                   }
                                 />
                                 <Button
                                   variant="secondary"
                                   onClick={() =>
                                     handleOrgDecision(submission._id, "accept")
                                   }
                                 >
                                   Accept
                                 </Button>
                                 <Button
                                   variant="ghost"
                                   onClick={() =>
                                     handleOrgDecision(submission._id, "reject")
                                   }
                                 >
                                   Reject
                                 </Button>
                               </div>
                             ) : null}
                          </div>
                        ))}
                        {!orgSubmissions.length ? (
                          <p className="text-sm text-sand-500">
                            No submissions yet.
                          </p>
                        ) : null}
                      </div>
                      {orgDashboardMessage ? (
                        <p className="text-sm text-sand-500">
                          {orgDashboardMessage}
                        </p>
                      ) : null}
                    </Card>
                  </section>
                ) : null
              }
            />
          </Routes>
        ) : null}

        {showFormSave ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-3xl border border-sand-200 bg-white p-6 shadow-xl">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-sand-950">
                  {formId ? "Update form" : "Save form"}
                </h3>
                <p className="text-sm text-sand-500">
                  Choose an organization and describe this form.
                </p>
              </div>
              <div className="mt-4 space-y-3">
                <ComboBox
                  value={formOrgId}
                  onChange={setFormOrgId}
                  options={adminOrgs.map((org) => ({
                    value: org._id,
                    label: org.name,
                  }))}
                  placeholder="Search organization"
                />
                <Input
                  placeholder="Form name"
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
                />
                <Input
                  placeholder="Form description"
                  value={formDescription}
                  onChange={(event) => setFormDescription(event.target.value)}
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={handleCreateForm}>
                  {formId ? "Update form" : "Save form"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowFormSave(false)}
                >
                  Cancel
                </Button>
              </div>
              {formMessage ? (
                <p className="mt-3 text-sm text-sand-500">{formMessage}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {showCooldownPrompt ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-3xl border border-sand-200 bg-white p-6 shadow-xl">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-sand-500">
                  Cooldown active
                </p>
                <h3 className="text-xl font-semibold text-sand-950">
                  Please wait before resubmitting
                </h3>
                <p className="text-sm text-sand-500">
                  {cooldownMessage}
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowCooldownPrompt(false)}
                >
                  Got it
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {showSavePrompt ? (
          <section className="mx-auto mt-6 max-w-4xl">
            <Card className="space-y-5">
              <SectionHeading
                title="Save new information?"
                subtitle="We found new details from this form. Save them to your profile?"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {saveCandidates.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-2xl border border-sand-200 bg-white p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-sand-500">
                      {item.key}
                    </p>
                    <p className="mt-2 text-base text-sand-950">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSaveMissing}>Save to profile</Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowSavePrompt(false);
                    setActiveForm(null);
                    setSaveCandidates([]);
                  }}
                >
                  Not now
                </Button>
              </div>
            </Card>
          </section>
        ) : null}


        {showCustomComponent ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-3xl border border-sand-200 bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-sand-950">
                    Add a new component
                  </h3>
                  <p className="text-sm text-sand-500">
                    Define the input type, label, tag, and any options.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomComponent(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sand-200 text-sand-700 transition hover:border-sand-900 hover:text-sand-900"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Label"
                  value={customComponent.label}
                  onChange={(event) =>
                    setCustomComponent((prev) => ({
                      ...prev,
                      label: event.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="Tag (maps to profile key)"
                  value={customComponent.tag}
                  onChange={(event) =>
                    setCustomComponent((prev) => ({
                      ...prev,
                      tag: event.target.value,
                    }))
                  }
                />
                <Select
                  value={customComponent.type}
                  onChange={(event) =>
                    setCustomComponent((prev) => ({
                      ...prev,
                      type: event.target.value,
                    }))
                  }
                >
                  <option value="text">text</option>
                  <option value="email">email</option>
                  <option value="date">date</option>
                  <option value="select">select</option>
                  <option value="image">image</option>
                </Select>
                <Input
                  placeholder={
                    customComponent.type === "image"
                      ? "Accepted formats (e.g., jpg,png)"
                      : "Options (comma)"
                  }
                  value={customComponent.options}
                  onChange={(event) =>
                    setCustomComponent((prev) => ({
                      ...prev,
                      options: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[
                  { name: "type", Icon: Type },
                  { name: "mail", Icon: Mail },
                  { name: "calendar", Icon: Calendar },
                  { name: "map-pin", Icon: MapPin },
                  { name: "phone", Icon: Phone },
                  { name: "id-card", Icon: IdCard },
                  { name: "image", Icon: Image },
                  { name: "file-text", Icon: FileText },
                  { name: "user", Icon: User },
                  { name: "shield", Icon: Shield },
                  { name: "badge-check", Icon: BadgeCheck },
                ]
                  .map((icon) => (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() =>
                        setCustomComponent((prev) => ({
                          ...prev,
                          iconName: icon.name,
                        }))
                      }
                      className={`flex items-center justify-center rounded-2xl border p-2 ${
                        customComponent.iconName === icon.name
                          ? "border-sand-900"
                          : "border-sand-200"
                      }`}
                    >
                      <icon.Icon className="h-4 w-4 text-sand-900" />
                    </button>
                  ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    if (!customComponent.label.trim()) return;
                    setFormComponents((prev) => [
                      ...prev,
                      {
                        id: `custom-${Date.now()}`,
                        type: customComponent.type,
                        label: customComponent.label,
                        tag: customComponent.tag,
                        iconName: customComponent.iconName,
                        required: customComponent.required,
                        options: customComponent.options,
                      },
                    ]);
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
                >
                  Add component
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowCustomComponent(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : null}

      </main>
    </div>
  );
}

const LandingPage = () => (
  <div className="min-h-screen bg-white">
    <header className="px-6 py-6 sm:px-10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.2em] text-sand-500">
            Omniform
          </p>
          <h1 className="text-2xl font-semibold text-sand-950 sm:text-3xl">
            End the data tax
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <SignInButton>
            <Button size="sm">Sign in</Button>
          </SignInButton>
        </div>
      </nav>
    </header>

    <main className="px-6 pb-16 sm:px-10">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-sand-500">
            Creative Clash 2026
          </p>
          <h2 className="text-4xl font-semibold text-sand-950 sm:text-5xl">
            One profile. Every form. Zero retyping.
          </h2>
          <p className="text-base text-sand-700 sm:text-lg">
            Omniform keeps your core details secure and ready. Sign in once and
            reuse your profile whenever you need to submit a form.
          </p>
          <div className="flex flex-wrap gap-3">
            <SignInButton>
              <Button size="lg">Start filling</Button>
            </SignInButton>
            <Button variant="secondary" size="lg">
              See how it works
            </Button>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-sand-500">
            <span>Secure by design</span>
            <span>Role-based access</span>
            <span>Built for banks, clinics, campuses</span>
          </div>
        </div>
        <div className="grid gap-4">
          <Card className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-sand-500">
              Live forms
            </p>
            <p className="text-xl font-semibold text-sand-950">
              Organizations publish, users fill
            </p>
            <p className="text-sm text-sand-500">
              Drag-and-drop form builder for admins, clean review flow for
              organizations.
            </p>
          </Card>
          <Card className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-sand-500">
              Autofill intelligence
            </p>
            <p className="text-xl font-semibold text-sand-950">
              Tags map to your profile
            </p>
            <p className="text-sm text-sand-500">
              Each field is tagged to your saved info, with prompts to save
              missing details.
            </p>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl">
        <Card className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-sand-500">
              Ready to stop retyping?
            </p>
            <h3 className="text-2xl font-semibold text-sand-950">
              Sign in and build your profile once.
            </h3>
          </div>
          <SignInButton>
            <Button size="lg">Get started</Button>
          </SignInButton>
        </Card>
      </section>
    </main>
  </div>
);
