"use client";

import { useMemo, useState } from "react";

import { IssueDrawer } from "./IssueDrawer";
import { IssueFilters, type IssueFiltersState } from "./IssueFilters";
import { IssueTable } from "./IssueTable";
import { IssuesHeader } from "./IssuesHeader";
import { MOCK_ISSUES, MOCK_PROJECTS } from "./mock-data";
import type { Issue, Project } from "./types";

const DEFAULT_FILTERS: IssueFiltersState = {
  severities: [],
  statuses: [],
  assignees: [],
  components: [],
};

export function IssuesView() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filters, setFilters] = useState<IssueFiltersState>(DEFAULT_FILTERS);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredIssues = useMemo(() => {
    return MOCK_ISSUES.filter((issue) => {
      if (
        filters.severities.length > 0 &&
        !filters.severities.includes(issue.severity)
      )
        return false;
      if (
        filters.statuses.length > 0 &&
        !filters.statuses.includes(issue.status)
      )
        return false;
      if (filters.assignees.length > 0) {
        const assigneeKey = issue.assignee ?? "unassigned";
        if (!filters.assignees.includes(assigneeKey)) return false;
      }
      if (
        filters.components.length > 0 &&
        !filters.components.includes(issue.component)
      )
        return false;
      return true;
    });
  }, [filters]);

  function handleSelectIssue(issue: Issue) {
    setSelectedIssue(issue);
    setDrawerOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <IssuesHeader
        projects={MOCK_PROJECTS}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        issueCount={filteredIssues.length}
      />

      <IssueFilters filters={filters} onFiltersChange={setFilters} />

      <IssueTable
        issues={filteredIssues}
        selectedIssueId={selectedIssue?.id ?? null}
        onSelectIssue={handleSelectIssue}
      />

      <IssueDrawer
        issue={selectedIssue}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
