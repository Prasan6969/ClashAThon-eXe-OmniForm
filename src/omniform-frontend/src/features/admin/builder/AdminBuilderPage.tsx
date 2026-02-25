import {
  BadgeCheck,
  Calendar,
  FileText,
  IdCard,
  Image,
  Mail,
  MapPin,
  Phone,
  Plus,
  Shield,
  Type,
  User,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select } from "../../../components/ui/select";
import { toProfileTag } from "../../../utils/profile-autofill";
import type { BuilderPaletteComponent, FormBuilderComponent } from "../../../types/app";

type AdminBuilderPageProps = {
  handleLeaveBuilder: () => void;
  setShowFormSave: (value: boolean) => void;
  componentSearch: string;
  setComponentSearch: (value: string) => void;
  draggingComponentId: string | null;
  setDraggingComponentId: Dispatch<SetStateAction<string | null>>;
  dropIndex: number | null;
  setDropIndex: Dispatch<SetStateAction<number | null>>;
  setShowCustomComponent: (value: boolean) => void;
  builderComponents: BuilderPaletteComponent[];
  setComponentContextMenu: Dispatch<
    SetStateAction<{ x: number; y: number; componentId: string } | null>
  >;
  formComponents: FormBuilderComponent[];
  setFormComponents: Dispatch<SetStateAction<FormBuilderComponent[]>>;
  setFormDraftTouchedAt: Dispatch<SetStateAction<number | null>>;
};

const renderBuilderIcon = (iconName?: string, className = "h-3.5 w-3.5 text-sand-900") => {
  if (iconName === "type") return <Type className={className} />;
  if (iconName === "mail") return <Mail className={className} />;
  if (iconName === "calendar") return <Calendar className={className} />;
  if (iconName === "map-pin") return <MapPin className={className} />;
  if (iconName === "phone") return <Phone className={className} />;
  if (iconName === "id-card") return <IdCard className={className} />;
  if (iconName === "image") return <Image className={className} />;
  if (iconName === "file-text") return <FileText className={className} />;
  if (iconName === "user") return <User className={className} />;
  if (iconName === "shield") return <Shield className={className} />;
  return <BadgeCheck className={className} />;
};

export const AdminBuilderPage = ({
  handleLeaveBuilder,
  setShowFormSave,
  componentSearch,
  setComponentSearch,
  draggingComponentId,
  setDraggingComponentId,
  dropIndex,
  setDropIndex,
  setShowCustomComponent,
  builderComponents,
  setComponentContextMenu,
  formComponents,
  setFormComponents,
  setFormDraftTouchedAt,
}: AdminBuilderPageProps) => (
  <section
    className="mx-auto mt-6 min-h-[70vh] max-w-6xl"
    onClick={() => setComponentContextMenu(null)}
  >
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sand-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={handleLeaveBuilder}>
          Back to dashboard
        </Button>
        <p className="text-sm text-sand-500">Build and tag form components.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => setShowFormSave(true)}>
          Save form
        </Button>
      </div>
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="flex min-h-[70vh] max-h-[70vh] flex-col space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-sand-500">Components</p>
        <Input
          placeholder="Search components"
          value={componentSearch}
          onChange={(event) => setComponentSearch(event.target.value)}
        />
        <div
          className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto pr-1"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (!draggingComponentId) return;
            setFormComponents((prev) =>
              prev.filter((item) => item.id !== draggingComponentId)
            );
            setDraggingComponentId(null);
            setDropIndex(null);
          }}
        >
          <div
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-sand-300 bg-sand-50 p-2 text-center text-[10px] text-sand-700"
            onClick={() => setShowCustomComponent(true)}
          >
            <Plus className="h-3.5 w-3.5 text-sand-900" />
            <span className="text-[9px] uppercase tracking-[0.2em]">Add new</span>
            <span className="text-[9px] uppercase tracking-[0.2em]">component</span>
          </div>
          {builderComponents
            .filter((component) => {
              const query = componentSearch.trim().toLowerCase();
              if (!query) return true;
              const haystack = `${component.label} ${component.type} ${component.tag}`
                .toLowerCase()
                .trim();
              if (haystack.includes(query)) return true;
              let qIndex = 0;
              for (let i = 0; i < haystack.length; i += 1) {
                if (haystack[i] === query[qIndex]) {
                  qIndex += 1;
                  if (qIndex === query.length) return true;
                }
              }
              return false;
            })
            .map((component) => (
              <div
                key={component.id}
                draggable
                onClick={() => {
                  setFormComponents((prev) => [
                    ...prev,
                    {
                      id: `${component.type}-${Date.now()}`,
                      type: component.type,
                      label: component.label,
                      tag: component.tag || toProfileTag(component.label),
                      iconName: component.iconName,
                      required: false,
                      options: component.options || "",
                    },
                  ]);
                  setFormDraftTouchedAt(Date.now());
                }}
                onContextMenu={(event) => {
                  if (!component.removable) return;
                  event.preventDefault();
                  setComponentContextMenu({
                    x: event.clientX,
                    y: event.clientY,
                    componentId: component.id,
                  });
                }}
                onDragStart={(event) => {
                  event.dataTransfer.setData("component", JSON.stringify(component));
                }}
                className="flex aspect-square cursor-grab flex-col items-center justify-center gap-1 rounded-xl border border-sand-200 bg-white p-2 text-center text-[10px] text-sand-700"
              >
                {renderBuilderIcon(component.iconName)}
                <span className="text-[9px] uppercase tracking-[0.2em]">
                  {component.label}
                </span>
              </div>
            ))}
        </div>
      </div>
      <div
        onDragOver={(event) => event.preventDefault()}
        onDragEnter={() => setDropIndex(formComponents.length)}
        onDrop={(event) => {
          event.preventDefault();
          const payload = event.dataTransfer.getData("component");
          const insertAt = dropIndex === null ? formComponents.length : dropIndex;

          if (payload) {
            const component = JSON.parse(payload) as {
              type: string;
              label: string;
              tag?: string;
              iconName?: string;
              options?: string;
            };
            setFormComponents((prev) => {
              const nextItem = {
                id: `${component.type}-${Date.now()}`,
                type: component.type,
                label: component.label,
                tag: component.tag || toProfileTag(component.label),
                iconName: component.iconName,
                required: false,
                options: component.options || "",
              };
              const updated = [...prev];
              updated.splice(insertAt, 0, nextItem);
              return updated;
            });
            setFormDraftTouchedAt(Date.now());
          } else if (draggingComponentId) {
            setFormComponents((prev) => {
              const fromIndex = prev.findIndex((item) => item.id === draggingComponentId);
              if (fromIndex === -1) return prev;
              const updated = [...prev];
              const [moved] = updated.splice(fromIndex, 1);
              const targetIndex = fromIndex < insertAt ? insertAt - 1 : insertAt;
              updated.splice(targetIndex, 0, moved);
              return updated;
            });
            setFormDraftTouchedAt(Date.now());
          }
          setDropIndex(null);
          setDraggingComponentId(null);
        }}
        className="min-h-[70vh] max-h-[70vh] overflow-y-auto rounded-3xl border border-dashed border-sand-300 bg-sand-50 p-6"
      >
        {formComponents.length ? (
          <div className="space-y-4">
            {formComponents.map((component, index) => (
              <div key={component.id} className="space-y-3">
                {dropIndex === index ? (
                  <div className="h-1 w-full rounded-full bg-sand-900" />
                ) : null}
                <div
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("reorder", component.id);
                    setDraggingComponentId(component.id);
                  }}
                  onDragEnd={() => {
                    setDraggingComponentId(null);
                    setDropIndex(null);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDropIndex((prev) => (prev === index ? prev : index));
                  }}
                  className="rounded-2xl border border-sand-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {component.iconName ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-sand-200 bg-sand-50">
                            {renderBuilderIcon(component.iconName)}
                          </span>
                        ) : null}
                        <p className="text-sm font-semibold text-sand-950">
                          {component.label || "Untitled field"}
                        </p>
                      </div>
                      <p className="text-xs text-sand-500">Tag: {component.tag || "none"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={component.required ? "primary" : "ghost"}
                        type="button"
                        onClick={() => {
                          setFormComponents((prev) =>
                            prev.map((item, idx) =>
                              idx === index ? { ...item, required: !item.required } : item
                            )
                          );
                          setFormDraftTouchedAt(Date.now());
                        }}
                      >
                        {component.required ? "Required" : "Optional"}
                      </Button>
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => {
                          setFormComponents((prev) =>
                            prev.filter((_, idx) => idx !== index)
                          );
                          setFormDraftTouchedAt(Date.now());
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-dashed border-sand-200 bg-sand-50 p-3">
                  {component.type === "select" ? (
                    <p className="text-xs text-sand-500">Select: {component.options || "No options"}</p>
                  ) : component.type === "date" ? (
                    <p className="text-xs text-sand-500">Date picker</p>
                  ) : component.type === "email" ? (
                    <p className="text-xs text-sand-500">Email input</p>
                  ) : component.type === "image" ? (
                    <p className="text-xs text-sand-500">Image upload</p>
                  ) : component.type === "map" ? (
                    <p className="text-xs text-sand-500">Map location picker</p>
                  ) : (
                    <p className="text-xs text-sand-500">Text input</p>
                  )}
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Label"
                    value={component.label}
                    onChange={(event) => {
                      setFormComponents((prev) =>
                        prev.map((item, idx) =>
                          idx === index ? { ...item, label: event.target.value } : item
                        )
                      );
                      setFormDraftTouchedAt(Date.now());
                    }}
                  />
                  <Input
                    placeholder="Tag (maps to profile key)"
                    value={component.tag}
                    onChange={(event) => {
                      setFormComponents((prev) =>
                        prev.map((item, idx) =>
                          idx === index ? { ...item, tag: event.target.value } : item
                        )
                      );
                      setFormDraftTouchedAt(Date.now());
                    }}
                  />
                  <Select
                    value={component.type}
                    onChange={(event) => {
                      setFormComponents((prev) =>
                        prev.map((item, idx) =>
                          idx === index ? { ...item, type: event.target.value } : item
                        )
                      );
                      setFormDraftTouchedAt(Date.now());
                    }}
                  >
                    <option value="text">text</option>
                    <option value="email">email</option>
                    <option value="date">date</option>
                    <option value="number">number</option>
                    <option value="select">select</option>
                    <option value="image">image</option>
                    <option value="map">map</option>
                  </Select>
                  <Input
                    placeholder="Options (comma)"
                    value={component.options}
                    onChange={(event) => {
                      setFormComponents((prev) =>
                        prev.map((item, idx) =>
                          idx === index ? { ...item, options: event.target.value } : item
                        )
                      );
                      setFormDraftTouchedAt(Date.now());
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sand-500">
            <p className="text-sm uppercase tracking-[0.2em]">Drop components here</p>
            <p className="text-base text-sand-700">
              Drag tiles or click them to build a form.
            </p>
          </div>
        )}
      </div>
    </div>
  </section>
);
