# Ledger — First-Deploy Bootstrap

The X106 deploy rule (push → Actions → VPS) assumes the GitHub repo, VPS path, nginx site, and DNS already exist. For this new app, none of them do yet — go through the list below once, then every future `git push` will deploy automatically.

## 1 · Backend (api) needs to merge first

`apps.ledger` is a new Django app inside the existing `x106-api` repo. The frontend can't authenticate against `/api/v1/ledger/*` until the migration is applied on the VPS.

```bash
cd /Users/kynguyenpham/X106/api
git status                         # review the ledger app + settings/urls changes
git add apps/ledger x106/settings/base.py x106/urls.py tests/test_ledger.py
git commit -m "feat(api): add ledger app — token-auth expense tracker"
git push                           # triggers .github/workflows/deploy.yml on x106-api
gh run watch --repo nguyenrot/x106-api --exit-status
```

The deploy step runs `python manage.py migrate --noinput`, which will create `ledger_accounts` and `ledger_transactions` in the production DB. Smoke-check after green:

```bash
curl -fsS https://api.kynguyen.cc/api/v1/ledger/categories
# Should return the 9-category JSON list.
```

## 2 · DNS — Cloudflare A record

In the Cloudflare dashboard for `kynguyen.cc`, add:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | ledger | `103.90.224.186` | Proxied (orange cloud) |

Flexible SSL (the zone-wide default) handles HTTPS at the edge; the VPS origin stays plain HTTP.

## 3 · VPS — nginx vhost + app dir

SSH to `root@103.90.224.186` and run:

```bash
mkdir -p /var/www/ledger

cat > /etc/nginx/sites-available/ledger.kynguyen.cc <<'NGINX'
server {
    listen 80;
    server_name ledger.kynguyen.cc;

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        "upgrade";
        proxy_read_timeout 60s;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/ledger.kynguyen.cc /etc/nginx/sites-enabled/ledger.kynguyen.cc
nginx -t
systemctl reload nginx
```

`pm2` is already installed (other apps use it) — no extra prep needed.

## 4 · GitHub repo + secrets

```bash
cd /Users/kynguyenpham/X106/ledger
git init -b main
git add .
git commit -m "feat(ledger): initial Nuxt 4 + Tailwind v4 scaffold"

gh repo create nguyenrot/ledger --public --source=. --remote=origin --push
# `--push` already pushed the initial commit. The push triggers deploy.yml,
# which will FAIL until the secrets exist — set them BEFORE pushing if you
# want the first run to deploy:
gh secret set VPS_HOST    --repo nguyenrot/ledger --body '103.90.224.186'
gh secret set VPS_SSH_KEY --repo nguyenrot/ledger < ~/.ssh/x106_actions_deploy
```

If the first push happened before secrets were set, re-trigger after:

```bash
cd /Users/kynguyenpham/X106
./deploy.sh ledger
gh run watch --repo nguyenrot/ledger --exit-status
```

## 5 · Verify

```bash
curl -fsSL https://ledger.kynguyen.cc/ -o /dev/null -w 'HTTP %{http_code}\n'
# 200 = SPA shell served. Cloudflare may cache the first 502 briefly — purge
# the zone cache once if it sticks.
```

Open `https://ledger.kynguyen.cc` in a browser — the TokenGate should appear. Click "Tạo account mới" to mint a token, save it somewhere safe, then start logging.

## Future deploys

After bootstrap, the normal X106 flow applies — `git push` triggers Actions automatically. No more manual VPS or DNS work.
