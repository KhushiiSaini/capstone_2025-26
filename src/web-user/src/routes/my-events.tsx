import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRModal from "@/components/QRModal";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/my-events")({
  component: MyEventsPage,
});

function MyEventsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const res = await fetch("/api/users/3/registrations"); // user ID 3
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserEvents();
  }, []);

  const handleShowQR = (qr: string) => {
    setQrValue(qr);
    setQrModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      {/* ---------------- Taskbar / Header ---------------- */}
      <header className="bg-gradient-to-r from-[#620030] to-[#953363] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#7A003C] font-extrabold text-lg shadow-sm">
              MES
            </div>
            <div>
              <h1 className="font-bold text-xl leading-none">MES Events Platform</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate({ to: "/events" })}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
            >
              Events
            </button>
            {/* <button
              onClick={() => navigate({ to: "/my-events" })}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
            >
              My Events
            </button> */}
            <button
              onClick={() => navigate({ to: "/profile" })}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
            >
              Profile
            </button>
            <button
              onClick={() => navigate({ to: "/inbox" })}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-3xl shadow-md p-10 border border-purple-100">
          <h2 className="text-4xl font-bold text-maroon-800 mb-10">My Events</h2>

          {events.length === 0 ? (
            <p className="text-gray-600">No events registered yet.</p>
          ) : (
            <div className="grid gap-10 md:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event.eventId}
                  className="bg-pink-50 border border-pink-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
                >
                  {/* Icon */}
                  <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-10 h-10 text-pink-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10m-12 8h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  {/* Event Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-maroon-800 mb-2">{event.eventName}</h3>
                    <p className="text-pink-800 text-sm mb-1">
                      {new Date(event.eventDate).toDateString()}
                    </p>
                    <p className="text-pink-800 text-sm mb-2">{event.eventLocation}</p>
                  </div>

                  {/* QR Button */}
                  {event.qr && (
                    <button
                      onClick={() => handleShowQR(event.qr)}
                      className="mt-4 text-sm bg-maroon-800 text-white rounded-full py-2 px-4 hover:bg-maroon-700 transition"
                    >
                      QR Available
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* QR Modal */}
      <QRModal open={qrModalOpen} onOpenChange={setQrModalOpen} qrValue={qrValue} isNewRegistration={false} />
    </div>
  );
}

export default MyEventsPage;
