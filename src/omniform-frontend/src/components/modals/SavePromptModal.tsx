import { Button } from "../ui/button";
import { SectionHeading } from "../ui/section-heading";
import type { SaveCandidate } from "../../utils/profile-autofill";
import type { Dispatch, SetStateAction } from "react";

const IMAGE_KEY_HINT = /(image|photo|avatar|document)/i;
const IMAGE_URL_HINT = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i;

const isImageCandidate = (item: SaveCandidate) => {
  const value = String(item.value || "").trim();
  if (!value) return false;

  const looksLikeDataImage = value.startsWith("data:image/");
  const looksLikeHttpUrl = /^https?:\/\//i.test(value);
  const keyLooksImage = IMAGE_KEY_HINT.test(item.key) || IMAGE_KEY_HINT.test(item.label);
  const valueLooksImage = IMAGE_URL_HINT.test(value);

  return looksLikeDataImage || (looksLikeHttpUrl && (keyLooksImage || valueLooksImage));
};

type SavePromptModalProps = {
  saveCandidates: SaveCandidate[];
  selectedSaveCandidateKeys: Record<string, boolean>;
  setSelectedSaveCandidateKeys: Dispatch<SetStateAction<Record<string, boolean>>>;
  handleSaveMissing: () => void;
  handleSubmitWithoutSaving: () => void;
  onBack: () => void;
};

export const SavePromptModal = ({
  saveCandidates,
  selectedSaveCandidateKeys,
  setSelectedSaveCandidateKeys,
  handleSaveMissing,
  handleSubmitWithoutSaving,
  onBack,
}: SavePromptModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-3xl rounded-3xl border border-sand-200 bg-white p-6 shadow-xl">
      <SectionHeading
        title="Review before submit"
        subtitle="Confirm your form entries. Optionally save selected values to your profile for future autofill."
      />
      <div className="mt-4 grid max-h-[50vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
        {saveCandidates.map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-sand-200 bg-white p-4"
          >
            <input
              type="checkbox"
              checked={Boolean(selectedSaveCandidateKeys[item.key])}
              onChange={(event) =>
                setSelectedSaveCandidateKeys((prev) => ({
                  ...prev,
                  [item.key]: event.target.checked,
                }))
              }
            />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">
                {item.label}
              </p>
              <p className="text-xs text-sand-500">{item.key}</p>
              {isImageCandidate(item) ? (
                <div className="mt-2 space-y-2">
                  <img
                    src={item.value}
                    alt={item.label}
                    className="h-28 w-full rounded-xl object-cover"
                  />
                  <p className="break-all text-xs text-sand-500">{item.value}</p>
                </div>
              ) : (
                <p className="mt-2 text-base text-sand-950">{item.value}</p>
              )}
            </div>
          </label>
        ))}
        {!saveCandidates.length ? (
          <div className="rounded-2xl border border-sand-200 bg-white p-4 sm:col-span-2">
            <p className="text-sm text-sand-500">
              No new profile fields found. Submit when you are ready.
            </p>
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={handleSaveMissing}>Save selected and submit</Button>
        <Button variant="secondary" onClick={handleSubmitWithoutSaving}>
          Submit without saving
        </Button>
        <Button variant="ghost" onClick={onBack}>
          Back to form
        </Button>
      </div>
    </div>
  </div>
);
