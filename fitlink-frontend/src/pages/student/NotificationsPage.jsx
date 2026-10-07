import React, { useEffect, useState } from "react";
import { Bell, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markFeedbackSent,
} from "@/services/notificationService";
import NotificationItem from "@/components/NotificationItem";
import Navbar from "@/components/Navbar";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load all notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifications(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("❌ Error loading notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleFeedbackSent = async (id) => {
    try {
      await markFeedbackSent(id);
      await loadNotifications();
    } catch (err) {
      console.error("❌ Error marking feedback sent:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-[#0f172a] text-gray-900 dark:text-gray-100">
      {/* 🧡 Navbar */}
      <div className="relative">
        <Navbar />
        {/* 🔙 Nút back nằm ngay góc trái trên thanh Navbar */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-1/2 -translate-y-1/2 left-6 flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* ======= MAIN CONTENT ======= */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="w-7 h-7 text-orange-500" />
          <h1 className="text-3xl font-bold">Your Notifications</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <Bell className="w-10 h-10 mx-auto mb-3 text-orange-400" />
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <NotificationItem
                key={n._id}
                noti={n}
                onFeedbackSent={handleFeedbackSent}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
