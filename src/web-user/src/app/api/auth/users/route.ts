import { NextResponse } from 'next/server';
import { createTeamDDatabase } from '@teamd/database';

const { db, schema } = createTeamDDatabase({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const users = await db.select().from(schema.users).orderBy(schema.users.id);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
