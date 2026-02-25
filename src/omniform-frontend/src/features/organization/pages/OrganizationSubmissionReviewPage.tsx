import type { Dispatch, ReactNode, SetStateAction } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { SectionHeading } from "../../../components/ui/section-heading";
import { StatusPill } from "../../../components/ui/status-pill";
import type { OrgSubmissionDetail } from "../../../types/app";

type OrganizationSubmissionReviewPageProps = {
  selectedOrgSubmission: OrgSubmissionDetail | null;
  orgDashboardMessage: string;
  renderSubmissionValue: (
    submission: OrgSubmissionDetail,
    key: string,
    rawValue: string
  ) => ReactNode;
  orgReviewNotes: Record<string, string>;
  setOrgReviewNotes: Dispatch<SetStateAction<Record<string, string>>>;
  handleOrgDecision: (
    submissionId: string,
    decision: "accept" | "reject"
  ) => Promise<void>;
  onBack: () => void;
};

export const OrganizationSubmissionReviewPage = ({
  selectedOrgSubmission,
  orgDashboardMessage,
  renderSubmissionValue,
  orgReviewNotes,
  setOrgReviewNotes,
  handleOrgDecision,
  onBack,
}: OrganizationSubmissionReviewPageProps) => (
  <section className="mx-auto mt-10 max-w-5xl">
    <Card className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          title={
            selectedOrgSubmission
              ? typeof selectedOrgSubmission.formId === "string"
                ? "Submission review"
                : selectedOrgSubmission.formId.name
              : "Submission review"
          }
          subtitle="Review form data and finalize a decision."
        />
        <Button variant="ghost" onClick={onBack}>
          Back to submissions
        </Button>
      </div>
      {selectedOrgSubmission ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={selectedOrgSubmission.status} />
            <p className="text-sm text-sand-500">
              Submitted {new Date(selectedOrgSubmission.createdAt).toLocaleString()}
            </p>
          </div>
          {selectedOrgSubmission.data ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(selectedOrgSubmission.data).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-sand-200 bg-white p-3"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-sand-500">{key}</p>
                  {renderSubmissionValue(selectedOrgSubmission, key, String(value || ""))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-sand-500">No data submitted.</p>
          )}
          {orgDashboardMessage ? (
            <p className="text-sm text-sand-500">{orgDashboardMessage}</p>
          ) : null}
          {selectedOrgSubmission.status === "pending" ? (
            <div className="space-y-3">
              <Input
                placeholder="Add review notes"
                value={orgReviewNotes[selectedOrgSubmission._id] || ""}
                onChange={(event) =>
                  setOrgReviewNotes((prev) => ({
                    ...prev,
                    [selectedOrgSubmission._id]: event.target.value,
                  }))
                }
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => handleOrgDecision(selectedOrgSubmission._id, "accept")}
                >
                  Accept
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleOrgDecision(selectedOrgSubmission._id, "reject")}
                >
                  Reject
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-sand-500">
          {orgDashboardMessage || "Select a submission to review."}
        </p>
      )}
    </Card>
  </section>
);
