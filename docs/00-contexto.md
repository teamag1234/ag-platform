# Contexto: por qué una plataforma propia

## El problema
Desde febrero de 2025, por una sentencia del Juzgado Mercantil nº 6 de Barcelona
(18/12/2024, vigente hasta el 20/06/2027), LaLiga envía a Movistar, Vodafone,
MásOrange y DIGI listas de IPs que se cortan durante los partidos. Son IPs
compartidas de Cloudflare y otras redes, así que caen miles de webs ajenas.

Kajabi entero (app.kajabi.com, ssl.kajabi.com, *.mykajabi.com, su CDN) resuelve a
IPs de Cloudflare. Nuestro dominio, además, pasaba por nuestro propio proxy de
Cloudflare en un rango de plan gratuito donde el 82 % de las IPs monitorizadas
han sido bloqueadas alguna vez. Resultado: alumnos sin acceso en cada jornada.

## Lo que ya se ha hecho (sept 2026)
- Retirada la redirección a aptisweek.mykajabi.com (rompía los audios).
- Cambio del CNAME a "DNS only" en Cloudflare, como exige la documentación de Kajabi.
- Ticket abierto con Kajabi (conversación 215476025523462) pidiendo IP dedicada o CNAME alternativo.
- Guía de VPN para alumnos y recogida de incidencias con fecha.

## Lo que se decide construir
Un aula propia en servidor con IP dedicada, con el vídeo en Bunny Stream. Primero
como contingencia (fase 1), después como aula principal si funciona (fases 2 y 3).
No se sustituye Kajabi entero: checkout, cuotas, email y landings se quedan.

## Estimaciones de partida
| Fase | Tiempo | Coste orientativo |
|---|---|---|
| 1. Aula de contingencia | 4-8 semanas, 1 dev | 8-15 k€ |
| 2. Aula completa | 4-6 meses, 1-2 devs | 30-70 k€ |
| Infraestructura mensual | servidor 30-80 €, vídeo 50-90 €, copias y monitorización 20-40 € | |

## Riesgos conocidos
- Kajabi no exporta contraseñas ni progreso por API; el progreso se reinicia salvo importación manual.
- Hay que descargar los vídeos originales de Kajabi.
- La protección contra descargas nunca es absoluta.
- Una plataforma propia exige copias, actualizaciones y alguien de guardia.
