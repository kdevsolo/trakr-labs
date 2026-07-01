import { redirect } from "next/navigation";

import DashboardHeader from "@/components/dashboard/widgets/DashboardHeader";
import { WidgetSettingsView } from "@/components/dashboard/settings/WidgetSettingsView";
import { getMe } from "@/app/dashboard/action";

export default async function SettingsPage() {
  const me = await getMe();

  if (!me?.isOrgAdmin) {
    redirect("/dashboard");
  }

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
