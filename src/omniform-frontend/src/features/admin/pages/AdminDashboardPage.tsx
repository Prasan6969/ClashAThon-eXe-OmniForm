import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { ComboBox } from "../../../components/ui/combobox";
import { Input } from "../../../components/ui/input";
import { SectionHeading } from "../../../components/ui/section-heading";
import { Select } from "../../../components/ui/select";
import { Building2, FileText, LayoutGrid, Tags } from "lucide-react";
import type { Organization } from "../../../types/app";

type AdminDashboardPageProps = {
  orgName: string;
  setOrgName: (value: string) => void;
  orgUserId: string;
  setOrgUserId: (value: string) => void;
  orgCreateSubscriptionStartsAt: string;
  setOrgCreateSubscriptionStartsAt: (value: string) => void;
  orgCreateSubscriptionEndsAt: string;
  setOrgCreateSubscriptionEndsAt: (value: string) => void;
  handleCreateOrg: () => void;
  createdOrgId: string;
  orgMessage: string;
  roleUserEmail: string;
  setRoleUserEmail: (value: string) => void;
  roleValue: string;
  setRoleValue: (value: string) => void;
  roleOrgId: string;
  setRoleOrgId: (value: string) => void;
  adminOrgs: Organization[];
  handleSetRole: () => void;
  roleMessage: string;
  goTags: () => void;
  goBuilder: () => void;
  goManageForms: () => void;
  goOrgs: () => void;
};

export const AdminDashboardPage = ({
  orgName,
  setOrgName,
  orgUserId,
  setOrgUserId,
  orgCreateSubscriptionStartsAt,
  setOrgCreateSubscriptionStartsAt,
  orgCreateSubscriptionEndsAt,
  setOrgCreateSubscriptionEndsAt,
  handleCreateOrg,
  createdOrgId,
  orgMessage,
  roleUserEmail,
  setRoleUserEmail,
  roleValue,
  setRoleValue,
  roleOrgId,
  setRoleOrgId,
  adminOrgs,
  handleSetRole,
  roleMessage,
  goTags,
  goBuilder,
  goManageForms,
  goOrgs,
}: AdminDashboardPageProps) => (
  <section className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-[1fr_1fr]">
    <Card className="space-y-5">
      <SectionHeading
        title="Admin control center"
        subtitle="Register organizations and assign org accounts."
      />
      <div className="space-y-3">
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
          <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Subscription period</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="date"
              value={orgCreateSubscriptionStartsAt}
              onChange={(event) => setOrgCreateSubscriptionStartsAt(event.target.value)}
            />
            <Input
              type="date"
              value={orgCreateSubscriptionEndsAt}
              onChange={(event) => setOrgCreateSubscriptionEndsAt(event.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleCreateOrg}>Create organization</Button>
        {createdOrgId ? <p className="text-sm text-sand-500">Created org ID: {createdOrgId}</p> : null}
        {orgMessage ? <p className="text-sm text-sand-500">{orgMessage}</p> : null}
      </div>
    </Card>

    <Card className="space-y-5">
      <SectionHeading title="Assign roles" subtitle="Promote users or link org accounts." />
      <div className="space-y-3">
        <Input
          placeholder="User email"
          value={roleUserEmail}
          onChange={(event) => setRoleUserEmail(event.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
          <Select value={roleValue} onChange={(event) => setRoleValue(event.target.value)}>
            <option value="user">user</option>
            <option value="organization">organization</option>
            <option value="admin">admin</option>
          </Select>
          <ComboBox
            value={roleOrgId}
            onChange={setRoleOrgId}
            options={adminOrgs.map((org) => ({ value: org._id, label: org.name }))}
            placeholder="Search organization"
          />
        </div>
        <Button variant="secondary" onClick={handleSetRole}>Update role</Button>
        {roleMessage ? <p className="text-sm text-sand-500">{roleMessage}</p> : null}
      </div>
    </Card>

    <Card className="space-y-5 lg:col-span-2">
      <SectionHeading
        title="Admin tools"
        subtitle="Quick access to core admin features."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={goTags}
          className="flex w-full items-center gap-3 rounded-2xl border border-sand-200 bg-white px-4 py-4 text-left transition hover:bg-sand-50"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100 text-sand-900">
            <Tags className="h-5 w-5" />
          </span>
          <span>
            <p className="text-sm font-semibold text-sand-950">Manage tags</p>
            <p className="text-xs text-sand-500">Profile field labels</p>
          </span>
        </button>

        <button
          type="button"
          onClick={goBuilder}
          className="flex w-full items-center gap-3 rounded-2xl border border-sand-200 bg-white px-4 py-4 text-left transition hover:bg-sand-50"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100 text-sand-900">
            <LayoutGrid className="h-5 w-5" />
          </span>
          <span>
            <p className="text-sm font-semibold text-sand-950">Form builder</p>
            <p className="text-xs text-sand-500">Design form templates</p>
          </span>
        </button>

        <button
          type="button"
          onClick={goManageForms}
          className="flex w-full items-center gap-3 rounded-2xl border border-sand-200 bg-white px-4 py-4 text-left transition hover:bg-sand-50"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100 text-sand-900">
            <FileText className="h-5 w-5" />
          </span>
          <span>
            <p className="text-sm font-semibold text-sand-950">Manage forms</p>
            <p className="text-xs text-sand-500">Browse all templates</p>
          </span>
        </button>

        <button
          type="button"
          onClick={goOrgs}
          className="flex w-full items-center gap-3 rounded-2xl border border-sand-200 bg-white px-4 py-4 text-left transition hover:bg-sand-50"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100 text-sand-900">
            <Building2 className="h-5 w-5" />
          </span>
          <span>
            <p className="text-sm font-semibold text-sand-950">Organizations</p>
            <p className="text-xs text-sand-500">Compliance settings</p>
          </span>
        </button>
      </div>
    </Card>
  </section>
);
