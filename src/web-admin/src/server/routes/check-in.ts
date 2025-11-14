import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { createTeamDDatabase } from '@teamd/database';

export async function registerCheckInRoutes(fastify: FastifyInstance) {
  if (!process.env.DATABASE_URL) {
    fastify.log.warn('DATABASE_URL not set. Skipping check-in routes.');
    return;
  }

  const { db, schema } = createTeamDDatabase({
    connectionString: process.env.DATABASE_URL,
  });

  // POST /api/attendees/check-in
  fastify.post('/api/attendees/check-in', async (request, reply) => {
    const body = request.body as { qrCode: string; eventId: number };
    const { qrCode, eventId } = body;

    if (!qrCode || !eventId) {
      return reply.code(400).send({ error: 'QR code and eventId are required.' });
    }

    try {
      // Use a transaction to prevent double-scanning
      await db.transaction(async (tx) => {
        // 1. Find QR code
        const [qrRecord] = await tx
          .select()
          .from(schema.qrCodes)
          .where(eq(schema.qrCodes.code, qrCode));

        if (!qrRecord) {
          return reply.code(404).send({ error: 'QR code not found.' });
        }

        if (qrRecord.checkedInAt) {
          return reply.code(400).send({ error: 'This QR code has already been used.' });
        }

        // 2. Find attendee linked to this QR
        const [attendee] = await tx
          .select()
          .from(schema.attendees)
          .where(eq(schema.attendees.id, qrRecord.attendeeId));

        if (!attendee) {
          return reply.code(404).send({ error: 'Attendee not found.' });
        }

        if (attendee.eventId !== eventId) {
          return reply.code(400).send({ error: 'QR code does not match this event.' });
        }

        // 3. Mark attendee as checked in
        const [updatedAttendee] = await tx
          .update(schema.attendees)
          .set({ checkedIn: true, updatedAt: new Date() })
          .where(eq(schema.attendees.id, attendee.id))
          .returning();

        // 4. Mark QR code as used
        await tx
          .update(schema.qrCodes)
          .set({ checkedInAt: new Date(), updatedAt: new Date() })
          .where(eq(schema.qrCodes.id, qrRecord.id));

        // 5. Return attendee info
        return reply.code(200).send({
          attendeeId: updatedAttendee.id,
          email: updatedAttendee.email,
          checkedIn: updatedAttendee.checkedIn,
        });
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Failed to check in attendee');
      return reply.code(500).send({ error: 'Failed to check in attendee.' });
    }
  });
}
