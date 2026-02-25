import { Image } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { SectionHeading } from "../../../components/ui/section-heading";
import type { Form } from "../../../types/app";

type UserFormFillPageProps = {
  activeForm: Form | null;
  formValues: Record<string, string>;
  setFormValues: Dispatch<SetStateAction<Record<string, string>>>;
  formErrors: Record<string, string>;
  formImageFileNames: Record<string, string>;
  getFileNameFromUrl: (url?: string) => string;
  handleFormImageUpload: (fieldKey: string, file?: File) => Promise<void>;
  uploadingImageTarget: string;
  handleAutofill: () => void;
  handleSubmitForm: () => Promise<void>;
  submitMessage: string;
  onBack: () => void;
};

export const UserFormFillPage = ({
  activeForm,
  formValues,
  setFormValues,
  formErrors,
  formImageFileNames,
  getFileNameFromUrl,
  handleFormImageUpload,
  uploadingImageTarget,
  handleAutofill,
  handleSubmitForm,
  submitMessage,
  onBack,
}: UserFormFillPageProps) => (
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
        <Button variant="ghost" onClick={onBack}>
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
            {(activeForm.components || activeForm.fields || []).map((field, index) => {
              const fieldKey = field.id || field.tag || `field-${index}`;
              const value = formValues[fieldKey] || "";
              const error = formErrors[fieldKey];
              return (
                <div key={fieldKey} className="space-y-2">
                  {field.type === "image" ? (
                    <>
                      <label className="block w-full cursor-pointer rounded-2xl border border-dashed border-sand-300 bg-sand-50 p-5 text-center">
                        <Image className="mx-auto h-5 w-5 text-sand-700" />
                        <p className="text-sm font-semibold text-sand-900">
                          {field.required ? `${field.label} *` : field.label}
                        </p>
                        <p className="mt-1 text-xs text-sand-500">
                          {value ? "Update image" : "Browse files"}
                        </p>
                        {value || formImageFileNames[fieldKey] ? (
                          <p className="mt-1 text-xs text-sand-500">
                            {formImageFileNames[fieldKey] ||
                              getFileNameFromUrl(value) ||
                              "Uploaded image"}
                          </p>
                        ) : null}
                        <input
                          className="hidden"
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            handleFormImageUpload(fieldKey, event.target.files?.[0])
                          }
                        />
                        {value ? (
                          <img
                            src={value}
                            alt={field.label}
                            className="mx-auto mt-3 h-24 rounded-xl object-cover"
                          />
                        ) : null}
                        {value ? (
                          <span className="mt-3 inline-flex rounded-full border border-sand-300 px-3 py-1 text-xs font-semibold text-sand-700">
                            Change image
                          </span>
                        ) : null}
                      </label>
                      {uploadingImageTarget === `form:${fieldKey}` ? (
                        <p className="text-xs text-sand-500">Uploading image...</p>
                      ) : null}
                    </>
                  ) : (
                    <Input
                      type={
                        field.type === "number"
                          ? "number"
                          : field.type === "date"
                          ? "date"
                          : field.type === "email"
                          ? "email"
                          : "text"
                      }
                      placeholder={field.required ? `${field.label} *` : field.label}
                      value={value}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          [fieldKey]: event.target.value,
                        }))
                      }
                    />
                  )}
                  {error ? <p className="text-sm text-sand-500">{error}</p> : null}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleSubmitForm}>Submit</Button>
            {submitMessage ? <p className="text-sm text-sand-500">{submitMessage}</p> : null}
          </div>
        </div>
      ) : (
        <p className="text-sm text-sand-500">
          Start by selecting an organization and form on the dashboard.
        </p>
      )}
    </Card>
  </section>
);
