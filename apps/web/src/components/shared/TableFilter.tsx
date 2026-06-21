"use client";

import { ChevronDownIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type TableFilterOption = {
  value: string;
  label: string;
};

type TableFilterProps = {
  label: string;
  value: string;
  options: TableFilterOption[];
  onChange: (value: string) => void;
  className?: string;
};

export function TableFilter({
  label,
  value,
  options,
  onChange,
  className,
}: TableFilterProps) {
  const selected = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/40",
            className,
          )}
        >
          <span className="text-muted-foreground">{label}:</span>
          <span>{selected?.label ?? "All"}</span>
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[10rem]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(value === option.value && "bg-accent")}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
