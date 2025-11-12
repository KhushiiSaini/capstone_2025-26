import { createFileRoute } from '@tanstack/react-router'
//  EVERYONE 
// THIS IS HEBAH &AKSHITA
export const Route = createFileRoute('/events')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/events"!</div>
}
