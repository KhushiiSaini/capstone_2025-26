import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool, type PoolConfig } from 'pg';
import * as sharedSchema from './schemas/alltables';
import * as overlaySchema from './overlays';

export interface TeamDDatabaseConfig extends PoolConfig {
  /**
   * Whether overlay schemas should be merged with the shared schema.
   * Defaults to true so Team D tables are available.
   */
  useOverlays?: boolean;
}

type SchemaShape = typeof sharedSchema & typeof overlaySchema;

function buildSchema(useOverlays: boolean) {
  return useOverlays ? { ...sharedSchema, ...overlaySchema } : sharedSchema;
}

export function createTeamDDatabase(config: TeamDDatabaseConfig = {}) {
  const {
    useOverlays = true,
    connectionString,
    ...poolConfig
  } = config;

  const resolvedConnectionString =
    connectionString ||
    process.env.DATABASE_URL ||
    'postgresql://user:password@localhost:5432/large_event_db';

  const pool = new Pool({
    ...poolConfig,
    connectionString: resolvedConnectionString,
  });

  const schema = buildSchema(useOverlays);
  const db = drizzle(pool, { schema });

  return { db, pool, schema };
}

const defaultInstance = createTeamDDatabase();

export const db = defaultInstance.db;
export const pool = defaultInstance.pool;
export const schema = defaultInstance.schema;

export type TeamDDatabase = NodePgDatabase<SchemaShape>;
export { sharedSchema, overlaySchema };
