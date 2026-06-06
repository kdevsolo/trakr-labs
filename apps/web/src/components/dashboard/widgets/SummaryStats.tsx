import {
  AlertTriangleIcon,
  FileTextIcon,
  SparklesIcon,
} from "lucide-react";

import StatsCard from "./StatsCard";

const SummaryStats = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatsCard
        label="Open Issues"
        value="248"
        trend={{ value: "+12%", positive: true }}
        icon={<FileTextIcon className="size-5" />}
      />
      <StatsCard
        label="New Reports (24H)"
        value="34"
        trend={{ value: "-5%" }}
        icon={<SparklesIcon className="size-5" />}
      />
      <StatsCard
        label="Critical Triage Needed"
        value="7 Unassigned"
        icon={<AlertTriangleIcon className="size-5 text-destructive" />}
        accent="critical"
      />
    </div>
  );
};

export default SummaryStats;
