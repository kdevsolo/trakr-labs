"use client";

import { DownloadIcon, FolderIcon, Loader2, PlusIcon } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/api";

import type { IssueWithStatus } from "./types";
import { getIssueReporterDisplay } from "./reporter-display";

type IssuesHeaderProps = {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
  onCreateIssue: () => void;
  canCreateIssue: boolean;
  totalIssues: number;
  projectCount: number;
  isLoading?: boolean;
  isExporting?: boolean;
  onExport: () => Promise<IssueWithStatus[] | undefined>;
};

function sanitizeCsvCell(value: string): string {
  if (/^[=+\-@]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

function exportIssuesCsv(issues: IssueWithStatus[], projectName: string) {
  const headers = ["Key", "Title", "Status", "Reporter", "Assignee", "Created"];
  const rows = issues.map((issue) => [
    issue.id.slice(0, 8).toUpperCase(),
    sanitizeCsvCell(issue.title),
    issue.status?.title ?? "",
    sanitizeCsvCell(getIssueReporterDisplay(issue)),
    issue.assignee?.name ?? (issue.assignedTo ? issue.assignedTo : "Unassigned"),
    issue.createdAt,
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-issues.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function IssuesHeader({
  projects,
  selectedProject,
  onSelectProject,
  onCreateProject,
  onCreateIssue,
  canCreateIssue,
  totalIssues,
  projectCount,
  isLoading = false,
  isExporting = false,
  onExport,
}: IssuesHeaderProps) {
  const [open, setOpen] = useState(false);

  async function handleExport() {
    if (!selectedProject) return;

    const issues = await onExport();
    if (issues && issues.length > 0) {
      exportIssuesCsv(issues, selectedProject.name);
    }
  }

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Active Issues
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedProject
              ? `${totalIssues} issue${totalIssues === 1 ? "" : "s"} across ${projectCount} project${projectCount === 1 ? "" : "s"}.`
              : "Select a project to view issues."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {canCreateIssue ? (
            <Button
              size="sm"
              className="gap-2"
              disabled={!selectedProject}
              onClick={onCreateIssue}
            >
              <PlusIcon className="size-4" />
              New Issue
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!selectedProject || totalIssues === 0 || isExporting}
            onClick={handleExport}
          >
            {isExporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <DownloadIcon className="size-4" />
            )}
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={isLoading}
              className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-medium transition-colors hover:bg-muted/40 disabled:opacity-50"
            >
              <FolderIcon className="size-3.5 text-muted-foreground" />
              {isLoading
                ? "Loading projects…"
                : selectedProject
                  ? selectedProject.name
                  : projects.length > 0
                    ? "Select project"
                    : "No projects yet"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Project</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {projects.length === 0 ? (
              <DropdownMenuItem disabled>No projects available</DropdownMenuItem>
            ) : (
              projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => {
                    onSelectProject(project);
                    setOpen(false);
                  }}
                >
                  {project.name}
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="font-medium text-primary"
              onClick={() => {
                onCreateProject();
                setOpen(false);
              }}
            >
              <PlusIcon className="size-3.5" />
              Create new project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
