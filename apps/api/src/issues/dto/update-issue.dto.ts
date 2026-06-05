export class UpdateIssueDto {
  title?: string;
  description?: string;
  statusId?: string;
  assignedTo?: string | null;
}
