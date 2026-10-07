import React from "react";
import SidebarAdmin from "@/components/SidebarAdmin";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-wrapper flex min-h-screen bg-slate-900 text-white">
      <SidebarAdmin />
      <div className="flex-1 p-8 overflow-y-auto admin-content">{children}</div>
    </div>
  );
}
