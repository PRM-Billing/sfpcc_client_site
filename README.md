# SFPCC client-only bundle

Contents here are synced from repo root **`PRM-Web-Deploy/`** and deployed separately so SFPCC never lands on the full PRM document hub.

## What gets copied

Runs automatically when deploying with **`python3 deploy.py --sfpcc-client`**:

- `sfpcc-consolidated-user-stories.html`
- `SFPCC-US18-22-ERP-Estimates-APR27.html` _(APR 2026 US‑18&nbsp;…&nbsp;US‑22 estimate pack)_  
- `SFPCC-US25-BULK-DEMOGRAPHICS-Estimates.html`
- `SFPCC-US25-Bulk-Demographics-Prototype.html` _(interactive UX walkthrough)_  
- `SFPCC-US23-BULK-DEMOGRAPHICS-Estimates.html` _(if present; redirect stub / legacy bookmarks)_

`index.html` in this folder is hand-maintained — only SFPCC entry points linked.

## Deploy to Netlify (`sfpcc-documents`)

**Pushing to GitHub does not update the live site by itself.** The Netlify site must be redeployed after each push.

### Option A — GitHub Actions (recommended)

1. In [Netlify](https://app.netlify.com) → **sfpcc-documents** → **Site configuration** → **General** → copy **Site ID**.
2. Netlify → **User settings** → **Personal access tokens** → create a token.
3. In GitHub → **PRM-Billing/sfpcc_client_site** → **Settings** → **Secrets and variables** → **Actions**, add:
   - `NETLIFY_AUTH_TOKEN` — your Netlify token
   - `NETLIFY_SITE_ID` — site ID from step 1
4. Push to `main` (or run **Actions** → **Deploy to Netlify** → **Run workflow**).

### Option B — Netlify linked to GitHub

Netlify → **sfpcc-documents** → **Build & deploy** → **Link repository** → `PRM-Billing/sfpcc_client_site`, branch `main`, publish directory `.` → **Trigger deploy**.

### Option C — Legacy `deploy.py` (PRM-Web-Deploy repo)

```bash
cd PRM-Web-Deploy
NETLIFY_TOKEN='nfp_...' NETLIFY_SITE_NAME=sfpcc-documents python3 deploy.py --sfpcc-client
```

After deploy, hard-refresh the backlog page (`Ctrl+Shift+R`). The landing view opens **Completed** with the sticky nav and accordion browser.

## What gets copied (legacy deploy.py)

When someone submits **SFPCC-Business-Case-Intake.html**, a Netlify serverless function emails the full Q&A to **osanchez@prmbilling.net**.

### One-time Netlify setup

1. In [Resend](https://resend.com), create an API key and verify the sending domain (`prmbilling.net`) if you want mail from your domain.
2. In the **sfpcc-documents** Netlify site → **Site configuration** → **Environment variables**, add:

| Variable | Example | Required |
|----------|---------|----------|
| `RESEND_API_KEY` | `re_...` | Yes |
| `INTAKE_FROM_EMAIL` | `SFPCC Intake <intake@prmbilling.net>` | Recommended |
| `INTAKE_NOTIFY_TO` | `osanchez@prmbilling.net` | Optional (this is the default) |

3. Redeploy the site so `netlify/functions/sfpcc-intake-notify.mjs` is published.

Without `RESEND_API_KEY`, the form shows an error on submit. Use **Generate preview** and email the text manually until the key is set.

