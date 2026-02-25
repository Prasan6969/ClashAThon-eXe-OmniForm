import { Image } from "lucide-react";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { MapPickerModal } from "../../../components/modals/MapPickerModal";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { ComboBox } from "../../../components/ui/combobox";
import { Input } from "../../../components/ui/input";
import { MapPreview } from "../../../components/ui/map-preview";
import { SectionHeading } from "../../../components/ui/section-heading";
import { Select } from "../../../components/ui/select";
import type { Profile, TagDefinition } from "../../../types/app";

type ProfilePageProps = {
  registeredEmail: string;
  avatarInitials: string;
  avatarBackgroundImage: string;
  profileDraft: Profile;
  setProfileDraft: Dispatch<SetStateAction<Profile>>;
  profileTags: TagDefinition[];
  isBaseProfileKey: (key: string) => boolean;
  getProfileTagFieldValue: (tag: string) => string;
  setProfileTagFieldValue: (tag: string, value: string) => void;
  profileImageFileNames: Record<string, string>;
  getFileNameFromUrl: (url?: string) => string;
  handleProfileTagImageUpload: (
    tag: string,
    file?: File,
    options?: string[]
  ) => Promise<void>;
  handleProfileTagImageDelete: (tag: string) => Promise<void>;
  uploadingImageTarget: string;
  handleProfileSave: () => Promise<void>;
  profileMessage: string;
};

export const ProfilePage = ({
  registeredEmail,
  avatarInitials,
  avatarBackgroundImage,
  profileDraft,
  setProfileDraft,
  profileTags,
  isBaseProfileKey,
  getProfileTagFieldValue,
  setProfileTagFieldValue,
  profileImageFileNames,
  getFileNameFromUrl,
  handleProfileTagImageUpload,
  handleProfileTagImageDelete,
  uploadingImageTarget,
  handleProfileSave,
  profileMessage,
}: ProfilePageProps) => {
  const [activeMapField, setActiveMapField] = useState<{
    tag: string;
    label: string;
    currentValue: string;
  } | null>(null);
  const [imageDeleteTarget, setImageDeleteTarget] = useState<{
    tag: string;
    label: string;
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

  const readMultiValue = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const passportImageValue = getProfileTagFieldValue("passportSizePhotoUrl");
  const passportInputId = "profile-passport-size-photo";

  return (
  <section className="mx-auto mt-10 max-w-3xl">
    <Card className="space-y-8">
      <SectionHeading
        title="OmniForm Profile"
        subtitle="Account details for your OmniForm identity."
      />
      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="space-y-2">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-sm font-semibold text-white shadow-sm"
            style={{
              backgroundImage: avatarBackgroundImage,
            }}
            aria-label="User avatar"
          >
            {avatarInitials}
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Registered email</p>
            <p className="text-sm text-sand-900">{registeredEmail || "Not available"}</p>
          </div>
        </div>
      </div>

      <SectionHeading
        title="Form Information"
        subtitle="Keep your data accurate for every autofill."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Full name</p>
          <Input
            value={profileDraft.fullName || ""}
            onChange={(event) =>
              setProfileDraft((prev) => ({ ...prev, fullName: event.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Work email</p>
          <Input
            value={profileDraft.workEmail || ""}
            onChange={(event) =>
              setProfileDraft((prev) => ({ ...prev, workEmail: event.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Personal email</p>
          <Input
            value={profileDraft.personalEmail || ""}
            onChange={(event) =>
              setProfileDraft((prev) => ({ ...prev, personalEmail: event.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Address</p>
          <Input
            value={profileDraft.address || ""}
            onChange={(event) =>
              setProfileDraft((prev) => ({ ...prev, address: event.target.value }))
            }
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Phone number</p>
          <Input
            value={profileDraft.phone || ""}
            onChange={(event) =>
              setProfileDraft((prev) => ({ ...prev, phone: event.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Citizenship number</p>
          <Input
            value={profileDraft.citizenshipNumber || ""}
            onChange={(event) =>
              setProfileDraft((prev) => ({ ...prev, citizenshipNumber: event.target.value }))
            }
          />
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-sand-300 bg-sand-50 p-5 text-center">
        <label htmlFor={passportInputId} className="block w-full cursor-pointer">
          <Image className="mx-auto h-5 w-5 text-sand-700" />
          <p className="text-sm font-semibold text-sand-900">Passport size photo</p>
          <p className="mt-1 text-xs text-sand-500">
            {passportImageValue ? "Update image" : "Browse files"}
          </p>
          {passportImageValue || profileImageFileNames.passportSizePhotoUrl ? (
            <p className="mt-1 break-all text-xs text-sand-500">
              {profileImageFileNames.passportSizePhotoUrl ||
                getFileNameFromUrl(passportImageValue) ||
                "Uploaded image"}
            </p>
          ) : null}
        </label>
        <input
          id={passportInputId}
          className="hidden"
          type="file"
          accept="image/*"
          onChange={(event) =>
            handleProfileTagImageUpload(
              "passportSizePhotoUrl",
              event.target.files?.[0],
              []
            )
          }
        />
        {passportImageValue ? (
          <a
            href={passportImageValue}
            target="_blank"
            rel="noreferrer"
            className="mx-auto mt-3 block w-full max-w-full sm:max-w-md"
          >
            <img
              src={passportImageValue}
              alt="Passport size photo"
              className="h-40 w-full rounded-xl object-cover sm:h-44"
            />
          </a>
        ) : null}
        {passportImageValue ? (
          <div className="mt-3 flex items-center justify-center gap-2">
            <label
              htmlFor={passportInputId}
              className="inline-flex cursor-pointer rounded-full border border-sand-300 px-3 py-1 text-xs font-semibold text-sand-700"
            >
              Change image
            </label>
            <button
              type="button"
              className="inline-flex cursor-pointer rounded-full border border-sand-300 px-3 py-1 text-xs font-semibold text-sand-700"
              onClick={() =>
                setImageDeleteTarget({
                  tag: "passportSizePhotoUrl",
                  label: "Passport size photo",
                })
              }
            >
              Delete image
            </button>
          </div>
        ) : null}
        {uploadingImageTarget === "tag:passportSizePhotoUrl" ? (
          <p className="mt-2 text-xs text-sand-500">Uploading image...</p>
        ) : null}
      </div>
      {(() => {
        const additionalFields = profileTags.filter(
          (item) => !isBaseProfileKey(item.tag)
        );
        if (!additionalFields.length) return null;

        const orderedFields = [
          ...additionalFields.filter(
            (item) => item.type !== "image" && item.type !== "map"
          ),
          ...additionalFields.filter((item) => item.type === "map"),
          ...additionalFields.filter((item) => item.type === "image"),
        ];

        return (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-sand-900">Additional profile fields</p>
            <div className="space-y-4">
              {orderedFields.map((item) => {
                const value = getProfileTagFieldValue(item.tag);

                if (item.type === "image") {
                  const inputId = `profile-image-${item._id}`;
                  return (
                    <div
                      key={item._id}
                      className="rounded-2xl border border-dashed border-sand-300 bg-sand-50 p-5 text-center"
                    >
                      <label htmlFor={inputId} className="block w-full cursor-pointer">
                        <Image className="mx-auto h-5 w-5 text-sand-700" />
                        <p className="text-sm font-semibold text-sand-900">{item.label}</p>
                        <p className="mt-1 text-xs text-sand-500">
                          {value ? "Update image" : "Browse files"}
                        </p>
                        {value || profileImageFileNames[item.tag] ? (
                          <p className="mt-1 break-all text-xs text-sand-500">
                            {profileImageFileNames[item.tag] ||
                              getFileNameFromUrl(value) ||
                              "Uploaded image"}
                          </p>
                        ) : null}
                      </label>
                      <input
                        id={inputId}
                        className="hidden"
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          handleProfileTagImageUpload(
                            item.tag,
                            event.target.files?.[0],
                            item.options || []
                          )
                        }
                      />
                      {value ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noreferrer"
                          className="mx-auto mt-3 block w-full max-w-full sm:max-w-md"
                        >
                          <img
                            src={value}
                            alt={item.label}
                            className="h-40 w-full rounded-xl object-cover sm:h-44"
                          />
                        </a>
                      ) : null}
                      {value ? (
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <label
                            htmlFor={inputId}
                            className="inline-flex cursor-pointer rounded-full border border-sand-300 px-3 py-1 text-xs font-semibold text-sand-700"
                          >
                            Change image
                          </label>
                          <button
                            type="button"
                            className="inline-flex cursor-pointer rounded-full border border-sand-300 px-3 py-1 text-xs font-semibold text-sand-700"
                            onClick={() =>
                              setImageDeleteTarget({ tag: item.tag, label: item.label })
                            }
                          >
                            Delete image
                          </button>
                        </div>
                      ) : null}
                      {uploadingImageTarget === `tag:${item.tag}` ? (
                        <p className="mt-2 text-xs text-sand-500">Uploading image...</p>
                      ) : null}
                    </div>
                  );
                }

                if (item.type === "select") {
                  return (
                    <div key={item._id} className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-sand-500">{item.label}</p>
                      <Select
                        value={value}
                        onChange={(event) =>
                          setProfileTagFieldValue(item.tag, event.target.value)
                        }
                      >
                        <option value="">Select {item.label}</option>
                        {(item.options || []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </div>
                  );
                }

                if (item.type === "combobox") {
                  return (
                    <div key={item._id} className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-sand-500">{item.label}</p>
                      <ComboBox
                        options={(item.options || []).map((option) => ({
                          value: option,
                          label: option,
                        }))}
                        value={value}
                        placeholder={`Search ${item.label}`}
                        onChange={(nextValue) => setProfileTagFieldValue(item.tag, nextValue)}
                      />
                    </div>
                  );
                }

                if (item.type === "radio") {
                  return (
                    <div key={item._id} className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-sand-500">{item.label}</p>
                      <div className="space-y-2 rounded-2xl border border-sand-200 bg-sand-50 p-3">
                        {(item.options || []).map((option) => (
                          <label key={option} className="flex items-center gap-2 text-sm text-sand-900">
                            <input
                              type="radio"
                              name={`profile-${item.tag}`}
                              className="h-4 w-4 accent-sand-900"
                              checked={value === option}
                              onChange={() => setProfileTagFieldValue(item.tag, option)}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (item.type === "checkbox") {
                  const selectedValues = new Set(readMultiValue(value));
                  return (
                    <div key={item._id} className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-sand-500">{item.label}</p>
                      <div className="space-y-2 rounded-2xl border border-sand-200 bg-sand-50 p-3">
                        {(item.options || []).map((option) => (
                          <label key={option} className="flex items-center gap-2 text-sm text-sand-900">
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-sand-900"
                              checked={selectedValues.has(option)}
                              onChange={(event) => {
                                const next = new Set(selectedValues);
                                if (event.target.checked) {
                                  next.add(option);
                                } else {
                                  next.delete(option);
                                }
                                setProfileTagFieldValue(item.tag, Array.from(next).join(", "));
                              }}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (item.type === "map") {
                  return (
                    <div key={item._id} className="rounded-2xl border border-sand-200 bg-sand-50 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-sand-500">{item.label}</p>
                      <p className="mt-1 text-sm text-sand-900">
                        {value ? readMapLabel(value) : "No location selected"}
                      </p>
                      <MapPreview value={value} />
                      <Button
                        className="mt-3"
                        variant="secondary"
                        onClick={() =>
                          setActiveMapField({
                            tag: item.tag,
                            label: item.label,
                            currentValue: value,
                          })
                        }
                      >
                        {value ? "Update location" : "Select location"}
                      </Button>
                    </div>
                  );
                }

                return (
                  <div key={item._id} className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-sand-500">{item.label}</p>
                    <Input
                      type={
                        item.type === "number"
                          ? "number"
                          : item.type === "date"
                          ? "date"
                          : item.type === "email"
                          ? "email"
                          : "text"
                      }
                      value={value}
                      onChange={(event) =>
                        setProfileTagFieldValue(item.tag, event.target.value)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleProfileSave}>Save profile</Button>
      </div>
      {profileMessage ? <p className="text-sm text-sand-500">{profileMessage}</p> : null}
    </Card>
    {activeMapField ? (
      <MapPickerModal
        title={activeMapField.label}
        initialValue={activeMapField.currentValue}
        onClose={() => setActiveMapField(null)}
        onSelect={(nextValue) => {
          setProfileTagFieldValue(activeMapField.tag, nextValue);
          setActiveMapField(null);
        }}
      />
    ) : null}
    {imageDeleteTarget ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-md rounded-3xl border border-sand-200 bg-white p-6 shadow-xl">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-sand-950">Delete image?</h3>
            <p className="text-sm text-sand-500">
              This removes <span className="font-semibold text-sand-900">{imageDeleteTarget.label}</span> from your profile and ImageKit.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={async () => {
                await handleProfileTagImageDelete(imageDeleteTarget.tag);
                setImageDeleteTarget(null);
              }}
            >
              Delete image
            </Button>
            <Button variant="ghost" onClick={() => setImageDeleteTarget(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    ) : null}
  </section>
  );
};
