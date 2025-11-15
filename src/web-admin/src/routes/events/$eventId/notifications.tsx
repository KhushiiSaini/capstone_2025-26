// import { createFileRoute } from '@tanstack/react-router'
// // rachel & himasha
// export const Route = createFileRoute('/events/$eventId/notifications')({
//   component: RouteComponent,
// })

// function RouteComponent() {
//   return <div>Hello "/events/$eventId/notifications"!</div>
// }

import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

const heroImageUrl =
  'https://www.eng.mcmaster.ca/wp-content/uploads/2021/05/JHE-Exterior-scaled.jpg'

export const Route = createFileRoute('/events/$eventId/notifications')({
  component: RouteComponent,
})

// rachel & himasha
function RouteComponent() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [recipientsInput, setRecipientsInput] = useState('')
  const [message, setMessage] = useState('')
  const [audience, setAudience] = useState('all')
  const [channel, setChannel] = useState('in_app')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
          eventId: 1, // Default to event 1 as per requirement
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f7ecf5 0%, #fdf7fb 40%, #ffffff 70%)',
        padding: '40px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          borderRadius: '32px',
          overflow: 'hidden',
          boxShadow: '0 35px 80px rgba(122,0,60,0.25)',
          backgroundColor: '#fff',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '32px' }}>
          {/* Left: notification builder */}
          <section
            style={{
              flex: '1 1 50%',
              padding: '48px',
              background: 'linear-gradient(135deg, #ffffff 0%, #fff8fb 70%)',
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
                Team D
              </p>
              <h1
                style={{
                  fontSize: '2rem',
                  color: '#7A003C',
                  margin: '0 0 8px',
                  fontWeight: 800,
                }}
              >
                Notifications (Admin)
              </h1>
              <p style={{ color: '#953363', margin: 0 }}>
                Create and send event updates to attendees.
              </p>
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

          {/* Right: hero/info panel */}
          <section
            style={{
              position: 'relative',
              flex: '1 1 50%',
              minHeight: '320px',
              backgroundImage: `linear-gradient(135deg, rgba(98,0,48,0.8), rgba(149,51,99,0.7)), url(${heroImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div style={{ padding: '48px', color: '#fff' }}>
              <p
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.3em',
                  fontSize: '0.8rem',
                  marginBottom: '12px',
                }}
              >
                MES Event Portal
              </p>
              <h2
                style={{
                  fontSize: '2.4rem',
                  lineHeight: 1.2,
                  margin: 0,
                  fontWeight: 800,
                }}
              >
                Keep attendees informed in real time
              </h2>
              <p
                style={{
                  marginTop: '18px',
                  maxWidth: '480px',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                Use targeted, in-app notifications and email to share key updates about
                door times, transportation, and schedule changes across large MES events.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
