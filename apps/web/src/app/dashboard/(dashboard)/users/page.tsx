import DashboardHeader from "@/components/dashboard/widgets/DashboardHeader";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Team"
        subtitle="Manage team members, roles, and assignments."
      />
      <p className="text-sm text-muted-foreground">Team management coming soon.</p>
    </div>
  );
}
