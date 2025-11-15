// import { createFileRoute } from '@tanstack/react-router'
// // rachel & himasha
// export const Route = createFileRoute('/events/$eventId/notifications')({
//   component: RouteComponent,
// })

// function RouteComponent() {
//   return <div>Hello "/events/$eventId/notifications"!</div>
// }

import { createFileRoute, useMatch, useNavigate, useRouterState } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Calendar, Users, Send, QrCode, User, ChartBar } from 'lucide-react'
import ProtectedTeamPortal from '../../../components/ProtectedTeamPortal';

const heroImageUrl =
  'https://www.eng.mcmaster.ca/wp-content/uploads/2021/05/JHE-Exterior-scaled.jpg'

// Sidebar links used by the Admin Dashboard layout in multiple admin pages
const sidebarLinks = [
  { title: 'Event Manager', icon: Calendar, path: '/events' },
  { title: 'User Profile', icon: User, path: '/profile' },
  { title: 'Analytics', icon: ChartBar, path: '/analytics' },
]

// The route path is automatically derived from the file structure
// Use the parent path ($eventId) to correctly inherit the parameters.
export const Route = createFileRoute('/events/$eventId/notifications')({
  // component: YourNotificationComponent, 
  component: ProtectedCheckIn, 
});

// rachel & himasha
function RouteComponent() {
  const match = Route.useMatch()
  const navigate = useNavigate()
  const activePath = useRouterState({ select: (state) => state.location.pathname })

  const [eventName, setEventName] = useState('Event')
  const [isEventLoading, setIsEventLoading] = useState(true)
  const [eventError, setEventError] = useState<string | null>(null)

  const eventIdParam = match?.params.eventId
  const [isFormOpen, setIsFormOpen] = useState(true)
  const [recipientsInput, setRecipientsInput] = useState('')
  const [message, setMessage] = useState('')
  const [audience, setAudience] = useState('all')
  const [channel, setChannel] = useState('in_app')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // --- ADDED EFFECT TO FETCH EVENT NAME ---
  useEffect(() => {
    if (!eventIdParam) {
      setIsEventLoading(false)
      return
    }

    const controller = new AbortController()

    const fetchEventName = async () => {
      setIsEventLoading(true)
      setEventError(null)
      try {
        const res = await fetch(`/api/events/${eventIdParam}`, { signal: controller.signal })
        if (!res.ok) {
          throw new Error(`Failed to fetch event: ${res.status}`)
        }
        const data = await res.json()
        const name = data?.name ?? `Event ID ${eventIdParam}`
        setEventName(name)
      } catch (err: any) {
        if (err.name === 'AbortError') return
        console.error('Error fetching event name:', err)
        setEventName(`Event ID ${eventIdParam}`)
        setEventError('Could not load event name. Using ID as fallback.')
      } finally {
        setIsEventLoading(false)
      }
    }

    fetchEventName()

    return () => controller.abort()
  }, [eventIdParam])

  const resetForm = () => {
    setRecipientsInput('')
    setMessage('')
    setAudience('all')
    setChannel('in_app')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)
    setError(null)

    if (!message.trim()) {
      setError('Please provide a message.')
      return
    }

    // Parse recipients input (comma or newline-separated emails)
    const parsedRecipients = recipientsInput
      .split(/[,\n]/)
      .map((r) => r.trim())
      .filter(Boolean)

    if (parsedRecipients.length === 0) {
      setError('Please provide at least one recipient (comma-separated emails).')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          recipients: parsedRecipients,
          eventId: eventIdParam ? Number(eventIdParam) : 1,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create notification')
      }

      const result = await res.json()
      setStatus(`Notification created successfully. Sent to ${result.notification.recipients.length} recipient(s).`)
      resetForm()
      setIsFormOpen(false)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'An error occurred while creating the notification. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const notifyAllAttendees = async () => {
    const id = eventIdParam || 1
    setError(null)
    setStatus(null)
    try {
      const res = await fetch(`/api/events/${id}/attendees`)
      if (!res.ok) throw new Error('Failed to fetch attendees')
      const data = await res.json()
      const emails = data.map((a: any) => a.email).filter(Boolean)
      if (emails.length === 0) {
        setError('No attendees found for this event.')
        return
      }
      setRecipientsInput(emails.join(', '))
      setStatus(`Prefilled ${emails.length} attendee email(s).`)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to load attendees')
    }
  }

    const pageTitle = isEventLoading 
    ? 'Create Event Notification' 
    : `Create ${eventName} Notification`

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
      Notify Attendee(s): {eventName}
    </h1>
    <p className="text-[#953363]">
      Create and send event updates to attendees.
    </p>
  </div>
</div>
    
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          borderRadius: '32px',
          overflow: 'hidden',
          boxShadow: '0 35px 80px rgba(122,0,60,0.25)',
          backgroundColor: 'rgb(122 0 60 / 14%)',
          border: '1px solid #CA99B1',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '32px' }}>
          {/* Left: notification builder */}
          <section
            style={{
              flex: '1 1 50%',
              padding: '48px',
              marginTop: '-20px',
              backgroundColor: 'rgb(249 233 240 / var(--tw-bg-opacity, 1))',
              // background: 'linear-gradient(135deg, #ffffff 0%, #fff8fb 70%)',
              minHeight: '400px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.4em',
                  color: '#AF668A',
                }}
              >
              </p>
              <h1
                style={{
                  fontSize: '2rem',
                  color: '#7A003C',
                  margin: '0 0 8px',
                  fontWeight: 800,
                }}
              >
                
              </h1>
            </div>

            {/* New notification button */}
            {!isFormOpen && (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#7A003C',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 15px 30px rgba(122,0,60,0.25)',
                  marginBottom: '16px',
                }}
              >
                + New Notification
              </button>
            )}

            {status && (
              <div
                style={{
                  marginBottom: '12px',
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: '#ecfdf3',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  fontSize: '14px',
                }}
              >
                {status}
              </div>
            )}

            {error && (
              <div
                style={{
                  marginBottom: '12px',
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '14px',
                }}
              >
                {error}
              </div>
            )}

            {isFormOpen && (
              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
              >

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    htmlFor="recipients"
                    style={{ fontSize: '0.9rem', color: '#7A003C', fontWeight: 600 }}
                  >
                    Recipients (comma or newline separated emails)
                  </label>
                  <textarea
                    id="recipients"
                    value={recipientsInput}
                    onChange={(e) => setRecipientsInput(e.target.value)}
                    rows={3}
                    placeholder="e.g. alice@example.com, bob@example.com"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '14px',
                      border: '1px solid #F3D3DF',
                      fontSize: '15px',
                      color: '#7A003C',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                  <div style={{ marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={notifyAllAttendees}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '12px',
                        border: '1px solid #E6B8D1',
                        backgroundColor: '#fff',
                        color: '#7A003C',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Load attendees
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    htmlFor="message"
                    style={{ fontSize: '0.9rem', color: '#7A003C', fontWeight: 600 }}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Write a clear, concise update for attendees."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '14px',
                      border: '1px solid #F3D3DF',
                      fontSize: '15px',
                      color: '#7A003C',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Audience and Channel selections removed — not used by DB schema */}

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '10px',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      resetForm()
                      setIsFormOpen(false)
                      setError(null)
                      setStatus(null)
                    }}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '999px',
                      border: '1px solid #E6B8D1',
                      backgroundColor: '#fff',
                      color: '#7A003C',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '999px',
                      border: 'none',
                      backgroundColor: '#7A003C',
                      color: '#fff',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 15px 30px rgba(122,0,60,0.25)',
                    }}
                  >
                    {isSubmitting ? 'Sending…' : 'Send notification'}
                  </button>
                </div>
              </form>
            )}
          </section>


        </div>
      </div>
      </section>
    </main>
  )
}

export default function ProtectedCheckIn() {
  return (
    <ProtectedTeamPortal>
      <RouteComponent/>
    </ProtectedTeamPortal>
  );
}
