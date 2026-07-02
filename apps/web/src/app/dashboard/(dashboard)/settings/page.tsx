import { redirect } from "next/navigation";

import DashboardHeader from "@/components/dashboard/widgets/DashboardHeader";
import { SettingsView } from "@/components/dashboard/settings/SettingsView";
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
        subtitle="Connect a GitHub repository and configure the embeddable feedback widget for your projects."
      />
      <SettingsView />
    </div>
  );
}
