"use client";

import { useMemo } from "react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type GridOptions,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import { cn } from "@/lib/utils";

ModuleRegistry.registerModules([AllCommunityModule]);

type DataTableProps<T> = {
  rowData: T[];
  columnDefs: ColDef<T>[];
  className?: string;
  height?: number | string;
  gridOptions?: GridOptions<T>;
};

function DataTable<T>({
  rowData,
  columnDefs,
  className,
  height = 360,
  gridOptions,
}: DataTableProps<T>) {
  const defaultColDef = useMemo<ColDef<T>>(
    () => ({
      sortable: true,
      resizable: true,
      filter: false,
      flex: 1,
      minWidth: 100,
    }),
    [],
  );

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <AgGridReact<T>
        theme={themeQuartz}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        animateRows
        suppressCellFocus
        domLayout="normal"
        {...gridOptions}
      />
    </div>
  );
}

export { DataTable };
export type { ColDef, GridOptions };
