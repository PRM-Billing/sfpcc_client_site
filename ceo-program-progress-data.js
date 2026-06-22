/**
 * SFPCARE - Weekly Hours Reports
 *
 * sprintHourTable — one row per closed sprint (tracker totals).
 * varianceHours — billable plan − actual spent (same sign as tracker Margin: negative = loss when spend exceeded plan).
 *
 * Sprint calendars: Sprint 1 Apr 6–Apr 20 · Sprint 2 Apr 20–May 4 · Sprint 3 May 5–May 19 · Sprint 4 May 19–Jun 1 · Sprint 5 Jun 1–Jun 15 (closed) · Sprint 6 Jun 15–Jun 29 · Sprint 7 Jun 30–Jul 13.
 * Sprint 4: client quoted 42.5 h · team spent 30.5 h (incl. US-13 · US-19 · US-20 · US-22 pending work) → margin +12 h.
 * US-11 + US-34 (Sprint 5): per-story hours on Sprint 5 · storyHoursReconciliation.
 * US-33 (Sprint 6–7): same user story spans both sprints · Sprint 6 billable 80 h · Sprint 7 planned 70 h.
 */
window.PRM_CEO_PROGRAM_PROGRESS = {
  meta: {
    title: "SFPCARE - Weekly Hours Reports",
    lastUpdated: "2026-06-12",
    sprintCadenceNote:
      "Each sprint row matches the tracker: billable plan (what we priced for the client) vs actual hours spent.",
    billingExport: {
      clientLabel: "SFPCC",
      disclaimer:
        "Figures come from ceo-program-progress-data.js; reconcile with SFPCARE tracker tabs before invoicing.",
      /** Shown on client invoice attachment pages and CSV only */
      clientInvoiceAttachmentNote:
        "Completed work and billable hours for the sprint period shown — for invoicing / accounts-payable reference. Commercial terms follow your SOW and agreement.",
    },
  },

  baselinePlanHoursClosed: 238.2,

  hoursRollupClosed: {
    baselinePlanHours: 238.2,
    /** Sum of actual hours spent (same semantic as sprint rows’ second column). */
    billedHours: 233.5,
    /** planned billable − actual spent across closed Sprints 1–4 (tracker-style margin) */
    varianceHours: 4.7,
  },

  sprintHourTable: [
    {
      sprint: "Sprint 1",
      dates: "Apr 6 – Apr 20",
      estimatedHours: 52,
      billedHours: 72,
      varianceHours: -20,
    },
    {
      sprint: "Sprint 2",
      dates: "Apr 20 – May 4",
      estimatedHours: 70.5,
      billedHours: 65,
      varianceHours: 5.5,
    },
    {
      sprint: "Sprint 3",
      dates: "May 5 – May 19",
      estimatedHours: 73.2,
      billedHours: 66,
      varianceHours: 7.2,
    },
    {
      sprint: "Sprint 4",
      dates: "May 19 – Jun 1",
      estimatedHours: 42.5,
      billedHours: 30.5,
      varianceHours: 12,
    },
    {
      sprint: "Sprint 5",
      dates: "Jun 1 – Jun 15",
      estimatedHours: 101,
      billedHours: 88.75,
      varianceHours: 12.25,
    },
    {
      sprint: "Sprint 6",
      dates: "Jun 15 – Jun 29",
      estimatedHours: 80,
      billedHours: 0,
      varianceHours: 80,
    },
    {
      sprint: "Sprint 7",
      dates: "Jun 30 – Jul 13",
      estimatedHours: 70,
      billedHours: 0,
      varianceHours: 70,
    },
  ],

  sprintBarSeries: [
    {
      shortLabel: "Sprint 1",
      dates: "Apr 6–20",
      estimatedHours: 52,
      billedHours: 72,
    },
    {
      shortLabel: "Sprint 2",
      dates: "Apr 20–May 4",
      estimatedHours: 70.5,
      billedHours: 65,
    },
    {
      shortLabel: "Sprint 3",
      dates: "May 5–19",
      estimatedHours: 73.2,
      billedHours: 66,
    },
    {
      shortLabel: "Sprint 4",
      dates: "May 19–Jun 1",
      estimatedHours: 42.5,
      billedHours: 30.5,
    },
    {
      shortLabel: "Sprint 5",
      dates: "Jun 1–15",
      estimatedHours: 101,
      billedHours: 88.75,
    },
    {
      shortLabel: "Sprint 6",
      dates: "Jun 15–29",
      estimatedHours: 80,
      billedHours: 0,
    },
    {
      shortLabel: "Sprint 7",
      dates: "Jun 30–Jul 13",
      estimatedHours: 70,
      billedHours: 0,
    },
  ],

  /** Half-sprint breakdown removed from UI; leave empty unless weekly slices return. */
  intraSprintHalves: [],

  programKpis: [
    {
      label: "Baseline (closed work)",
      value:
        "238.2 h — sum of client-quoted hours for Sprints 1–4 (tracker sprint totals before actuals).",
      tone: "ok",
    },
    {
      label: "Actual spent (same sprints)",
      value:
        "233.5 h — team spent on tracked stories for closed Sprints 1–4.",
      tone: "ok",
    },
    {
      label: "Overall margin vs plan",
      value:
        "+4.7 h — client quoted minus team spent across closed Sprints 1–4.",
      tone: "warn",
    },
    {
      label: "Sprint 5 · closed",
      value:
        "Delivered US-13.1 · US-5.2 · US-11 · US-13.2 · US-34 · US-35 · US-38 · client approved 101 h · team spent 88.75 h on tracked stories.",
      tone: "warn",
    },
    {
      label: "Sprint 6–7 · US-33",
      value:
        "US-33 SyncMD AI Ambient Notes — Sprint 6 (Jun 15–29) · 80 h billable · Sprint 7 (Jun 30–Jul 13) · 70 h planned.",
      tone: "ok",
    },
  ],

  sprints: [
    {
      id: 1,
      name: "Sprint 1",
      dates: "Apr 6 – Apr 20",
      storyCodes: ["US-7"],
      headline: "Sleep Study · scored PDF AI pre-fill",
      status: "Closed",
      effortSnapshot: {
        estimatedH: 52,
        actualH: 72,
        marginH: -20,
        note:
          "SFPCARE tracker US-7 · billable plan 52 h · actual spent 72 h · margin vs plan −20 h · ceo-sprint-effort.html?sprint=1",
      },
      outcomeBullets: [
        "US-7 closed — actual work exceeded billable plan (−20 h vs plan on plan − actual basis).",
      ],
      clientMilestones: [
        "Delivered US-7: Sleep Study — AI pre-fill from scored PDF (completed in this sprint period).",
      ],
      stories: [["US-7", "Sleep Study — AI pre-fill from scored PDF", "Done"]],
    },
    {
      id: 2,
      name: "Sprint 2",
      dates: "Apr 20 – May 4",
      storyCodes: ["US-13", "US-14", "US-15", "US-16"],
      headline: "Platform · Integration · X-Ray",
      status: "Closed",
      effortSnapshot: {
        estimatedH: 70.5,
        actualH: 65,
        marginH: 5.5,
        note:
          "SFPCARE tracker US-13–US-16 · billable plan 70.5 h · actual spent 65 h · ceo-sprint-effort.html?sprint=2",
      },
      outcomeBullets: ["Firebase admin login, sync messaging, integration + X-ray slice."],
      clientMilestones: [
        "Delivered scope for US-13–US-16: platform admin login (Firebase/FCM), patient & appointment sync, X-ray interpretation upload, and consistent sync messaging.",
      ],
      stories: [
        ["US-13", "Doctor-approved admin login (Firebase / FCM)", "Done"],
        ["US-14", "Same-day patient & appointment sync", "Done"],
        ["US-15", "Instant X-ray interpretation upload", "Done"],
        ["US-16", "Consistent sync status messaging", "Done"],
      ],
    },
    {
      id: 3,
      name: "Sprint 3",
      dates: "May 5 – May 19",
      storyCodes: ["US-22", "US-5", "US-19", "US-20"],
      headline: "Portal delivery · sleep, merged PDF, X-ray & PFT to referring physicians",
      status: "Closed",
      effortSnapshot: {
        estimatedH: 73.2,
        actualH: 66,
        marginH: 7.2,
        harshitEstimatedH: 73.2,
        harshitSpentH: 0,
        note:
          "Sprint closed — 4 user stories delivered. Hours tracked in story reconciliation below.",
      },
      outcomeBullets: [
        "Referring-physician portal paths for sleep, X-ray, and PFT; merged sleep PDF package (US-5).",
      ],
      clientMilestones: [
        "Delivered portal paths for sleep, merged PDF package, X-ray, and PFT reporting to referring physicians (US-22, US-5, US-19, US-20).",
      ],
      stories: [
        ["US-22", "Send sleep study reports to referring physicians (portal)", "Done"],
        ["US-5", "Single merged PDF (sleep package)", "Done"],
        ["US-19", "Send X-ray reports to referring physicians (portal)", "Done"],
        ["US-20", "Send PFT reports to referring physicians (portal)", "Done"],
      ],
      storyHoursReconciliation: [
        {
          story: "US-22",
          title: "Send sleep study reports to referring physicians (portal)",
          harshitEstimatedH: 6,
          harshitSpentH: 0,
          clientQuotedH: 6,
          teamSpentH: 5.4,
          note: "Harshit quoted 6 h · client quoted 6 h · team spent 5.4 h.",
        },
        {
          story: "US-5",
          title: "Single merged PDF (sleep package)",
          harshitEstimatedH: 19.2,
          harshitSpentH: 0,
          clientQuotedH: 19.2,
          teamSpentH: 17.3,
          note: "Harshit quoted 19.2 h · client quoted 19.2 h · team spent 17.3 h.",
        },
        {
          story: "US-19",
          title: "Send X-ray reports to referring physicians (portal)",
          harshitEstimatedH: 16.8,
          harshitSpentH: 0,
          clientQuotedH: 16.8,
          teamSpentH: 15.1,
          note: "Harshit quoted 16.8 h · client quoted 16.8 h · team spent 15.1 h.",
        },
        {
          story: "US-20",
          title: "Send PFT reports to referring physicians (portal)",
          harshitEstimatedH: 31.2,
          harshitSpentH: 0,
          clientQuotedH: 31.2,
          teamSpentH: 28.2,
          note: "Harshit quoted 31.2 h · client quoted 31.2 h · team spent 28.2 h.",
        },
      ],
    },
    {
      id: 4,
      name: "Sprint 4",
      dates: "May 19 – Jun 1",
      storyCodes: ["US-21", "US-26", "US-5.1", "US-36"],
      headline: "PST portal · electronic signature · merged PDF & appointment sync",
      status: "Closed",
      effortSnapshot: {
        estimatedH: 42.5,
        actualH: 30.5,
        marginH: 12,
        harshitEstimatedH: 42.5,
        harshitSpentH: 3,
        note:
          "Sprint closed — delivered stories plus pending-work hours on US-13 · US-19 · US-20 · US-22 (see reconciliation).",
      },
      outcomeBullets: [
        "US-21 PST module delivered; US-26 electronic signature; US-5.1 merged-PDF enhancement; US-36 bug-fix enhancement (non-billable).",
      ],
      clientMilestones: [
        "Delivered PST outbound portal (US-21), electronic signature (US-26), merged sleep PDF enhancement (US-5.1); US-36 CureMD appointment-range sync shipped as non-billable bug-fix enhancement.",
      ],
      stories: [
        ["US-21", "Send PST reports to referring physicians (portal)", "Done"],
        ["US-26", "Electronic signature", "Done"],
        ["US-5.1", "Single merged PDF — new enhancement", "Done"],
        ["US-36", "CureMD appointment range sync — enhancement (bug fix) · non-billable", "Done"],
      ],
      storyHoursReconciliation: [
        {
          story: "US-21",
          title: "Send PST reports to referring physicians (portal)",
          harshitEstimatedH: 31,
          harshitSpentH: 2,
          clientQuotedH: 31,
          teamSpentH: 9,
          note: "Harshit quoted 31 h · client quoted 31 h · Harshit spent 2 h · team spent 9 h.",
        },
        {
          story: "US-5.1",
          title: "Single merged PDF — new enhancement",
          harshitEstimatedH: 4,
          harshitSpentH: 0,
          clientQuotedH: 4,
          teamSpentH: 4,
          note: "Harshit quoted 4 h · client approved 4 h · team spent 4 h (Sprint 4).",
        },
        {
          story: "US-26",
          title: "Electronic signature",
          harshitEstimatedH: 7.5,
          harshitSpentH: 1,
          clientQuotedH: 7.5,
          teamSpentH: 6.5,
          note: "Harshit quoted 7.5 h · client quoted 7.5 h · Harshit spent 1 h · team spent 6.5 h.",
        },
        {
          story: "US-36",
          title: "CureMD appointment range sync — enhancement (bug fix)",
          harshitEstimatedH: 0,
          harshitSpentH: 0,
          clientQuotedH: 0,
          teamSpentH: 3,
          note: "Non-billable bug-fix enhancement · no client quoted hours · team spent 3 h.",
        },
        {
          story: "US-13",
          title: "Doctor-approved admin login (Firebase / FCM) — pending work",
          harshitEstimatedH: 0,
          harshitSpentH: 0,
          clientQuotedH: 0,
          teamSpentH: 4,
          note: "Pending work · team spent 4 h · no client quoted hours (delivered Sprint 2).",
        },
        {
          story: "US-19",
          title: "Send X-ray reports to referring physicians (portal) — pending work",
          harshitEstimatedH: 0,
          harshitSpentH: 0,
          clientQuotedH: 0,
          teamSpentH: 1,
          note: "Pending work · team spent 1 h · no client quoted hours (delivered Sprint 3).",
        },
        {
          story: "US-20",
          title: "Send PFT reports to referring physicians (portal) — pending work",
          harshitEstimatedH: 0,
          harshitSpentH: 0,
          clientQuotedH: 0,
          teamSpentH: 2,
          note: "Pending work · team spent 2 h · no client quoted hours (delivered Sprint 3).",
        },
        {
          story: "US-22",
          title: "Send sleep study reports to referring physicians (portal) — pending work",
          harshitEstimatedH: 0,
          harshitSpentH: 0,
          clientQuotedH: 0,
          teamSpentH: 1,
          note: "Pending work · team spent 1 h · no client quoted hours (delivered Sprint 3).",
        },
      ],
    },
    {
      id: 5,
      name: "Sprint 5",
      dates: "Jun 1 – Jun 15",
      storyCodes: ["US-13.1", "US-5.2", "US-11", "US-13.2", "US-34", "US-35", "US-38"],
      headline: "US-13.1 · US-5.2 · US-11 · US-13.2 · US-34 · US-35 · US-38",
      status: "Closed",
      effortSnapshot: {
        estimatedH: 101,
        actualH: 88.75,
        marginH: 12.25,
        harshitEstimatedH: 58,
        harshitSpentH: 12,
        note:
          "Sprint closed — 7 user stories delivered. All stories hours-tracked in story reconciliation below.",
      },
      outcomeBullets: [
        "US-13.1 — pop-up / browser approval notifications when doctor offline.",
        "US-5.2 — combined report PDF for PFT & PST (enhancement · US-5).",
        "US-11 — demand-based resource suggestions on the planning dashboard.",
        "US-13.2 — concurrent MA approval queue (pairs with US-13.1).",
        "US-34 — CSV report export across all orders & statuses.",
        "US-35 — dashboard status overview for PFT & PST.",
        "US-38 — electronic signatures for remaining physicians (no separate hours — platform delivered in US-26).",
      ],
      clientMilestones: [
        "US-13.1 — MA approval notifications when doctor is offline.",
        "US-5.2 — merged PFT/PST PDF package delivered.",
        "US-11 — resource suggestions MVP visible to schedulers.",
        "US-13.2 — concurrent MA approval queue live.",
        "US-34 — CSV export across X-Ray, Sleep, PFT, PST.",
        "US-35 — PFT/PST five-count dashboard panels.",
        "US-38 — remaining doctors auto-signed on notes/reports · 0 h (non-billable).",
      ],
      stories: [
        ["US-13.1", "Pop-up / browser approval notifications", "Done"],
        ["US-5.2", "Combined report PDF for PFT & PST", "Done"],
        ["US-11", "Resource suggestions (Phase A–B MVP)", "Done"],
        ["US-13.2", "Concurrent MA approval queue", "Done"],
        ["US-34", "CSV report export — all orders & statuses", "Done"],
        ["US-35", "Dashboard status overview — PFT & PST", "Done"],
        ["US-38", "Electronic signatures for remaining doctors", "Done"],
      ],
      storyHoursReconciliation: [
        {
          story: "US-13.1",
          title: "Pop-up / browser approval notifications",
          harshitEstimatedH: 0,
          harshitSpentH: 0,
          clientQuotedH: 24,
          teamSpentH: 24,
          note:
            "No Harshit hours · client quoted 24 h · team spent 24 h.",
        },
        {
          story: "US-13.2",
          title: "Concurrent MA approval queue",
          harshitEstimatedH: 0,
          harshitSpentH: 0,
          clientQuotedH: 3,
          teamSpentH: 2.25,
          note:
            "No Harshit hours · client quoted 3 h · team spent 2 h 15 min.",
        },
        {
          story: "US-5.2",
          title: "Combined report PDF for PFT & PST",
          harshitEstimatedH: 10,
          harshitSpentH: 1.5,
          clientQuotedH: 14,
          teamSpentH: 5,
          taskUrl: "https://b24.prmbilling.com/workgroups/group/961/tasks/task/view/8647580/",
          note:
            "Harshit quoted 10 h · Harshit spent 1.5 h · client quoted 14 h · team spent 5 h · Bitrix task #8647580.",
        },
        {
          story: "US-11",
          title: "Resource suggestions (Phase A–B MVP)",
          harshitEstimatedH: 39,
          harshitSpentH: 7.5,
          clientQuotedH: 45,
          teamSpentH: 55,
          note:
            "Harshit quoted 39 h · Harshit spent 7.5 h · client quoted 45 h · team spent 55 h.",
        },
        {
          story: "US-34",
          title: "CSV report export — all orders & statuses",
          harshitEstimatedH: 4.5,
          harshitSpentH: 1.5,
          clientQuotedH: 8,
          teamSpentH: 2,
          note:
            "Harshit quoted 4.5 h · Harshit spent 1.5 h · client quoted 8 h · team spent 2 h.",
        },
        {
          story: "US-35",
          title: "Dashboard status overview — PFT & PST",
          harshitEstimatedH: 4.5,
          harshitSpentH: 1.5,
          clientQuotedH: 7,
          teamSpentH: 0.5,
          note:
            "Harshit quoted 4.5 h · Harshit spent 1.5 h · client quoted 7 h · team spent 30 min.",
        },
        {
          story: "US-38",
          title: "Electronic signatures for remaining doctors",
          harshitEstimatedH: 0,
          harshitSpentH: 0,
          clientQuotedH: 0,
          teamSpentH: 0,
          note:
            "No separate engineering hours — signature platform delivered in US-26; per-doctor PNG + NPI onboarding only.",
        },
      ],
    },
    {
      id: 6,
      name: "Sprint 6",
      dates: "Jun 15 – Jun 29",
      storyCodes: ["US-33"],
      headline: "US-33 · SyncMD AI Ambient Notes (Phases 0–2)",
      status: "Active",
      effortSnapshot: {
        estimatedH: 80,
        actualH: 0,
        marginH: 80,
        harshitEstimatedH: 80,
        harshitSpentH: 0,
        note:
          "US-33 spans Sprint 6–7. Sprint 6: 80 h billable (Harshit quoted = client quoted). Phases 0–2.",
      },
      outcomeBullets: [
        "US-33 Phase 0 — CureMD note API spike + ambient platform scaffold.",
        "US-33 Phase 1 — PFT/PST ambient scribe MVP.",
        "US-33 Phase 2 — appointment sync (US-36 parallel path).",
      ],
      clientMilestones: [
        "US-33 — ambient notes platform foundation and PFT/PST capture MVP.",
      ],
      stories: [
        ["US-33", "SyncMD AI Ambient Notes Module", "In Progress"],
      ],
      storyHoursReconciliation: [
        {
          story: "US-33",
          title: "SyncMD AI Ambient Notes Module (Phases 0–2)",
          harshitEstimatedH: 80,
          harshitSpentH: 0,
          clientQuotedH: 80,
          teamSpentH: 0,
          note:
            "Harshit quoted 80 h · client quoted 80 h · sprint in progress · Phases 0–2.",
        },
      ],
    },
    {
      id: 7,
      name: "Sprint 7",
      dates: "Jun 30 – Jul 13",
      storyCodes: ["US-33"],
      headline: "US-33 · SyncMD AI Ambient Notes (Phases 3–4)",
      status: "Planning",
      effortSnapshot: {
        estimatedH: 70,
        actualH: 0,
        marginH: 70,
        note:
          "US-33 continuation — Office Visit module (Phase 3) + QA and rollout hardening (Phase 4). Same user story as Sprint 6.",
      },
      outcomeBullets: [
        "US-33 Phase 3 — Office Visit ambient module (CR-B).",
        "US-33 Phase 4 — QA pass and phased clinic rollout prep.",
      ],
      clientMilestones: [
        "US-33 — office-visit ambient flow + QC dashboard ready for pilot clinics.",
      ],
      stories: [
        ["US-33", "SyncMD AI Ambient Notes Module", "Planned"],
      ],
    },
  ],
};
