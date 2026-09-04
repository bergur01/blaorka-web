#!/usr/bin/env bash
# Deploy-skripta fyrir new.blaorka.is á web1.haukdal.is
#
# Keyrð sem site-notandinn (blaorka-new). Sem root:  deploy-new-blaorka [branch]
#
# Ferli:
#   1. git fetch + reset á origin/<branch> í app/repo
#   2. npm ci + next build (output: standalone)
#   3. Afritar standalone-útgáfuna í app/releases/<tímastimpill>
#   4. Skiptir app/current -> nýja útgáfan og endurræsir systemd-þjónustuna
#   5. Heilsutékk á 127.0.0.1:$PORT – ef það fellur er skipt til baka í fyrri útgáfu
#   6. Hendir gömlum útgáfum (heldur síðustu $KEEP)
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/app}"
REPO_URL="${REPO_URL:-https://github.com/bergur01/blaorka-web.git}"
BRANCH="${1:-${BRANCH:-main}}"
SERVICE="${SERVICE:-new-blaorka}"
PORT="${PORT:-3010}"
KEEP="${KEEP:-5}"

REPO="$APP_DIR/repo"
RELEASES="$APP_DIR/releases"
SHARED="$APP_DIR/shared"
CURRENT="$APP_DIR/current"

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31mVILLA: %s\033[0m\n' "$*" >&2; exit 1; }

# Node úr nvm (CloudPanel setur það upp fyrir site-notandann)
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use default >/dev/null
export NEXT_TELEMETRY_DISABLED=1

mkdir -p "$RELEASES" "$SHARED"
[ -f "$SHARED/.env" ] || die "Vantar $SHARED/.env (HELPDESK_API_URL / HELPDESK_API_KEY)"

log "Sæki kóða ($REPO_URL, branch $BRANCH)"
if [ ! -d "$REPO/.git" ]; then
  git clone --branch "$BRANCH" "$REPO_URL" "$REPO"
fi
cd "$REPO"
git remote set-url origin "$REPO_URL"
git fetch --prune origin
git checkout -q "$BRANCH"
git reset -q --hard "origin/$BRANCH"
COMMIT="$(git rev-parse --short HEAD)"
log "Á commit $COMMIT: $(git log -1 --pretty=%s)"

log "npm ci"
npm ci --no-audit --no-fund

log "next build"
rm -rf .next
npm run build

[ -f .next/standalone/server.js ] || die "Engin .next/standalone/server.js – vantar output: \"standalone\" í next.config.ts á þessu branchi? (er nýjasta commit-ið komið á GitHub?)"

log "Bý til útgáfu"
TS="$(date +%Y%m%d-%H%M%S)"
RELEASE="$RELEASES/$TS-$COMMIT"
mkdir -p "$RELEASE"
cp -a .next/standalone/. "$RELEASE/"
mkdir -p "$RELEASE/.next"
cp -a .next/static "$RELEASE/.next/static"
cp -a public "$RELEASE/public"
ln -sfn "$SHARED/.env" "$RELEASE/.env"
echo "$COMMIT" > "$RELEASE/COMMIT"

PREVIOUS="$(readlink -f "$CURRENT" 2>/dev/null || true)"
ln -sfn "$RELEASE" "$CURRENT"

log "Endurræsi $SERVICE"
sudo -n /usr/bin/systemctl restart "$SERVICE"

log "Heilsutékk á http://127.0.0.1:$PORT/"
ok=0
for i in $(seq 1 30); do
  code="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/" || true)"
  if [ "$code" = "200" ]; then ok=1; break; fi
  sleep 1
done
if [ "$ok" != "1" ]; then
  echo "Þjónustan svarar ekki 200 (síðast: $code). Síðustu línur úr journal:" >&2
  sudo -n /usr/bin/journalctl -u "$SERVICE" -n 30 --no-pager >&2 || true
  if [ -n "$PREVIOUS" ] && [ -d "$PREVIOUS" ]; then
    log "Skipti til baka í $PREVIOUS"
    ln -sfn "$PREVIOUS" "$CURRENT"
    sudo -n /usr/bin/systemctl restart "$SERVICE"
  fi
  die "Deploy mistókst – fyrri útgáfa er í loftinu"
fi

log "Hreinsa gamlar útgáfur (held $KEEP)"
ls -1dt "$RELEASES"/*/ | tail -n +"$((KEEP + 1))" | xargs -r rm -rf

log "Búið – $COMMIT er í loftinu á https://new.blaorka.is ($RELEASE)"
