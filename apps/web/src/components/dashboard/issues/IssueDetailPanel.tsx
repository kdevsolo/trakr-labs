"use client";

import { ExternalLinkIcon, LinkIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SafeExternalLink } from "@/components/shared/SafeExternalLink";
import { useUpdateIssue } from "@/hooks/api/use-issues";

import { formatIssueKey, formatRelativeTime } from "./IssueTable";
import { IssueAssigneeSelect } from "./IssueAssigneeSelect";
import { IssueComments } from "./IssueComments";
import { IssueStatusSelect } from "./IssueStatusSelect";
import type { IssueWithStatus } from "./types";
import { getIssueReporterDisplay } from "./reporter-display";
import { WidgetTechnicalDetails } from "./WidgetTechnicalDetails";

type IssueDetailPanelProps = {
  issue: IssueWithStatus;
  projectId: string;
  projectKey?: string;
  onClose: () => void;
  onIssueUpdated?: (issue: IssueWithStatus) => void;
};

export function IssueDetailPanel({
  issue,
  projectId,
  projectKey,
  onClose,
  onIssueUpdated,
}: IssueDetailPanelProps) {
  const updateIssue = useUpdateIssue(projectId);

  const issueKey = formatIssueKey(projectKey, issue.id);

  function handleStatusChange(statusId: string) {
    if (statusId === issue.statusId) return;

    updateIssue.mutate(
      { issueId: issue.id, input: { statusId } },
      {
        onSuccess: (updatedIssue) => {
          onIssueUpdated?.(updatedIssue);
        },
      },
    );
  }

  function handleAssigneeChange(assignedTo: string | null) {
    if (assignedTo === issue.assignedTo) return;

    updateIssue.mutate(
      { issueId: issue.id, input: { assignedTo } },
      {
        onSuccess: (updatedIssue) => {
          onIssueUpdated?.(updatedIssue);
        },
      },
    );
  }

  return (
    <aside className="flex w-full max-w-md shrink-0 flex-col overflow-hidden border-l border-border bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              {issueKey}
            </span>
            <IssueStatusSelect
              value={issue.statusId}
              onValueChange={handleStatusChange}
              disabled={updateIssue.isPending}
            />
          </div>
          <h2 className="text-base font-semibold leading-snug text-foreground">
            {issue.title}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          {/* <IconButton aria-label="Copy issue link">
            <LinkIcon className="size-3.5" />
          </IconButton>
          <IconButton aria-label="Open issue">
            <ExternalLinkIcon className="size-3.5" />
          </IconButton> */}
          <IconButton aria-label="Close issue panel" onClick={onClose}>
            <XIcon className="size-3.5" />
          </IconButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-b border-border px-5 py-4">
          <MetaField
            label="Assignee"
            value={
              <IssueAssigneeSelect
                value={issue.assignedTo}
                onValueChange={handleAssigneeChange}
                disabled={updateIssue.isPending}
              />
            }
          />
          <MetaField
            label="Reporter"
            value={getIssueReporterDisplay(issue)}
          />
          <MetaField label="Created" value={formatRelativeTime(issue.createdAt)} />
          <MetaField label="Updated" value={formatRelativeTime(issue.updatedAt)} />
          <MetaField label="Assigned by" value={issue.assignedBy ?? "—"} />
          <MetaField label="Modified by" value={issue.modifiedBy ?? "—"} />
        </div>

        <div className="space-y-5 px-5 py-4">
          <Section title="Description">
            <p className="text-sm leading-relaxed text-foreground/80">
              {issue.description ?? "No description provided."}
            </p>
          </Section>

          {issue.media && issue.media.length > 0 && (
            <Section title="Attachments">
              <ul className="grid grid-cols-2 gap-3">
                {issue.media.map((item) => (
                  <li key={item.id}>
                    <SafeExternalLink
                      href={item.url}
                      className="block overflow-hidden rounded-md border border-border bg-muted/20 transition-colors hover:bg-muted/40"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt=""
                        className="aspect-video w-full object-cover"
                      />
                    </SafeExternalLink>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <WidgetTechnicalDetails metadata={issue.metadata} />

          <IssueComments projectId={projectId} issueId={issue.id} />
        </div>
      </div>

      {/* <div className="flex shrink-0 items-center gap-2 border-t border-border px-5 py-4">
        <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>
          Acknowledge
        </Button>
        <Button size="sm" className="flex-1">
          Start Progress
        </Button>
      </div> */}
    </aside>
  );
}

function IconButton({
  children,
  onClick,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      {...props}
    >
      {children}
    </button>
  );
}

function MetaField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}
