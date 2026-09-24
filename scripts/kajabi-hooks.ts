/**
 * Registra en Kajabi los webhooks que conceden accesos: purchase, order_created, payment_succeeded.
 * Uso: npm run kajabi:hooks            (lista los hooks actuales y crea los que falten)
 */
import { env } from '@/lib/env';
import { kajabiGet, kajabiPost, listSites, type JsonApiList } from '@/lib/kajabi/client';
import { run } from './_bootstrap';

const EVENTS = ['purchase', 'order_created', 'payment_succeeded'] as const;

run(async () => {
  const { APP_URL, KAJABI_WEBHOOK_SECRET } = env();
  if (!KAJABI_WEBHOOK_SECRET) throw new Error('Define KAJABI_WEBHOOK_SECRET antes de registrar los hooks');
  const target = `${APP_URL}/api/webhooks/kajabi?key=${encodeURIComponent(KAJABI_WEBHOOK_SECRET)}`;

  const sites = await listSites();
  if (!sites.length) throw new Error('La API no devuelve ningún site');
  const siteId = sites[0].id;

  const existing = await kajabiGet<JsonApiList<{ event: string; target_url: string }>>('/hooks', { 'page[size]': 100 });
  console.log('Hooks existentes:');
  for (const h of existing.data) console.log(`  ${h.id}\t${h.attributes.event}\t${h.attributes.target_url}`);

  for (const event of EVENTS) {
    const already = existing.data.find((h) => h.attributes.event === event && h.attributes.target_url === target);
    if (already) {
      console.log(`Ya existe: ${event}`);
      continue;
    }
    const created = await kajabiPost<{ data: { id: string } }>('/hooks', {
      data: { type: 'hooks', attributes: { event, target_url: target }, relationships: { site: { data: { type: 'sites', id: siteId } } } },
    });
    console.log(`Creado ${event}: hook ${created.data.id}`);
  }
});
