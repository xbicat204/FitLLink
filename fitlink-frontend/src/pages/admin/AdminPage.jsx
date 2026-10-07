import MainLayout from "../../layouts/MainLayout";
import SidebarAdmin from "@/components/SidebarAdmin";
import AdminSendNotification from '@/components/notifications/AdminSendNotification';

export default function AdminPage() {
  return (
      <div className="flex min-h-screen bg-gray-50">
        <SidebarAdmin />
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-6">Dashboard Admin</h1>
          {/* Nội dung dashboard hoặc các thành phần con sẽ ở đây */}
          {/* <AdminSendNotification /> */}
        </div>
      </div>
  );
}
