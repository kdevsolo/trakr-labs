"use client";

import { ChevronDownIcon, FolderIcon } from "lucide-react";
import { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjects } from "@/hooks/api/use-projects";
import type { Project } from "@/lib/api";

import { GithubSettingsView } from "./GithubSettingsView";
import { WidgetSettingsView } from "./WidgetSettingsView";

export function SettingsView() {
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);

  useEffect(() => {
    if (projects.length === 0) {
      setSelectedProject(null);
      return;
    }

    setSelectedProject((current) => {
      if (current && projects.some((project) => project.id === current.id)) {
        return current;
      }
      return projects[0] ?? null;
    });
  }, [projects]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Project:
        </span>
        <DropdownMenu open={projectMenuOpen} onOpenChange={setProjectMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={projectsLoading}
              className="flex h-8 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent focus:outline-none disabled:opacity-50"
            >
              <FolderIcon className="size-3.5 text-muted-foreground" />
              {projectsLoading
                ? "Loading projects…"
                : selectedProject?.name ?? "Select project"}
              <ChevronDownIcon className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Switch project</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => {
                  setSelectedProject(project);
                  setProjectMenuOpen(false);
                }}
              >
                {project.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <GithubSettingsView project={selectedProject} />
      <WidgetSettingsView project={selectedProject} />
    </div>
  );
}
