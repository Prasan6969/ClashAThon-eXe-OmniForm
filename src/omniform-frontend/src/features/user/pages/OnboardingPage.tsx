import { Image } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import type { Profile } from "../../../types/app";

type OnboardingPageProps = {
  onboardingStep: number;
  profileDraft: Profile;
  setProfileDraft: Dispatch<SetStateAction<Profile>>;
  profileImageFileNames: Record<string, string>;
  getFileNameFromUrl: (url?: string) => string;
  handleProfileImageUpload: (field: `${string}PhotoUrl`, file?: File) => Promise<void>;
  handleOnboardingNext: () => Promise<void>;
  handleOnboardingFinish: () => Promise<void>;
  setShowOnboarding: Dispatch<SetStateAction<boolean>>;
  profileMessage: string;
};

export const OnboardingPage = ({
  onboardingStep,
  profileDraft,
  setProfileDraft,
  profileImageFileNames,
  getFileNameFromUrl,
  handleProfileImageUpload,
  handleOnboardingNext,
  handleOnboardingFinish,
  setShowOnboarding,
  profileMessage,
}: OnboardingPageProps) => (
  <section className="mx-auto mt-10 max-w-2xl">
    <Card className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-sand-500">Welcome to Omniform</p>
        <h2 className="text-3xl font-semibold text-sand-950">Let’s set up your profile</h2>
        <p className="text-sm text-sand-500">Complete the essentials to unlock form filling.</p>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-sand-200">
        <div
          className="h-full rounded-full bg-sand-900 transition-all"
          style={{ width: onboardingStep === 1 ? "50%" : "100%" }}
        />
      </div>

      {onboardingStep === 1 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Full name *</p>
            <Input
              placeholder="Enter full name"
              value={profileDraft.fullName || ""}
              onChange={(event) =>
                setProfileDraft((prev) => ({ ...prev, fullName: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Work email *</p>
            <Input
              placeholder="Enter work email"
              value={profileDraft.workEmail || ""}
              onChange={(event) =>
                setProfileDraft((prev) => ({ ...prev, workEmail: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Personal email *</p>
            <Input
              placeholder="Enter personal email"
              value={profileDraft.personalEmail || ""}
              onChange={(event) =>
                setProfileDraft((prev) => ({ ...prev, personalEmail: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Address *</p>
            <Input
              placeholder="Enter address"
              value={profileDraft.address || ""}
              onChange={(event) =>
                setProfileDraft((prev) => ({ ...prev, address: event.target.value }))
              }
            />
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Phone number</p>
              <Input
                placeholder="Enter phone number"
                value={profileDraft.phone || ""}
                onChange={(event) =>
                  setProfileDraft((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Citizenship number</p>
              <Input
                placeholder="Enter citizenship number"
                value={profileDraft.citizenshipNumber || ""}
                onChange={(event) =>
                  setProfileDraft((prev) => ({ ...prev, citizenshipNumber: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="block w-full cursor-pointer rounded-2xl border border-dashed border-sand-300 bg-sand-50 p-5 text-center">
              <Image className="mx-auto h-5 w-5 text-sand-700" />
              <p className="text-sm font-semibold text-sand-900">Passport size photo</p>
              <p className="mt-1 text-xs text-sand-500">
                {profileDraft.passportSizePhotoUrl ? "Update image" : "Browse files"}
              </p>
              {profileDraft.passportSizePhotoUrl || profileImageFileNames.passportSizePhotoUrl ? (
                <p className="mt-1 text-xs text-sand-500">
                  {profileImageFileNames.passportSizePhotoUrl ||
                    getFileNameFromUrl(profileDraft.passportSizePhotoUrl) ||
                    "Uploaded image"}
                </p>
              ) : null}
              <input
                className="hidden"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  handleProfileImageUpload("passportSizePhotoUrl", event.target.files?.[0])
                }
              />
              {profileDraft.passportSizePhotoUrl ? (
                <span className="mt-3 inline-flex rounded-full border border-sand-300 px-3 py-1 text-xs font-semibold text-sand-700">
                  Change image
                </span>
              ) : null}
            </label>
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-3">
        {onboardingStep === 1 ? (
          <Button onClick={handleOnboardingNext}>Next</Button>
        ) : (
          <>
            <Button onClick={handleOnboardingFinish}>Save and finish</Button>
            <Button variant="ghost" onClick={() => setShowOnboarding(false)}>
              Skip for now
            </Button>
          </>
        )}
      </div>
      {profileMessage ? <p className="text-sm text-sand-500">{profileMessage}</p> : null}
    </Card>
  </section>
);
