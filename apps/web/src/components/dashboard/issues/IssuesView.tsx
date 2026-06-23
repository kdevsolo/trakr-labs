"use client";

import { useEffect, useMemo, useState } from "react";

import { listIssues } from "@/lib/api";
import { useIssues } from "@/hooks/api/use-issues";
import { useMe } from "@/hooks/api/use-me";
import { useMyPermissions } from "@/hooks/api/use-my-permissions";
import { useProjects } from "@/hooks/api/use-projects";
import type { ListIssuesParams, Project } from "@/lib/api";
import { canCreateIssueForProject } from "@/lib/permissions/can-create-issue";

import { CreateIssueDrawer } from "./CreateIssueDrawer";
import { CreateProjectDrawer } from "./CreateProjectDrawer";
import { IssueDetailPanel } from "./IssueDetailPanel";
import { IssueTable } from "./IssueTable";
import { IssuesHeader } from "./IssuesHeader";
import type { IssueWithStatus } from "./types";

const ALL_FILTER = "all";
const UNASSIGNED_FILTER = "unassigned";
const PAGE_SIZE = 8;

const DEFAULT_META = {
  page: 1,
  pageSize: PAGE_SIZE,
  total: 0,
};

export function IssuesView() {
  const { data: me } = useMe();
  const { data: permissions } = useMyPermissions(Boolean(me?.orgId));
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<IssueWithStatus | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER);
  const [assigneeFilter, setAssigneeFilter] = useState(ALL_FILTER);
  const [isExporting, setIsExporting] = useState(false);

  const issueListParams = useMemo((): ListIssuesParams => {
    const params: ListIssuesParams = {
      page,
      pageSize: PAGE_SIZE,
    };

    if (statusFilter !== ALL_FILTER) {
      params.statusId = statusFilter;
    }

    if (assigneeFilter !== ALL_FILTER) {
      params.assignedTo = assigneeFilter;
    }

    return params;
  }, [page, statusFilter, assigneeFilter]);

  const canCreateIssue = selectedProject
    ? canCreateIssueForProject(
        me?.isOrgAdmin ?? false,
        permissions,
        selectedProject.id,
      )
    : false;

  const {
    data: issuesResult,
    isLoading: issuesLoading,
  } = useIssues(selectedProject?.id ?? "", issueListParams);

  const issues = issuesResult?.items ?? [];
  const meta = issuesResult?.meta ?? DEFAULT_META;

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
    setPage(1);
  }, [selectedProject?.id, statusFilter, assigneeFilter]);

  function handleSelectIssue(issue: IssueWithStatus) {
    setSelectedIssue(issue);
  }

  function handleProjectCreated(project: Project) {
    setSelectedProject(project);
  }

  function handleIssueCreated(issue: IssueWithStatus) {
    setSelectedIssue(issue);
  }

  async function handleExport() {
    if (!selectedProject || meta.total === 0) return;

    setIsExporting(true);

    try {
      const exportParams: ListIssuesParams = {
        page: 1,
        pageSize: 100,
      };

      if (statusFilter !== ALL_FILTER) {
        exportParams.statusId = statusFilter;
      }

      if (assigneeFilter !== ALL_FILTER) {
        exportParams.assignedTo = assigneeFilter;
      }

      const result = await listIssues(selectedProject.id, exportParams);
      return result.items;
    } finally {
      setIsExporting(false);
    }
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
          onCreateIssue={() => setCreateIssueOpen(true)}
          canCreateIssue={canCreateIssue}
          totalIssues={meta.total}
          projectCount={projects.length}
          isLoading={projectsLoading}
          isExporting={isExporting}
          onExport={handleExport}
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
            meta={meta}
            projectKey={selectedProject?.projectKey}
            selectedIssueId={selectedIssue?.id ?? null}
            onSelectIssue={handleSelectIssue}
            isLoading={issuesLoading}
            canCreateIssue={canCreateIssue}
            onCreateIssue={() => setCreateIssueOpen(true)}
            statusFilter={statusFilter}
            assigneeFilter={assigneeFilter}
            onStatusFilterChange={setStatusFilter}
            onAssigneeFilterChange={setAssigneeFilter}
            onPageChange={setPage}
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

      {me?.orgId ? (
        <>
          <CreateProjectDrawer
            open={createProjectOpen}
            orgId={me.orgId}
            onClose={() => setCreateProjectOpen(false)}
            onCreated={handleProjectCreated}
          />
          <CreateIssueDrawer
            open={createIssueOpen}
            projects={projects}
            initialProjectId={selectedProject?.id}
            onClose={() => setCreateIssueOpen(false)}
            onCreated={handleIssueCreated}
          />
        </>
      ) : null}
    </div>
  );
}
