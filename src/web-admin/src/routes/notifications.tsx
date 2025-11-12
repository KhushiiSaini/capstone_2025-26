import { createFileRoute } from '@tanstack/react-router'
// rachel & himasha
export const Route = createFileRoute('/notifications')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/notifications"!</div>
}
