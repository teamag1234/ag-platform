import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { getDb } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await getDb().execute(sql`select 1`);
    return NextResponse.json({ ok: true, db: 'up', time: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ ok: false, db: 'down', error: err instanceof Error ? err.message : String(err) }, { status: 503 });
  }
}
