# Fase 1: aula de contingencia

## Objetivo
Que un alumno con compra activa pueda ver sus lecciones desde España durante un
partido de LaLiga, sin VPN, en un dominio nuestro que no dependa de Cloudflare.

## Dentro del alcance
- Dominio propio (propuesta: aula.agacademyaptis.com) con DNS fuera de Cloudflare.
- Servidor con IP dedicada en la UE (Hetzner, OVH o AWS Zaragoza).
- Acceso por enlace mágico al email. Sin contraseñas.
- Concesión de acceso automática desde los webhooks de Kajabi.
- Catálogo: cursos, módulos y lecciones con vídeo, texto y PDF.
- Vídeo en Bunny Stream con token firmado y restricción de dominio.
- Progreso básico: lección vista / no vista.
- Los 2-3 cursos más consumidos primero.
- Página de estado "hay fútbol" con enlace al aula, alojada en el mismo servidor.

## Fuera del alcance (fase 2)
- Tests, certificados, comunidad, comentarios.
- Backoffice completo; en fase 1 el contenido se carga por script o panel mínimo.
- Checkout, cuotas, email marketing, landings: siguen en Kajabi.
- App móvil.

## Criterios de aceptación
- Un alumno de prueba con conexión Movistar reproduce una lección completa durante una ventana de bloqueo activa (comprobar en hayahora.futbol).
- Ningún hostname en la ruta de una lección resuelve a IPs de Cloudflare.
- Una compra nueva en Kajabi concede acceso al aula en menos de 5 minutos sin intervención manual.
- Copia de seguridad diaria de base de datos y restauración probada una vez.

## Tareas iniciales (issues)
1. Decidir stack (ADR 0001) y contratar servidor.
2. Dominio y DNS fuera de Cloudflare, certificado TLS.
3. Esquema de datos: alumnos, accesos, cursos, módulos, lecciones, progreso.
4. Login por enlace mágico.
5. Receptor de webhooks de Kajabi y conciliación diaria con la API.
6. Subida de vídeos a Bunny Stream y reproductor con token.
7. Vistas de curso y lección.
8. Página de estado y guía para alumnos.
9. Copias de seguridad y monitorización.
