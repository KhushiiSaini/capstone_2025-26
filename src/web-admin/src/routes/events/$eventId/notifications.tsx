import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/events/$eventId/notifications')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/events/$eventId/notifications"!</div>
}
