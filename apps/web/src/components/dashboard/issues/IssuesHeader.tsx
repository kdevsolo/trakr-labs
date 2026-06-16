"use client";

import { ChevronDownIcon, FolderIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@/lib/api";

type IssuesHeaderProps = {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
  issueCount: number;
  isLoading?: boolean;
};

export function IssuesHeader({
  projects,
  selectedProject,
  onSelectProject,
  onCreateProject,
  issueCount,
  isLoading = false,
}: IssuesHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Issues
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {selectedProject
              ? `${issueCount} issue${issueCount === 1 ? "" : "s"} in ${selectedProject.name}.`
              : "Select a project to view issues."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Project:
        </span>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={isLoading}
              className="flex h-8 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent focus:outline-none disabled:opacity-50"
            >
              <FolderIcon className="size-3.5 text-muted-foreground" />
              {isLoading
                ? "Loading projects…"
                : selectedProject
                  ? selectedProject.name
                  : projects.length > 0
                    ? "Select project"
                    : "No projects yet"}
              <ChevronDownIcon className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Switch project</DropdownMenuLabel>
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
                  className="flex items-center justify-between"
                >
                  <span>{project.name}</span>
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
