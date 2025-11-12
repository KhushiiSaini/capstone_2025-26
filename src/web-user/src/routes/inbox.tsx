import { createFileRoute } from '@tanstack/react-router'
// RACHEL AND HIMASHA
export const Route = createFileRoute('/inbox')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/inbox"!</div>
}
