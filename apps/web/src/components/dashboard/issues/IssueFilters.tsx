"use client";

import { ChevronDownIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Severity, IssueStatus } from "./types";

export type IssueFiltersState = {
  severities: Severity[];
  statuses: IssueStatus[];
  assignees: string[];
  components: string[];
};

type FilterDropdownProps = {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
};

function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
}: FilterDropdownProps) {
  const hasActive = selected.length > 0 && selected.length < options.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent focus:outline-none data-[state=open]:bg-accent"
        >
          {label}
          {hasActive && (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {selected.length}
            </span>
          )}
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.value}
            checked={selected.includes(opt.value)}
            onCheckedChange={() => onToggle(opt.value)}
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const SEVERITY_OPTIONS: { value: Severity; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const STATUS_OPTIONS: { value: IssueStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const ASSIGNEE_OPTIONS = [
  { value: "unassigned", label: "Unassigned" },
  { value: "Sarah Chen", label: "Sarah Chen" },
  { value: "Alex Rivera", label: "Alex Rivera" },
  { value: "Jordan Kim", label: "Jordan Kim" },
  { value: "Jamie Torres", label: "Jamie Torres" },
];

const COMPONENT_OPTIONS = [
  { value: "Auth Service", label: "Auth Service" },
  { value: "Frontend Core", label: "Frontend Core" },
  { value: "Database", label: "Database" },
  { value: "Frontend UI", label: "Frontend UI" },
];

type IssueFiltersProps = {
  filters: IssueFiltersState;
  onFiltersChange: (filters: IssueFiltersState) => void;
};

export function IssueFilters({ filters, onFiltersChange }: IssueFiltersProps) {
  function toggle<T extends string>(
    key: keyof IssueFiltersState,
    value: T,
    current: T[],
  ) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: next });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterDropdown
        label="Severity"
        options={SEVERITY_OPTIONS}
        selected={filters.severities}
        onToggle={(v) =>
          toggle("severities", v as Severity, filters.severities)
        }
      />
      <FilterDropdown
        label="Status: Open"
        options={STATUS_OPTIONS}
        selected={filters.statuses}
        onToggle={(v) =>
          toggle("statuses", v as IssueStatus, filters.statuses)
        }
      />
      <FilterDropdown
        label="Assignee"
        options={ASSIGNEE_OPTIONS}
        selected={filters.assignees}
        onToggle={(v) => toggle("assignees", v, filters.assignees)}
      />
      <FilterDropdown
        label="Component"
        options={COMPONENT_OPTIONS}
        selected={filters.components}
        onToggle={(v) => toggle("components", v, filters.components)}
      />
    </div>
  );
}
