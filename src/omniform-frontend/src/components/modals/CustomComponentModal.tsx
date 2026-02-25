import {
  BadgeCheck,
  Calendar,
  FileText,
  IdCard,
  Image,
  Mail,
  MapPin,
  Phone,
  Shield,
  Type,
  User,
  X,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import { ComboBox } from "../ui/combobox";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import type { CustomComponentDraft, TagDefinition } from "../../types/app";

type CustomComponentModalProps = {
  customComponent: CustomComponentDraft;
  setCustomComponent: Dispatch<SetStateAction<CustomComponentDraft>>;
  adminTags: TagDefinition[];
  onAddComponent: () => void;
  onClose: () => void;
};

export const CustomComponentModal = ({
  customComponent,
  setCustomComponent,
  adminTags,
  onAddComponent,
  onClose,
}: CustomComponentModalProps) => {
  const tagOptions = adminTags.map((item) => ({
    value: item.tag,
    label: `${item.label} (${item.tag})`,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-sand-200 bg-white p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-sand-950">Add a new component</h3>
          <p className="text-sm text-sand-500">
            Define the input type, label, and options. Tag mapping is handled automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sand-200 text-sand-700 transition hover:border-sand-900 hover:text-sand-900"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <ComboBox
            options={tagOptions}
            value={customComponent.tag}
            placeholder="Search tags (optional)"
            onChange={(value) => {
              const selectedTag = adminTags.find((item) => item.tag === value);
              setCustomComponent((prev) => ({
                ...prev,
                tag: value,
                label: prev.label.trim() ? prev.label : selectedTag?.label || prev.label,
                type: selectedTag?.type || prev.type,
                options:
                  selectedTag && Array.isArray(selectedTag.options)
                    ? selectedTag.options.join(", ")
                    : prev.options,
              }));
            }}
          />
          <p className="mt-1 text-xs text-sand-500">
            Pick an existing tag to auto-map this component.
          </p>
        </div>
        <Input
          placeholder="Label"
          value={customComponent.label}
          onChange={(event) =>
            setCustomComponent((prev) => ({ ...prev, label: event.target.value }))
          }
        />
        <Select
          value={customComponent.type}
          onChange={(event) =>
            setCustomComponent((prev) => ({ ...prev, type: event.target.value }))
          }
        >
          <option value="text">text</option>
          <option value="email">email</option>
          <option value="date">date</option>
          <option value="number">number</option>
          <option value="select">select</option>
          <option value="radio">radio</option>
          <option value="checkbox">checkbox</option>
          <option value="combobox">combobox</option>
          <option value="image">image</option>
          <option value="map">map</option>
        </Select>
        <Input
          placeholder={
            customComponent.type === "image"
              ? "Formats or size (e.g., jpg,png,300x400)"
              : "Options (comma)"
          }
          value={customComponent.options}
          onChange={(event) =>
            setCustomComponent((prev) => ({ ...prev, options: event.target.value }))
          }
        />
      </div>
      {customComponent.type === "image" ? (
        <p className="mt-2 text-xs text-sand-500">
          Image rules: comma separated formats plus optional exact size, e.g. jpg,png,300x400.
        </p>
      ) : null}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {[
          { name: "type", Icon: Type },
          { name: "mail", Icon: Mail },
          { name: "calendar", Icon: Calendar },
          { name: "map-pin", Icon: MapPin },
          { name: "phone", Icon: Phone },
          { name: "id-card", Icon: IdCard },
          { name: "image", Icon: Image },
          { name: "file-text", Icon: FileText },
          { name: "user", Icon: User },
          { name: "shield", Icon: Shield },
          { name: "badge-check", Icon: BadgeCheck },
        ].map((icon) => (
          <button
            key={icon.name}
            type="button"
            onClick={() =>
              setCustomComponent((prev) => ({ ...prev, iconName: icon.name }))
            }
            className={`flex items-center justify-center rounded-2xl border p-2 ${
              customComponent.iconName === icon.name
                ? "border-sand-900"
                : "border-sand-200"
            }`}
          >
            <icon.Icon className="h-4 w-4 text-sand-900" />
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={onAddComponent}>Add component</Button>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
    </div>
  );
};
