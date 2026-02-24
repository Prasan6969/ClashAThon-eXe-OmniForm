import {
  useUser,
  useAuth,
  SignInButton,
  SignOutButton,
} from "@clerk/clerk-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { ComboBox } from "./components/ui/combobox";
import { Select } from "./components/ui/select";
import { SectionHeading } from "./components/ui/section-heading";
import { StatusPill } from "./components/ui/status-pill";

type Organization = { _id: string; name: string; slug: string; status: string };
type FormField = {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
};
type Form = {
  _id: string;
  name: string;
  description?: string;
  fields: FormField[];
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
  primary?: Record<string, string>;
  extra?: Record<string, string>;
};

type View = "user" | "profile" | "admin" | "org";

export default function App() {
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
  const [roleUserEmail, setRoleUserEmail] = useState("");
  const [roleValue, setRoleValue] = useState("user");
  const [roleOrgId, setRoleOrgId] = useState("");
  const [orgMessage, setOrgMessage] = useState("");
  const [roleMessage, setRoleMessage] = useState("");
  const [formOrgId, setFormOrgId] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFields, setFormFields] = useState<
    Array<{
      key: string;
      label: string;
      type: string;
      required: boolean;
      options: string;
    }>
  >([{ key: "", label: "", type: "text", required: false, options: "" }]);
  const [formMessage, setFormMessage] = useState("");
  const [adminOrgs, setAdminOrgs] = useState<Organization[]>([]);
  const [orgSubmissions, setOrgSubmissions] = useState<Submission[]>([]);
  const [orgForms, setOrgForms] = useState<Form[]>([]);
  const [orgStatusFilter, setOrgStatusFilter] = useState("pending");
  const [orgFormFilter, setOrgFormFilter] = useState("");
  const [orgReviewNotes, setOrgReviewNotes] = useState<Record<string, string>>(
    {}
  );
  const [orgDashboardMessage, setOrgDashboardMessage] = useState("");

  const [orgQuery, setOrgQuery] = useState("");
  const [orgResults, setOrgResults] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [formQuery, setFormQuery] = useState("");
  const [forms, setForms] = useState<Form[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeForm, setActiveForm] = useState<Form | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [orgLoading, setOrgLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [profileDraft, setProfileDraft] = useState<Profile>({
    primary: { fullName: "", email: "", phone: "", address: "", dob: "" },
    extra: {},
  });
  const [extraEntries, setExtraEntries] = useState<
    Array<{ key: string; value: string }>
  >([{ key: "", value: "" }]);
  const [profileMessage, setProfileMessage] = useState("");
  const [view, setView] = useState<View>("user");
  const [resolvedRole, setResolvedRole] = useState<string | null>(null);
  const [resolvedOrganizationId, setResolvedOrganizationId] = useState<string>("");
  const [hasReloaded, setHasReloaded] = useState(false);

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
        body: JSON.stringify({ name: orgName, organizationUserId: orgUserId }),
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
      const fields = formFields
        .filter((field) => field.key.trim() && field.label.trim())
        .map((field) => ({
          key: field.key.trim(),
          label: field.label.trim(),
          type: field.type.trim() || "text",
          required: field.required,
          options: field.options
            ? field.options.split(",").map((option) => option.trim())
            : [],
        }));

      await adminFetch(`/api/admin/orgs/${formOrgId}/forms`, {
        method: "POST",
        body: JSON.stringify({
          name: formName,
          description: formDescription,
          fields,
        }),
      });

      setFormMessage("Form created.");
      setFormName("");
      setFormDescription("");
      setFormFields([
        { key: "", label: "", type: "text", required: false, options: "" },
      ]);
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

  const buildAutofillPayload = (form: Form) => {
    const data: Record<string, string> = {};
    form.fields?.forEach((field) => {
      const primaryValue = profileDraft?.primary?.[field.key];
      const extraValue = extraEntries.find((entry) => entry.key === field.key)
        ?.value;
      data[field.key] = primaryValue || extraValue || "";
    });
    return data;
  };

  const handleSubmitForm = async () => {
    if (!selectedOrg || !activeForm) return;
    try {
      setSubmitMessage("");
      const data = buildAutofillPayload(activeForm);
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
          primary: profileDraft.primary || {},
          extra: extraEntries.reduce<Record<string, string>>((acc, entry) => {
            if (entry.key.trim()) {
              acc[entry.key.trim()] = entry.value;
            }
            return acc;
          }, {}),
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

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setResolvedRole(null);
      setResolvedOrganizationId("");
      setView("user");
      return;
    }
    const activeRole = resolvedRole || role;
    if (activeRole === "admin") {
      setView("admin");
    } else if (activeRole === "organization") {
      setView("org");
    } else {
      setView("user");
    }
  }, [isLoaded, user, role, resolvedRole]);

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

  useEffect(() => {
    if (!isLoaded || !user) return;
    const resolveRole = async () => {
      try {
        const payload = await authedFetch("/api/admin/whoami");
        setResolvedRole(payload?.resolvedRole || null);
        setResolvedOrganizationId(payload?.organizationId || "");
      } catch (error) {
        setResolvedRole(null);
        setResolvedOrganizationId("");
      }
    };

    resolveRole();
  }, [isLoaded, user]);

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
          primary: {
            fullName: profilePayload?.data?.primary?.fullName || "",
            email: profilePayload?.data?.primary?.email || "",
            phone: profilePayload?.data?.primary?.phone || "",
            address: profilePayload?.data?.primary?.address || "",
            dob: profilePayload?.data?.primary?.dob || "",
          },
          extra: profilePayload?.data?.extra || {},
        });
        const extras = profilePayload?.data?.extra || {};
        const entries = Object.keys(extras).length
          ? Object.entries(extras).map(([key, value]) => ({
              key,
              value: String(value ?? ""),
            }))
          : [{ key: "", value: "" }];
        setExtraEntries(entries);
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
              <Badge tone="neutral">{String(resolvedRole || role)}</Badge>
              {role === "user" ? (
                <>
                  <Button
                    variant={view === "user" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setView("user")}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant={view === "profile" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setView("profile")}
                  >
                    Profile
                  </Button>
                </>
              ) : null}
            {role === "admin" ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setView("admin")}
              >
                Admin
              </Button>
            ) : null}
            {role === "organization" ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setView("org")}
              >
                Review
              </Button>
            ) : null}
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

      <main className="px-6 pb-16 sm:px-10">
        {role === "user" && view === "user" ? (
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
              <Button onClick={handleOrgSearch} disabled={orgLoading}>
                {orgLoading ? "Searching..." : "Search"}
              </Button>
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
                    <p className="text-sm text-sand-500">Active organization</p>
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
                    <p className="font-semibold text-sand-950">{form.name}</p>
                    <p className="text-sm text-sand-500">Autofill ready</p>
                  </div>
                  <Button size="sm" onClick={() => setActiveForm(form)}>
                    Autofill
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
        ) : null}

        {role === "user" && view === "user" && activeForm ? (
          <section className="mx-auto mt-10 max-w-6xl">
            <Card className="space-y-5">
              <SectionHeading
                title={`Confirm ${activeForm.name}`}
                subtitle="Review the autofilled fields before submitting."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {(activeForm.fields || []).map((field) => (
                  <div
                    key={field.key}
                    className="rounded-2xl border border-sand-200 bg-white p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-sand-500">
                      {field.label}
                    </p>
                    <p className="mt-2 text-base text-sand-950">
                      {buildAutofillPayload(activeForm)[field.key] || "—"}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleSubmitForm}>Confirm and submit</Button>
                <Button variant="ghost" onClick={() => setActiveForm(null)}>
                  Cancel
                </Button>
              </div>
              {submitMessage ? (
                <p className="text-sm text-sand-500">{submitMessage}</p>
              ) : null}
            </Card>
          </section>
        ) : null}

        {role === "admin" && view === "admin" ? (
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
                  Paste Clerk user IDs (example: user_abc123). Organization users are
                  assigned to an org ID after creation.
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
          </section>
        ) : null}

        {role === "admin" && view === "admin" ? (
          <section className="mx-auto mt-6 max-w-6xl">
            <Card className="space-y-6">
              <SectionHeading
                title="Form builder"
                subtitle="Create forms and define fields per organization."
              />
              <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="space-y-3">
                <p className="text-sm text-sand-500">
                  Fields (key should match profile keys, e.g., fullName, email)
                </p>
                {formFields.map((field, index) => (
                  <div
                    key={index}
                    className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto_auto]"
                  >
                    <Input
                      placeholder="Field key"
                      value={field.key}
                      onChange={(event) =>
                        setFormFields((prev) =>
                          prev.map((item, idx) =>
                            idx === index
                              ? { ...item, key: event.target.value }
                              : item
                          )
                        )
                      }
                    />
                    <Input
                      placeholder="Label"
                      value={field.label}
                      onChange={(event) =>
                        setFormFields((prev) =>
                          prev.map((item, idx) =>
                            idx === index
                              ? { ...item, label: event.target.value }
                              : item
                          )
                        )
                      }
                    />
                    <Input
                      placeholder="Type (text, email, date, select)"
                      value={field.type}
                      onChange={(event) =>
                        setFormFields((prev) =>
                          prev.map((item, idx) =>
                            idx === index
                              ? { ...item, type: event.target.value }
                              : item
                          )
                        )
                      }
                    />
                    <Input
                      placeholder="Options (comma)"
                      value={field.options}
                      onChange={(event) =>
                        setFormFields((prev) =>
                          prev.map((item, idx) =>
                            idx === index
                              ? { ...item, options: event.target.value }
                              : item
                          )
                        )
                      }
                    />
                    <Button
                      variant={field.required ? "primary" : "ghost"}
                      type="button"
                      onClick={() =>
                        setFormFields((prev) =>
                          prev.map((item, idx) =>
                            idx === index
                              ? { ...item, required: !item.required }
                              : item
                          )
                        )
                      }
                    >
                      {field.required ? "Required" : "Optional"}
                    </Button>
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() =>
                        setFormFields((prev) =>
                          prev.filter((_, idx) => idx !== index)
                        )
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() =>
                      setFormFields((prev) => [
                        ...prev,
                        {
                          key: "",
                          label: "",
                          type: "text",
                          required: false,
                          options: "",
                        },
                      ])
                    }
                  >
                    Add field
                  </Button>
                  <Button onClick={handleCreateForm}>Create form</Button>
                </div>
                {formMessage ? (
                  <p className="text-sm text-sand-500">{formMessage}</p>
                ) : null}
              </div>
            </Card>
          </section>
        ) : null}

        {role === "user" && view === "user" ? (
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
                        Cooldown until: {new Date(submission.cooldownUntil).toLocaleDateString()}
                      </p>
                    ) : null}
                  </div>
                  <StatusPill
                    status={
                      submission.status as "pending" | "completed" | "rejected"
                    }
                  />
                </div>
              ))}
              {!submissions.length ? (
                <p className="text-sm text-sand-500">No submissions yet.</p>
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
            <Button size="lg" className="w-full" onClick={() => setView("profile")}>
              Go to profile
            </Button>
          </Card>
        </section>
        ) : null}

        {role === "organization" && view === "org" ? (
          <section className="mx-auto mt-10 max-w-6xl">
            <Card className="space-y-6">
              <SectionHeading
                title="Organization review"
                subtitle="Review submitted forms and accept or reject."
              />
              <p className="text-sm text-sand-500">
                Your organization ID is pulled from Clerk metadata. Use filters to
                focus on a specific form.
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
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </Select>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setOrgStatusFilter("all");
                    setOrgFormFilter("");
                  }}
                >
                  Reset
                </Button>
              </div>
              <div className="space-y-4">
                {orgSubmissions.map((submission) => (
                  <div
                    key={submission._id}
                    className="space-y-3 rounded-2xl border border-sand-200 bg-white p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sand-950">
                          {typeof submission.formId === "string"
                            ? orgForms.find(
                                (form) => form._id === submission.formId
                              )?.name || `Form ${submission.formId}`
                            : submission.formId.name}
                        </p>
                        <p className="text-sm text-sand-500">
                          {new Date(submission.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <StatusPill status={submission.status} />
                    </div>
                    {submission.data ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {Object.entries(submission.data).map(([key, value]) => (
                          <div
                            key={key}
                            className="rounded-2xl border border-sand-200 bg-white p-3"
                          >
                            <p className="text-xs uppercase tracking-[0.2em] text-sand-500">
                              {key}
                            </p>
                            <p className="mt-1 text-sm text-sand-950">
                              {value || "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {submission.status === "pending" ? (
                      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                        <Input
                          placeholder="Review notes (optional)"
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
                            handleOrgDecision(submission._id, "reject")
                          }
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() =>
                            handleOrgDecision(submission._id, "accept")
                          }
                        >
                          Accept
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}
                {!orgSubmissions.length ? (
                  <p className="text-sm text-sand-500">
                    No submissions for this filter.
                  </p>
                ) : null}
              </div>
              {orgDashboardMessage ? (
                <p className="text-sm text-sand-500">{orgDashboardMessage}</p>
              ) : null}
            </Card>
          </section>
        ) : null}

        {role === "user" && view === "profile" ? (
        <section className="mx-auto mt-10 max-w-6xl">
          <Card className="space-y-6">
            <SectionHeading
              title="Profile editor"
              subtitle="Save your details once to autofill every form."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                placeholder="Full name"
                value={profileDraft.primary?.fullName || ""}
                onChange={(event) =>
                  setProfileDraft((prev) => ({
                    ...prev,
                    primary: { ...prev.primary, fullName: event.target.value },
                  }))
                }
              />
              <Input
                placeholder="Email"
                value={profileDraft.primary?.email || ""}
                onChange={(event) =>
                  setProfileDraft((prev) => ({
                    ...prev,
                    primary: { ...prev.primary, email: event.target.value },
                  }))
                }
              />
              <Input
                placeholder="Phone"
                value={profileDraft.primary?.phone || ""}
                onChange={(event) =>
                  setProfileDraft((prev) => ({
                    ...prev,
                    primary: { ...prev.primary, phone: event.target.value },
                  }))
                }
              />
              <Input
                placeholder="Address"
                value={profileDraft.primary?.address || ""}
                onChange={(event) =>
                  setProfileDraft((prev) => ({
                    ...prev,
                    primary: { ...prev.primary, address: event.target.value },
                  }))
                }
              />
              <Input
                placeholder="Date of birth"
                value={profileDraft.primary?.dob || ""}
                onChange={(event) =>
                  setProfileDraft((prev) => ({
                    ...prev,
                    primary: { ...prev.primary, dob: event.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-3">
              <p className="text-sm text-sand-500">Custom fields</p>
              {extraEntries.map((entry, index) => (
                <div
                  key={`${entry.key}-${index}`}
                  className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <Input
                    placeholder="Field key (e.g., passportNumber)"
                    value={entry.key}
                    onChange={(event) =>
                      setExtraEntries((prev) =>
                        prev.map((item, idx) =>
                          idx === index
                            ? { ...item, key: event.target.value }
                            : item
                        )
                      )
                    }
                  />
                  <Input
                    placeholder="Field value"
                    value={entry.value}
                    onChange={(event) =>
                      setExtraEntries((prev) =>
                        prev.map((item, idx) =>
                          idx === index
                            ? { ...item, value: event.target.value }
                            : item
                        )
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() =>
                      setExtraEntries((prev) =>
                        prev.filter((_, idx) => idx !== index)
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="secondary"
                type="button"
                onClick={() =>
                  setExtraEntries((prev) => [...prev, { key: "", value: "" }])
                }
              >
                Add field
              </Button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleProfileSave}>Save profile</Button>
            </div>
            {profileMessage ? (
              <p className="text-sm text-sand-500">{profileMessage}</p>
            ) : null}
          </Card>
        </section>
        ) : null}
      </main>
    </div>
  );
}
