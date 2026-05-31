import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import { Link } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import { supabase } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

type Notification = {
  id: string;
  message: string;
  type: string;
  created_at: string;
  is_read: boolean;
  sender_username?: string;
};

export default function Notifications() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    initializeNotifications();

    const channel = supabase
      .channel(`notifications-${user.id}`)

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },

        (payload) => {
          const newNotification = payload.new as Notification;

          setNotifications((prev) => [
            {
              ...newNotification,
              is_read: false,
            },
            ...prev,
          ]);

          toast.success(newNotification.message);
        },
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function initializeNotifications() {
    await fetchNotifications();

    await markNotificationsAsRead();
  }

  async function markNotificationsAsRead() {
    if (!user) return;

    console.log("USER ID:", user?.id);

    const { data, error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("user_id", user.id)
      .eq("is_read", false)
      .select();

    console.log("MARK READ DATA:", data);

    console.log("MARK READ ERROR:", error);

    if (error) {
      alert(error.message);
    }
  }

  async function fetchNotifications() {
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      return;
    }

    setNotifications(data || []);

    setLoading(false);
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          Loading notifications...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Activity Center
          </p>

          <h1 className="mt-4 text-6xl font-light tracking-tight">
            Notifications
          </h1>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="
                  rounded-3xl border
                  border-zinc-200 bg-white
                  p-6 transition
                  dark:border-zinc-800
                  dark:bg-zinc-900
                "
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-lg leading-relaxed">
                    <Link
                      to={`/profile/${notification.sender_username}`}
                      className="
                          font-medium transition
                          hover:text-black
                          dark:hover:text-white
                        "
                    >
                      @{notification.sender_username}
                    </Link>

                    <span> {notification.message}</span>
                  </div>

                  <p className="mt-3 text-sm text-zinc-500">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>

                {!notification.is_read && (
                  <div
                    className="
                        mt-2 h-3 w-3
                        rounded-full bg-blue-500
                      "
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {!notifications.length && (
          <div className="py-24 text-center text-zinc-500">
            No notifications yet.
          </div>
        )}
      </section>
    </MainLayout>
  );
}
