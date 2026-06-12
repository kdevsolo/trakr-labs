"use client";

import {
  BotIcon,
  CopyIcon,
  ExternalLinkIcon,
  UserIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { SeverityBadge } from "./SeverityBadge";
import { StatusBadge } from "./StatusBadge";
import type { Issue } from "./types";

type IssueDrawerProps = {
  issue: Issue | null;
  open: boolean;
  onClose: () => void;
};

export function IssueDrawer({ issue, open, onClose }: IssueDrawerProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={(o) => !o && onClose()}
      direction="right"
    >
      <DrawerContent className="flex h-full w-full flex-col overflow-hidden sm:max-w-lg">
        {issue && <IssueDrawerBody issue={issue} onClose={onClose} />}
      </DrawerContent>
    </Drawer>
  );
}

function IssueDrawerBody({
  issue,
  onClose,
}: {
  issue: Issue;
  onClose: () => void;
}) {
  return (
    <>
      <DrawerHeader className="flex-shrink-0 border-b border-border px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                {issue.key}
              </span>
              <SeverityBadge severity={issue.severity} />
            </div>
            <DrawerTitle className="text-base font-semibold leading-snug text-foreground">
              {issue.summary}
            </DrawerTitle>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <CopyIcon className="size-3.5" />
            </button>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ExternalLinkIcon className="size-3.5" />
            </button>
            <DrawerClose asChild>
              <button
                type="button"
                onClick={onClose}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </button>
            </DrawerClose>
          </div>
        </div>
      </DrawerHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-b border-border px-5 py-4">
          <MetaField
            label="Assignee"
            value={
              issue.assignee ? (
                <span className="flex items-center gap-1.5">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserIcon className="size-3" />
                  </span>
                  {issue.assignee}
                </span>
              ) : (
                <span className="text-muted-foreground italic">Unassigned</span>
              )
            }
          />
          <MetaField label="Reporter" value={issue.reporter} />
          <MetaField label="Component" value={issue.component} />
          <MetaField label="Environment" value={issue.environment} />
          <MetaField label="Created" value={issue.createdAt} />
          <MetaField
            label="Impact"
            value={
              <span className="font-medium text-foreground">{issue.impact}</span>
            }
          />
        </div>

        <div className="space-y-5 px-5 py-4">
          <Section title="Description">
            <p className="text-sm leading-relaxed text-foreground/80">
              {issue.description}
            </p>
          </Section>

          {issue.stackTrace && (
            <Section title="Stack Trace">
              <pre className="overflow-x-auto rounded-lg border border-border bg-muted/60 p-3 text-xs leading-relaxed text-foreground/80 font-mono">
                {issue.stackTrace}
              </pre>
            </Section>
          )}

          {(issue.aiTriage || issue.aiSuggestedFix) && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <BotIcon className="size-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  AI Triage &amp; Suggested Fix
                </span>
              </div>
              {issue.aiTriage && (
                <p className="mb-2 text-sm leading-relaxed text-foreground/80">
                  {issue.aiTriage}
                </p>
              )}
              {issue.aiSuggestedFix && (
                <p className="text-sm leading-relaxed text-foreground/80">
                  <span className="font-semibold">Suggested action:</span>{" "}
                  {issue.aiSuggestedFix}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-border px-5 py-4">
        <Button variant="outline" size="sm" className="flex-1">
          Acknowledge
        </Button>
        <Button size="sm" className="flex-1">
          Start Progress
        </Button>
      </div>
    </>
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
