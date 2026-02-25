import { Button } from "../ui/button";

type CooldownPromptModalProps = {
  cooldownMessage: string;
  onClose: () => void;
};

export const CooldownPromptModal = ({
  cooldownMessage,
  onClose,
}: CooldownPromptModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md rounded-3xl border border-sand-200 bg-white p-6 shadow-xl">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-sand-500">
          Cooldown active
        </p>
        <h3 className="text-xl font-semibold text-sand-950">
          Please wait before resubmitting
        </h3>
        <p className="text-sm text-sand-500">{cooldownMessage}</p>
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Got it
        </Button>
      </div>
    </div>
  </div>
);
