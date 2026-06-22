/**
 * Shared CSV download + print/PDF helpers for client billing attachments (CEO static pages).
 */
(function (global) {
  function sanitizeFilenameSegment(s) {
    return String(s || "export")
      .replace(/[^\w\-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "") || "export";
  }

  function csvEscape(cell) {
    if (cell === null || cell === undefined) return "";
    var str = String(cell);
    if (/[,"\r\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  /** @param {(string|number|null|undefined)[][]} rows */
  function rowsToCsvString(rows) {
    var lines = (rows || []).map(function (row) {
      return (row || []).map(csvEscape).join(",");
    });
    return "\uFEFF" + lines.join("\r\n");
  }

  function downloadTextFile(filename, text, mimeType) {
    mimeType = mimeType || "text/csv;charset=utf-8;";
    var blob = new Blob([text], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 2000);
  }

  /** @param {(string|number|null|undefined)[][]} rows */
  function downloadCsv(filename, rows) {
    downloadTextFile(filename, rowsToCsvString(rows));
  }

  function printPage() {
    window.print();
  }

  function num(x) {
    return typeof x === "number" && !isNaN(x) ? x : null;
  }

  /** @returns {number|""} */
  function csvNum(v) {
    var n = num(v);
    return n === null ? "" : n;
  }

  var effortCols = ["backend", "frontend", "automation", "prdQa", "qa"];

  function sumFromRows(rows) {
    var out = { backend: 0, frontend: 0, automation: 0, prdQa: 0, qa: 0, total: 0 };
    (rows || []).forEach(function (r) {
      effortCols.forEach(function (c) {
        var v = num(r[c]);
        if (v !== null) out[c] += v;
      });
      var t = num(r.total);
      if (t !== null) out.total += t;
    });
    return out;
  }

  /** @param {object} C PRM_CEO_SPRINT_EFFORT */
  function sectionTotals(C, sectionKey) {
    var sec = C[sectionKey];
    var over = sec && sec.summaryOverride;
    if (over && typeof over.total === "number") {
      return {
        backend: num(over.backend) || 0,
        frontend: num(over.frontend) || 0,
        automation: num(over.automation) || 0,
        prdQa: num(over.prdQa) || 0,
        qa: num(over.qa) || 0,
        total: over.total,
      };
    }
    var s = sumFromRows(sec && sec.rows);
    return {
      backend: s.backend,
      frontend: s.frontend,
      automation: s.automation,
      prdQa: s.prdQa,
      qa: s.qa,
      total: s.total,
    };
  }

  function appendEffortTableRows(rows, sectionTitle, sectionKey, C, totalLabelPrefix) {
    rows.push([sectionTitle]);
    rows.push([
      "Story",
      "Description",
      "Module",
      "BE_hours",
      "FE_hours",
      "Auto_hours",
      "PRD_QA_crit_hours",
      "QA_hours",
      "Total_hours",
      "Status",
    ]);
    var sec = C[sectionKey];
    var rw = (sec && sec.rows) || [];
    rw.forEach(function (r) {
      rows.push([
        r.story || "",
        r.description || "",
        r.module || "",
        csvNum(r.backend),
        csvNum(r.frontend),
        csvNum(r.automation),
        csvNum(r.prdQa),
        csvNum(r.qa),
        csvNum(r.total),
        r.status || "",
      ]);
    });
    var t = sectionTotals(C, sectionKey);
    rows.push([
      totalLabelPrefix,
      "",
      sec && sec.summaryOverride ? "rollup_total_row" : "sum_of_numeric_rows",
      csvNum(t.backend),
      csvNum(t.frontend),
      csvNum(t.automation),
      csvNum(t.prdQa),
      csvNum(t.qa),
      csvNum(t.total),
      "",
    ]);
    rows.push([]);
  }

  function appendVariance(rows, C) {
    var eTot = sectionTotals(C, "estimated");
    var aTot = sectionTotals(C, "actual");
    rows.push(["VARIANCE_EST_MINUS_ACTUAL"]);
    rows.push(["Bucket", "Estimated", "Actual", "Delta"]);
    var keys = [
      ["backend", "Backend"],
      ["frontend", "Frontend"],
      ["automation", "Automation"],
      ["prdQa", "PRD + QA criteria"],
      ["qa", "QA"],
      ["total", "Total"],
    ];
    keys.forEach(function (kv) {
      var k = kv[0];
      var ev = eTot[k];
      var av = aTot[k];
      var diff = ev - av;
      rows.push([kv[1], csvNum(ev), csvNum(av), csvNum(diff)]);
    });
  }

  /**
   * @param {typeof window.PRM_CEO_SPRINT_EFFORT} C
   * @returns {(string|number)[][]}
   */
  function buildRowsForSprintEffort(C) {
    if (!C) return [["Error", "Missing PRM_CEO_SPRINT_EFFORT dataset"]];
    var billing = C.billingExport || {};
    var sprint = C.sprint || {};
    var rows = [];
    rows.push(["Document", "Sprint effort billing export"]);
    rows.push(["Client_label", billing.clientLabel || ""]);
    rows.push(["Sprint_window", sprint.label || ""]);
    rows.push(["Data_last_updated", sprint.lastUpdated || ""]);
    if (billing.invoiceReference) {
      rows.push(["Invoice_reference", billing.invoiceReference]);
    }
    if (billing.internalNote) rows.push(["Internal_note", billing.internalNote]);
    rows.push([]);
    rows.push([
      "DISCLAIMER",
      "Figures are generated from ceo-sprint-effort-data.js — reconcile with timesheets/SOW before invoicing.",
    ]);
    rows.push([]);
    appendEffortTableRows(rows, "ESTIMATED_BILLABLE", "estimated", C, "TOTAL_ESTIMATED");
    appendEffortTableRows(rows, "ACTUAL_LOGGED", "actual", C, "TOTAL_ACTUAL");
    appendVariance(rows, C);
    return rows;
  }

  function snapshotHour(x) {
    if (typeof x !== "number" || isNaN(x)) return "";
    return x.toFixed(1).replace(/\.0$/, "");
  }

  /**
   * Per-story margin: client approved − (team spent + Harshit spent).
   * Negative Δ = loss (total spend exceeded client approved).
   * @param {object} r
   * @returns {number}
   */
  function computeStoryReconRowDelta(r) {
    if (!r) return NaN;
    var client = num(r.clientQuotedH);
    var team = num(r.teamSpentH);
    var harshitS = num(r.harshitSpentH);
    if (client === null || team === null) return NaN;
    var hs = harshitS !== null ? harshitS : 0;
    return Math.round((client - team - hs) * 10) / 10;
  }

  /**
   * Sum per-story reconciliation rows (tracked stories with client quote + team spend).
   * @param {object[]} reconRows
   * @returns {{ harshitEstimatedH: number, harshitSpentH: number, clientQuotedH: number, teamSpentH: number, marginH: number, isProfit: boolean, storyCount: number }}
   */
  function computeStoryReconTotals(reconRows) {
    var out = {
      harshitEstimatedH: 0,
      harshitSpentH: 0,
      clientQuotedH: 0,
      teamSpentH: 0,
      marginH: 0,
      isProfit: true,
      storyCount: 0,
    };
    (reconRows || []).forEach(function (r) {
      if (!r) return;
      out.storyCount += 1;
      ["harshitEstimatedH", "harshitSpentH", "clientQuotedH", "teamSpentH"].forEach(function (k) {
        var v = num(r[k]);
        if (v !== null) out[k] += v;
      });
      var rowDelta = computeStoryReconRowDelta(r);
      if (typeof rowDelta === "number" && !isNaN(rowDelta)) out.marginH += rowDelta;
    });
    out.marginH = Math.round(out.marginH * 10) / 10;
    out.isProfit = out.marginH >= -0.05;
    return out;
  }

  function formatHoursDisplay(n) {
    if (typeof n !== "number" || isNaN(n)) return "—";
    return (Math.round(n * 10) / 10).toFixed(1);
  }

  function formatMarginSigned(h) {
    if (typeof h !== "number" || isNaN(h)) return "—";
    var rounded = Math.round(h * 10) / 10;
    return (rounded > 0 ? "+" : "") + rounded.toFixed(1) + " h";
  }

  /**
   * @param {object} totals from computeStoryReconTotals
   * @returns {string} HTML for sprint reconciliation summary banner
   */
  function renderStoryReconSummaryHtml(totals) {
    if (!totals || !totals.storyCount) return "";
    var profit = totals.isProfit;
    var statusClass = profit ? "recon-summary-profit" : "recon-summary-loss";
    var statusLabel = profit
      ? totals.marginH > 0.05
        ? "Profit"
        : "Break-even"
      : "Loss";
    var statusNote = profit
      ? "Client approved covers total spend (team + Harshit)."
      : "Total spend (team + Harshit) exceeded client approved — review variance.";
    return (
      '<div class="recon-summary ' +
      statusClass +
      '">' +
      '<div class="recon-summary-head">' +
      '<span class="recon-summary-title">Sprint total — tracked stories (' +
      totals.storyCount +
      ")</span>" +
      '<span class="recon-summary-badge">' +
      statusLabel +
      "</span>" +
      "</div>" +
      '<div class="recon-summary-grid">' +
      '<div class="recon-summary-item"><span class="k">Harshit quoted</span><span class="v">' +
      formatHoursDisplay(totals.harshitEstimatedH) +
      "</span></div>" +
      '<div class="recon-summary-item"><span class="k">Client approved</span><span class="v">' +
      formatHoursDisplay(totals.clientQuotedH) +
      "</span></div>" +
      '<div class="recon-summary-item"><span class="k">Harshit spent</span><span class="v">' +
      formatHoursDisplay(totals.harshitSpentH) +
      "</span></div>" +
      '<div class="recon-summary-item"><span class="k">Team spent</span><span class="v">' +
      formatHoursDisplay(totals.teamSpentH) +
      "</span></div>" +
      '<div class="recon-summary-item"><span class="k">Δ approved − spent</span><span class="v ' +
      (profit ? "pos" : "neg") +
      '">' +
      formatMarginSigned(totals.marginH) +
      "</span></div>" +
      "</div>" +
      '<p class="recon-summary-note">' +
      statusNote +
      "</p>" +
      "</div>"
    );
  }

  /**
   * @param {object} totals from computeStoryReconTotals
   * @param {{ name?: string, dates?: string, status?: string }} sprintMeta
   * @returns {string} HTML for full-page hero reconciliation summary
   */
  function renderStoryReconFullPageHeroHtml(totals, sprintMeta) {
    if (!totals || !totals.storyCount) return "";
    sprintMeta = sprintMeta || {};
    var profit = totals.isProfit;
    var statusClass = profit ? "hero-profit" : "hero-loss";
    var statusLabel = profit
      ? totals.marginH > 0.05
        ? "Profit"
        : "Break-even"
      : "Loss";
    var statusNote = profit
      ? "Client approved covers total spend (team + Harshit) — sprint is on track."
      : "Total spend (team + Harshit) exceeded client approved — review variance before close.";
    return (
      '<section class="recon-hero ' +
      statusClass +
      '">' +
      '<div class="recon-hero-top">' +
      '<div class="recon-hero-meta">' +
      '<span class="recon-hero-eyebrow">Sprint hours reconciliation</span>' +
      '<h2 class="recon-hero-title">' +
      (sprintMeta.name || "Sprint") +
      " · margin summary</h2>" +
      (sprintMeta.dates ? '<p class="recon-hero-dates">' + sprintMeta.dates + "</p>" : "") +
      "</div>" +
      '<div class="recon-hero-badge-wrap">' +
      '<span class="recon-hero-badge">' +
      statusLabel +
      "</span>" +
      '<p class="recon-hero-badge-sub">' +
      formatMarginSigned(totals.marginH) +
      " approved − spent</p>" +
      "</div>" +
      "</div>" +
      '<div class="recon-hero-metrics">' +
      '<div class="recon-hero-metric"><span class="k">Harshit quoted</span><span class="v">' +
      formatHoursDisplay(totals.harshitEstimatedH) +
      '<span class="u">h</span></span></div>' +
      '<div class="recon-hero-metric primary"><span class="k">Client approved</span><span class="v">' +
      formatHoursDisplay(totals.clientQuotedH) +
      '<span class="u">h</span></span></div>' +
      '<div class="recon-hero-metric"><span class="k">Harshit spent</span><span class="v">' +
      formatHoursDisplay(totals.harshitSpentH) +
      '<span class="u">h</span></span></div>' +
      '<div class="recon-hero-metric primary"><span class="k">Team spent</span><span class="v">' +
      formatHoursDisplay(totals.teamSpentH) +
      '<span class="u">h</span></span></div>' +
      '<div class="recon-hero-metric ' +
      (profit ? "pos" : "neg") +
      '"><span class="k">Δ approved − spent</span><span class="v">' +
      formatMarginSigned(totals.marginH) +
      "</span></div>" +
      '<div class="recon-hero-metric muted"><span class="k">Tracked stories</span><span class="v">' +
      totals.storyCount +
      "</span></div>" +
      "</div>" +
      '<p class="recon-hero-note">' +
      statusNote +
      "</p>" +
      "</section>"
    );
  }

  function appendStoryReconCsvRows(rows, recon) {
    if (!recon || !recon.length) return;
    var t = computeStoryReconTotals(recon);
    rows.push(["STORY_HOURS_RECONCILIATION"]);
    rows.push([
      "Story_ID",
      "Title",
      "Harshit_quoted_h",
      "Client_quoted_h",
      "Harshit_spent_h",
      "Team_spent_h",
      "Approved_minus_team_plus_Harshit_spent_h",
      "Bitrix_task_url",
    ]);
    recon.forEach(function (r) {
      var dq = computeStoryReconRowDelta(r);
      rows.push([
        r.story || "",
        r.title || "",
        csvNum(r.harshitEstimatedH),
        csvNum(r.clientQuotedH),
        csvNum(r.harshitSpentH),
        csvNum(r.teamSpentH),
        typeof dq === "number" && !isNaN(dq) ? dq : "",
        r.taskUrl || "",
      ]);
    });
    rows.push([
      "TOTAL",
      "Tracked stories",
      csvNum(t.harshitEstimatedH),
      csvNum(t.clientQuotedH),
      csvNum(t.harshitSpentH),
      csvNum(t.teamSpentH),
      csvNum(t.marginH),
      "",
    ]);
    rows.push(["Sprint_margin_status", t.isProfit ? "profit_or_break_even" : "loss"]);
  }

  /**
   * @param {typeof window.PRM_CEO_PROGRAM_PROGRESS} D
   * @param {object} sprint one of D.sprints
   */
  function buildRowsForStoryHoursReconciliation(D, sprint) {
    if (!D || !sprint) return [["Error", "Missing program progress data"]];
    var billing = (D.meta && D.meta.billingExport) || {};
    var rows = [];
    rows.push(["Document", "SFPCARE_sprint_hours_reconciliation"]);
    rows.push(["Client_label", billing.clientLabel || "SFPCC"]);
    rows.push(["As_of_report_date", D.meta.lastUpdated || ""]);
    rows.push(["Sprint_id", String(sprint.id)]);
    rows.push(["Sprint_name", sprint.name || ""]);
    rows.push(["Sprint_dates", sprint.dates || ""]);
    rows.push(["Sprint_status", sprint.status || ""]);
    rows.push([]);
    var recon = sprint.storyHoursReconciliation || [];
    appendStoryReconCsvRows(rows, recon);
    return rows;
  }

  /**
   * @param {typeof window.PRM_CEO_PROGRAM_PROGRESS} D
   * @param {object} sprint one of D.sprints
   */
  function buildRowsForProgramSprintDetail(D, sprint) {
    if (!D || !sprint) return [["Error", "Missing program progress data"]];
    var billing = (D.meta && D.meta.billingExport) || {};
    var rows = [];
    rows.push(["Document", "Program sprint summary billing export"]);
    rows.push(["Client_label", billing.clientLabel || ""]);
    rows.push(["Program_title", D.meta.title || ""]);
    rows.push(["Subtitle", D.meta.subtitle || ""]);
    rows.push(["As_of_report_date", D.meta.lastUpdated || ""]);
    rows.push([]);
    rows.push([
      "DISCLAIMER",
      billing.disclaimer ||
        "Figures are generated from ceo-program-progress-data.js / internal snapshots — reconcile with contract and timesheets before billing.",
    ]);
    rows.push([]);
    rows.push(["Sprint_id", String(sprint.id)]);
    rows.push(["Sprint_name", sprint.name || ""]);
    rows.push(["Sprint_dates", sprint.dates || ""]);
    rows.push(["Sprint_status", sprint.status || ""]);
    rows.push([]);
    rows.push(["Executive_headline", sprint.headline || ""]);
    rows.push([]);
    var ef = sprint.effortSnapshot || {};
    rows.push(["EFFORT_SNAPSHOT"]);
    rows.push(["Estimated_hours", snapshotHour(ef.estimatedH)]);
    rows.push(["Actual_hours", snapshotHour(ef.actualH)]);
    rows.push(["Margin_hours_planned_minus_actual", snapshotHour(ef.marginH)]);
    rows.push(["Effort_snapshot_note", ef.note || ""]);
    rows.push([]);
    rows.push(["Results_milestones"]);
    (sprint.outcomeBullets || []).forEach(function (b) {
      rows.push(["Outcome_bullet", b]);
    });
    rows.push([]);
    rows.push(["Delivery_focus_stories"]);
    rows.push(["Story_ID", "Notes", "Disposition"]);
    (sprint.stories || []).forEach(function (row) {
      rows.push([(row && row[0]) || "", (row && row[1]) || "", (row && row[2]) || ""]);
    });
    var recon = sprint.storyHoursReconciliation || [];
    if (recon.length) {
      rows.push([]);
      appendStoryReconCsvRows(rows, recon);
    }
    return rows;
  }

  /**
   * Client-facing invoice attachment — no internal margin / estimate breakdown.
   * @param {typeof window.PRM_CEO_PROGRAM_PROGRESS} D
   * @param {object} sprint one of D.sprints
   * @param {number|null|undefined} invoiceBillableHours pre-resolved billable hours for the period
   */
  function buildRowsForClientSprintInvoice(D, sprint, invoiceBillableHours) {
    if (!D || !sprint) return [["Error", "Missing program progress data"]];
    var be = (D.meta && D.meta.billingExport) || {};
    var rows = [];
    rows.push(["Document", "SFPCARE_client_sprint_billing_summary"]);
    rows.push(["Partner_organization", be.clientLabel || "SFPCC"]);
    rows.push(["Sprint", sprint.name || ""]);
    rows.push(["Sprint_period", sprint.dates || ""]);
    rows.push(["Sprint_status", sprint.status || ""]);
    rows.push([
      "Billable_hours_sprint_plan",
      invoiceBillableHours === null || invoiceBillableHours === undefined
        ? ""
        : snapshotHour(invoiceBillableHours),
    ]);
    rows.push([]);
    rows.push(["Milestone_summary"]);
    rows.push([sprint.headline || ""]);
    rows.push([]);
    rows.push(["Deliverables_completed"]);
    if ((sprint.clientMilestones || []).length) {
      (sprint.clientMilestones || []).forEach(function (m) {
        rows.push([m]);
      });
    } else {
      rows.push(["(See scope items below.)"]);
    }
    rows.push([]);
    rows.push(["Story_ID", "Deliverable", "Status"]);
    (sprint.stories || []).forEach(function (row) {
      rows.push([(row && row[0]) || "", (row && row[1]) || "", (row && row[2]) || ""]);
    });
    rows.push([]);
    rows.push([
      "Attachment_note",
      be.clientInvoiceAttachmentNote ||
        "Summary of completed work and billable hours for invoicing reference.",
    ]);
    return rows;
  }

  global.PRM_BILLING_EXPORT = {
    sanitizeFilenameSegment: sanitizeFilenameSegment,
    downloadCsv: downloadCsv,
    printPage: printPage,
    buildRowsForSprintEffort: buildRowsForSprintEffort,
    buildRowsForProgramSprintDetail: buildRowsForProgramSprintDetail,
    buildRowsForStoryHoursReconciliation: buildRowsForStoryHoursReconciliation,
    buildRowsForClientSprintInvoice: buildRowsForClientSprintInvoice,
    computeStoryReconTotals: computeStoryReconTotals,
    computeStoryReconRowDelta: computeStoryReconRowDelta,
    renderStoryReconSummaryHtml: renderStoryReconSummaryHtml,
    renderStoryReconFullPageHeroHtml: renderStoryReconFullPageHeroHtml,
    formatHoursDisplay: formatHoursDisplay,
    formatMarginSigned: formatMarginSigned,
  };
})(typeof window !== "undefined" ? window : this);
