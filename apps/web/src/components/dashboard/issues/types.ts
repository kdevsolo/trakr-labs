export type Severity = "critical" | "high" | "medium" | "low";
export type IssueStatus = "open" | "in_progress" | "resolved" | "closed";

export type Issue = {
  id: string;
  key: string;
  summary: string;
  component: string;
  severity: Severity;
  status: IssueStatus;
  assignee: string | null;
  reporter: string;
  environment: string;
  createdAt: string;
  impact: string;
  description: string;
  stackTrace?: string;
  aiTriage?: string;
  aiSuggestedFix?: string;
};

export type Project = {
  id: string;
  name: string;
  key: string;
};
