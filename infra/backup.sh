#!/usr/bin/env bash
# Copia de seguridad diaria de la base de datos. Ejecutar desde la raíz del repo (cron).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p backups
fecha=$(date +%Y%m%d-%H%M)
docker compose exec -T db pg_dump -U ag ag_platform | gzip > "backups/ag_platform-$fecha.sql.gz"
find backups -name 'ag_platform-*.sql.gz' -mtime +14 -delete
# Opcional: copia externa con rclone (configura un remoto llamado "backup")
if command -v rclone >/dev/null 2>&1 && rclone listremotes | grep -q '^backup:'; then
  rclone copy backups backup:ag-platform-backups --min-age 1m
fi
echo "Copia hecha: backups/ag_platform-$fecha.sql.gz"
