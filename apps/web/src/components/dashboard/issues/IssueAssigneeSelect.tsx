"use client";

import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrgMembersStore } from "@/stores/use-org-members-store";

const UNASSIGNED_VALUE = "unassigned";

type IssueAssigneeSelectProps = {
  value: string | null;
  onValueChange: (userId: string | null) => void;
  disabled?: boolean;
  variant?: "inline" | "form";
};

export function IssueAssigneeSelect({
  value,
  onValueChange,
  disabled,
  variant = "inline",
}: IssueAssigneeSelectProps) {
  const members = useOrgMembersStore((state) => state.members);
  const isLoading = useOrgMembersStore((state) => state.isLoading);

  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => a.name.localeCompare(b.name)),
    [members],
  );

  const selectedMember = sortedMembers.find((member) => member.id === value);
  const selectValue = value ?? UNASSIGNED_VALUE;

  function handleValueChange(nextValue: string) {
    onValueChange(nextValue === UNASSIGNED_VALUE ? null : nextValue);
  }

  const triggerClassName =
    variant === "form"
      ? "h-9 w-full border border-input bg-background px-3 shadow-xs"
      : "h-auto w-full border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0";

  return (
    <Select
      value={selectValue}
      onValueChange={handleValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger size="sm" className={triggerClassName}>
        <SelectValue>
          {isLoading ? (
            <span className="text-muted-foreground">Loading…</span>
          ) : selectedMember ? (
            selectedMember.name
          ) : (
            <span className="italic text-muted-foreground">Unassigned</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        <SelectItem value={UNASSIGNED_VALUE}>
          <span className="italic text-muted-foreground">Unassigned</span>
        </SelectItem>
        {sortedMembers.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            {member.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
