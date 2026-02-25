import { Button } from "../ui/button";
import { ComboBox } from "../ui/combobox";
import { Input } from "../ui/input";
import type { Organization } from "../../types/app";

type FormSaveModalProps = {
  formId: string | null;
  formOrgId: string;
  setFormOrgId: (value: string) => void;
  adminOrgs: Organization[];
  formName: string;
  setFormName: (value: string) => void;
  formDescription: string;
  setFormDescription: (value: string) => void;
  handleCreateForm: () => void;
  onCancel: () => void;
  formMessage: string;
};

export const FormSaveModal = ({
  formId,
  formOrgId,
  setFormOrgId,
  adminOrgs,
  formName,
  setFormName,
  formDescription,
  setFormDescription,
  handleCreateForm,
  onCancel,
  formMessage,
}: FormSaveModalProps) => (
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
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      {formMessage ? (
        <p className="mt-3 text-sm text-sand-500">{formMessage}</p>
      ) : null}
    </div>
  </div>
);
