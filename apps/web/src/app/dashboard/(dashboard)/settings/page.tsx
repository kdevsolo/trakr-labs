import DashboardHeader from "@/components/dashboard/widgets/DashboardHeader";
import { WidgetSettingsView } from "@/components/dashboard/settings/WidgetSettingsView";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Settings"
        subtitle="Configure the embeddable feedback widget for your projects."
      />
      <WidgetSettingsView />
    </div>
  );
}
