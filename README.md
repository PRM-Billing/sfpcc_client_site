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

## Commands

Using a dedicated Netlify site (example name `sfpcc-documents`):

```bash
cd PRM-Web-Deploy
NETLIFY_TOKEN='nfp_...' NETLIFY_SITE_NAME=sfpcc-documents python3 deploy.py --sfpcc-client
```

## New initiative intake — email notifications

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

