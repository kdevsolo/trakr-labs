import { redirect } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MeHydration } from "@/providers/me-hydration";
import { getMe } from "../action";

export default async function DashboardShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const meDetails = await getMe();
  if (!meDetails) redirect("/auth/login");
  if (!meDetails.orgId) redirect("/dashboard/onboarding");

  return (
    <MeHydration initialMe={meDetails}>
      <DashboardLayout>{children}</DashboardLayout>
    </MeHydration>
  );
}
