import { createFileRoute } from '@tanstack/react-router'
// khushi
export const Route = createFileRoute('/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/profile"!</div>
}
