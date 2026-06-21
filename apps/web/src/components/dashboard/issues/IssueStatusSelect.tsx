"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useStatusStore,
} from "@/stores/use-status-store";

import { StatusBadge } from "./StatusBadge";

type IssueStatusSelectProps = {
  value: string;
  onValueChange: (statusId: string) => void;
  disabled?: boolean;
};

export function IssueStatusSelect({
  value,
  onValueChange,
  disabled,
}: IssueStatusSelectProps) {
  const statuses = useStatusStore((state) => state.activeStatuses);
  const selectedStatus = statuses.find((status) => status.id === value);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        size="sm"
        className="h-auto w-auto border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
      >
        <SelectValue>
          <StatusBadge status={selectedStatus?.title ?? "Unknown"} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        {statuses.map((status) => (
          <SelectItem key={status.id} value={status.id}>
            <StatusBadge status={status.title} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
