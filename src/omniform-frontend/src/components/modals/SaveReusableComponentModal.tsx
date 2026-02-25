import { Button } from "../ui/button";

type SaveReusableComponentModalProps = {
  componentLabel: string;
  onSave: () => void;
  onSkip: () => void;
};

export const SaveReusableComponentModal = ({
  componentLabel,
  onSave,
  onSkip,
}: SaveReusableComponentModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md rounded-3xl border border-sand-200 bg-white p-6 shadow-xl">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-sand-950">Save reusable component?</h3>
        <p className="text-sm text-sand-500">
          <span className="font-semibold text-sand-900">{componentLabel}</span> was added to the form.
          Do you also want it in your reusable component list?
        </p>
        <p className="text-xs text-sand-500">
          Tag handling is automatic — no manual tag setup needed.
        </p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={onSave}>Save to reusable list</Button>
        <Button variant="secondary" onClick={onSkip}>
          Not now
        </Button>
      </div>
    </div>
  </div>
);
