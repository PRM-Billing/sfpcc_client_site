# SFPCC ERP user stories — FE / BE / QA estimates (US-1–11 and US-13)

**Purpose:** Effort for **ClinicSync ERP** (SFPCC), grounded in **actual repository size and delivery history**, not greenfield assumptions.  
**Detail:** Acceptance criteria and technical architecture stay in the **separate implementation specification** (not duplicated here).

**All hours below are floor (minimum) planning values** for incremental work on the current codebase—add buffer only if you need risk margin. **Frontend hours are halved** vs the prior floor (AI-assisted velocity on existing React patterns), **except US-8** (touch signing needs more **FE**). **QA hours are one-quarter** of the prior floor (dev-tested / lean QA; **US-8** gets a slightly larger pass for device matrix).

---

## Correction: why v2.0 numbers were too high

Earlier versions converted **product-spec “person-days”** (risk-heavy, vendor-style) straight to hours (**~1.4k–2.6k h** for US-1–11 + US-13). That implicitly treated each epic as if it were built **from zero** in isolation.

**This codebase is not greenfield.** The SFPCC items are **deltas** on top of an ERP that already includes multi-tenant DB, appointments, sleep study, x-ray, CureMD **automation bots**, document flows, and a large **resource-planning** UI. Estimates below are **incremental engineering + QA** on that foundation.

---

## Evidence from this repository

| Signal | What we see locally |
|--------|----------------------|
| **Git history** | First commits **2026-02-09** through latest **2026-03-20** in version control (~**6 calendar weeks** of concentrated delivery on this thread). |
| **Commit pattern** | ~**24** commits spanning tenant migrations, sleep/x-ray, CureMD automation suite, appointment APIs, resource planning—consistent with **one primary dev** shipping vertical slices quickly (with AI-assisted tooling). |
| **Code volume (indicative)** | ~**25.6k** lines backend JS/TS, ~**39.7k** lines frontend TS/TSX, ~**2.5k** lines Python automation (excluding vendor dependencies)—**on the order of ~65k+** application lines already in place. |

**Implied velocity (order-of-magnitude):** one developer producing the **core product surface** in roughly **4–6 weeks** of focused time (your statement) to **~6 weeks** calendar in git—i.e. **~160 h** net floor engineering for the *initial* big lump at ~40 h/week minimum plausible band. That same velocity profile calibrates **incremental** story hours below.

---

## How to read the numbers now

| Lens | Use when |
|------|-----------|
| **Incremental floor (this document)** | Planning SFPCC work **on top of the current ERP codebase** with the **same** stack and tools (including Cursor / AI-assisted coding). |
| **Conservative / vendor buffer** | Contracts, external team unfamiliar with repo, or heavy compliance gates—see [appendix](#appendix-benchmark-scenario--vendor--greenfield-style-hours). |

**QA** = lean functional/regression pass for that story (**¼** of the prior QA floor); assumes strong dev self-test. **Not** full formal validation.

---

## Rollup — incremental hours (floor only)

| US | Title (short) | BE (h) | FE (h) | Automation (h) | Eng subtotal (h) | QA (h) | Notes |
|----|----------------|--------|--------|----------------:|-----------------:|-------:|--------|
| US-1 | Check-in ERP→CureMD + blank note + order ensure | 40 | 6 | 8 | **54** | **6** | Builds on existing appointments, queues, sleep/x-ray orders |
| US-2 | Inbound CureMD check-in sync + poll | 40 | 6 | — | **46** | **5** | Bulk upsert + worker; maps to existing appointment model |
| US-3 | Signed sleep in MR portal + patient documents | 24 | 12 | — | **36** | **4** | Extends document listing + existing scheduler shell |
| US-4 | Diagnosis & CPT at upload → CureMD | 16 | 6 | 20 | **42** | **4** | Migration + queue metadata + extend existing Playwright bot |
| US-5 | Merge template + report single PDF (sleep) | 16 | 0 | — | **16** | **2** | Sign-and-queue path + PDF merge util; x-ray unchanged |
| US-6 | Clickable status cards filter | 0 | 2 | — | **2** | **1** | Chips + existing filters |
| US-7 | AI pre-fill from scored PDF | 32 | 8 | — | **40** | **6** | New pipeline; most uncertainty remains |
| US-8 | Mobile-friendly sleep signing | 0 | 14 | — | **14** | **4** | Signature surface + layout/stack **FE-heavy**; touch targets, scroll vs draw, narrow breakpoints |
| US-9 | X-ray + legacy (browser workflow) | 0 | 4 | — | **4** | **1** | **Browser-native:** second window / tab + ERP; minimal UI (link or launcher), not embedded frame work |
| US-10 | Weekly compliance prompt (new doctors) | 0 | 3 | — | **3** | **1** | **FE-only:** small static banner/dialog + local dismiss (no BE) |
| US-11 | Resource allocation suggestions (Phase A–B) | 32 | 8 | — | **40** | **5** | **RP feature already large**—suggestions layer + aggregates |
| US-13 | Doctor-approved admin login (Firebase/FCM) | 24 | 8 | — | **32** | **3** | Step-up on existing auth |

**Eng subtotal (US-1–11 + US-13):** **329 h**  
**QA subtotal (same set):** **42 h**  
**Combined (same set):** **371 h**

---

## Calendar view (floor backlog, same velocity as initial build)

Assume the same stack and tooling as the **4–6 week** initial ERP push. Person-hours in the tables do not change with headcount; **calendar** compresses when more people run in parallel (with coordination tax).

| Metric | Value |
|--------|--------|
| Total eng+QA (US-1–11 + US-13) | **371 h** |
| Solo @ **40 h/week** | **~9.25 weeks** |

**Calendar by team size (indicative effective throughput, incl. Cursor)** — same **371 h** total:

| Team | Assumed combined h/week | Calendar (371 h) |
|------|-------------------------|------------------|
| **1 dev** (full-stack) | 40 | **~9.25 weeks** |
| **2 devs** | ~70 | **~5.25–5.5 weeks** |
| **3 devs** | ~100 | **~3.75 weeks** |

**Why not 2× or 3× faster with 2 or 3 people?** Dependencies (e.g. CureMD check-in before inbound sync), shared environments, reviews, and merge/integration work cap real parallelism—hence **~70** and **~100 h/week** combined buckets instead of 80 or 120.

**Important:** These weeks are **only** for the SFPCC story list; they **do not** repeat the original **4–6 week** foundation build (already done).

---

## Cursor / team sizing (short)

- **Cursor / AI** matches what already built **~65k+** lines quickly: strong for **incremental** CRUD, wiring, migrations, tests.
- **CureMD sandbox**, **Playwright**, **workshops**, **BAA/model** (US-7), and **prod Firebase** (US-13) can force **real time** above these floors regardless of AI.

---

## Grand totals summary (floor — quick reference)

| Scope | Engineering (h) | QA (h) | Total (h) |
|--------|-----------------|--------|----------:|
| **US-1–11 + US-13 (full scope)** | **329** | **42** | **371** |

---

## Per-story detail (floor hours)

### US-1: Check-In in CureMD + blank note (ERP → CureMD)

**User story:** **As** front-desk / clinical staff **I want** check-in from ERP to drive CureMD, blank note job, and sleep/x-ray orders **so that** we avoid double entry.

**Description:** CureMD API client + orchestration + appointment columns + scheduler buttons; reuses queues and order services already in repo.

| Area | Hours |
|------|------:|
| Backend | 40 |
| Frontend | 6 |
| Automation (blank-note queue path) | 8 |
| QA | 6 |

---

### US-2: Inbound CureMD check-in sync + poll

**User story:** **As** staff using CureMD for check-in **I want** ERP updated within minutes **so that** modalities stay aligned.

**Description:** Poll worker + mapping + manual admin trigger; aligns with existing upsert patterns.

| Area | Hours |
|------|------:|
| Backend | 40 |
| Frontend | 6 |
| QA | 5 |

---

### US-3: Signed sleep in MR portal + patient documents

**User story:** **As** a records user **I want** signed sleep artifacts on the appointment and in a patient document hub **so that** download is in-context.

**Description:** Register documents on sign; extend list API by account; scheduler attachments + documents route.

| Area | Hours |
|------|------:|
| Backend | 24 |
| Frontend | 12 |
| QA | 4 |

---

### US-4: Diagnosis & CPT at upload → CureMD

**User story:** **As** technician **I want** diagnosis/CPT on upload **so that** CureMD note fields get filled via bot.

**Description:** Small schema/API change; extra fields on the CureMD upload queue row; extend the existing Python upload bot.

| Area | Hours |
|------|------:|
| Backend | 16 |
| Frontend | 6 |
| Automation | 20 |
| QA | 4 |

---

### US-5: Single merged PDF (sleep)

**User story:** **As** operations **I want** one PDF for CureMD for sleep **so that** packaging is simple.

**Description:** PDF merge helper + sign-and-queue path change; x-ray single-file unchanged.

| Area | Hours |
|------|------:|
| Backend | 16 |
| Frontend | 0 |
| QA | 2 |

---

### US-6: Clickable status cards

**User story:** **As** coordinator **I want** chips to filter the list **so that** drill-down is one click.

| Area | Hours |
|------|------:|
| Backend | 0 |
| Frontend | 2 |
| QA | 1 |

---

### US-7: AI pre-fill from scored PDF

**User story:** **As** physician **I want** draft template fields from the PDF **so that** typing is reduced.

**Description:** New API + model integration + review UI; largest residual uncertainty.

| Area | Hours |
|------|------:|
| Backend | 32 |
| Frontend | 8 |
| QA | 6 |

---

### US-8: Mobile-friendly sleep signing

**User story:** **As** doctor on tablet **I want** signing to work with touch **so that** it’s reliable.

**Description:** **Frontend-heavy:** signature capture (canvas or embedded control), touch vs mouse, preventing scroll from stealing strokes, minimum control size, stacked layout on narrow widths, and polish on Edge/Chrome on Windows touch-class devices.

| Area | Hours |
|------|------:|
| Backend | 0 |
| Frontend | 14 |
| QA | 4 |

---

### US-9: X-ray + legacy (browser workflow)

**User story:** **As** x-ray user **I want** ERP and the legacy web app usable together **so that** I don’t fight a single cramped panel.

**Description:** Treat this as a **browser workflow**, not a deep integration: e.g. open legacy in a **second window** or side-by-side browser windows; ERP side is a **short flow** (button or link, maybe copy-friendly context). Avoid embedded-frame and server work unless product later insists.

| Area | Hours |
|------|------:|
| Backend | 0 |
| Frontend | 4 |
| QA | 1 |

---

### US-10: Weekly compliance prompt

**User story:** **As** organization **I want** a weekly reminder about new doctors **so that** PRM stays informed.

**Description:** **Frontend-only, very small:** static or semi-static copy (e.g. banner, modal, or callout) with optional **local** dismiss / “don’t show again this week” stored in the browser—no new APIs, database, or server session flags unless product later insists on server-side audit.

| Area | Hours |
|------|------:|
| Backend | 0 |
| Frontend | 3 |
| QA | 1 |

---

### US-11: Resource suggestions (Phase A–B MVP)

**User story:** **As** scheduler **I want** demand-based suggestions **so that** staffing hints are visible without auto-assign.

**Description:** Demand aggregates + heuristic API + panel; **resource-planning** area of the product already substantial.

| Area | Hours |
|------|------:|
| Backend | 32 |
| Frontend | 8 |
| QA | 5 |

---

### US-13: Doctor-approved admin login (Firebase / FCM)

**User story:** Approver confirms admin sign-in from phone; admin completes session after approve.

| Area | Hours |
|------|------:|
| Backend | 24 |
| Frontend | 8 |
| QA | 3 |

---

### US-34: CSV report export (X-Ray · Sleep Study · PFT · PST)

**User story:** **As** operations or clinical leadership **I want** to export a CSV report from each modality module **so that** I can review all orders and all statuses without manual copy-paste from the UI.

**Description:** Add **Export CSV** on each module list/report page (X-Ray, Sleep Study, PFT, PST). Each export includes **all orders** and **all statuses** for that module. Shared backend CSV helper + one export route per module; shared frontend button pattern on four pages.

| Area | Hours |
|------|------:|
| Backend | 4 |
| Frontend | 3 |
| QA | 1 |

**Total US-34:** **8 h** (not included in the US-1–11 + US-13 **371 h** rollup above).

**BRD (HTML):** `SFPCC-US34-CSV-Export-Estimates.html`

---

## Appendix: benchmark scenario — vendor / “greenfield-style” hours

For an external team or zero-assumed codebase familiarity, budget separately (historically **~1.4k–2.6k h** eng+QA for US-1–11 + US-13 in an earlier planning pass). **The floor incremental table above is the working baseline** (**371 h** for US-1–11 + US-13; **referral epic omitted** from this plan). FE halved except **US-8** signing polish; **US-1** **40 h BE** + **6 h FE** + **8 h automation**; **US-7** pre-fill **32 h BE**; QA **¼** of prior floor with extra **US-8** device pass; **US-10** FE-only static prompt; **US-9** browser-native legacy workflow.

---

## Delivery note

Applies to **this ERP codebase**. Same **AI-assisted** workflow that delivered the current system; **security / clinical / sandbox** gates can still stretch real calendar beyond these floors.

---

*Estimates document version: **4.3** · March 2026 · adds **US-34** CSV export (8 h)*
