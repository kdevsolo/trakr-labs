"use client";

import { ChevronDownIcon, FolderIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "./types";

type IssuesHeaderProps = {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project | null) => void;
  issueCount: number;
};

export function IssuesHeader({
  projects,
  selectedProject,
  onSelectProject,
  issueCount,
}: IssuesHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Active Issues
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {issueCount} open issues requiring triage across{" "}
            {projects.length} projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Export CSV
          </Button>
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
              className="flex h-8 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent focus:outline-none"
            >
              <FolderIcon className="size-3.5 text-muted-foreground" />
              {selectedProject ? selectedProject.name : "All Projects"}
              <ChevronDownIcon className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Switch Project</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                onSelectProject(null);
                setOpen(false);
              }}
            >
              <span className="font-medium">All Projects</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => {
                  onSelectProject(project);
                  setOpen(false);
                }}
                className="flex items-center justify-between"
              >
                <span>{project.name}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {project.key}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-primary font-medium">
              <PlusIcon className="size-3.5" />
              Create New Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
