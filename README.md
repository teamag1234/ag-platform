# AG Platform

Plataforma propia de AG Academy: aula virtual, vídeo y progreso de alumnos.
Sustituye progresivamente a Kajabi, empezando por el aula. Kajabi sigue siendo
la tienda, el CRM y el email al menos hasta 2027.

## Por qué

Los bloqueos de IPs de LaLiga dejan la plataforma inaccesible desde España en
cada jornada, y con Kajabi no controlamos ni el servidor ni la red por la que
sale. Contexto completo en `docs/00-contexto.md`.

## Fases

| Fase | Qué | Cuándo |
|---|---|---|
| 1. Aula de contingencia | Copia del área de alumno en servidor propio con IP dedicada, vídeo en Bunny Stream, acceso por enlace mágico | oct-nov 2026 |
| 2. Aula completa | Progreso, PDFs, tests, certificados, backoffice | 1T-2T 2027 |
| 3. Aula principal | El aula propia pasa a ser la principal; Kajabi solo ventas, email y landings | decisión en 1T 2027 |

Alcance detallado de la fase 1 en `docs/01-fase-1-aula-contingencia.md`.

## Cómo trabajamos

- `main` está protegida. Nadie hace push directo, ni personas ni sesiones de Claude Code.
- Cada tarea va en su rama: `nombre/tipo-descripcion` (ej. `jesu/feat-login-enlace-magico`).
- Cada rama termina en un Pull Request revisado por otra persona del equipo.
- Las tareas viven en el tablero de GitHub Projects de este repo. Un issue por tarea.
- Las decisiones técnicas se escriben en `docs/decisiones/` como notas cortas (ADR).
- Las sesiones de Claude Code siguen las reglas de `CLAUDE.md`.

## Estructura

```
src/app            páginas y rutas del aula (Next.js App Router)
src/lib/auth       sesión y enlaces mágicos
src/lib/kajabi     cliente de la API, conciliación de accesos, lectura de webhooks
src/lib/bunny.ts   Bunny Stream: URLs firmadas y subida de vídeos
src/db             esquema Drizzle y conexión a Postgres
drizzle/           migraciones generadas
scripts/           importar/exportar cursos, conciliar con Kajabi, subir vídeos, registrar webhooks
content/           definición de cursos en JSON (una por curso)
infra/             Caddy, copias de seguridad y guía de despliegue
docs/              contexto, alcance y decisiones
```

## Arrancar en local

```bash
cp .env.example .env        # DATABASE_URL, SESSION_SECRET y EMAIL_PROVIDER=console bastan para empezar
npm install
npm run db:migrate
npm run import:course -- content/ejemplo-curso.json
npm run grant -- tu@email.com curso-de-prueba
npm run dev                 # http://localhost:3000/acceso, el enlace mágico sale por consola
```

Despliegue en servidor: `infra/README.md`.
