# Reglas para sesiones de Claude Code en este repo

## Idioma y tono
- Todo en español: commits, PRs, issues, documentación y comentarios de código.
- Mensajes de commit cortos, en imperativo: "Añade login por enlace mágico".

## Ramas y PRs
- Nunca hagas push a `main`. Trabaja siempre en una rama `nombre/tipo-descripcion`.
- Tipos: `feat`, `fix`, `docs`, `infra`, `chore`.
- Abre un PR por tarea. Un PR resuelve un issue; enlázalo en la descripción.
- No hagas rebase ni force-push sobre ramas de otras personas.
- Antes de abrir el PR: lint, typecheck y tests del paquete tocado deben pasar.

## Principios técnicos (no negociables salvo ADR que lo cambie)
- Ninguna dependencia de Cloudflare en la ruta crítica de una lección: DNS, app, API y vídeo resuelven fuera de Cloudflare.
- El servidor de la app tiene IP dedicada. Nada de CDN compartida delante de la app.
- El vídeo no se construye: se usa Bunny Stream con URLs firmadas por token y restricción de dominio.
- Kajabi sigue siendo la fuente de verdad de compras y contactos. Los accesos al aula se conceden por webhook de Kajabi (purchase, order_created, payment_succeeded) y por la conciliación diaria. El script `npm run grant` es solo para pruebas y piloto; nunca se editan accesos a mano en producción.
- Acceso de alumnos por enlace mágico al email. No se migran contraseñas.
- Secretos solo en variables de entorno. Nunca en el repo, ni en ejemplos.
- Datos personales de alumnos: alojamiento en la UE, mínimo necesario, nada en logs.

## Cómo se verifica un cambio
- `npm run typecheck`, `npm run lint` y `npm run build` deben pasar antes de abrir el PR (es lo que ejecuta la CI).
- Para probar con base de datos: `docker compose up -d db` o un Postgres local, `npm run db:migrate`, `npm run import:course -- content/ejemplo-curso.json`, `npm run grant -- tu@email.com curso-de-prueba` y `npm run dev`. Con `EMAIL_PROVIDER=console` el enlace mágico sale por la consola.
- Cambios de esquema: editar `src/db/schema.ts`, ejecutar `npm run db:generate` y subir la migración generada en `drizzle/`.

## Marca
- Colores: navy #0a0e27, dorado #FFBD59, verde #00ff88 solo en materiales de afiliados.
- Tipografía Poppins. Prefijo de clases CSS `ag-`.

## Decisiones
- Cualquier decisión de arquitectura se escribe en `docs/decisiones/NNNN-titulo.md` con estado (propuesta, aceptada, sustituida).
- Si una tarea requiere una decisión que no existe, para y abre un issue con la propuesta en vez de decidir en el código.
