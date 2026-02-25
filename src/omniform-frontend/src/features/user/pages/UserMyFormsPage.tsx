import { useMemo, useState } from "react";
import { FileSearch } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Select } from "../../../components/ui/select";
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
  navigateToSearch: () => void;
};

export const UserMyFormsPage = ({
  submissions,
  handleClearCanceledSubmissions,
  handleViewUserSubmission,
  handleCancelSubmission,
  profileDraft,
  navigateToProfile,
  navigateToSearch,
}: UserMyFormsPageProps) => {
  const [submissionQuery, setSubmissionQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "rejected" | "approved"
  >("all");

  const visibleSubmissions = useMemo(
    () =>
      submissions.filter((submission) => {
        if (!submission.formId) return false;
        if (typeof submission.formId === "string") return false;
        return Boolean(submission.formId.name);
      }),
    [submissions]
  );

  const filteredSubmissions = useMemo(() => {
    const query = submissionQuery.trim().toLowerCase();
    return visibleSubmissions.filter((submission) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "approved"
          ? submission.status === "completed"
          : submission.status === statusFilter;
      if (!matchesStatus) return false;

      if (!query) return true;
      const formName =
        typeof submission.formId === "string"
          ? `form ${submission.formId}`
          : submission.formId?.name || "deleted form";
      const createdText = new Date(submission.createdAt).toLocaleString();
      const cooldownText = submission.cooldownUntil
        ? new Date(submission.cooldownUntil).toLocaleDateString()
        : "";

      const haystack = [
        formName,
        submission.status,
        submission.reviewNotes || "",
        createdText,
        cooldownText,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [visibleSubmissions, submissionQuery, statusFilter]);

  return (
  <section className="mx-auto mt-10 grid max-w-6xl gap-6">
    <Card className="flex min-h-[420px] flex-col space-y-5">
      <SectionHeading
        title="My Forms"
        subtitle="Track every form after submission."
      />
      <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
        <Input
          placeholder="Search submissions"
          value={submissionQuery}
          onChange={(event) => setSubmissionQuery(event.target.value)}
        />
        <Select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as "all" | "pending" | "rejected" | "approved"
            )
          }
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="approved">Approved</option>
        </Select>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-sand-500">
          {filteredSubmissions.length} of {visibleSubmissions.length} submissions
        </p>
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
        {visibleSubmissions.length === 0 ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-sand-300 bg-sand-50 px-6 py-10 text-center">
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-sand-300 bg-white text-sand-700">
              <FileSearch className="h-10 w-10" />
            </span>
            <h3 className="mt-5 text-xl font-semibold text-sand-950">No forms yet</h3>
            <p className="mt-2 max-w-md text-sm text-sand-500">
              You haven’t filled any forms yet. Find an organization form and start your first submission.
            </p>
            <Button className="mt-6" onClick={navigateToSearch}>
              Find Forms
            </Button>
          </div>
        ) : null}
        {filteredSubmissions.map((submission) => (
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
              <StatusPill
                status={submission.status}
                labelOverrides={{ completed: "approved" }}
              />
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
        {visibleSubmissions.length && !filteredSubmissions.length ? (
          <p className="text-sm text-sand-500">No matching submissions.</p>
        ) : null}
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
};
