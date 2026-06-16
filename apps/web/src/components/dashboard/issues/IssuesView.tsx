"use client";

import { useEffect, useState } from "react";

import { useIssues } from "@/hooks/api/use-issues";
import { useMe } from "@/hooks/api/use-me";
import { useProjects } from "@/hooks/api/use-projects";
import type { Project } from "@/lib/api";

import { CreateProjectDrawer } from "./CreateProjectDrawer";
import { IssueDrawer } from "./IssueDrawer";
import { IssueTable } from "./IssueTable";
import { IssuesHeader } from "./IssuesHeader";
import type { IssueWithStatus } from "./types";

export function IssuesView() {
  const { data: me } = useMe();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<IssueWithStatus | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: issues = [],
    isLoading: issuesLoading,
  } = useIssues(selectedProject?.id ?? "");

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

  function handleSelectIssue(issue: IssueWithStatus) {
    setSelectedIssue(issue);
    setDrawerOpen(true);
  }

  function handleProjectCreated(project: Project) {
    setSelectedProject(project);
  }

  return (
    <div className="flex flex-col gap-4">
      <IssuesHeader
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onCreateProject={() => setCreateProjectOpen(true)}
        issueCount={issues.length}
        isLoading={projectsLoading}
      />

      {!selectedProject && !projectsLoading ? (
        <div className="flex items-center justify-center rounded-lg border border-border bg-white py-16">
          <p className="text-sm text-muted-foreground">
            Create a project to start tracking issues.
          </p>
        </div>
      ) : (
        <IssueTable
          issues={issues}
          selectedIssueId={selectedIssue?.id ?? null}
          onSelectIssue={handleSelectIssue}
          isLoading={issuesLoading}
        />
      )}

      <IssueDrawer
        issue={selectedIssue}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {me?.orgId && (
        <CreateProjectDrawer
          open={createProjectOpen}
          orgId={me.orgId}
          onClose={() => setCreateProjectOpen(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}
