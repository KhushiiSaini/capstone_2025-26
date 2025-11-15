import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

// RACHEL AND HIMASHA

export const Route = createFileRoute('/inbox')({
  component: RouteComponent,
})

const heroImageUrl =
  'https://www.eng.mcmaster.ca/wp-content/uploads/2021/05/JHE-Exterior-scaled.jpg'

type NotificationItem = {
  id: number
  eventId?: number | null
  message: string
  recipients?: unknown
  createdAt: string
  read?: boolean
}

// Fetch notifications from database via API
async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch('/api/inbox', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to load notifications')
  return res.json()
}

function RouteComponent() {
  const { data: apiNotifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    retry: 1,
  })

  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Fetch from database and update state
  useEffect(() => {
    if (apiNotifications && apiNotifications.length > 0) {
      setNotifications(apiNotifications)
    } else if (!isLoading && apiNotifications.length === 0) {
      // Database has no notifications
      setNotifications([])
    }
  }, [apiNotifications, isLoading])

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
    if (selectedId === id) {
      setSelectedId(id)
    }
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications

  const selected =
    selectedId != null
      ? notifications.find((n) => n.id === selectedId) ?? null
      : filteredNotifications[0] ?? null

  const unreadCount = notifications.filter((n) => !n.read).length

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
          maxWidth: '1200px',
          borderRadius: '32px',
          overflow: 'hidden',
          boxShadow: '0 35px 80px rgba(122,0,60,0.25)',
          backgroundColor: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '32px',
          }}
        >
          {/* Left: Inbox list + detail */}
          <section
            style={{
              flex: '1 1 60%',
              padding: '40px 40px 48px',
              background: 'linear-gradient(135deg, #ffffff 0%, #fff8fb 70%)',
              minHeight: '420px',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div>
                  <p
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.4em',
                      color: '#AF668A',
                      fontSize: '0.75rem',
                      margin: 0,
                    }}
                  >
                    Team D
                  </p>
                  <h1
                    style={{
                      fontSize: '2rem',
                      color: '#7A003C',
                      margin: '4px 0 0',
                      fontWeight: 800,
                    }}
                  >
                    Notification Inbox
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '999px',
                    border: '1px solid #E6B8D1',
                    backgroundColor:
                      unreadCount === 0 ? '#fff' : 'rgba(149,51,99,0.05)',
                    color: unreadCount === 0 ? '#AF668A' : '#7A003C',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: unreadCount === 0 ? 'default' : 'pointer',
                  }}
                >
                  Mark all as read
                </button>
              </div>
              <p
                style={{
                  margin: 0,
                  color: '#953363',
                  fontSize: '0.95rem',
                }}
              >
                View important updates about your MES events, transportation, and
                waivers in one place.
              </p>
            </div>

            {/* Filter + badge */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: '#FDF4F8',
                  borderRadius: '999px',
                  padding: '4px',
                  border: '1px solid #F3D3DF',
                }}
              >
                {['all', 'unread'].map((key) => {
                  const value = key as 'all' | 'unread'
                  const isActive = filter === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFilter(value)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: isActive ? '#7A003C' : 'transparent',
                        color: isActive ? '#fff' : '#7A003C',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {value === 'all' ? 'All' : 'Unread'}
                    </button>
                  )
                })}
              </div>

              <span
                style={{
                  fontSize: '0.85rem',
                  color: '#953363',
                  backgroundColor: '#FDF4F8',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  border: '1px solid #F3D3DF',
                }}
              >
                Unread: <strong>{unreadCount}</strong>
              </span>
            </div>

            {/* Layout: list + detail */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.6fr)',
                gap: '16px',
                minHeight: '220px',
              }}
            >
              {/* List */}
              <div
                style={{
                  borderRadius: '18px',
                  border: '1px solid #F3D3DF',
                  backgroundColor: '#FDF4F8',
                  padding: '8px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                {filteredNotifications.length === 0 ? (
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: '#953363',
                      padding: '12px',
                      margin: 0,
                    }}
                  >
                    You&apos;re all caught up. No notifications to show.
                  </p>
                ) : (
                  filteredNotifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setSelectedId(n.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 10px 10px 12px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor:
                          selected?.id === n.id ? '#FFE9F3' : '#fff',
                        marginBottom: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '2px',
                          }}
                        >
                          {!n.read && (
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '999px',
                                backgroundColor: '#7A003C',
                              }}
                            />
                          )}
                          <span
                            style={{
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              color: '#7A003C',
                            }}
                          >
                            {n.message.split('.')[0]}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.8rem',
                            color: '#953363',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {n.message}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#AF668A',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {new Date(n.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </button>
                  ))
                )}
              </div>

              {/* Detail */}
              <div
                style={{
                  borderRadius: '18px',
                  border: '1px solid #F3D3DF',
                  backgroundColor: '#fff',
                  padding: '16px 18px',
                  minHeight: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: selected ? 'space-between' : 'center',
                }}
              >
                {selected ? (
                  <>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          textTransform: 'uppercase',
                          letterSpacing: '0.14em',
                          fontSize: '0.7rem',
                          color: '#AF668A',
                        }}
                      >
                        Event Notification
                      </p>
                      <h2
                        style={{
                          margin: '4px 0 6px',
                          fontSize: '1.1rem',
                          color: '#7A003C',
                          fontWeight: 700,
                        }}
                      >
                        {selected.message.split('.')[0]}
                      </h2>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.95rem',
                          lineHeight: 1.6,
                          color: '#953363',
                        }}
                      >
                        {selected.message}
                      </p>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '16px',
                        gap: '8px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: '#AF668A',
                        }}
                      >
                        Received:{' '}
                        {new Date(selected.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                      {!selected.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(selected.id)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '999px',
                            border: 'none',
                            backgroundColor: '#7A003C',
                            color: '#fff',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 10px 20px rgba(122,0,60,0.25)',
                          }}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <p
                    style={{
                      margin: 0,
                      textAlign: 'center',
                      fontSize: '0.95rem',
                      color: '#953363',
                    }}
                  >
                    Select a notification from the list to view its details.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Right: hero / illustration */}
          <section
            style={{
              position: 'relative',
              flex: '1 1 40%',
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
                  fontSize: '2.2rem',
                  lineHeight: 1.2,
                  margin: 0,
                  fontWeight: 800,
                }}
              >
                Stay on top of every update
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
                Your inbox collects door-time reminders, transportation notices,
                waiver prompts, and important messages from MES so that you never
                miss a critical update for your events.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
