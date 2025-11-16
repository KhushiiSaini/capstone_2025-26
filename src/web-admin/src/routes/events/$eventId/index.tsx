import { createFileRoute, useMatch, useNavigate, useRouterState } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Calendar, Users, Send, QrCode } from 'lucide-react';
import ProtectedTeamPortal from '../../../components/ProtectedTeamPortal';

export const Route = createFileRoute('/events/$eventId/')({
  component: ProtectedEventDetailPage,
});


function EventDetailPage() {
  const match = useMatch(Route);
  const navigate = useNavigate();
  const activePath = useRouterState({ select: (state) => state.location.pathname });

  const eventId = match?.params.eventId;
  const [event, setEvent] = useState<any | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);

    // Fetch event details
    fetch(`/api/events/${eventId}`)
      .then((res) => res.json())
      .then(setEvent)
      .catch((err) => console.error(err));

    // Fetch attendees
    fetch(`/api/events/${eventId}/attendees`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        // Map API fields to your component format
        const mapped = data.map((a: any) => ({
          id: a.id,
          name: a.name || a.email,
          email: a.email,
          waiver: a.waiverSigned,
        }));
        setAttendees(mapped);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (!eventId) return <div className="p-8 text-[#7A003C]">No event selected</div>;
  if (loading) return <div className="p-8 text-[#7A003C]">Loading...</div>;
  if (!event) return <div className="p-8 text-[#7A003C]">Event not found</div>;

  const totalAttendees = attendees.length;
  const waiversSigned = attendees.filter((a) => a.waiver).length;

  return (
    <main className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="bg-[#620030] text-white w-full lg:w-72 shadow-lg p-8 flex flex-col space-y-8">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-extrabold flex items-center justify-center lg:justify-start space-x-2">
            <span>Admin Dashboard</span>
            <span className="w-6 h-6 bg-gradient-to-tr from-[#953363] to-[#AF668A] rounded-full flex-shrink-0"></span>
          </h2>
          <div className="mt-2 w-16 h-1 bg-[#AF668A] rounded-full mx-auto lg:mx-0"></div>
        </div>

        <div className="flex flex-col space-y-4">
          {[{ title: 'Event Manager', path: '/events' }, { title: 'User Profile', path: '/profile' }, { title: 'Analytics', path: '/analytics' }].map((link) => (
            <button
              key={link.title}
              onClick={() => navigate({ to: link.path })}
              className={`flex items-center p-4 rounded-xl transition-all shadow-md ${activePath === link.path ? 'bg-[#AF668A] text-white' : 'bg-[#953363] text-white hover:bg-[#AF668A]'
                }`}
            >
              <span className="font-medium">{link.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 w-full p-8 lg:p-12 space-y-8">
    
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#F9E9F0] rounded-2xl p-6 shadow">
          <div>
            <h1 className="text-4xl font-extrabold text-[#7A003C] mb-2">{event.name}</h1>
            {/* <p className="text-[#953363]">{event.description || 'Event details and attendees.'}</p> */}
          </div>

          {/* Actions moved to header */}
          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            <button
              onClick={() => navigate({ to: `/events/${eventId}/check-in` })}

              className="flex items-center gap-2 bg-[#953363] text-white rounded-xl px-4 py-2 hover:bg-[#AF668A] transition">
              <QrCode className="w-5 h-5" />
              Check In
            </button>
            <button
              onClick={() => navigate({ to: `/events/${eventId}/notifications` })}

              className="flex items-center gap-2 bg-[#953363] text-white rounded-xl px-4 py-2 hover:bg-[#AF668A] transition">
              <Send className="w-5 h-5" />
              Notify Attendees
            </button>
          </div>
        </div>


        {/* Event Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-[#CA99B1] rounded-2xl shadow-md p-6 flex items-center space-x-4">
            <Calendar className="text-[#953363] w-6 h-6" />
            <div>
              <p className="text-sm text-[#953363]">Date</p>
              <p className="font-semibold text-[#7A003C]">
                {new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#CA99B1] rounded-2xl shadow-md p-6 flex items-center space-x-4">
            <Calendar className="text-[#953363] w-6 h-6" />
            <div>
              <p className="text-sm text-[#953363]">Location</p>
              <p className="font-semibold text-[#7A003C]">{event.location || 'TBD'}</p>
            </div>
          </div>
          <div className="bg-white border border-[#CA99B1] rounded-2xl shadow-md p-6 flex items-center space-x-4">
            <Users className="text-[#953363] w-6 h-6" />
            <div>
              <p className="text-sm text-[#953363]">Attendees</p>
              <p className="font-semibold text-[#7A003C]">{totalAttendees}</p>
            </div>
          </div>

          <div className="bg-white border border-[#CA99B1] rounded-2xl shadow-md p-6 flex items-center space-x-4">
            <Send className="text-[#953363] w-6 h-6" />
            <div>
              <p className="text-sm text-[#953363]">Waivers Signed</p>
              <p className="font-semibold text-[#7A003C]">{waiversSigned}/{totalAttendees}</p>
            </div>
          </div>

          
        </div>



        {/* Attendees Grid */}
        <div className="overflow-x-auto">
          <h2 className="text-2xl font-bold text-[#7A003C] mb-4">Attendees</h2>

          {attendees.length > 0 ? (
            <table className="min-w-full bg-white border border-[#CA99B1] rounded-2xl shadow-md">
              <thead className="bg-[#F9E9F0] text-[#7A003C]">
                <tr>
                  <th className="py-3 px-6 text-left border-b border-[#CA99B1]">Name</th>
                  <th className="py-3 px-6 text-left border-b border-[#CA99B1]">Email</th>
                  <th className="py-3 px-6 text-left border-b border-[#CA99B1]">Waiver Status</th>
                </tr>
              </thead>
              <tbody className="text-[#7A003C]">
                {attendees.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-[#F0E0E5]">
                    <td className="py-3 px-6 border-b border-[#CA99B1]">{attendee.name}</td>
                    <td className="py-3 px-6 border-b border-[#CA99B1]">{attendee.email}</td>
                    <td className={`py-3 px-6 border-b border-[#CA99B1] ${attendee.waiver ? 'text-green-600' : 'text-red-600'}`}>
                      {attendee.waiver ? 'Signed' : 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-[#953363]">No attendees registered yet.</p>
          )}
        </div>

      </section>
    </main>
  );
}


function ProtectedEventDetailPage() {
  return (
    <ProtectedTeamPortal>
      <EventDetailPage />
    </ProtectedTeamPortal>
  );
}
