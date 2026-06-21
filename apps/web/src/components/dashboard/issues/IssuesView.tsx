"use client";

import { useEffect, useState } from "react";

import { useIssues } from "@/hooks/api/use-issues";
import { useMe } from "@/hooks/api/use-me";
import { useProjects } from "@/hooks/api/use-projects";
import type { Project } from "@/lib/api";

import { CreateProjectDrawer } from "./CreateProjectDrawer";
import { IssueDetailPanel } from "./IssueDetailPanel";
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

  useEffect(() => {
    if (!selectedIssue) return;
    const stillExists = issues.some((issue) => issue.id === selectedIssue.id);
    if (!stillExists) {
      setSelectedIssue(null);
    }
  }, [issues, selectedIssue]);

  function handleSelectIssue(issue: IssueWithStatus) {
    setSelectedIssue(issue);
  }

  function handleProjectCreated(project: Project) {
    setSelectedProject(project);
  }

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden p-6">
        <IssuesHeader
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={(project) => {
            setSelectedProject(project);
            setSelectedIssue(null);
          }}
          onCreateProject={() => setCreateProjectOpen(true)}
          issues={issues}
          projectCount={projects.length}
          isLoading={projectsLoading}
        />

        {!selectedProject && !projectsLoading ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-border bg-white">
            <p className="text-sm text-muted-foreground">
              Create a project to start tracking issues.
            </p>
          </div>
        ) : (
          <IssueTable
            issues={issues}
            projectKey={selectedProject?.projectKey}
            selectedIssueId={selectedIssue?.id ?? null}
            onSelectIssue={handleSelectIssue}
            isLoading={issuesLoading}
          />
        )}
      </div>

      {selectedIssue && selectedProject ? (
        <IssueDetailPanel
          issue={selectedIssue}
          projectId={selectedProject.id}
          projectKey={selectedProject.projectKey}
          onClose={() => setSelectedIssue(null)}
          onIssueUpdated={setSelectedIssue}
        />
      ) : null}

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
