"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateIssue } from "@/hooks/api/use-issues";
import { useMe } from "@/hooks/api/use-me";
import { useMyPermissions } from "@/hooks/api/use-my-permissions";
import type { IssueWithStatus, Project } from "@/lib/api";
import { getWritableProjects } from "@/lib/permissions/can-create-issue";
import { useStatusStore } from "@/stores/use-status-store";
import { cn } from "@/lib/utils";

import { FieldLabel } from "../onboarding/FieldLabel";
import { IssueAssigneeSelect } from "./IssueAssigneeSelect";
import { IssueStatusSelect } from "./IssueStatusSelect";

type CreateIssueDrawerProps = {
  open: boolean;
  projects: Project[];
  initialProjectId?: string | null;
  onClose: () => void;
  onCreated: (issue: IssueWithStatus) => void;
};

function getDefaultStatusId(
  activeStatuses: { id: string; title: string }[],
): string {
  const openStatus = activeStatuses.find(
    (status) => status.title.toLowerCase() === "open",
  );
  return openStatus?.id ?? activeStatuses[0]?.id ?? "";
}

export function CreateIssueDrawer({
  open,
  projects,
  initialProjectId,
  onClose,
  onCreated,
}: CreateIssueDrawerProps) {
  const { data: me } = useMe();
  const { data: permissions } = useMyPermissions(Boolean(me?.orgId));
  const activeStatuses = useStatusStore((state) => state.activeStatuses);

  const writableProjects = useMemo(
    () =>
      getWritableProjects(
        projects,
        me?.isOrgAdmin ?? false,
        permissions,
      ),
    [projects, me?.isOrgAdmin, permissions],
  );

  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [statusId, setStatusId] = useState("");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createIssue = useCreateIssue(projectId);
  const showProjectPicker = writableProjects.length > 1;
  const lockedProjectId =
    initialProjectId &&
    writableProjects.some((project) => project.id === initialProjectId)
      ? initialProjectId
      : null;

  useEffect(() => {
    if (!open) return;

    const defaultStatusId = getDefaultStatusId(activeStatuses);
    setStatusId(defaultStatusId);
    setTitle("");
    setDescription("");
    setAssignedTo(null);
    setError(null);

    if (lockedProjectId) {
      setProjectId(lockedProjectId);
      return;
    }

    if (writableProjects.length === 1) {
      setProjectId(writableProjects[0]?.id ?? "");
      return;
    }

    setProjectId("");
  }, [open, lockedProjectId, writableProjects, activeStatuses]);

  function handleClose() {
    onClose();
  }

  async function handleSubmit() {
    const trimmedTitle = title.trim();

    if (!projectId) {
      setError("Select a project.");
      return;
    }

    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    if (!statusId) {
      setError("Status is not available. Try again in a moment.");
      return;
    }

    setError(null);

    try {
      const issue = await createIssue.mutateAsync({
        title: trimmedTitle,
        description: description.trim() || undefined,
        statusId,
        assignedTo: assignedTo ?? undefined,
      });
      onCreated(issue);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create issue.",
      );
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      direction="right"
    >
      <DrawerContent className="max-w-md">
        <DrawerHeader>
          <DrawerTitle>Create issue</DrawerTitle>
          <DrawerDescription>
            Add a new issue to track work for your project.
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-4">
          {showProjectPicker ? (
            <div className="space-y-2">
              <FieldLabel required>Project</FieldLabel>
              <Select
                value={projectId}
                onValueChange={setProjectId}
                disabled={createIssue.isPending || Boolean(lockedProjectId)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {writableProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <FieldLabel required>Title</FieldLabel>
            <Input
              placeholder="e.g. Fix login redirect loop"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={createIssue.isPending}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Description</FieldLabel>
            <textarea
              placeholder="Add more context about this issue…"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={createIssue.isPending}
              rows={4}
              className={cn(
                "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel required>Status</FieldLabel>
            <IssueStatusSelect
              value={statusId}
              onValueChange={setStatusId}
              disabled={createIssue.isPending || !statusId}
              variant="form"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Assignee</FieldLabel>
            <IssueAssigneeSelect
              value={assignedTo}
              onValueChange={setAssignedTo}
              disabled={createIssue.isPending}
              variant="form"
            />
          </div>

          {error ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <DrawerFooter className="flex-row justify-end gap-2">
          <DrawerClose asChild>
            <Button variant="outline" disabled={createIssue.isPending}>
              Cancel
            </Button>
          </DrawerClose>
          <Button onClick={handleSubmit} disabled={createIssue.isPending}>
            {createIssue.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create issue"
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
