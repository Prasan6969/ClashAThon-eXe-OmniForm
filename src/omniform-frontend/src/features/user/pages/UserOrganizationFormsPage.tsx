import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { SectionHeading } from "../../../components/ui/section-heading";
import type { Form, Organization, Profile } from "../../../types/app";

type UserOrganizationFormsPageProps = {
  selectedOrg: Organization | null;
  formQuery: string;
  setFormQuery: Dispatch<SetStateAction<string>>;
  forms: Form[];
  formLoading: boolean;
  openForm: (form: Form) => void;
  profileDraft: Profile;
  onBack: () => void;
  onGoProfile: () => void;
};

export const UserOrganizationFormsPage = ({
  selectedOrg,
  formQuery,
  setFormQuery,
  forms,
  formLoading,
  openForm,
  profileDraft,
  onBack,
  onGoProfile,
}: UserOrganizationFormsPageProps) => (
  <section className="mx-auto mt-10 max-w-6xl">
    <Card className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          title={selectedOrg ? `Forms for ${selectedOrg.name}` : "Organization forms"}
          subtitle="Browse templates and autofill instantly."
        />
        <Button variant="ghost" onClick={onBack}>
          Back to organizations
        </Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search forms"
          value={formQuery}
          onChange={(event) => setFormQuery(event.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
          <Card key={form._id} className="space-y-3">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-sand-950">{form.name}</p>
              <p className="text-sm text-sand-500">{form.description || "No description"}</p>
            </div>
            <Button size="sm" onClick={() => openForm(form)}>
              Fill
            </Button>
          </Card>
        ))}
        {formLoading ? <p className="text-sm text-sand-500">Loading forms...</p> : null}
        {!formLoading && !forms.length ? <p className="text-sm text-sand-500">No forms yet.</p> : null}
      </div>
    </Card>

    {profileDraft.fullName &&
    profileDraft.workEmail &&
    profileDraft.personalEmail &&
    profileDraft.address ? null : (
      <Card className="space-y-5 lg:col-span-2">
        <SectionHeading
          title="Next steps"
          subtitle="Complete your profile to unlock autofill."
        />
        <div className="space-y-4">
          <div className="rounded-2xl border border-sand-200 bg-white p-4">
            <p className="text-sm uppercase tracking-[0.2em] text-sand-500">Step 1</p>
            <p className="mt-2 text-lg font-semibold text-sand-950">Add the missing profile fields</p>
            <p className="text-sm text-sand-500">Your saved profile powers autofill.</p>
          </div>
          <Button size="lg" className="w-full" onClick={onGoProfile}>
            Go to profile
          </Button>
        </div>
      </Card>
    )}
  </section>
);
