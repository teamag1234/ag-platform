import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { env } from '@/lib/env';

export type Db = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { agPool?: Pool; agDb?: Db };

/** Conexión perezosa: se crea en la primera consulta, no al importar el módulo. */
export function getDb(): Db {
  if (globalForDb.agDb) return globalForDb.agDb;
  const pool = new Pool({ connectionString: env().DATABASE_URL, max: 10 });
  const db = drizzle(pool, { schema });
  globalForDb.agPool = pool;
  globalForDb.agDb = db;
  return db;
}

export async function closeDb() {
  await globalForDb.agPool?.end();
  globalForDb.agPool = undefined;
  globalForDb.agDb = undefined;
}

export { schema };
