/**
 * PRM document meta — "Last updated" strip at the top of every page.
 * Source: <meta name="doc-last-updated" content="YYYY-MM-DD"> or PRM_DOC_META.setLastUpdated().
 */
(function (global) {
  var BAR_CLASS = "prm-doc-updated-bar";
  var STYLE_ID = "prm-doc-meta-styles";

  function pad2(n) {
    n = String(n);
    return n.length < 2 ? "0" + n : n;
  }

  function formatDate(input) {
    if (input == null || input === "") return "";
    if (global.PRM_DATE_FORMAT && global.PRM_DATE_FORMAT.format) {
      return global.PRM_DATE_FORMAT.format(input);
    }
    var s = String(input).trim();
    var iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return iso[2] + "-" + iso[3] + "-" + iso[1];
    return s;
  }

  function getMetaIso() {
    var el = document.querySelector('meta[name="doc-last-updated"]');
    return el ? (el.getAttribute("content") || "").trim() : "";
  }

  function detectFromGlobals() {
    if (global.PRM_DOC_LAST_UPDATED) return global.PRM_DOC_LAST_UPDATED;
    var sources = [
      function () {
        return global.PRM_CEO_DASHBOARD && global.PRM_CEO_DASHBOARD.meta && global.PRM_CEO_DASHBOARD.meta.lastUpdated;
      },
      function () {
        return global.PRM_COO_DASHBOARD && global.PRM_COO_DASHBOARD.meta && global.PRM_COO_DASHBOARD.meta.lastUpdated;
      },
      function () {
        return global.PRM_CEO_PROGRAM_PROGRESS && global.PRM_CEO_PROGRAM_PROGRESS.meta && global.PRM_CEO_PROGRAM_PROGRESS.meta.lastUpdated;
      },
      function () {
        return global.PRM_CEO_ROADMAP && global.PRM_CEO_ROADMAP.meta && global.PRM_CEO_ROADMAP.meta.lastUpdated;
      },
      function () {
        return global.PRM_NEXT_STEPS && global.PRM_NEXT_STEPS.meta && global.PRM_NEXT_STEPS.meta.lastUpdated;
      },
      function () {
        return global.PRM_LANNY_PRIORITY_TRACK && global.PRM_LANNY_PRIORITY_TRACK.meta && global.PRM_LANNY_PRIORITY_TRACK.meta.lastUpdated;
      },
      function () {
        return global.HARSHIT_BACKLOG_DEFAULT && global.HARSHIT_BACKLOG_DEFAULT.exportedAt;
      },
    ];
    for (var i = 0; i < sources.length; i++) {
      var v = sources[i]();
      if (v) return v;
    }
    return "";
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent =
      ".prm-doc-updated-bar{" +
      "box-sizing:border-box;width:100%;position:fixed;top:0;left:0;right:0;z-index:10000;" +
      "padding:.38rem 1rem;font-family:'Space Mono',ui-monospace,monospace;font-size:.7rem;" +
      "text-align:right;letter-spacing:.02em;color:rgba(255,255,255,.82);" +
      "background:#0f172a;border-bottom:1px solid rgba(255,255,255,.1);}" +
      ".prm-doc-updated-bar .prm-doc-updated-inner{display:inline-block;}" +
      "body.prm-doc-bar-on{--prm-doc-bar-height:28px;}" +
      "body.prm-doc-bar-on{padding-top:var(--prm-doc-bar-height);}" +
      "body.prm-doc-bar-on #sidebar{top:var(--prm-doc-bar-height);height:calc(100vh - var(--prm-doc-bar-height));}" +
      "@media print{.prm-doc-updated-bar{position:static;}}";
    document.head.appendChild(s);
  }

  function applyLayoutOffset(bar) {
    if (!bar || !document.body) return;
    var h = bar.offsetHeight || 28;
    document.body.classList.add("prm-doc-bar-on");
    document.documentElement.style.setProperty("--prm-doc-bar-height", h + "px");
    document.body.style.paddingTop = h + "px";
  }

  function renderBar(iso) {
    if (!iso || !document.body) return;
    if (document.body.getAttribute("data-prm-doc-updated") === "skip") return;

    var label = "Last updated: " + formatDate(iso);
    var slot = document.getElementById("prm-last-updated");
    if (slot) {
      slot.textContent = label;
      return;
    }

    var targetSel = document.body.getAttribute("data-prm-updated-target");
    if (targetSel) {
      var target = document.querySelector(targetSel);
      if (target) {
        target.textContent = label;
        return;
      }
    }

    injectStyles();
    var bar = document.querySelector("." + BAR_CLASS);
    if (!bar) {
      bar = document.createElement("div");
      bar.className = BAR_CLASS;
      bar.setAttribute("role", "status");
      bar.setAttribute("aria-live", "polite");
      document.body.insertBefore(bar, document.body.firstChild);
    }
    bar.innerHTML = '<span class="prm-doc-updated-inner">' + label + "</span>";
    applyLayoutOffset(bar);
  }

  function resolveIso() {
    return detectFromGlobals() || getMetaIso();
  }

  function mount() {
    var iso = resolveIso();
    if (iso) renderBar(iso);
  }

  function setLastUpdated(iso) {
    if (!iso) return;
    global.PRM_DOC_LAST_UPDATED = iso;
    var meta = document.querySelector('meta[name="doc-last-updated"]');
    if (meta) meta.setAttribute("content", iso);
    else if (document.head) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "doc-last-updated");
      meta.setAttribute("content", iso);
      document.head.appendChild(meta);
    }
    renderBar(iso);
  }

  global.PRM_DOC_META = {
    mount: mount,
    setLastUpdated: setLastUpdated,
    format: formatDate,
    getIso: resolveIso,
  };

  function onReady() {
    mount();
    setTimeout(mount, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})(typeof window !== "undefined" ? window : this);
