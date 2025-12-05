"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect jika belum login
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Fetch notifikasi user
  useEffect(() => {
    if (!session?.user?.id) return;

    async function fetchNotifications() {
      try {
        const res = await fetch(`/api/notifications?userId=${session.user.id}`);
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Gagal fetch notifikasi:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [session]);

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">🔔 Notifications</h2>

      {loading ? (
        <p className="text-gray-600">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-600">No notifications yet.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-white p-4 rounded-lg shadow flex flex-col"
            >
              <p className="text-gray-800">{notif.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notif.created_at).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
