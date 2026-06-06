import DashboardHeader from "@/components/dashboard/widgets/DashboardHeader";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Settings"
        subtitle="Configure workspace and notification preferences."
      />
      <p className="text-sm text-muted-foreground">Settings coming soon.</p>
    </div>
  );
}
