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

Set **whole-site Password Protection** (or SSO) **only on that Netlify site**. Keep `prm-documents` URLs internal.
