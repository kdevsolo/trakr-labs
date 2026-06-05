export class CreateIssueDto {
  title!: string;
  description?: string;
  statusId!: string;
  assignedTo?: string;
}
