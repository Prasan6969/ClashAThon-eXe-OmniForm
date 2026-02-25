import { Image } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
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
  handleProfileTagImageUpload: (tag: string, file?: File) => Promise<void>;
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
  uploadingImageTarget,
  handleProfileSave,
  profileMessage,
}: ProfilePageProps) => (
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
      {(() => {
        const additionalFields = profileTags.filter(
          (item) => !isBaseProfileKey(item.tag)
        );
        if (!additionalFields.length) return null;

        const orderedFields = [
          ...additionalFields.filter((item) => item.type !== "image"),
          ...additionalFields.filter((item) => item.type === "image"),
        ];

        return (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-sand-900">Additional profile fields</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {orderedFields.map((item) => {
                const value = getProfileTagFieldValue(item.tag);

                if (item.type === "image") {
                  return (
                    <label
                      key={item._id}
                      className="block w-full cursor-pointer rounded-2xl border border-dashed border-sand-300 bg-sand-50 p-5 text-center sm:col-span-2"
                    >
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
                      <input
                        className="hidden"
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          handleProfileTagImageUpload(item.tag, event.target.files?.[0])
                        }
                      />
                      {value ? (
                        <img
                          src={value}
                          alt={item.label}
                          className="mx-auto mt-3 h-40 w-full max-w-full rounded-xl object-cover sm:h-44 sm:max-w-md"
                        />
                      ) : null}
                      {value ? (
                        <span className="mt-3 inline-flex rounded-full border border-sand-300 px-3 py-1 text-xs font-semibold text-sand-700">
                          Change image
                        </span>
                      ) : null}
                      {uploadingImageTarget === `tag:${item.tag}` ? (
                        <p className="mt-2 text-xs text-sand-500">Uploading image...</p>
                      ) : null}
                    </label>
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
  </section>
);
