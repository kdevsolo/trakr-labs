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
  variant?: "inline" | "form";
};

export function IssueStatusSelect({
  value,
  onValueChange,
  disabled,
  variant = "inline",
}: IssueStatusSelectProps) {
  const statuses = useStatusStore((state) => state.activeStatuses);
  const selectedStatus = statuses.find((status) => status.id === value);

  const triggerClassName =
    variant === "form"
      ? "h-9 w-full border border-input bg-background px-3 shadow-xs"
      : "h-auto w-auto border-none bg-transparent p-0 shadow-none focus-visible:ring-0";

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger size="sm" className={triggerClassName}>
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
