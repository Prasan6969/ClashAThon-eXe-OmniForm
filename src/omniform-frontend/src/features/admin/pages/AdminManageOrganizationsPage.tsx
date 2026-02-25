import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { SectionHeading } from "../../../components/ui/section-heading";
import type { Organization } from "../../../types/app";

type AdminManageOrganizationsPageProps = {
  filteredAdminOrgs: Organization[];
  manageOrgQuery: string;
  setManageOrgQuery: Dispatch<SetStateAction<string>>;
  handleOpenManageOrg: (org: Organization) => void;
  onBack: () => void;
};

export const AdminManageOrganizationsPage = ({
  filteredAdminOrgs,
  manageOrgQuery,
  setManageOrgQuery,
  handleOpenManageOrg,
  onBack,
}: AdminManageOrganizationsPageProps) => (
  <section className="mx-auto mt-6 max-w-6xl">
    <Card className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          title="Manage forms"
          subtitle="Select an organization to see its templates."
        />
        <Button variant="ghost" onClick={onBack}>
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
            <p className="text-lg font-semibold text-sand-950">{org.name}</p>
            <p className="text-sm text-sand-500">{org.slug}</p>
            <Button variant="secondary" onClick={() => handleOpenManageOrg(org)}>
              View forms
            </Button>
          </Card>
        ))}
        {!filteredAdminOrgs.length ? (
          <p className="text-sm text-sand-500">No organizations match that search.</p>
        ) : null}
      </div>
    </Card>
  </section>
);
