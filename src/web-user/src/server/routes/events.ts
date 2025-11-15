import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { createTeamDDatabase } from "@teamd/database";
import crypto from "crypto";

export async function registerStudentEvent(fastify: FastifyInstance) {
  // Ensure DB exists
  if (!process.env.DATABASE_URL) {
    fastify.log.warn("DATABASE_URL not set. Skipping event routes.");
    return;
  }

  const { db, schema } = createTeamDDatabase({
    connectionString: process.env.DATABASE_URL,
  });

  const { events, attendees, qrCodes, users } = schema;

  // --------------------------------------------------------------------
  // GET /api/events → return all events
  // --------------------------------------------------------------------
  fastify.get("/api/events", async (_request, reply) => {
    try {
      const all = await db.select().from(events).orderBy(events.date);
      return reply.send(all);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: "Failed to fetch events" });
    }
  });

  // --------------------------------------------------------------------
  // GET /api/users/:id/registrations
  // Returns all events a user is registered for + QR code
  // --------------------------------------------------------------------
  fastify.get("/api/users/:id/registrations", async (request, reply) => {
    const userId = Number(request.params["id"]);

    try {
      // Fetch user to ensure they exist
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      // Fetch all events this user is registered for along with QR code
      const registrations = await db
        .select({
          attendeeId: attendees.id,
          qr: qrCodes.code,
          eventId: events.id,
          eventName: events.name,
          eventDate: events.date,
          eventLocation: events.location,
        })
        .from(attendees)
        .leftJoin(events, eq(events.id, attendees.eventId))
        .leftJoin(qrCodes, eq(qrCodes.attendeeId, attendees.id))
        .where(eq(attendees.userId, userId))
        .orderBy(events.date);

      return reply.send({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        events: registrations,
      });
    } catch (err) {
      fastify.log.error(err);
      return reply
        .status(500)
        .send({ error: "Failed to fetch user registrations" });
    }
  });

  // --------------------------------------------------------------------
  // POST /api/events/:id/register
  // Creates:
  // 1. attendee row
  // 2. qr_codes row
  // Returns: { qr: "QR-xxxx" }
  // --------------------------------------------------------------------
  fastify.post("/api/events/:id/register", async (request, reply) => {
    const eventId = Number(request.params["id"]);

    try {
      // ---------------------------------------------------------
      // TODO: REPLACE WITH REAL USER ID AFTER LOGIN SYSTEM WORKS
      // ---------------------------------------------------------
      const userId = 3;

      // Fetch user info
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      // ---------------------------------------------------------
      // 1. Insert attendee row (snapshot of user data)
      // ---------------------------------------------------------
      const [attendeeRow] = await db
        .insert(attendees)
        .values({
          userId,
          eventId,
          name: `${user.firstName} ${user.lastName}`, // add this

          email: user.email,
          phoneNumber: user.phoneNumber,
          dietaryRestrictions: user.dietaryRestrictions,
          program: user.program,
          year: user.year,
        })
        .returning();

      // ---------------------------------------------------------
      // 2. Generate QR code (random, unique)
      // ---------------------------------------------------------
      const qrString = "QR-" + crypto.randomBytes(16).toString("hex");

      // ---------------------------------------------------------
      // 3. Insert into qr_codes table
      // ---------------------------------------------------------
      await db.insert(qrCodes).values({
        code: qrString,
        attendeeId: attendeeRow.id,
      });

      // Frontend reads data.qr
      return reply.send({
        success: true,
        qr: qrString,
        attendeeId: attendeeRow.id,
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: "Registration failed" });
    }
  });
}
