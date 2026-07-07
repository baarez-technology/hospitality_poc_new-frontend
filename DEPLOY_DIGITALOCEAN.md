# Deploying the frontend to DigitalOcean App Platform (static site)

This replaces the previous Vercel deployment. App Platform builds the Vite app
from GitHub, serves `dist/` on DO's global CDN with free auto-managed TLS, and
auto-redeploys on every push to `main`.

The app spec lives in [`.do/app.yaml`](.do/app.yaml).

---

## 1. Set the backend URL (one-time)

`VITE_API_URL` is **inlined into the JS bundle at build time** (Vite), so it is a
`BUILD_TIME` env var in the spec. Edit `.do/app.yaml` and replace
`REPLACE_WITH_BACKEND_URL` with your backend droplet's **public HTTPS root**
(no trailing slash, no `/api`), e.g. `https://api.yourdomain.com`.

The app calls the backend as `${VITE_API_URL}/api/v1/...` (see `src/api/client.ts`).

## 2. Deploy

**Option A — DO Console (no CLI):**
1. Apps → Create App → choose the GitHub repo `baarez-technology/jpark-inn-frontend`, branch `main`.
2. When asked, choose "Import from App Spec" / "Edit your app spec" and paste `.do/app.yaml`,
   or let it autodetect (Resource type = **Static Site**, Build command
   `npm ci && npm run build:skip-check`, Output dir `dist`).
3. Add the env var `VITE_API_URL` (scope: Build time) if not already in the spec.
4. Create resources.

**Option B — doctl CLI:**
```bash
doctl apps create --spec .do/app.yaml          # first deploy -> prints APP_ID
doctl apps update <APP_ID> --spec .do/app.yaml  # later updates
```

App Platform gives you a `https://<app>.ondigitalocean.app` URL. Add a custom
domain under the app's **Settings → Domains** if desired (TLS is automatic).

---

## ⚠️ Two things that must be true on the BACKEND, or the live site breaks

### a) Backend must be served over **HTTPS**
The App Platform site is HTTPS. Browsers **block** an HTTPS page from calling an
`http://` API (mixed content). If the droplet currently exposes `http://IP:8000`,
put a domain + TLS in front of it. On the droplet:
```bash
sudo apt install nginx certbot python3-certbot-nginx
# nginx reverse proxy: api.yourdomain.com -> http://127.0.0.1:8000
sudo certbot --nginx -d api.yourdomain.com
```
Then use `https://api.yourdomain.com` as `VITE_API_URL`.

### b) Backend **CORS** — already fine
The backend `CORSMiddleware` is set to `allow_origins=["*"]` with
`allow_credentials=False`, and the frontend uses Bearer tokens
(`withCredentials: false`). So cross-origin calls from the App Platform URL work
without any backend change. (If you later lock CORS down to specific origins,
remember to add `https://<app>.ondigitalocean.app` and any custom domain.)

---

## Notes
- `vercel.json` is now unused by App Platform (kept for reference / rollback).
- Security response headers from `vercel.json` are not configurable on App
  Platform static sites; the app still sets them via `<meta>`/nginx where it can.
  Front the app with a custom domain + Cloudflare if you need strict header control.
- SPA deep links work via `catchall_document: index.html` in the spec.
- Changing any `VITE_*` value requires a **rebuild** (redeploy), not just a restart.
