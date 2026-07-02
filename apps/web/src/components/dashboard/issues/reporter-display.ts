import {
  WidgetIssueMetadataSchema,
  type IssueWithRelations,
} from "@trakr/schemas";

type IssueReporterSource = Pick<
  IssueWithRelations,
  "reportedBy" | "reporter" | "metadata"
>;

export function getIssueReporterDisplay(issue: IssueReporterSource): string {
  if (issue.reportedBy) {
    return issue.reporter?.name ?? issue.reportedBy;
  }

  const metadata = WidgetIssueMetadataSchema.safeParse(issue.metadata);
  if (metadata.success) {
    if (metadata.data.reportType === "auto") {
      return "Automatic";
    }
    if (metadata.data.email) {
      return metadata.data.email;
    }
  }

  return "—";
}
