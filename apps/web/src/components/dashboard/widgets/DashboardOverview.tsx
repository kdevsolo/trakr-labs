import AiInsights from "./AiInsights";
import BugVolumeChart from "./BugVolumeChart";
import DashboardHeader from "./DashboardHeader";
import RecentCriticalIssues from "./RecentCriticalIssues";
import SummaryStats from "./SummaryStats";

const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Dashboard Overview"
        subtitle="System status and issue triage metrics for current sprint."
      />
      <SummaryStats />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BugVolumeChart />
        </div>
        <div>
          <AiInsights />
        </div>
      </div>
      <RecentCriticalIssues />
    </div>
  );
};

export default DashboardOverview;
