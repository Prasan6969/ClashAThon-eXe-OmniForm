import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { SectionHeading } from "../../../components/ui/section-heading";
import { StatusPill } from "../../../components/ui/status-pill";
import type { ReactNode } from "react";
import type { UserSubmissionDetail } from "../../../types/app";

const formatFieldLabel = (value: string) =>
  String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

type UserSubmissionDetailPageProps = {
  selectedUserSubmission: UserSubmissionDetail | null;
  renderSubmissionValue: (
    submission: UserSubmissionDetail,
    key: string,
    rawValue: string
  ) => ReactNode;
  handleCancelSubmission: (submissionId: string) => Promise<void>;
  onBack: () => void;
};

export const UserSubmissionDetailPage = ({
  selectedUserSubmission,
  renderSubmissionValue,
  handleCancelSubmission,
  onBack,
}: UserSubmissionDetailPageProps) => (
  <section className="mx-auto mt-10 max-w-4xl">
    <Card className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          title={
            selectedUserSubmission
              ? typeof selectedUserSubmission.formId === "string"
                ? "Submission details"
                : selectedUserSubmission.formId?.name || "Deleted form"
              : "Submission details"
          }
          subtitle="Review what you submitted and track status."
        />
        <Button variant="ghost" onClick={onBack}>
          Back to dashboard
        </Button>
      </div>
      {selectedUserSubmission ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill
              status={selectedUserSubmission.status}
              labelOverrides={{ completed: "approved" }}
            />
            <p className="text-sm text-sand-500">
              Submitted {new Date(selectedUserSubmission.createdAt).toLocaleString()}
            </p>
          </div>
          {selectedUserSubmission.data ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(selectedUserSubmission.data).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-sand-200 bg-white p-3"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-sand-500">
                    {formatFieldLabel(key)}
                  </p>
                  {renderSubmissionValue(selectedUserSubmission, key, String(value || ""))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-sand-500">No data submitted.</p>
          )}
          {selectedUserSubmission.reviewNotes ? (
            <div className="rounded-2xl border border-sand-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-sand-500">Review notes</p>
              <p className="mt-2 text-sm text-sand-950">{selectedUserSubmission.reviewNotes}</p>
            </div>
          ) : null}
          {selectedUserSubmission.status === "pending" ? (
            <Button
              variant="ghost"
              onClick={() => handleCancelSubmission(selectedUserSubmission._id)}
            >
              Cancel submission
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-sand-500">Select a submission to review.</p>
      )}
    </Card>
  </section>
);
