import type { FastifyInstance } from 'fastify';
import { createTeamDDatabase } from '@teamd/database';
import { eq } from 'drizzle-orm';

export async function registerNotificationRoutes(fastify: FastifyInstance) {
  if (!process.env.DATABASE_URL) {
    fastify.log.warn('DATABASE_URL not set. Skipping notification routes.');
    return;
  }

  const { db, schema } = createTeamDDatabase({
    connectionString: process.env.DATABASE_URL,
  });

  // POST /api/notifications - Create a new notification
  fastify.post('/api/notifications', async (request, reply) => {
    try {
      const { title, message, audience, channel, eventId, recipients: bodyRecipients } =
        request.body as {
          title?: string;
          message?: string;
          audience?: string;
          channel?: string;
          eventId?: number;
          recipients?: string[];
        };

      if (!message || !message.trim()) {
        return reply.code(400).send({ error: 'Message is required' });
      }

      // Default eventId to 1 as per requirement
      const event = eventId || 1;

      // If explicit recipients were provided in the request body, use them.
      // Otherwise build recipients array based on audience selection.
      let recipients: string[] = [];

      if (Array.isArray(bodyRecipients) && bodyRecipients.length > 0) {
        recipients = bodyRecipients.map((r) => String(r).trim()).filter(Boolean);
      } else if (audience === 'all' || audience === 'checked_in') {
        const attendees = await db
          .select()
          .from(schema.attendees)
          .where(eq(schema.attendees.eventId, event));

        recipients = attendees
          .filter((att: any) => {
            // If audience is 'checked_in', only include checked-in attendees
            if (audience === 'checked_in') {
              return att.checkedIn === true;
            }
            // Otherwise include all
            return true;
          })
          .map((att: any) => att.email);
      } else if (audience === 'staff') {
        // For staff, you may want to query from a staff/admin table
        // For now, default to empty or handle as needed
        recipients = [];
      }

      // Insert notification into database
      const [notification] = await db
        .insert(schema.notifications)
        .values({
          eventId: event,
          message: message.trim(),
          recipients: JSON.stringify(recipients), // Store as JSON string
          createdAt: new Date(),
        })
        .returning();

      fastify.log.info(
        { notificationId: notification.id, recipientCount: recipients.length },
        'Notification created successfully'
      );

      return reply.code(201).send({
        success: true,
        notification: {
          id: notification.id,
          eventId: notification.eventId,
          message: notification.message,
          recipients,
          createdAt: notification.createdAt,
        },
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Failed to create notification');
      return reply.code(500).send({ error: 'Failed to create notification' });
    }
  });

  // GET /api/notifications - Get all notifications (optional, for admin view)
  fastify.get('/api/notifications', async (_request, reply) => {
    try {
      const notifications = await db
        .select()
        .from(schema.notifications)
        .orderBy(schema.notifications.createdAt);

      return notifications.map((notif: any) => ({
        ...notif,
        recipients:
          typeof notif.recipients === 'string' ? JSON.parse(notif.recipients) : notif.recipients,
      }));
    } catch (error) {
      fastify.log.error({ err: error }, 'Failed to fetch notifications');
      return reply.code(500).send({ error: 'Failed to load notifications' });
    }
  });
}
