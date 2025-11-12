import { createFileRoute } from '@tanstack/react-router'
// KHUSHII
export const Route = createFileRoute('/users')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/profile"!</div>
}
