import { Image } from "lucide-react";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { SectionHeading } from "../../../components/ui/section-heading";
import { MapPickerModal } from "../../../components/modals/MapPickerModal";
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
}: UserFormFillPageProps) => {
  const [showReview, setShowReview] = useState(false);
  const [activeMapField, setActiveMapField] = useState<{
    key: string;
    label: string;
    currentValue: string;
  } | null>(null);

  const readMapLabel = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      if (parsed?.address) return String(parsed.address);
      if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number") {
        return `${parsed.lat.toFixed(6)}, ${parsed.lng.toFixed(6)}`;
      }
    } catch {
      return value;
    }
    return value;
  };

  const components = activeForm?.components || activeForm?.fields || [];

  const readSubmissionValue = (value: string, type?: string) => {
    if (!value) return "—";
    if (type === "map") return readMapLabel(value);
    return value;
  };

  return (
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
          {!showReview ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={handleAutofill}>
                Autofill
              </Button>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {components.map((field, index) => {
              const fieldKey = field.id || field.tag || `field-${index}`;
              const value = formValues[fieldKey] || "";
              const error = formErrors[fieldKey];
              return (
                <div key={fieldKey} className="space-y-2">
                  {showReview ? (
                    <div className="rounded-2xl border border-sand-200 bg-sand-50 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-sand-500">
                        {field.label}
                      </p>
                      {field.type === "image" && value ? (
                        <div className="mt-2 space-y-2">
                          <img
                            src={value}
                            alt={field.label}
                            className="h-28 w-full rounded-xl object-cover"
                          />
                          <p className="break-all text-xs text-sand-500">
                            {getFileNameFromUrl(value) || value}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-sand-950">
                          {readSubmissionValue(value, field.type)}
                        </p>
                      )}
                    </div>
                  ) : field.type === "image" ? (
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
                  ) : field.type === "map" ? (
                    <div className="rounded-2xl border border-sand-200 bg-sand-50 p-4">
                      <p className="text-sm font-semibold text-sand-900">
                        {field.required ? `${field.label} *` : field.label}
                      </p>
                      <p className="mt-1 text-xs text-sand-500">
                        {value ? readMapLabel(value) : "No location selected"}
                      </p>
                      <Button
                        className="mt-3"
                        variant="secondary"
                        onClick={() =>
                          setActiveMapField({
                            key: fieldKey,
                            label: field.label,
                            currentValue: value,
                          })
                        }
                      >
                        {value ? "Update location" : "Select location"}
                      </Button>
                    </div>
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
                  {!showReview && error ? <p className="text-sm text-sand-500">{error}</p> : null}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {showReview ? (
              <>
                <Button variant="ghost" onClick={() => setShowReview(false)}>
                  Edit
                </Button>
                <Button onClick={handleSubmitForm}>Submit</Button>
              </>
            ) : (
              <Button onClick={() => setShowReview(true)}>Review</Button>
            )}
            {submitMessage ? <p className="text-sm text-sand-500">{submitMessage}</p> : null}
          </div>
        </div>
      ) : (
        <p className="text-sm text-sand-500">
          Start by selecting an organization and form on the dashboard.
        </p>
      )}
    </Card>
    {activeMapField ? (
      <MapPickerModal
        title={activeMapField.label}
        initialValue={activeMapField.currentValue}
        onClose={() => setActiveMapField(null)}
        onSelect={(nextValue) => {
          setFormValues((prev) => ({
            ...prev,
            [activeMapField.key]: nextValue,
          }));
          setActiveMapField(null);
        }}
      />
    ) : null}
  </section>
  );
};
