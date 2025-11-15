import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRModal from "@/components/QRModal";

export const Route = createFileRoute("/my-events")({
  component: MyEventsPage,
});

function MyEventsPage() {
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
            to="/events"
            className="bg-white text-maroon-800 hover:bg-gray-100 text-sm py-1.5 px-5 rounded-full font-semibold transition"
          >
            Events
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-3xl shadow-md p-10 border border-purple-100">
          <h2 className="text-4xl font-bold text-maroon-800 mb-10">
            My Events
          </h2>

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
                    <h3 className="text-2xl font-semibold text-maroon-800 mb-2">
                      {event.eventName}
                    </h3>
                    <p className="text-pink-800 text-sm mb-1">
                      {new Date(event.eventDate).toDateString()}
                    </p>
                    <p className="text-pink-800 text-sm mb-2">
                      {event.eventLocation}
                    </p>
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
      <QRModal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        qrValue={qrValue}
        isNewRegistration={false}
      />
    </div>
  );
}

export default MyEventsPage;
