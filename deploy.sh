#!/usr/bin/env bash
# Manual fallback: extract /tmp/ledger-deploy.tar.gz built by GitHub Actions,
# then recreate the PM2 process. Production deploys go through Actions
# (.github/workflows/deploy.yml). Use this only for emergency rollback
# or when Actions is unavailable.
set -euo pipefail

APP_DIR="/var/www/ledger"
PM2_NAME="ledger-pkn"
PORT="3005"
ARCHIVE="${1:-/tmp/ledger-deploy.tar.gz}"

[ -f "$ARCHIVE" ] || { echo "no archive at $ARCHIVE"; exit 1; }

cd "$APP_DIR"
tar xzf "$ARCHIVE"

pm2 delete "$PM2_NAME" >/dev/null 2>&1 || true
PORT="$PORT" pm2 start .output/server/index.mjs --name "$PM2_NAME" --update-env
pm2 save --force >/dev/null
echo "[ledger] manual deploy done"
