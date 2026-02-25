import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { SectionHeading } from "../../../components/ui/section-heading";
import { Select } from "../../../components/ui/select";
import { StatusPill } from "../../../components/ui/status-pill";
import type { Dispatch, SetStateAction } from "react";
import type { Organization, OrgSubmissionSummary, Form } from "../../../types/app";

type OrganizationDashboardPageProps = {
  orgMembership: Organization | null;
  membershipExpired: boolean;
  membershipStatus: string;
  orgFormFilter: string;
  setOrgFormFilter: (value: string) => void;
  orgForms: Form[];
  orgSubmissionEmailQuery: string;
  setOrgSubmissionEmailQuery: (value: string) => void;
  setOrgSubmissionPage: Dispatch<SetStateAction<number>>;
  orgStatusFilter: string;
  setOrgStatusFilter: (value: string) => void;
  loadOrgSubmissions: (formId: string, status: string, page: number, emailQuery: string) => void;
  orgSubmissions: OrgSubmissionSummary[];
  orgSubmissionPage: number;
  orgSubmissionTotalPages: number;
  orgDashboardMessage: string;
  navigateToSubmission: (id: string) => void;
};

export const OrganizationDashboardPage = ({
  orgMembership,
  membershipExpired,
  membershipStatus,
  orgFormFilter,
  setOrgFormFilter,
  orgForms,
  orgSubmissionEmailQuery,
  setOrgSubmissionEmailQuery,
  setOrgSubmissionPage,
  orgStatusFilter,
  setOrgStatusFilter,
  loadOrgSubmissions,
  orgSubmissions,
  orgSubmissionPage,
  orgSubmissionTotalPages,
  orgDashboardMessage,
  navigateToSubmission,
}: OrganizationDashboardPageProps) => (
  <section className="mx-auto mt-10 max-w-6xl">
    <Card className="space-y-6">
      {orgMembership && (membershipExpired || orgMembership.subscriptionStatus !== "active") ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-900">
            Membership is {membershipStatus}. Your organization forms are hidden from users until renewal.
          </p>
        </div>
      ) : null}
      <SectionHeading
        title="Organization review"
        subtitle="Review submitted forms and accept or reject."
      />
      <Card className="space-y-4 border border-sand-200 bg-sand-50/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-sand-950">{orgMembership?.name || "Organization"}</p>
            <p className="text-sm font-semibold text-sand-950">Membership status</p>
            <p className="text-sm text-sand-500">
              {membershipStatus}
              {orgMembership?.subscriptionStartsAt
                ? ` · Starts ${new Date(orgMembership.subscriptionStartsAt).toLocaleDateString()}`
                : ""}
              {orgMembership?.subscriptionEndsAt
                ? ` · Ends ${new Date(orgMembership.subscriptionEndsAt).toLocaleDateString()}`
                : ""}
            </p>
          </div>
          <Badge tone="neutral">{orgMembership?.subscriptionStatus || "unknown"}</Badge>
        </div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <Select value={orgFormFilter} onChange={(event) => setOrgFormFilter(event.target.value)}>
          <option value="">All forms</option>
          {orgForms.map((form) => (
            <option key={form._id} value={form._id}>
              {form.name}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Search by user email"
          value={orgSubmissionEmailQuery}
          onChange={(event) => {
            setOrgSubmissionEmailQuery(event.target.value);
            setOrgSubmissionPage(1);
          }}
        />
        <Select value={orgStatusFilter} onChange={(event) => setOrgStatusFilter(event.target.value)}>
          <option value="all">all</option>
          <option value="pending">pending</option>
          <option value="completed">accepted</option>
          <option value="rejected">rejected</option>
        </Select>
        <Button
          variant="secondary"
          onClick={() => {
            setOrgFormFilter("");
            setOrgStatusFilter("all");
            setOrgSubmissionEmailQuery("");
            setOrgSubmissionPage(1);
            loadOrgSubmissions("", "all", 1, "");
          }}
        >
          Reset
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-sand-500">
          Showing {orgSubmissions.length} submissions
          {orgStatusFilter !== "all" ? ` · ${orgStatusFilter}` : ""}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOrgSubmissionPage((prev) => Math.max(prev - 1, 1))}
            disabled={orgSubmissionPage <= 1}
          >
            Prev
          </Button>
          <p className="text-xs uppercase tracking-[0.2em] text-sand-500">
            Page {orgSubmissionPage} of {orgSubmissionTotalPages}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setOrgSubmissionPage((prev) => Math.min(prev + 1, orgSubmissionTotalPages))
            }
            disabled={orgSubmissionPage >= orgSubmissionTotalPages}
          >
            Next
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {orgSubmissions.map((submission) => (
          <div
            key={submission._id}
            className="rounded-2xl border border-sand-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-sand-950">
                  {typeof submission.formId === "string" ? "Form" : submission.formId?.name || "Form"}
                </p>
                <p className="text-sm text-sand-500">
                  Submitted {new Date(submission.createdAt).toLocaleString()}
                </p>
              </div>
              <StatusPill status={submission.status} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => navigateToSubmission(submission._id)}>
                View
              </Button>
            </div>
          </div>
        ))}
        {!orgSubmissions.length ? <p className="text-sm text-sand-500">No submissions yet.</p> : null}
      </div>
      {orgDashboardMessage ? <p className="text-sm text-sand-500">{orgDashboardMessage}</p> : null}
    </Card>
  </section>
);
