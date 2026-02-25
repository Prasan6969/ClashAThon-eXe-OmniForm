import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { SectionHeading } from "../../../components/ui/section-heading";
import type { Organization } from "../../../types/app";

type UserSearchFormsPageProps = {
  orgQuery: string;
  setOrgQuery: (value: string) => void;
  orgResults: Organization[];
  handleSelectOrg: (org: Organization) => void;
  formLoading: boolean;
  orgLoading: boolean;
};

export const UserSearchFormsPage = ({
  orgQuery,
  setOrgQuery,
  orgResults,
  handleSelectOrg,
  formLoading,
  orgLoading,
}: UserSearchFormsPageProps) => (
  <section className="mx-auto mt-10 max-w-6xl">
    <Card className="space-y-6">
      <SectionHeading
        title="Search Forms"
        subtitle="Find organizations and open their form collections."
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search organizations"
          value={orgQuery}
          onChange={(event) => setOrgQuery(event.target.value)}
        />
      </div>
      <div className="space-y-3">
        {orgResults.map((org) => (
          <div
            key={org._id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand-200 bg-white p-4"
          >
            <div>
              <p className="text-lg font-semibold text-sand-950">{org.name}</p>
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
        {orgLoading ? <p className="text-sm text-sand-500">Searching...</p> : null}
        {!orgLoading && !orgResults.length ? (
          <p className="text-sm text-sand-500">No organizations yet.</p>
        ) : null}
      </div>
    </Card>
  </section>
);
