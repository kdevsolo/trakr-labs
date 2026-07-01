"use client";

import dynamic from "next/dynamic";

import type { DataTable } from "./DataTable";

export const LazyDataTable = dynamic(
  () => import("./DataTable").then((mod) => mod.DataTable),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Loading table…
      </div>
    ),
  },
) as typeof DataTable;
