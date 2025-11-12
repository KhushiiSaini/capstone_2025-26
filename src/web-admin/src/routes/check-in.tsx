import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/check-in')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/check-in"!</div>
}
