import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_URL: z.string().url().default('http://localhost:3000'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET debe tener al menos 32 caracteres'),
  EMAIL_PROVIDER: z.enum(['console', 'brevo', 'postmark']).default('console'),
  EMAIL_FROM: z.string().default('AG Academy <aula@agacademyaptis.com>'),
  BREVO_API_KEY: z.string().optional(),
  POSTMARK_TOKEN: z.string().optional(),
  BUNNY_STREAM_LIBRARY_ID: z.string().optional(),
  BUNNY_STREAM_API_KEY: z.string().optional(),
  BUNNY_STREAM_TOKEN_KEY: z.string().optional(),
  BUNNY_EMBED_HOST: z.string().default('iframe.mediadelivery.net'),
  /** Host CDN de la librería (vz-xxxx.b-cdn.net). Si se define, se muestran miniaturas de los vídeos. */
  BUNNY_STREAM_CDN_HOST: z.string().optional(),
  KAJABI_API_KEY: z.string().optional(),
  KAJABI_CLIENT_ID: z.string().optional(),
  KAJABI_CLIENT_SECRET: z.string().optional(),
  KAJABI_WEBHOOK_SECRET: z.string().optional(),
  ESTADO_MENSAJE: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

/** Lee y valida las variables de entorno una sola vez. Falla pronto si falta algo esencial. */
export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const detalle = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Variables de entorno inválidas: ${detalle}`);
  }
  cached = parsed.data;
  return cached;
}

export const isProd = () => env().NODE_ENV === 'production';
