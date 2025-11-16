import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/inbox")({
  component: () => (
    <ProtectedRoute>
      <InboxPage />
    </ProtectedRoute>
  ),
});

type NotificationItem = {
  id: number;
  eventId?: number | null;
  eventName?: string;
  message: string;
  createdAt: string;
  read?: boolean;
};

async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch("/api/inbox", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load notifications");
  return res.json();
}

function InboxPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { data: apiNotifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  /** Format user name */
  const userName =
    user?.email
      ?.split("@")[0]
      .split(".")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ") ?? "User";

  /** Load + patch event names */
  useEffect(() => {
    setNotifications(apiNotifications);
    attachEventNames(apiNotifications);
  }, [apiNotifications]);

  async function attachEventNames(list: NotificationItem[]) {
    const updated = await Promise.all(
      list.map(async (n) => {
        if (!n.eventId || n.eventName) return n;
        try {
          const res = await fetch(`/api/events/${n.eventId}`);
          if (!res.ok) throw new Error();
          const event = await res.json();
          return { ...n, eventName: event.name ?? `Event ${n.eventId}` };
        } catch {
          return { ...n, eventName: `Event ${n.eventId}` };
        }
      })
    );
    setNotifications(updated);
  }

  const filtered =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const selected =
    selectedId != null
      ? notifications.find((n) => n.id === selectedId) ?? null
      : filtered[0] ?? null;

  function markAsRead(id: number) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#F8F4F7] text-[#2D142C]">
      <header className="bg-gradient-to-r from-[#620030] to-[#953363] text-white shadow-lg">
  <div className="w-full px-6 py-4 flex justify-between items-center">
    
    {/* LEFT-ALIGNED LOGO */}
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#7A003C] font-extrabold text-lg shadow-sm">
        MES
      </div>
      <div>
        <h1 className="font-bold text-xl leading-none">MES Events Platform</h1>
      </div>
    </div>

    {/* RIGHT-SIDE NAV BUTTONS */}
    <div className="flex items-center space-x-3">
      <button
        onClick={() => navigate({ to: '/events' })}
        className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
      >
        Events
      </button>

      <button
        onClick={() => navigate({ to: '/profile' })}
        className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
      >
        Profile
      </button>

      <button
        onClick={() => navigate({ to: '/inbox' })}
        className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
      >
        Notifications
      </button>

      <button
        onClick={logout}
        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>

  </div>
</header>


      {/* 📬 PAGE CONTENT */}
                    <div className=" bg-[#F9E9F0] p-8">

      <div className="rounded-3xl shadow-md p-10 bg-white mx-auto w-full ">

        {/* HEADER */}
        <div className="bg-[#F9E9F0] rounded-2xl p-6 mb-10 flex justify-between items-center ">
          <div>
            <h1 className="text-4xl font-extrabold text-[#7A003C]">
              Notification Inbox
            </h1>
            <p className="mt-2 text-[#953363]">
              View important alerts about events and requirements.
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className={`px-4 py-2 rounded-xl font-semibold border transition ${
              unreadCount === 0
                ? "border-[#CA99B1] text-[#CA99B1] cursor-not-allowed"
                : "border-[#953363] text-[#953363] hover:bg-[#953363]/10"
            }`}
          >
            Mark all as read
          </button>
        </div>

        {/* FILTER CONTROL */}
        <div className="flex justify-between mb-6">
          <div className="flex bg-[#F9E9F0] border border-[#CA99B1] rounded-full p-1 space-x-1">
            {(["all", "unread"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-1 rounded-full font-semibold text-sm transition ${
                  filter === key ? "bg-[#7A003C] text-white" : "text-[#7A003C]"
                }`}
              >
                {key === "all" ? "All" : "Unread"}
              </button>
            ))}
          </div>

          <span className="text-sm bg-[#F9E9F0] border border-[#CA99B1] px-4 py-1 rounded-full text-[#7A003C]">
            Unread: <strong>{unreadCount}</strong>
          </span>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT LIST */}
          <div className="border border-[#CA99B1] rounded-2xl bg-[#F9E9F0] p-3 max-h-[420px] overflow-y-auto space-y-2">
            {filtered.length === 0 ? (
              <p className="text-[#953363] text-center py-6">
                No notifications to display
              </p>
            ) : (
              filtered.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setSelectedId(n.id)}
                  className={`w-full text-left rounded-xl px-4 py-3 flex justify-between items-start transition ${
                    selected?.id === n.id ? "bg-white" : "bg-[#FDF4F8]"
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      {!n.read && (
                        <span className="w-2 h-2 bg-[#7A003C] rounded-full" />
                      )}
                      <span className="font-semibold text-[#7A003C]">
                        {n.eventName}
                      </span>
                    </div>

                    <p className="text-sm text-[#953363] truncate">
                      {n.message}
                    </p>
                  </div>

                  <span className="text-xs text-[#AF668A] whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* RIGHT DETAIL PANEL */}
          <div className="border border-[#CA99B1] rounded-2xl bg-white p-6 min-h-[260px]">
            {selected ? (
              <>
                <p className="uppercase text-xs text-[#AF668A] tracking-widest">
                  Event Notification
                </p>

                <h2 className="text-xl font-bold text-[#7A003C] mb-1">
                  {selected.eventName}
                </h2>

                <p className="text-[#953363] leading-relaxed">
                  {selected.message}
                </p>

                <div className="flex justify-between mt-6 items-center">
                  <span className="text-sm text-[#AF668A]">
                    {new Date(selected.createdAt).toLocaleString()}
                  </span>

                  {!selected.read && (
                    <button
                      onClick={() => markAsRead(selected.id)}
                      className="bg-[#7A003C] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#953363] transition"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-[#953363]">
                Select a notification to view details
              </p>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* FOOTER */}
      {/* <footer className="bg-[#F3D3DF] text-[#7A003C] text-center py-6 text-sm">
        © 2025 MES Events Platform. Large event support and coordination.
      </footer> */}
    </main>
  );
}
