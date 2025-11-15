import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Send, X } from 'lucide-react'

export const Route = createFileRoute('/notifications')({
  component: RouteComponent,
})

function RouteComponent() {
  const [message, setMessage] = useState('')
  const [recipients, setRecipients] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Mock attendees (in production, fetch from API for event 1)
  const mockAttendees = [
    { id: 1, name: 'Alice Johnson', email: 'alice.johnson@mcmaster.ca' },
    { id: 2, name: 'Bob Smith', email: 'bob.smith@mcmaster.ca' },
    { id: 3, name: 'Charlie Brown', email: 'charlie.brown@mcmaster.ca' },
  ]

  const handleToggleRecipient = (email: string) => {
    setRecipients((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    )
  }

  const handleSelectAll = () => {
    if (recipients.length === mockAttendees.length) {
      setRecipients([])
    } else {
      setRecipients(mockAttendees.map((a) => a.email))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      setStatus({ type: 'error', message: 'Message cannot be empty' })
      return
    }

    if (recipients.length === 0) {
      setStatus({ type: 'error', message: 'Please select at least one recipient' })
      return
    }

    setIsLoading(true)
    setStatus(null)

    try {
      // TODO: Send notification to backend API
      // For now, just simulate success
      setStatus({ type: 'success', message: 'Notification sent successfully!' })
      setMessage('')
      setRecipients([])
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to send notification',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white p-8 lg:p-12">
      <div className="max-w-3xl mx-auto">
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
            <button
              onClick={() => setStatus(null)}
              className="hover:opacity-70 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#F9E9F0] border border-[#CA99B1] rounded-2xl p-8 space-y-6">
          {/* Message Input */}
          <div>
            <label className="block text-sm font-semibold text-[#7A003C] mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your notification message..."
              className="w-full px-4 py-3 border border-[#CA99B1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#953363] resize-none"
              rows={5}
            />
            <p className="text-xs text-[#AF668A] mt-1">
              {message.length}/500 characters
            </p>
          </div>

          {/* Recipients */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-[#7A003C]">
                Recipients ({recipients.length}/{mockAttendees.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-[#953363] hover:text-[#7A003C] font-medium transition"
              >
                {recipients.length === mockAttendees.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto border border-[#CA99B1] rounded-xl p-3 bg-white">
              {mockAttendees.length > 0 ? (
                mockAttendees.map((attendee) => (
                  <label key={attendee.id} className="flex items-center p-2 hover:bg-[#F9E9F0] rounded-lg cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={recipients.includes(attendee.email)}
                      onChange={() => handleToggleRecipient(attendee.email)}
                      className="w-4 h-4 rounded border-[#CA99B1] text-[#953363] focus:ring-[#953363]"
                    />
                    <span className="ml-3 text-[#7A003C] font-medium">{attendee.name}</span>
                    <span className="ml-auto text-xs text-[#AF668A]">{attendee.email}</span>
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
      </div>
    </main>
  )
}
