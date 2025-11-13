import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { createTeamDDatabase } from '@teamd/database';

export async function registerProfileRoutes(fastify: FastifyInstance) {
  if (!process.env.DATABASE_URL) {
    fastify.log.warn('DATABASE_URL not set. Skipping profile routes.');
    return;
  }

  const { db, schema } = createTeamDDatabase({
    connectionString: process.env.DATABASE_URL,
  });

  fastify.get('/api/auth/users', async (_request, reply) => {
    try {
      const users = await db.select().from(schema.users).orderBy(schema.users.id);
      return users;
    } catch (error) {
      fastify.log.error({ err: error }, 'Failed to fetch users');
      return reply.code(500).send({ error: 'Failed to load users' });
    }
  });

  fastify.get('/api/auth/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = Number(id);

    if (Number.isNaN(userId)) {
      return reply.code(400).send({ error: 'Invalid user id' });
    }

    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId));

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return user;
    } catch (error) {
      fastify.log.error({ err: error }, 'Failed to fetch user');
      return reply.code(500).send({ error: 'Failed to load user' });
    }
  });

  fastify.put('/api/auth/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = Number(id);

    if (Number.isNaN(userId)) {
      return reply.code(400).send({ error: 'Invalid user id' });
    }

    const body = request.body as Partial<typeof schema.users.$inferInsert> & { dob?: string | null };

    const updatePayload: Partial<typeof schema.users.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.firstName !== undefined) updatePayload.firstName = body.firstName;
    if (body.lastName !== undefined) updatePayload.lastName = body.lastName;
    if (body.preferredName !== undefined) updatePayload.preferredName = body.preferredName;
    if (body.email !== undefined) updatePayload.email = body.email;
    if (body.phoneNumber !== undefined) updatePayload.phoneNumber = body.phoneNumber;
    if (body.dietaryRestrictions !== undefined) updatePayload.dietaryRestrictions = body.dietaryRestrictions;
    if (body.emergencyContact !== undefined) updatePayload.emergencyContact = body.emergencyContact;
    if (body.mediaConsent !== undefined) updatePayload.mediaConsent = body.mediaConsent;
    if (body.program !== undefined) updatePayload.program = body.program;
    if (body.year !== undefined) updatePayload.year = body.year;
    if (body.studentNumber !== undefined) updatePayload.studentNumber = body.studentNumber;
    if (body.pronouns !== undefined) updatePayload.pronouns = body.pronouns;
    if (body.dob !== undefined) {
      updatePayload.dob = body.dob ? new Date(body.dob) : null;
    }

    try {
      const [updatedUser] = await db
        .update(schema.users)
        .set(updatePayload)
        .where(eq(schema.users.id, userId))
        .returning();

      if (!updatedUser) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return updatedUser;
    } catch (error) {
      fastify.log.error({ err: error }, 'Failed to update user');
      return reply.code(500).send({ error: 'Failed to update user' });
    }
  });

  fastify.get('/api/auth/profile', async (request, reply) => {
    const { email } = request.query as { email?: string };

    if (!email) {
      return reply.code(400).send({ error: 'Email is required' });
    }

    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return user;
    } catch (error) {
      fastify.log.error({ err: error }, 'Failed to fetch profile');
      return reply.code(500).send({ error: 'Failed to load profile' });
    }
  });
}
