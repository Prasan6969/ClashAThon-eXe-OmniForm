import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { SectionHeading } from "../../../components/ui/section-heading";
import type { Form, Organization } from "../../../types/app";

type AdminManageFormsPageProps = {
  selectedManageOrg: Organization | null;
  manageFormQuery: string;
  setManageFormQuery: Dispatch<SetStateAction<string>>;
  filteredManageForms: Form[];
  handleEditManageForm: (form: Form) => void;
  handleDeleteManageForm: (form: Form) => Promise<void>;
  manageFormsLoading: boolean;
  onBackToOrganizations: () => void;
  onBackToDashboard: () => void;
};

export const AdminManageFormsPage = ({
  selectedManageOrg,
  manageFormQuery,
  setManageFormQuery,
  filteredManageForms,
  handleEditManageForm,
  handleDeleteManageForm,
  manageFormsLoading,
  onBackToOrganizations,
  onBackToDashboard,
}: AdminManageFormsPageProps) => (
  <section className="mx-auto mt-6 max-w-6xl">
    <Card className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          title={selectedManageOrg ? `Forms for ${selectedManageOrg.name}` : "Organization forms"}
          subtitle="Search and review every template."
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={onBackToOrganizations}>
            Back to organizations
          </Button>
          <Button variant="ghost" onClick={onBackToDashboard}>
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
              <p className="text-lg font-semibold text-sand-950">{form.name}</p>
              <p className="text-sm text-sand-500">{form.description || "No description"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => handleEditManageForm(form)}>
                Edit form
              </Button>
              <Button variant="ghost" onClick={() => handleDeleteManageForm(form)}>
                Delete form
              </Button>
            </div>
          </Card>
        ))}
        {manageFormsLoading ? <p className="text-sm text-sand-500">Loading forms...</p> : null}
        {!manageFormsLoading && !filteredManageForms.length ? (
          <p className="text-sm text-sand-500">No forms match that search.</p>
        ) : null}
      </div>
    </Card>
  </section>
);
