/**
 * Rellena la duración de cada lección con vídeo consultando Bunny Stream, y avisa de vídeos aún no codificados.
 * Uso: npm run bunny:sync
 */
import { eq, isNotNull } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { getVideo } from '@/lib/bunny';
import { run } from './_bootstrap';

const STATUS: Record<number, string> = { 0: 'creado', 1: 'subido', 2: 'procesando', 3: 'transcodificando', 4: 'listo', 5: 'error', 6: 'subida fallida' };

run(async () => {
  const db = getDb();
  const rows = await db.select().from(schema.lessons).where(isNotNull(schema.lessons.bunnyVideoId));
  console.log(`${rows.length} lecciones con vídeo`);
  for (const l of rows) {
    try {
      const v = await getVideo(l.bunnyVideoId!);
      await db.update(schema.lessons).set({ durationSeconds: Math.round(v.length) }).where(eq(schema.lessons.id, l.id));
      console.log(`  ${l.title}: ${Math.round(v.length)} s, estado ${STATUS[v.status] ?? v.status}${v.status !== 4 ? ` (${v.encodeProgress}%)` : ''}`);
    } catch (err) {
      console.log(`  ${l.title}: ERROR ${err instanceof Error ? err.message : err}`);
    }
  }
});
