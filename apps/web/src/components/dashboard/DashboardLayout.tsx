"use client";

import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { useLoadOrgMembers } from "@/hooks/api/use-load-org-members";
import { useLoadStatusMaster } from "@/hooks/api/use-status-master";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  useLoadStatusMaster();
  useLoadOrgMembers();

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fb]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
