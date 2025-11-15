import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRModal from "@/components/QRModal";

export const Route = createFileRoute("/events")({
  component: EventsPage,
});

function EventsPage() {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [events, setEvents] = useState<any[]>([]);

  // ---------------------------
  // 1️⃣ Load events from backend
  // ---------------------------
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

  // ---------------------------
  // 2️⃣ Register user + get QR
  // ---------------------------
  const handleRegister = async (eventId: number) => {
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // valid empty object
      });

      if (!res.ok) {
        throw new Error("Registration failed");
      }

      const data = await res.json();

      // Save event to localStorage
      const saved = JSON.parse(localStorage.getItem("myEvents") || "[]");
      const event = events.find((e: any) => e.id === eventId);

      if (event && !saved.some((e: any) => e.id === eventId)) {
        saved.push(event);
        localStorage.setItem("myEvents", JSON.stringify(saved));
      }

      // Show backend QR code
      setQrValue(data.qr);
      setQrModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Failed to register for event");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-maroon-800 text-white p-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-maroon-800 font-bold text-lg">MES</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Team D Events</h1>
              <p className="text-sm opacity-90">User Experience Hub</p>
            </div>
          </div>

          <Link
            to="/my-events"
            className="bg-white text-maroon-800 hover:bg-gray-100 text-sm py-1.5 px-5 rounded-full font-semibold transition"
          >
            My Events
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto p-8">
        {/* White container */}
        <div className="bg-white rounded-3xl shadow-md p-10 border border-purple-100">
          <h2 className="text-4xl font-bold text-maroon-800 mb-10">
            Upcoming Events
          </h2>

          {/* If backend returns nothing */}
          {events.length === 0 && (
            <p className="text-gray-600">No events available.</p>
          )}

          {/* Event cards */}
          <div className="grid gap-10 md:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-pink-50 border border-pink-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition cursor-pointer"
                // onClick={() => handleRegister(event.id)}
              >
                {/* Clean Icon */}
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

                {/* Title (backend = event.name) */}
                <h3 className="text-2xl font-semibold text-maroon-800 mb-3">
                  {event.name}
                </h3>

                {/* Date */}
                <p className="text-pink-800 text-sm mb-1">
                  {new Date(event.date).toDateString()}
                </p>

                {/* Location */}
                <p className="text-pink-800 text-sm mb-4">{event.location}</p>

                {/* Placeholder description */}
                {/* <p className="text-gray-700 text-sm mb-6 line-clamp-2">
                  No description provided.
                </p> */}

                {/* Register button */}
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
