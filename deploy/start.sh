#!/usr/bin/env bash
# Ræsir Next.js standalone-þjóninn úr app/current – kallað af systemd (new-blaorka.service)
set -euo pipefail
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use default >/dev/null
cd "$HOME/app/current"
exec node server.js
