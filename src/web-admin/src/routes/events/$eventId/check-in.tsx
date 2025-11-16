import { createFileRoute, useMatch, useNavigate, useRouterState } from '@tanstack/react-router';
import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Calendar, Users, Send, QrCode, User, ChartBar } from 'lucide-react';
import ProtectedTeamPortal from '../../../components/ProtectedTeamPortal';

// Sidebar links similar to the Event Manager
const sidebarLinks = [
  { title: 'Event Manager', icon: Calendar, path: '/events' },
  { title: 'User Profile', icon: User, path: '/profile' },
  { title: 'Analytics', icon: ChartBar, path: '/analytics' },
];

function CheckInPage() {
  const match = useMatch(Route);
  const eventId = match?.params.eventId;

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const navigate = useNavigate();
  const activePath = useRouterState({ select: (state) => state.location.pathname });

  // Fetch event on mount
  useEffect(() => {
    async function fetchEvent() {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedEvent(data);
      } else {
        setMessage('⚠️ Event not found.');
      }
    }

    fetchEvent();
  }, [eventId]);

  // Fetch attendees & initialize QR scanner when event is loaded
  useEffect(() => {
    if (!selectedEvent) return;

    async function fetchAttendees() {
      const res = await fetch(`/api/events/${selectedEvent.id}/attendees`);
      const data = await res.json();
      setAttendees(data);
    }

    fetchAttendees();
    setMessage(null);

    // Initialize QR scanner
    // Initialize QR scanner
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: 250,
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          // formatsToSupport: ["QR_CODE"],
          // Hide default messages like "Launching camera..."
          // verbose: false,
          experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        },
        false
      );
    }

    scannerRef.current.render(handleScan, handleError);

    // if (!scannerRef.current) {
    //   scannerRef.current = new Html5QrcodeScanner(
    //     'qr-reader',
    //     { fps: 10, qrbox: 250 },
    //     false
    //   );
    // }

    // scannerRef.current.render(handleScan, handleError);

    return () => {
      // Cleanup scanner
      scannerRef.current?.clear().catch(console.warn);
      const qrReaderElement = document.getElementById('qr-reader');
      if (qrReaderElement) {
        qrReaderElement.innerHTML = '';  // Clear the QR scanner div
      }

      //document.getElementById('qr-reader')!.innerHTML = '';
    };
  }, [selectedEvent]);

  // Handle QR code scans
  const handleScan = async (decodedText: string) => {
    if (!decodedText || !selectedEvent) return;

    try {
      const res = await fetch('/api/attendees/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: decodedText, eventId: selectedEvent.id }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage(`✅ ${result.email} checked in successfully!`);
        setAttendees((prev) =>
          prev.map((a) =>
            a.id === result.attendeeId ? { ...a, checkedIn: true, checkedInAt: result.checkedInAt } : a
          )
        );
      } else {
        setMessage(`⚠️ ${result.error || 'Failed to check in.'}`);
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setMessage('⚠️ Failed to check in attendee.');
    }
  };

  const handleError = (err: any) => {
    console.error('QR Scan Error:', err);
    setMessage('⚠️ Camera error. Please try again.');
  };

  if (!selectedEvent) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-[#7A003C]">{message || 'Loading event...'}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <aside className="bg-[#620030] text-white w-full lg:w-72 shadow-lg p-8 flex flex-col space-y-8">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-extrabold text-white flex items-center space-x-2">
            <span>Admin Dashboard</span>
            <span className="w-6 h-6 bg-gradient-to-tr from-[#953363] to-[#AF668A] rounded-full flex-shrink-0"></span>
          </h2>
          <div className="mt-2 w-16 h-1 bg-[#AF668A] rounded-full"></div>
        </div>

        <div className="flex flex-col space-y-4">
          {sidebarLinks.map((link) => (
            <button
              key={link.title}
              onClick={() => navigate({ to: link.path })}
              className={`flex items-center p-4 rounded-xl transition-all shadow-md ${activePath === link.path ? 'bg-[#AF668A] text-white' : 'bg-[#953363] text-white hover:bg-[#AF668A]'
                }`}
            >
              <link.icon className="w-6 h-6 mr-3" />
              <span className="font-medium">{link.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 w-full p-8 lg:p-12">

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#F9E9F0] rounded-2xl p-6 shadow">
          <div>
            <h1 className="text-4xl font-extrabold text-[#7A003C] mb-2">
              Check-In: {selectedEvent.name}                </h1>

          </div>

        </div>



        {/* QR Scanner */}

        <div
          className="m-6 w-full max-w-3xl mx-auto p-12 bg-[#AF668A] rounded-2xl shadow-inner"
          id="qr-reader"
        />

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-[#953363]">{message}</p>
        )}

        {/* Attendee Table */}
        <h2 className="text-2xl font-semibold text-[#7A003C] mb-4 mt-8">Attendees</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-[#CA99B1] rounded-xl">
            <thead className="bg-[#F9E9F0] border-b border-[#CA99B1]">
              <tr>
                <th className="px-4 py-2 text-left text-[#7A003C]">Email</th>
                <th className="px-4 py-2 text-left text-[#7A003C] text-center">Waiver</th>
                <th className="px-4 py-2 text-left text-[#7A003C] text-center">Checked In</th>
                <th className="px-4 py-2 text-left text-[#7A003C] text-center">Check-In Time</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-[#CA99B1] hover:bg-[#F4E4ED] transition"
                >
                  <td className="px-4 py-2 text-[#7A003C] ">{a.email}</td>
                  <td className="px-4 py-2 text-[#953363] text-center">
                    {a.waiverSigned ? '✅' : '❌'}
                  </td>

                  <td className="px-4 py-2 text-[#AF668A] text-center">{a.checkedIn ? '✅' : '❌'}</td>
                  {/* <td className="px-4 py-2 text-[#AF668A]">{a.checkedInAt}</td> */}
                  <td className="px-4 py-2 text-[#AF668A] text-center">
                    {a.checkedInAt
                      ? new Date(a.checkedInAt.replace(' ', 'T'))
                        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default function ProtectedCheckIn() {
  return (
    <ProtectedTeamPortal>
      <CheckInPage />
    </ProtectedTeamPortal>
  );
}

// Route definition with hardcoded eventId
export const Route = createFileRoute('/events/$eventId/check-in')({
  component: ProtectedCheckIn,
});
