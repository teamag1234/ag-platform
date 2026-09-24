import { and, eq, inArray } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { getCustomer, getPurchasesForCustomer, findCustomerByEmail, relId, type JsonApiResource, type PurchaseAttributes } from './client';

export type GrantSource = 'kajabi_webhook' | 'kajabi_sync';
export type SyncResult = { email: string; studentId: string; active: string[]; revoked: string[]; unmappedOffers: string[] };

/** Crea o actualiza el alumno a partir del cliente de Kajabi. */
export async function upsertStudentFromKajabi(customer: { id: string; email: string; name?: string | null }) {
  const db = getDb();
  const email = customer.email.trim().toLowerCase();
  const [row] = await db
    .insert(schema.students)
    .values({ email, name: customer.name ?? null, kajabiCustomerId: customer.id })
    .onConflictDoUpdate({
      target: schema.students.email,
      set: { name: customer.name ?? null, kajabiCustomerId: customer.id },
    })
    .returning({ id: schema.students.id, email: schema.students.email });
  return row;
}

/**
 * Recalcula los accesos de un alumno a partir de sus compras en Kajabi.
 * Kajabi es la fuente de verdad: una compra activa concede el curso, todas desactivadas lo revocan.
 */
export async function applyPurchases(
  student: { id: string; email: string },
  purchases: JsonApiResource<PurchaseAttributes>[],
  source: GrantSource,
): Promise<SyncResult> {
  const db = getDb();
  const offerIds = [...new Set(purchases.map((p) => relId(p, 'offer')).filter((x): x is string => !!x))];
  const mappings = offerIds.length
    ? await db.select().from(schema.kajabiOfferCourses).where(inArray(schema.kajabiOfferCourses.kajabiOfferId, offerIds))
    : [];
  const coursesByOffer = new Map<string, string[]>();
  for (const m of mappings) coursesByOffer.set(m.kajabiOfferId, [...(coursesByOffer.get(m.kajabiOfferId) ?? []), m.courseId]);

  const unmappedOffers = offerIds.filter((o) => !coursesByOffer.has(o));
  const perCourse = new Map<string, { active: boolean; purchaseId: string; offerId: string }>();
  for (const p of purchases) {
    const offerId = relId(p, 'offer');
    if (!offerId) continue;
    const active = !p.attributes.deactivated_at;
    for (const courseId of coursesByOffer.get(offerId) ?? []) {
      const prev = perCourse.get(courseId);
      if (!prev || (active && !prev.active)) perCourse.set(courseId, { active, purchaseId: p.id, offerId });
    }
  }

  const result: SyncResult = { email: student.email, studentId: student.id, active: [], revoked: [], unmappedOffers };
  const now = new Date();
  for (const [courseId, info] of perCourse) {
    await db
      .insert(schema.grants)
      .values({
        studentId: student.id,
        courseId,
        status: info.active ? 'active' : 'revoked',
        source,
        kajabiPurchaseId: info.purchaseId,
        kajabiOfferId: info.offerId,
        revokedAt: info.active ? null : now,
      })
      .onConflictDoUpdate({
        target: [schema.grants.studentId, schema.grants.courseId],
        set: {
          status: info.active ? 'active' : 'revoked',
          source,
          kajabiPurchaseId: info.purchaseId,
          kajabiOfferId: info.offerId,
          updatedAt: now,
          revokedAt: info.active ? null : now,
        },
      });
    (info.active ? result.active : result.revoked).push(courseId);
  }
  return result;
}

export async function syncCustomerGrants(kajabiCustomerId: string, source: GrantSource): Promise<SyncResult> {
  const customer = await getCustomer(kajabiCustomerId);
  const student = await upsertStudentFromKajabi({ id: customer.id, email: customer.attributes.email, name: customer.attributes.name });
  const purchases = await getPurchasesForCustomer(customer.id);
  return applyPurchases(student, purchases, source);
}

export async function syncGrantsByEmail(email: string, source: GrantSource): Promise<SyncResult | null> {
  const customer = await findCustomerByEmail(email);
  if (!customer) return null;
  return syncCustomerGrants(customer.id, source);
}

/** Revoca a mano un acceso concreto (solo pruebas o incidencias). */
export async function revokeGrant(studentId: string, courseId: string) {
  await getDb()
    .update(schema.grants)
    .set({ status: 'revoked', revokedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(schema.grants.studentId, studentId), eq(schema.grants.courseId, courseId)));
}
