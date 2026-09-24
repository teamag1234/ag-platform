# Despliegue del aula

## Requisitos
- Servidor Linux con IP dedicada (Hetzner CX/CPX, OVH o AWS Zaragoza), 2 vCPU y 4 GB bastan para empezar.
- Docker y Docker Compose instalados (`curl -fsSL https://get.docker.com | sh`).
- Dominio `aula.agacademyaptis.com` con un registro A apuntando a la IP del servidor.
  El registro debe estar en modo "DNS only" si la zona sigue en Cloudflare. Nunca proxied.

## Primera puesta en marcha
```bash
git clone https://github.com/teamag1234/ag-platform.git && cd ag-platform
cp .env.example .env            # rellenar: SESSION_SECRET, POSTGRES_PASSWORD, AULA_HOST, APP_URL, email, Bunny, Kajabi
docker compose build
docker compose up -d db
docker compose run --rm jobs npm run db:migrate
docker compose up -d
curl -s https://aula.agacademyaptis.com/api/health
```
Añade a `.env` estas dos variables que solo usa Compose:
```
POSTGRES_PASSWORD=una-contraseña-larga
AULA_HOST=aula.agacademyaptis.com
```

## Contenido
1. Exportar la estructura de un curso desde Kajabi: `docker compose run --rm jobs npm run export:kajabi-course -- <id> <slug>`.
   Sin argumentos lista los cursos. El JSON queda en `content/<slug>.json`.
2. Subir cada vídeo a Bunny: `docker compose run --rm jobs npm run bunny:upload -- /app/content/video.mp4 "Título"` y copiar el GUID en `bunnyVideoId`.
3. Importar: `docker compose run --rm jobs npm run import:course -- content/<slug>.json`. Poner `"published": true` cuando esté listo.

## Bunny Stream (panel de Bunny, en la Video Library)
- Security: activar **Token authentication** y copiar la clave en `BUNNY_STREAM_TOKEN_KEY`.
- Security: **Allowed referrers** = `aula.agacademyaptis.com`. Activar **Block direct URL file access**.
- API: la API key de la librería va en `BUNNY_STREAM_API_KEY`; el id en `BUNNY_STREAM_LIBRARY_ID`.
- Encoding: 360p, 720p y 1080p son suficientes.
- Miniaturas: pon el host CDN de la librería (vz-xxxx.b-cdn.net) en `BUNNY_STREAM_CDN_HOST` y las lecciones mostrarán la imagen del vídeo.
- Duraciones: `docker compose run --rm jobs npm run bunny:sync` rellena la duración de cada lección desde Bunny y avisa de vídeos aún no codificados.

## Kajabi
- Rellenar `KAJABI_API_KEY` (o client id + secret) y un `KAJABI_WEBHOOK_SECRET` largo y aleatorio.
- Registrar los webhooks: `docker compose run --rm jobs npm run kajabi:hooks`.
- Carga inicial de alumnos y accesos: `docker compose run --rm jobs npm run sync:kajabi` (tarda; la primera vez consulta cada cliente).
- Cada curso necesita sus `kajabiOfferIds`; el script de conciliación avisa de las ofertas sin curso.

## Tareas programadas (crontab del servidor)
```
15 3 * * * cd /ruta/ag-platform && docker compose run --rm jobs npm run sync:kajabi >> logs/sync.log 2>&1
45 3 * * * cd /ruta/ag-platform && ./infra/backup.sh >> logs/backup.log 2>&1
```

## Actualizar
```bash
git pull && docker compose build app jobs && docker compose run --rm jobs npm run db:migrate && docker compose up -d app
```

## Comprobación de resiliencia
Antes de abrir a alumnos, desde una conexión española durante un bloqueo activo (ver hayahora.futbol):
`nslookup aula.agacademyaptis.com` debe devolver la IP del servidor, nunca una IP de Cloudflare, y una lección con vídeo debe reproducirse entera.
