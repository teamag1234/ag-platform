/**
 * Conciliación con Kajabi.
 * - Sin argumentos: recorre todas las compras y recalcula los accesos de todos los alumnos.
 * - Con un email o un id de cliente: solo ese alumno.
 * Uso: npm run sync:kajabi            |  npm run sync:kajabi -- alumno@email.com
 */
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { getAllPurchases, getCustomer, relId } from '@/lib/kajabi/client';
import { applyPurchases, syncCustomerGrants, syncGrantsByEmail, upsertStudentFromKajabi } from '@/lib/kajabi/grants';
import { run } from './_bootstrap';

run(async () => {
  const arg = process.argv[2];
  if (arg) {
    const result = arg.includes('@') ? await syncGrantsByEmail(arg, 'kajabi_sync') : await syncCustomerGrants(arg, 'kajabi_sync');
    console.log(result ? JSON.stringify(result, null, 2) : 'No existe ese cliente en Kajabi');
    return;
  }

  const db = getDb();
  const purchases = await getAllPurchases();
  const byCustomer = new Map<string, typeof purchases>();
  for (const p of purchases) {
    const cid = relId(p, 'customer');
    if (!cid) continue;
    byCustomer.set(cid, [...(byCustomer.get(cid) ?? []), p]);
  }
  console.log(`${purchases.length} compras de ${byCustomer.size} clientes`);

  let done = 0;
  const unmapped = new Set<string>();
  for (const [customerId, list] of byCustomer) {
    let student = await db.query.students.findFirst({ where: eq(schema.students.kajabiCustomerId, customerId) });
    if (!student) {
      const c = await getCustomer(customerId);
      const row = await upsertStudentFromKajabi({ id: c.id, email: c.attributes.email, name: c.attributes.name });
      student = { ...row, name: c.attributes.name, kajabiCustomerId: c.id, createdAt: new Date(), lastLoginAt: null };
    }
    const r = await applyPurchases({ id: student.id, email: student.email }, list, 'kajabi_sync');
    r.unmappedOffers.forEach((o) => unmapped.add(o));
    if (++done % 100 === 0) console.log(`  ${done}/${byCustomer.size}`);
  }
  console.log(`Hecho: ${done} clientes conciliados.`);
  if (unmapped.size) console.log(`Ofertas de Kajabi sin curso asociado (añádelas en kajabiOfferIds del curso): ${[...unmapped].join(', ')}`);
});
