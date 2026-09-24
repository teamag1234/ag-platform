import { createHash } from 'node:crypto';
import { env } from '@/lib/env';

const STREAM_API = 'https://video.bunnycdn.com';

function libraryConfig() {
  const { BUNNY_STREAM_LIBRARY_ID, BUNNY_STREAM_API_KEY, BUNNY_STREAM_TOKEN_KEY, BUNNY_EMBED_HOST } = env();
  return { libraryId: BUNNY_STREAM_LIBRARY_ID, apiKey: BUNNY_STREAM_API_KEY, tokenKey: BUNNY_STREAM_TOKEN_KEY, embedHost: BUNNY_EMBED_HOST };
}

/**
 * URL del reproductor de Bunny firmada con token de un solo alumno.
 * Fórmula oficial: SHA256_HEX(token_security_key + video_id + expires).
 * Se genera en el servidor; la clave nunca llega al navegador.
 */
export function signedEmbedUrl(videoId: string, ttlSeconds = 6 * 60 * 60): string {
  const { libraryId, tokenKey, embedHost } = libraryConfig();
  if (!libraryId) throw new Error('Falta BUNNY_STREAM_LIBRARY_ID');
  const base = `https://${embedHost}/embed/${libraryId}/${videoId}`;
  if (!tokenKey) return `${base}?autoplay=false`;
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const token = createHash('sha256').update(`${tokenKey}${videoId}${expires}`).digest('hex');
  return `${base}?token=${token}&expires=${expires}&autoplay=false`;
}

async function streamRequest<T>(path: string, init: RequestInit): Promise<T> {
  const { libraryId, apiKey } = libraryConfig();
  if (!libraryId || !apiKey) throw new Error('Faltan BUNNY_STREAM_LIBRARY_ID o BUNNY_STREAM_API_KEY');
  const res = await fetch(`${STREAM_API}/library/${libraryId}${path}`, {
    ...init,
    headers: { AccessKey: apiKey, accept: 'application/json', ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Bunny ${init.method ?? 'GET'} ${path} respondió ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

export type BunnyVideo = { guid: string; title: string; status: number; length: number; encodeProgress: number };

export function createVideo(title: string, collectionId?: string) {
  return streamRequest<BunnyVideo>('/videos', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(collectionId ? { title, collectionId } : { title }),
  });
}

/** Bunny descarga el vídeo desde una URL pública (útil para migrar desde otro hosting). */
export function fetchVideoFromUrl(url: string, title: string) {
  return streamRequest<{ success: boolean; message: string | null }>('/videos/fetch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url, title }),
  });
}

/** Sube el binario de un vídeo ya creado con createVideo. */
export async function uploadVideoBinary(videoId: string, body: ReadableStream | Buffer, contentLength?: number) {
  const headers: Record<string, string> = { 'content-type': 'application/octet-stream' };
  if (contentLength) headers['content-length'] = String(contentLength);
  return streamRequest<{ success: boolean; message: string | null }>(`/videos/${videoId}`, {
    method: 'PUT',
    headers,
    body: body as BodyInit,
    // @ts-expect-error duplex es necesario en Node para cuerpos en streaming
    duplex: 'half',
  });
}

export function getVideo(videoId: string) {
  return streamRequest<BunnyVideo>(`/videos/${videoId}`, { method: 'GET' });
}
