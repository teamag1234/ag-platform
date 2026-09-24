#!/usr/bin/env bash
# Instalador del aula de AG Academy en un servidor Ubuntu limpio (22.04 o 24.04).
#
# Uso (como root, en el servidor):
#   GITHUB_TOKEN=<token de lectura del repo> bash install.sh aula.agacademyaptis.com tu@email.com
#
# Qué hace: instala Docker, clona el repo en /opt/ag-platform, crea el .env con secretos aleatorios,
# arranca base de datos, app y Caddy (certificado automático), aplica migraciones, importa el curso
# de ejemplo, da acceso al email indicado e imprime un enlace para entrar.
set -euo pipefail

AULA_HOST="${1:-}"
ADMIN_EMAIL="${2:-}"
REPO="teamag1234/ag-platform"
DIR="/opt/ag-platform"

if [[ -z "$AULA_HOST" || -z "$ADMIN_EMAIL" ]]; then
  echo "Uso: GITHUB_TOKEN=... bash install.sh <dominio-del-aula> <tu-email>"; exit 1
fi
if [[ $EUID -ne 0 ]]; then echo "Ejecuta este script como root (sudo -i)"; exit 1; fi

echo "==> Paquetes base"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq && apt-get install -y -qq git curl ca-certificates openssl >/dev/null

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Instalando Docker"
  curl -fsSL https://get.docker.com | sh >/dev/null
fi
systemctl enable --now docker >/dev/null 2>&1 || true

echo "==> Código"
if [[ -d "$DIR/.git" ]]; then
  git -C "$DIR" pull -q
else
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    git clone -q "https://${GITHUB_TOKEN}@github.com/${REPO}.git" "$DIR"
  else
    git clone -q "https://github.com/${REPO}.git" "$DIR"
  fi
  # No dejar el token en la configuración del remoto
  git -C "$DIR" remote set-url origin "https://github.com/${REPO}.git"
fi
cd "$DIR"

if [[ ! -f .env ]]; then
  echo "==> Creando .env con secretos aleatorios"
  cp .env.example .env
  sed -i "s|^APP_URL=.*|APP_URL=https://${AULA_HOST}|" .env
  sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=$(openssl rand -hex 32)|" .env
  sed -i "s|^KAJABI_WEBHOOK_SECRET=.*|KAJABI_WEBHOOK_SECRET=$(openssl rand -hex 24)|" .env
  {
    echo ""
    echo "# Solo para Docker Compose"
    echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)"
    echo "AULA_HOST=${AULA_HOST}"
  } >> .env
fi

echo "==> Construyendo e iniciando (la primera vez tarda unos minutos)"
docker compose build -q
docker compose up -d db
docker compose run --rm -T jobs npm run -s db:migrate
docker compose up -d app caddy
docker compose run --rm -T jobs npm run -s import:course -- content/ejemplo-curso.json
docker compose run --rm -T jobs npm run -s grant -- "$ADMIN_EMAIL" curso-de-prueba

echo "==> Esperando a la app"
for i in $(seq 1 30); do
  if docker compose exec -T app wget -qO- http://localhost:3000/api/health 2>/dev/null | grep -q '"ok":true'; then break; fi
  sleep 2
done

mkdir -p logs
( crontab -l 2>/dev/null | grep -v 'ag-platform' ; \
  echo "15 3 * * * cd $DIR && docker compose run --rm -T jobs npm run -s sync:kajabi >> logs/sync.log 2>&1" ; \
  echo "45 3 * * * cd $DIR && ./infra/backup.sh >> logs/backup.log 2>&1" ) | crontab -

echo
echo "=============================================================="
echo " Aula instalada en https://${AULA_HOST}"
echo " (el certificado tarda menos de un minuto la primera vez)"
echo
echo " Enlace de acceso para ${ADMIN_EMAIL}:"
docker compose run --rm -T jobs npm run -s enlace -- "$ADMIN_EMAIL" | head -1
echo
echo " Siguientes pasos: rellena en ${DIR}/.env las claves de Bunny, Kajabi y email,"
echo " y ejecuta: cd ${DIR} && docker compose up -d app"
echo "=============================================================="
