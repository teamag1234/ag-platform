/**
 * Sube un vídeo a Bunny Stream desde un archivo local o desde una URL pública.
 * Uso: npm run bunny:upload -- ./video.mp4 "Título"     |  npm run bunny:upload -- https://... "Título"
 * Imprime el GUID para ponerlo en bunnyVideoId.
 */
import { createReadStream, statSync } from 'node:fs';
import { Readable } from 'node:stream';
import { createVideo, fetchVideoFromUrl, uploadVideoBinary } from '@/lib/bunny';
import { run } from './_bootstrap';

run(async () => {
  const [source, title] = process.argv.slice(2);
  if (!source || !title) throw new Error('Uso: bunny:upload <archivo|url> "<título>"');

  if (/^https?:\/\//.test(source)) {
    const r = await fetchVideoFromUrl(source, title);
    console.log(`Bunny está descargando el vídeo: ${r.message ?? 'ok'}. Busca su GUID en el panel de Bunny por el título "${title}".`);
    return;
  }

  const size = statSync(source).size;
  const video = await createVideo(title);
  console.log(`Vídeo creado: ${video.guid}. Subiendo ${(size / 1e6).toFixed(1)} MB…`);
  await uploadVideoBinary(video.guid, Readable.toWeb(createReadStream(source)) as ReadableStream, size);
  console.log(`Subido. bunnyVideoId = ${video.guid}`);
});
