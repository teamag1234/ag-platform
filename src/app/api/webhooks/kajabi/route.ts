import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { timingSafeEqual } from 'node:crypto';
import { getDb, schema } from '@/db';
import { env } from '@/lib/env';
import { syncCustomerGrants, syncGrantsByEmail } from '@/lib/kajabi/grants';
import { CUSTOMER_ID_PATHS, EVENT_PATHS, findEmail, findString } from '@/lib/kajabi/payload';

export const dynamic = 'force-dynamic';

function keyIsValid(req: Request): boolean {
  const secret = env().KAJABI_WEBHOOK_SECRET;
  if (!secret) return false;
  const given = new URL(req.url).searchParams.get('key') ?? '';
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Kajabi puede comprobar la URL con un GET; respondemos 200 sin revelar nada. */
export async function GET(req: Request) {
  return keyIsValid(req) ? NextResponse.json({ ok: true }) : new NextResponse('forbidden', { status: 403 });
}

export async function POST(req: Request) {
  if (!keyIsValid(req)) return new NextResponse('forbidden', { status: 403 });

  const payload: unknown = await req.json().catch(() => null);
  if (!payload || typeof payload !== 'object') return new NextResponse('bad request', { status: 400 });

  const eventType = new URL(req.url).searchParams.get('event') ?? findString(payload, EVENT_PATHS);
  const customerId = findString(payload, CUSTOMER_ID_PATHS);
  const email = findEmail(payload);
  const db = getDb();

  const [event] = await db
    .insert(schema.webhookEvents)
    .values({ provider: 'kajabi', eventType, kajabiCustomerId: customerId, email, payload })
    .returning({ id: schema.webhookEvents.id });

  try {
    let result = null;
    if (customerId) result = await syncCustomerGrants(customerId, 'kajabi_webhook');
    else if (email) result = await syncGrantsByEmail(email, 'kajabi_webhook');
    else throw new Error('El webhook no trae customer_id ni email reconocibles');

    await db.update(schema.webhookEvents).set({ processedAt: new Date() }).where(eq(schema.webhookEvents.id, event.id));
    return NextResponse.json({ ok: true, synced: result ? { active: result.active.length, revoked: result.revoked.length } : null });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.update(schema.webhookEvents).set({ error: message }).where(eq(schema.webhookEvents.id, event.id));
    console.error('[webhook kajabi]', message);
    // 200 a propósito: el evento queda guardado y la conciliación diaria lo recoge.
    return NextResponse.json({ ok: false, stored: true });
  }
}
