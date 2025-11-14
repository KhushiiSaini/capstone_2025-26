import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { createTeamDDatabase } from '@teamd/database';

export async function registerEventRoutes(fastify: FastifyInstance) {
  if (!process.env.DATABASE_URL) {
    fastify.log.warn('DATABASE_URL not set. Skipping event routes.');
    return;
  }

  const { db, schema } = createTeamDDatabase({
    connectionString: process.env.DATABASE_URL,
  });

  // Get all events
  fastify.get('/api/events', async (_request, reply) => {
    try {
      const events = await db.select().from(schema.events).orderBy(schema.events.date);
      return events;
    } catch (error) {
      fastify.log.error({ err: error }, 'Failed to fetch events');
      return reply.code(500).send({ error: 'Failed to load events' });
    }
  });

  // Get single event by ID
  fastify.get('/api/events/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const eventId = Number(id);

    if (Number.isNaN(eventId)) {
      return reply.code(400).send({ error: 'Invalid event id' });
    }

    try {
      const [event] = await db.select().from(schema.events).where(eq(schema.events.id, eventId));
      if (!event) {
        return reply.code(404).send({ error: 'Event not found' });
      }
      return event;
    } catch (error) {
      fastify.log.error({ err: error }, 'Failed to fetch event');
      return reply.code(500).send({ error: 'Failed to load event' });
    }
  });

  // Get attendees for an event
  fastify.get('/api/events/:id/attendees', async (request, reply) => {
    const { id } = request.params as { id: string };
    const eventId = Number(id);

    if (Number.isNaN(eventId)) {
      return reply.code(400).send({ error: 'Invalid event id' });
    }

    try {
      const attendees = await db
        .select()
        .from(schema.attendees)
        .where(eq(schema.attendees.eventId, eventId));
      return attendees;
    } catch (error) {
      fastify.log.error({ err: error }, 'Failed to fetch attendees');
      return reply.code(500).send({ error: 'Failed to load attendees' });
    }
  });

  
  // Create new event
  fastify.post('/api/events', async (request, reply) => {
    const body = request.body as Partial<typeof schema.events.$inferInsert>;

    if (!body.name || !body.date) {
      return reply.code(400).send({ error: 'Event name and date are required' });
    }

    try {
      const [newEvent] = await db.insert(schema.events).values(body).returning();
      return newEvent;
    } catch (error) {
      fastify.log.error({ err: error }, 'Failed to create event');
      return reply.code(500).send({ error: 'Failed to create event' });
    }
  });

  // Optional: update event
  // fastify.put('/api/events/:id', async (request, reply) => {
  //   const { id } = request.params as { id: string };
  //   const eventId = Number(id);
  //   const body = request.body as Partial<typeof schema.events.$inferInsert>;

  //   if (Number.isNaN(eventId)) {
  //     return reply.code(400).send({ error: 'Invalid event id' });
  //   }

  //   try {
  //     const [updatedEvent] = await db
  //       .update(schema.events)
  //       .set({ ...body, updatedAt: new Date() })
  //       .where(eq(schema.events.id, eventId))
  //       .returning();

  //     if (!updatedEvent) {
  //       return reply.code(404).send({ error: 'Event not found' });
  //     }

  //     return updatedEvent;
  //   } catch (error) {
  //     fastify.log.error({ err: error }, 'Failed to update event');
  //     return reply.code(500).send({ error: 'Failed to update event' });
  //   }
  // });
}
