import DashboardHeader from "@/components/dashboard/widgets/DashboardHeader";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Issues"
        subtitle="View and manage all reported issues across your projects."
      />
      <p className="text-sm text-muted-foreground">Issues list coming soon.</p>
    </div>
  );
}
