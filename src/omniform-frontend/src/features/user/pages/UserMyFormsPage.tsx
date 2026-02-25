import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { SectionHeading } from "../../../components/ui/section-heading";
import { StatusPill } from "../../../components/ui/status-pill";
import type { Profile, Submission } from "../../../types/app";

type UserMyFormsPageProps = {
  submissions: Submission[];
  handleClearCanceledSubmissions: () => void;
  handleViewUserSubmission: (submissionId: string) => void;
  handleCancelSubmission: (submissionId: string) => void;
  profileDraft: Profile;
  navigateToProfile: () => void;
};

export const UserMyFormsPage = ({
  submissions,
  handleClearCanceledSubmissions,
  handleViewUserSubmission,
  handleCancelSubmission,
  profileDraft,
  navigateToProfile,
}: UserMyFormsPageProps) => (
  <section className="mx-auto grid max-w-6xl gap-6">
    <Card className="flex min-h-[420px] flex-col space-y-5">
      <SectionHeading
        title="My Forms"
        subtitle="Track every form after submission."
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-sand-500">{submissions.length} submissions</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearCanceledSubmissions}
          disabled={!submissions.some((item) => item.status === "canceled")}
        >
          Clear canceled
        </Button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {submissions.map((submission) => (
          <div
            key={submission._id}
            className="rounded-2xl border border-sand-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sand-950">
                  {typeof submission.formId === "string"
                    ? `Form ${submission.formId}`
                    : submission.formId?.name || "Deleted form"}
                </p>
                <p className="text-sm text-sand-500">
                  {new Date(submission.createdAt).toLocaleString()}
                </p>
                {submission.reviewNotes ? (
                  <p className="text-sm text-sand-500">Notes: {submission.reviewNotes}</p>
                ) : null}
                {submission.cooldownUntil ? (
                  <p className="text-sm text-sand-500">
                    Cooldown until: {new Date(submission.cooldownUntil).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
              <StatusPill status={submission.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleViewUserSubmission(submission._id)}
              >
                View
              </Button>
              {submission.status === "pending" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancelSubmission(submission._id)}
                >
                  Cancel submission
                </Button>
              ) : null}
            </div>
          </div>
        ))}
        {!submissions.length ? <p className="text-sm text-sand-500">No submissions yet.</p> : null}
      </div>
    </Card>

    {profileDraft.fullName &&
    profileDraft.workEmail &&
    profileDraft.personalEmail &&
    profileDraft.address ? null : (
      <Card className="space-y-5">
        <SectionHeading
          title="Next steps"
          subtitle="Complete your profile to unlock autofill."
        />
        <div className="space-y-4">
          <div className="rounded-2xl border border-sand-200 bg-white p-4">
            <p className="text-sm uppercase tracking-[0.2em] text-sand-500">Step 1</p>
            <p className="mt-2 text-lg font-semibold text-sand-950">
              Add the missing profile fields
            </p>
            <p className="text-sm text-sand-500">Your saved profile powers autofill.</p>
          </div>
          <Button size="lg" className="w-full" onClick={navigateToProfile}>
            Go to profile
          </Button>
        </div>
      </Card>
    )}
  </section>
);
