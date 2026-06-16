"use client";

import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { StatusBadge } from "./StatusBadge";
import type { IssueWithStatus } from "./types";

type IssueDrawerProps = {
  issue: IssueWithStatus | null;
  open: boolean;
  onClose: () => void;
};

export function IssueDrawer({ issue, open, onClose }: IssueDrawerProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
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
  issue: IssueWithStatus;
  onClose: () => void;
}) {
  return (
    <>
      <DrawerHeader className="flex-shrink-0 border-b border-border px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              <StatusBadge status={issue.status?.title ?? "Unknown"} />
            </div>
            <DrawerTitle className="text-base font-semibold leading-snug text-foreground">
              {issue.title}
            </DrawerTitle>
          </div>
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
      </DrawerHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-b border-border px-5 py-4">
          <MetaField label="Reported by" value={issue.reportedBy} />
          <MetaField
            label="Assigned to"
            value={issue.assignedTo ?? "Unassigned"}
          />
          <MetaField label="Assigned by" value={issue.assignedBy ?? "—"} />
          <MetaField label="Modified by" value={issue.modifiedBy ?? "—"} />
          <MetaField label="Created" value={issue.createdAt} />
          <MetaField label="Updated" value={issue.updatedAt} />
        </div>

        <div className="space-y-5 px-5 py-4">
          <Section title="Description">
            <p className="text-sm leading-relaxed text-foreground/80">
              {issue.description ?? "No description provided."}
            </p>
          </Section>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-border px-5 py-4">
        <Button variant="outline" size="sm" className="flex-1">
          Close
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
