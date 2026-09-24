import { env } from '@/lib/env';

const BASE = 'https://api.kajabi.com/v1';

export type ResourceId = { id: string; type: string };
export type JsonApiResource<A = Record<string, unknown>> = {
  id: string;
  type: string;
  attributes: A;
  relationships?: Record<string, { data: ResourceId | ResourceId[] | null }>;
};
export type JsonApiList<A = Record<string, unknown>> = { data: JsonApiResource<A>[]; included?: JsonApiResource[]; links?: { next?: string | null } };
export type JsonApiOne<A = Record<string, unknown>> = { data: JsonApiResource<A>; included?: JsonApiResource[] };

export type PurchaseAttributes = {
  amount_in_cents: number;
  currency: string;
  payment_type: string;
  deactivated_at: string | null;
  deactivation_reason: string | null;
  created_at: string;
  updated_at: string;
};
export type CustomerAttributes = { name: string; email: string; created_at: string };
export type OfferAttributes = { title: string; internal_title: string | null };
export type CourseAttributes = { title: string; description: string | null; thumbnail_url: string | null };
export type ModuleAttributes = { title: string; description: string | null; position: number | string | null; publishing_option: string };
export type LessonAttributes = { title: string; position: number | string | null; status: string; publishing_option: string };

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  const { KAJABI_API_KEY, KAJABI_CLIENT_ID, KAJABI_CLIENT_SECRET } = env();
  if (KAJABI_API_KEY) return KAJABI_API_KEY;
  if (!KAJABI_CLIENT_ID || !KAJABI_CLIENT_SECRET) throw new Error('Configura KAJABI_API_KEY o KAJABI_CLIENT_ID + KAJABI_CLIENT_SECRET');
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const body = { client_id: KAJABI_CLIENT_ID, client_secret: KAJABI_CLIENT_SECRET, grant_type: 'client_credentials' };
  let res = await fetch(`${BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    res = await fetch(`${BASE}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
      body: new URLSearchParams(body).toString(),
    });
  }
  if (!res.ok) throw new Error(`Kajabi oauth/token respondió ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in?: number };
  cachedToken = { value: json.access_token, expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000 };
  return cachedToken.value;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function kajabiGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${await getToken()}`, accept: 'application/vnd.api+json' },
    });
    if (res.status === 429 || res.status >= 500) {
      const wait = Number(res.headers.get('retry-after') ?? 2) * 1000;
      await sleep(Math.min(wait, 15_000));
      continue;
    }
    if (!res.ok) throw new Error(`Kajabi GET ${path} respondió ${res.status}: ${await res.text()}`);
    return (await res.json()) as T;
  }
  throw new Error(`Kajabi GET ${path}: demasiados reintentos`);
}

export async function kajabiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await getToken()}`, 'content-type': 'application/vnd.api+json', accept: 'application/vnd.api+json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Kajabi POST ${path} respondió ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

/** Recorre todas las páginas de un listado JSON:API. */
export async function kajabiListAll<A>(path: string, params: Record<string, string | number> = {}, pageSize = 100): Promise<JsonApiResource<A>[]> {
  const out: JsonApiResource<A>[] = [];
  for (let page = 1; page < 10_000; page++) {
    const res = await kajabiGet<JsonApiList<A>>(path, { ...params, 'page[number]': page, 'page[size]': pageSize });
    out.push(...res.data);
    if (res.data.length < pageSize) break;
    await sleep(120);
  }
  return out;
}

export const relId = (r: JsonApiResource, name: string): string | null => {
  const d = r.relationships?.[name]?.data;
  return d && !Array.isArray(d) ? d.id : null;
};
export const relIds = (r: JsonApiResource, name: string): string[] => {
  const d = r.relationships?.[name]?.data;
  return Array.isArray(d) ? d.map((x) => x.id) : d ? [d.id] : [];
};

export const getCustomer = (id: string) => kajabiGet<JsonApiOne<CustomerAttributes>>(`/customers/${id}`).then((r) => r.data);

export async function findCustomerByEmail(email: string) {
  const res = await kajabiGet<JsonApiList<CustomerAttributes>>('/customers', { 'filter[email_contains]': email, 'page[size]': 10 });
  const wanted = email.trim().toLowerCase();
  return res.data.find((c) => c.attributes.email?.toLowerCase() === wanted) ?? null;
}

export const getPurchasesForCustomer = (customerId: string) =>
  kajabiListAll<PurchaseAttributes>('/purchases', { 'filter[customer_id]': customerId });

export const getAllPurchases = () => kajabiListAll<PurchaseAttributes>('/purchases');

export const getCourseWithStructure = (courseId: string) =>
  kajabiGet<JsonApiOne<CourseAttributes>>(`/courses/${courseId}`, { include: 'modules,lessons,offers' });

export const listOffers = () => kajabiListAll<OfferAttributes>('/offers');
export const listCourses = () => kajabiListAll<CourseAttributes>('/courses');
export const listSites = () => kajabiListAll<{ title?: string; name?: string }>('/sites');
