import { createFileRoute } from '@tanstack/react-router';

// The route path is automatically derived from the file structure
// Use the parent path ($eventId) to correctly inherit the parameters.
export const Route = createFileRoute('/events/$eventId/notifications')({
  // component: YourNotificationComponent, 
  component: NotificationSenderPage, 
});

function NotificationSenderPage() {
  // Use the route context to correctly access the eventId parameter
  const { eventId } = Route.useParams(); 

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Send Notifications for Event {eventId}</h1>
      <p>This is where the interface for composing and sending notifications will be built.</p>
      {/* ... rest of the form/logic here */}
    </div>
  );
}
