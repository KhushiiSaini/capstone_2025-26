// import { useEffect, useState, useRef } from 'react';
// import { useNavigate, createFileRoute } from '@tanstack/react-router';
// import { Calendar } from 'lucide-react';
// import ProtectedTeamPortal from '../components/ProtectedTeamPortal';
// import { getCurrentUser } from '../lib/auth';
// import { Html5QrcodeScanner } from 'html5-qrcode';

// function CheckInPage() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState<any>(null);
//   const [events, setEvents] = useState<any[]>([]);
//   const [selectedEvent, setSelectedEvent] = useState<any>(null);
//   const [attendees, setAttendees] = useState<any[]>([]);
//   const [message, setMessage] = useState<string | null>(null);
//   const scannerRef = useRef<Html5QrcodeScanner | null>(null);

//   // Fetch current user
//   useEffect(() => {
//     setUser(getCurrentUser());
//   }, []);

//   // Fetch all events
//   useEffect(() => {
//     async function fetchEvents() {
//       const res = await fetch('/api/events');
//       const data = await res.json();
//       setEvents(data);
//     }
//     fetchEvents();
//   }, []);

//   // Fetch attendees and initialize QR scanner when an event is selected
//   useEffect(() => {
//     if (!selectedEvent) return;

//     async function fetchAttendees() {
//       const res = await fetch(`/api/events/${selectedEvent.id}/attendees`);
//       const data = await res.json();
//       setAttendees(data);
//     }

//     fetchAttendees();
//     setMessage(null);

//     // Initialize QR scanner
//     if (!scannerRef.current) {
//       scannerRef.current = new Html5QrcodeScanner(
//         'qr-reader',
//         { fps: 10, qrbox: 250 },
//         false
//       );
//     }

//     scannerRef.current.render(handleScan, handleError);

//     return () => {
//       // Cleanup scanner
//       scannerRef.current?.clear().catch((err) => console.warn('Scanner clear error', err));
//       document.getElementById('qr-reader')!.innerHTML = '';
//     };
//   }, [selectedEvent]);

//   // Handle QR code scans
//   const handleScan = async (decodedText: string) => {
//     if (!decodedText || !selectedEvent) return;

//     try {
//       const res = await fetch('/api/attendees/check-in', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ qrCode: decodedText, eventId: selectedEvent.id }),
//       });

//       const result = await res.json();

//       if (res.ok) {
//         setMessage(`✅ ${result.email} checked in successfully!`);
//         // Update attendee list
//         setAttendees((prev) =>
//           prev.map((a) =>
//             a.id === result.attendeeId ? { ...a, checkedIn: true } : a
//           )
//         );
//       } else {
//         setMessage(`⚠️ ${result.error || 'Failed to check in.'}`);
//       }
//     } catch (err) {
//       console.error('Check-in error:', err);
//       setMessage('⚠️ Failed to check in attendee.');
//     }
//   };

//   const handleError = (err: any) => {
//     console.error('QR Scan Error:', err);
//     setMessage('⚠️ Camera error. Please try again.');
//   };

//   return (
//     <main className="min-h-screen flex bg-gradient-to-r from-pink-50 to-white">
//       {/* Sidebar */}
//       <aside className="bg-[#620030] text-white w-full lg:w-72 shadow-lg p-8 flex flex-col space-y-8">
//         <div className="text-center lg:text-left">
//           <h2 className="text-3xl font-extrabold text-white flex items-center space-x-2">
//             <span>Admin Dashboard</span>
//             <span className="w-6 h-6 bg-gradient-to-tr from-[#953363] to-[#AF668A] rounded-full flex-shrink-0"></span>
//           </h2>
//           <div className="mt-2 w-16 h-1 bg-[#AF668A] rounded-full"></div>
//         </div>

//         <button
//           onClick={() => navigate({ to: '/events' })}
//           className="flex items-center p-4 rounded-xl transition-all shadow-md bg-[#AF668A] text-white hover:bg-[#953363]"
//         >
//           <Calendar className="w-6 h-6 mr-3" /> Back to Events
//         </button>
//       </aside>

//       {/* Main Content */}
//       <section className="flex-1 w-full p-8 lg:p-12">
//         {!selectedEvent ? (
//           <>
//             <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10 gap-4 bg-[#F9E9F0] rounded-2xl p-6">
//               <div>
//                 <h1 className="text-4xl font-extrabold text-[#7A003C] mb-2">Event Check-In</h1>
//                 <p className="text-[#953363]">
//                   Select an event to begin check-in and manage attendees.
//                 </p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {events.map((event) => (
//                 <div
//                   key={event.id}
//                   className="bg-[#F9E9F0] border border-[#CA99B1] rounded-3xl shadow-md p-6 flex flex-col justify-between hover:shadow-xl transition cursor-pointer hover:-translate-y-1"
//                   onClick={() => setSelectedEvent(event)}
//                 >
//                   <h3 className="text-xl font-bold text-[#7A003C]">{event.name}</h3>
//                   <p className="text-sm text-[#953363]">{new Date(event.date).toLocaleDateString()}</p>
//                   <p className="text-sm text-[#AF668A]">{event.location}</p>
//                 </div>
//               ))}
//             </div>
//           </>
//         ) : (
//           <>
//             <h1 className="text-4xl font-extrabold text-[#7A003C] mb-6">Check-In: {selectedEvent.name}</h1>

//             {/* QR Scanner */}
//             <div className="mb-6 max-w-md mx-auto p-4 bg-[#F9E9F0] rounded-2xl shadow-inner" id="qr-reader" />
//             {message && <p className="mt-4 text-center text-sm font-medium text-[#953363]">{message}</p>}

//             {/* Attendee Table */}
//             <h2 className="text-2xl font-semibold text-[#7A003C] mb-4 mt-8">Attendees</h2>
//             <div className="overflow-x-auto">
//               <table className="min-w-full table-auto border-collapse border border-[#CA99B1] rounded-xl">
//                 <thead className="bg-[#F9E9F0] border-b border-[#CA99B1]">
//                   <tr>
//                     <th className="px-4 py-2 text-left text-[#7A003C]">Email</th>
//                     <th className="px-4 py-2 text-left text-[#7A003C]">Waiver</th>
//                     <th className="px-4 py-2 text-left text-[#7A003C]">Checked In</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {attendees.map((a) => (
//                     <tr
//                       key={a.id}
//                       className="border-b border-[#CA99B1] hover:bg-[#F4E4ED] transition"
//                     >
//                       <td className="px-4 py-2 text-[#7A003C]">{a.email}</td>
//                       <td className="px-4 py-2 text-[#953363]">{a.waiverSigned ? '✅' : '❌'}</td>
//                       <td className="px-4 py-2 text-[#AF668A]">{a.checkedIn ? '✅' : '❌'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </>
//         )}
//       </section>
//     </main>
//   );
// }

// export default function ProtectedCheckIn() {
//   return (
//     <ProtectedTeamPortal>
//       <CheckInPage />
//     </ProtectedTeamPortal>
//   );
// }

// export const Route = createFileRoute('/check-in')({
//   component: ProtectedCheckIn,
// });
