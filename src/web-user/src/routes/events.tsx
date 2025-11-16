import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRModal from "@/components/QRModal";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/events")({
  component: EventsPage,
});

function EventsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [events, setEvents] = useState<any[]>([]);

  // Load events
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    }
    loadEvents();
  }, []);

  const handleRegister = async (eventId: number) => {
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error("Registration failed");

      const data = await res.json();

      const saved = JSON.parse(localStorage.getItem("myEvents") || "[]");
      const event = events.find((e: any) => e.id === eventId);

      if (event && !saved.some((e: any) => e.id === eventId)) {
        saved.push(event);
        localStorage.setItem("myEvents", JSON.stringify(saved));
      }

      setQrValue(data.qr);
      setQrModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Failed to register for event");
    }
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


      <main className="max-w-7xl mx-auto p-8 bg-[#F9E9F0]">
        <div className="bg-white rounded-3xl shadow-md p-10 border border-purple-100">
          {/* Header row with title and button */}
                
          <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#F9E9F0] rounded-2xl p-6 shadow">
            <div>
              <h1 className="text-4xl font-extrabold text-[#7A003C] py-2 mb-2">
              Upcoming Events
              </h1>
              
            </div>
            <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
              <button
              onClick={() => navigate({ to: "/my-events" })}
              className="px-6 py-3 bg-[#7A003C] text-white rounded-xl font-semibold shadow hover:bg-[#953363] transition disabled:opacity-50"
            >
              My Events
            </button>
            
              
            </div>
          </div>

          {events.length === 0 && <p className="text-gray-600">No events available.</p>}

          <div className="grid gap-10 md:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-pink-50 border border-pink-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition cursor-pointer"
              >
                {/* Event card content */}
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
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

                <h3 className="text-2xl font-semibold text-maroon-800 mb-3">
                  {event.name}
                </h3>
                <p className="text-pink-800 text-sm mb-1">
                  {new Date(event.date).toDateString()}
                </p>
                <p className="text-pink-800 text-sm mb-4">{event.location}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegister(event.id);
                  }}
                  className="w-full bg-maroon-700 hover:bg-maroon-800 text-white font-medium py-2.5 rounded-xl transition"
                >
                  Register
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>


      {/* QR Modal */}
      <QRModal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        qrValue={qrValue}
        isNewRegistration={true}
      />
    </div>
  );
}

export default EventsPage;
