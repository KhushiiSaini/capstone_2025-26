import { createFileRoute, useNavigate,useMatch, useRouterState } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Send, X, Calendar, Users, User, ChartBar } from 'lucide-react';
import ProtectedTeamPortal from '../../../components/ProtectedTeamPortal';

const sidebarLinks = [
  { title: 'Event Manager', icon: Calendar, path: '/events' },
  { title: 'User Profile', icon: User, path: '/profile' },
  { title: 'Analytics', icon: ChartBar, path: '/analytics' },
];

interface Attendee {
  id: number;
  name: string;
  email: string;
  checkedIn?: boolean;
}

function NotifyPage() {
  const [message, setMessage] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const navigate = useNavigate();
  const activePath = useRouterState({ select: (state) => state.location.pathname });
  // const { params } = useRouterState(state => state.location);
  // const eventId = Number(params.eventId || 1); // fallback to 1
  const match = useMatch(Route);
  const eventId = match?.params.eventId;

  // Fetch attendees from backend on mount
  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/attendees`);
      // const data = await res.json();
        // const res = await fetch(`/api/attendees?eventId=${eventId}`);
        if (!res.ok) throw new Error('Failed to fetch attendees');
        const data: Attendee[] = await res.json();
        setAttendees(data);
      } catch (err) {
        console.error(err);
        setStatus({ type: 'error', message: 'Failed to load attendees' });
      }
    };
    fetchAttendees();
  }, [eventId]);

  const handleToggleRecipient = (email: string) => {
    setRecipients(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleSelectAll = () => {
    if (recipients.length === attendees.length) {
      setRecipients([]);
    } else {
      setRecipients(attendees.map(a => a.email));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setStatus({ type: 'error', message: 'Message cannot be empty' });
      return;
    }

    if (recipients.length === 0) {
      setStatus({ type: 'error', message: 'Please select at least one recipient' });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          eventId,
          recipients,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send notification');
      }

      setStatus({ type: 'success', message: 'Notification sent successfully!' });
      setMessage('');
      setRecipients([]);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to send notification',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <aside className="bg-[#620030] text-white w-full lg:w-72 shadow-lg p-8 flex flex-col space-y-8">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-extrabold flex items-center space-x-2">
            <span>Admin Dashboard</span>
            <span className="w-6 h-6 bg-gradient-to-tr from-[#953363] to-[#AF668A] rounded-full flex-shrink-0"></span>
          </h2>
          <div className="mt-2 w-16 h-1 bg-[#AF668A] rounded-full"></div>
        </div>
        <div className="flex flex-col space-y-4">
          {sidebarLinks.map(link => (
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
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-[#7A003C] mb-2">Send Notification</h1>
          <p className="text-[#953363]">Send a notification to event attendees</p>
        </div>

        {/* Status Message */}
        {status && (
          <div
            className={`mb-6 p-4 rounded-lg flex justify-between items-center ${
              status.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <span>{status.message}</span>
            <button onClick={() => setStatus(null)} className="hover:opacity-70 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#F9E9F0] border border-[#CA99B1] rounded-2xl p-8 space-y-6">
          {/* Message Input */}
          <div>
            <label className="block text-sm font-semibold text-[#7A003C] mb-2">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Enter your notification message..."
              className="w-full px-4 py-3 border border-[#CA99B1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#953363] resize-none"
              rows={5}
            />
            <p className="text-xs text-[#AF668A] mt-1">{message.length}/500 characters</p>
          </div>

          {/* Recipients */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-[#7A003C]">
                Recipients ({recipients.length}/{attendees.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-[#953363] hover:text-[#7A003C] font-medium transition"
              >
                {recipients.length === attendees.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-[#CA99B1] rounded-xl p-3 bg-white">
              {attendees.length > 0 ? (
                attendees.map(att => (
                  <label
                    key={att.id}
                    className="flex items-center p-2 hover:bg-[#F9E9F0] rounded-lg cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={recipients.includes(att.email)}
                      onChange={() => handleToggleRecipient(att.email)}
                      className="w-4 h-4 rounded border-[#CA99B1] text-[#953363] focus:ring-[#953363]"
                    />
                    <span className="ml-3 text-[#7A003C] font-medium">{att.name}</span>
                    <span className="ml-auto text-xs text-[#AF668A]">{att.email}</span>
                  </label>
                ))
              ) : (
                <p className="text-[#AF668A] text-sm">No attendees available</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#953363] hover:bg-[#AF668A] disabled:opacity-50 text-white rounded-xl px-6 py-3 font-semibold transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Sending...' : 'Send Notification'}
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="bg-white border border-[#CA99B1] text-[#7A003C] rounded-xl px-6 py-3 font-semibold hover:bg-[#F9E9F0] transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default function ProtectedNotify() {
  return (
    <ProtectedTeamPortal>
      <NotifyPage />
    </ProtectedTeamPortal>
  );
}

// Route definition with dynamic eventId
export const Route = createFileRoute('/events/$eventId/notifications')({
  component: ProtectedNotify,
});
