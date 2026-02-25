import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { SectionHeading } from "../../../components/ui/section-heading";
import { Select } from "../../../components/ui/select";
import type { TagDefinition } from "../../../types/app";

type AdminTagsPageProps = {
  editingTagId: string;
  tagLabel: string;
  setTagLabel: Dispatch<SetStateAction<string>>;
  tagValue: string;
  setTagValue: Dispatch<SetStateAction<string>>;
  tagType: TagDefinition["type"];
  setTagType: Dispatch<SetStateAction<TagDefinition["type"]>>;
  tagOptions: string;
  setTagOptions: Dispatch<SetStateAction<string>>;
  handleCreateTag: () => Promise<void>;
  handleCancelEditTag: () => void;
  tagMessage: string;
  adminTags: TagDefinition[];
  handleStartEditTag: (item: TagDefinition) => void;
  handleDeleteTag: (id: string) => Promise<void>;
  onBack: () => void;
};

export const AdminTagsPage = ({
  editingTagId,
  tagLabel,
  setTagLabel,
  tagValue,
  setTagValue,
  tagType,
  setTagType,
  tagOptions,
  setTagOptions,
  handleCreateTag,
  handleCancelEditTag,
  tagMessage,
  adminTags,
  handleStartEditTag,
  handleDeleteTag,
  onBack,
}: AdminTagsPageProps) => (
  <section className="mx-auto mt-6 max-w-6xl">
    <Card className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          title="Manage tags"
          subtitle="Configure label, key, input type, and options for reusable profile fields."
        />
        <Button variant="ghost" onClick={onBack}>
          Back to dashboard
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="space-y-4 border border-sand-200 bg-sand-50/50">
          <SectionHeading
            title={editingTagId ? "Edit tag" : "Create tag"}
            subtitle="These tags power form mapping and profile inputs."
          />
          <Input
            placeholder="Label (e.g., Citizenship Front)"
            value={tagLabel}
            onChange={(event) => setTagLabel(event.target.value)}
          />
          <Input
            placeholder="Tag key (optional, auto-generated if empty)"
            value={tagValue}
            onChange={(event) => setTagValue(event.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
            <Select
              value={tagType}
              onChange={(event) => setTagType(event.target.value as TagDefinition["type"])}
            >
              <option value="text">text</option>
              <option value="email">email</option>
              <option value="date">date</option>
              <option value="number">number</option>
              <option value="image">image</option>
              <option value="select">select</option>
            </Select>
            <Input
              placeholder="Select options (comma separated)"
              value={tagOptions}
              onChange={(event) => setTagOptions(event.target.value)}
              disabled={tagType !== "select"}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleCreateTag}>
              {editingTagId ? "Save changes" : "Create tag"}
            </Button>
            {editingTagId ? (
              <Button variant="ghost" onClick={handleCancelEditTag}>
                Cancel edit
              </Button>
            ) : null}
          </div>
          {tagMessage ? <p className="text-sm text-sand-500">{tagMessage}</p> : null}
        </Card>

        <Card className="space-y-4 border border-sand-200 bg-sand-50/50">
          <SectionHeading
            title="Existing tags"
            subtitle="Use edit to update labels/types or remove to delete."
          />
          <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {adminTags.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-sand-200 bg-white px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-sand-900">{item.label}</p>
                  <p className="text-xs text-sand-500">
                    {item.tag} · {item.type}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleStartEditTag(item)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteTag(item._id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            {!adminTags.length ? <p className="text-sm text-sand-500">No tags created yet.</p> : null}
          </div>
        </Card>
      </div>
    </Card>
  </section>
);
