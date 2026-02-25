import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { SectionHeading } from "../../../components/ui/section-heading";
import { Select } from "../../../components/ui/select";
import type { Organization } from "../../../types/app";

type AdminOrganizationSettingsPageProps = {
  selectedAdminOrg: Organization | null;
  orgSettingsName: string;
  setOrgSettingsName: Dispatch<SetStateAction<string>>;
  orgSettingsStatus: string;
  setOrgSettingsStatus: Dispatch<SetStateAction<string>>;
  orgSettingsPanNumber: string;
  setOrgSettingsPanNumber: Dispatch<SetStateAction<string>>;
  orgSettingsLicenseNumber: string;
  setOrgSettingsLicenseNumber: Dispatch<SetStateAction<string>>;
  orgSettingsLocation: string;
  setOrgSettingsLocation: Dispatch<SetStateAction<string>>;
  orgSettingsSubscriptionStatus: string;
  setOrgSettingsSubscriptionStatus: Dispatch<SetStateAction<string>>;
  orgSettingsSubscriptionStartsAt: string;
  setOrgSettingsSubscriptionStartsAt: Dispatch<SetStateAction<string>>;
  orgSettingsSubscriptionEndsAt: string;
  setOrgSettingsSubscriptionEndsAt: Dispatch<SetStateAction<string>>;
  handleSaveOrgSettings: () => Promise<void>;
  handleDeleteOrganization: () => Promise<void>;
  orgSettingsMessage: string;
  onBack: () => void;
};

export const AdminOrganizationSettingsPage = ({
  selectedAdminOrg,
  orgSettingsName,
  setOrgSettingsName,
  orgSettingsStatus,
  setOrgSettingsStatus,
  orgSettingsPanNumber,
  setOrgSettingsPanNumber,
  orgSettingsLicenseNumber,
  setOrgSettingsLicenseNumber,
  orgSettingsLocation,
  setOrgSettingsLocation,
  orgSettingsSubscriptionStatus,
  setOrgSettingsSubscriptionStatus,
  orgSettingsSubscriptionStartsAt,
  setOrgSettingsSubscriptionStartsAt,
  orgSettingsSubscriptionEndsAt,
  setOrgSettingsSubscriptionEndsAt,
  handleSaveOrgSettings,
  handleDeleteOrganization,
  orgSettingsMessage,
  onBack,
}: AdminOrganizationSettingsPageProps) => (
  <section className="mx-auto mt-6 max-w-4xl">
    <Card className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          title={selectedAdminOrg ? `Manage ${selectedAdminOrg.name}` : "Organization settings"}
          subtitle="Update compliance details and subscription status."
        />
        <Button variant="ghost" onClick={onBack}>
          Back to organizations
        </Button>
      </div>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-sand-900">Organization details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Organization name</p>
              <Input
                placeholder="e.g., Omniform Labs"
                value={orgSettingsName}
                onChange={(event) => setOrgSettingsName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Organization status</p>
              <Select
                value={orgSettingsStatus}
                onChange={(event) => setOrgSettingsStatus(event.target.value)}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </Select>
            </div>
          </div>
        </div>
        <div className="space-y-3 border-t border-sand-200 pt-4">
          <p className="text-sm font-semibold text-sand-900">Compliance & identity</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">PAN number</p>
              <Input
                placeholder="Tax identifier"
                value={orgSettingsPanNumber}
                onChange={(event) => setOrgSettingsPanNumber(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">License number</p>
              <Input
                placeholder="Regulatory license"
                value={orgSettingsLicenseNumber}
                onChange={(event) => setOrgSettingsLicenseNumber(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Location</p>
              <Input
                placeholder="City, country"
                value={orgSettingsLocation}
                onChange={(event) => setOrgSettingsLocation(event.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="space-y-3 border-t border-sand-200 pt-4">
          <p className="text-sm font-semibold text-sand-900">Subscription</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Subscription status</p>
              <Select
                value={orgSettingsSubscriptionStatus}
                onChange={(event) => setOrgSettingsSubscriptionStatus(event.target.value)}
              >
                <option value="active">active</option>
                <option value="canceled">canceled</option>
                <option value="expired">expired</option>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Start date</p>
              <Input
                type="date"
                value={orgSettingsSubscriptionStartsAt}
                onChange={(event) => setOrgSettingsSubscriptionStartsAt(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">End date</p>
              <Input
                type="date"
                value={orgSettingsSubscriptionEndsAt}
                onChange={(event) => setOrgSettingsSubscriptionEndsAt(event.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleSaveOrgSettings}>Save changes</Button>
        <Button variant="ghost" onClick={handleDeleteOrganization}>
          Delete organization
        </Button>
        {orgSettingsMessage ? <p className="text-sm text-sand-500">{orgSettingsMessage}</p> : null}
      </div>
    </Card>
  </section>
);
