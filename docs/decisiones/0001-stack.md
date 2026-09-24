# ADR 0001: stack de la plataforma

Estado: aceptada (24-09-2026). Implementada en el esqueleto inicial del repo.

## Propuesta
- Aplicación: Next.js con TypeScript (ya se usa en kajabi-airtable-sync).
- Base de datos: PostgreSQL.
- Vídeo: Bunny Stream (red propia, no Cloudflare; token y restricción de dominio).
- Email transaccional (enlaces mágicos): proveedor con envío desde dominio propio, a decidir.
- Hosting: servidor con IP dedicada en la UE, Docker, despliegue con Coolify o similar.
- DNS: fuera de Cloudflare.

## Alternativas consideradas
- Laravel + Postgres: válido, mismo coste; se descarta solo por continuidad con el código existente.
- WordPress + LearnDash: rápido, pero mantenimiento de plugins y peor control del vídeo.
- Otro SaaS de cursos: Thinkific, Podia, LearnWorlds, Kartra y Circle resuelven a Cloudflare; mueve el problema de sitio.

## Consecuencias
- Un desarrollador con Next.js y Postgres puede empezar la fase 1 sin formación previa.
- El vídeo no se construye; el coste mensual depende del consumo (céntimos por GB).
- La operación (copias, actualizaciones, guardia) pasa a ser nuestra.
