import 'dotenv/config';
import { closeDb } from '@/db';

/** Ejecuta un script con manejo de errores y cierre de conexiones. */
export async function run(main: () => Promise<void>) {
  try {
    await main();
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
}

export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'leccion';
