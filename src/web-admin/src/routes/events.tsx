import { createFileRoute, useNavigate, useRouterState } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Calendar, Users, Send, QrCode, User, ChartBar } from 'lucide-react';
import ProtectedTeamPortal from '../components/ProtectedTeamPortal';
import { getCurrentUser, AuthUser } from '../lib/auth';

// Mock data
const mockEvents = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: `Event ${i + 1}`,
  date: `2025-12-${(i % 30) + 1}`,
  location: `Location ${i + 1}`,
  attendees: Array.from({ length: (i % 10) + 1 }, (_, j) => ({
    name: `Attendee ${j + 1}`,
    waiver: Math.random() > 0.3,
  })),
}));

const sidebarLinks = [
  { title: 'Event Manager', icon: Calendar, path: '/events' },
  { title: 'User Profile', icon: User, path: '/profile' },
  { title: 'Analytics', icon: ChartBar, path: '/analytics' },
];

type SortKey = 'title' | 'date' | 'location' | 'registered' | 'waivers';

function EventManagerPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [events, setEvents] = useState<typeof mockEvents>([]);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();
  const activePath = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    setUser(getCurrentUser());
    setEvents(mockEvents);
  }, []);

// function EventManagerPage() {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [events, setEvents] = useState<any[]>([]); // real events from API
//   const [sortKey, setSortKey] = useState<SortKey>('date');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
//   const navigate = useNavigate();

//   useEffect(() => {
//     setUser(getCurrentUser());

//     // Fetch events from your Fastify API
//     const fetchEvents = async () => {
//       try {
//         const res = await fetch('/api/events'); // adjust path if needed
//         if (!res.ok) throw new Error('Failed to fetch events');
//         const data = await res.json();
//         setEvents(data);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     fetchEvents();
//   }, []);


  const now = new Date();

  // Only upcoming events based on current date
  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3); // Top 3 upcoming events

  // Sort all events for the table
  const sortedEvents = [...events].sort((a, b) => {
    let aValue: string | number = '';
    let bValue: string | number = '';

    switch (sortKey) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'date':
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      case 'location':
        aValue = a.location.toLowerCase();
        bValue = b.location.toLowerCase();
        break;
      case 'registered':
        aValue = a.attendees.length;
        bValue = b.attendees.length;
        break;
      case 'waivers':
        aValue = a.attendees.filter((x) => x.waiver).length;
        bValue = b.attendees.filter((x) => x.waiver).length;
        break;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

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
              className={`flex items-center p-4 rounded-xl transition-all shadow-md ${
                activePath === link.path ? 'bg-[#AF668A] text-white' : 'bg-[#953363] text-white hover:bg-[#AF668A]'
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
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10 gap-4 bg-[#F9E9F0] rounded-2xl p-6">
  <div>
    <h1 className="text-4xl font-extrabold text-[#7A003C] mb-2">
      Event Manager
    </h1>
    <p className="text-[#953363]">
      Manage your upcoming events, track attendees, and more.
    </p>
  </div>
  <button
    onClick={() => navigate({ to: '/events/new' })}
    className="bg-[#953363] hover:bg-[#AF668A] text-white rounded-xl px-4 py-2 font-semibold transition"
  >
    + New Event
  </button>
</div>


        {/* Upcoming Events Cards */}
        <h2 className="text-2xl font-semibold text-[#7A003C] mb-4">Top 3 Upcoming Events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {upcomingEvents.map((event) => {
            const total = event.attendees.length;
            const waivers = event.attendees.filter((a) => a.waiver).length;
            return (
              <div
                key={event.id}
                className="bg-[#F9E9F0] border border-[#CA99B1] rounded-2xl shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-[#7A003C]">{event.title}</h3>
                  <Calendar className="w-6 h-6 text-[#953363]" />
                </div>
                <p className="text-sm text-[#953363]">{event.date}</p>
                <p className="text-sm text-[#AF668A] mb-2">{event.location}</p>
                <div className="flex justify-between text-[#7A003C] text-sm mb-2">
                  <span>Registered:</span>
                  <span>{total}</span>
                </div>
                <div className="flex justify-between text-[#7A003C] text-sm mb-2">
                  <span>Waivers:</span>
                  <span>{waivers}/{total}</span>
                </div>
                <button
                  onClick={() => navigate({ to: `/events/${event.id}/attendees` })}
                  className="mt-auto bg-[#953363] text-white text-sm rounded-lg py-1 hover:bg-[#AF668A] transition"
                >
                  View Attendees
                </button>
              </div>
            );
          })}
        </div>

        {/* All Events Table */}
        <h2 className="text-2xl font-semibold text-[#7A003C] mb-4">All Events</h2>
        <div className="overflow-x-auto border border-[#CA99B1] rounded-2xl">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-[#F9E9F0] border-b border-[#CA99B1]">
              <tr>
                <th
                  className="px-4 py-2 text-left text-[#7A003C] cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  Title {sortKey === 'title' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  className="px-4 py-2 text-left text-[#7A003C] cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  Date {sortKey === 'date' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  className="px-4 py-2 text-left text-[#7A003C] cursor-pointer"
                  onClick={() => handleSort('location')}
                >
                  Location {sortKey === 'location' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  className="px-4 py-2 text-left text-[#7A003C] cursor-pointer"
                  onClick={() => handleSort('registered')}
                >
                  Registered {sortKey === 'registered' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  className="px-4 py-2 text-left text-[#7A003C] cursor-pointer"
                  onClick={() => handleSort('waivers')}
                >
                  Waivers {sortKey === 'waivers' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-4 py-2 text-left text-[#7A003C]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event) => {
                const total = event.attendees.length;
                const waivers = event.attendees.filter((a) => a.waiver).length;
                return (
                  <tr key={event.id} className="border-b border-[#CA99B1] hover:bg-[#F4E4ED] transition">
                    <td className="px-4 py-2 text-[#7A003C]">{event.title}</td>
                    <td className="px-4 py-2 text-[#953363]">{event.date}</td>
                    <td className="px-4 py-2 text-[#AF668A]">{event.location}</td>
                    <td className="px-4 py-2 text-[#7A003C]">{total}</td>
                    <td className="px-4 py-2 text-[#7A003C]">{waivers}/{total}</td>
                    <td className="px-4 py-2 space-x-2 flex flex-wrap">
                      <button
                        onClick={() => navigate({ to: `/events/${event.id}/attendees` })}
                        className="flex items-center px-2 py-1 border border-[#953363] text-[#953363] rounded-lg hover:bg-[#953363]/10 transition text-sm"
                      >
                        <Users className="w-3 h-3 mr-1" /> Attendees
                      </button>
                      <button
                        onClick={() => navigate({ to: `/events/${event.id}/notifications` })}
                        className="flex items-center px-2 py-1 border border-[#953363] text-[#953363] rounded-lg hover:bg-[#953363]/10 transition text-sm"
                      >
                        <Send className="w-3 h-3 mr-1" /> Notify
                      </button>
                      <button
                        onClick={() => navigate({ to: `/events/${event.id}/checkin` })}
                        className="flex items-center px-2 py-1 border border-[#953363] text-[#953363] rounded-lg hover:bg-[#953363]/10 transition text-sm"
                      >
                        <QrCode className="w-3 h-3 mr-1" /> Check-In
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function ProtectedEventManager() {
  return (
    <ProtectedTeamPortal>
      <EventManagerPage />
    </ProtectedTeamPortal>
  );
}

export const Route = createFileRoute('/events')({
  component: ProtectedEventManager,
});
