/**
 * PRM standard date display: MM-DD-YYYY everywhere user-facing.
 * Store/compare as ISO YYYY-MM-DD in data and <input type="date">.
 */
(function (global) {
  var MONTHS = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  var MONTH_RE = "(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";

  function pad2(n) {
    n = String(n);
    return n.length < 2 ? "0" + n : n;
  }

  function fromDate(d) {
    if (!d || isNaN(d.getTime())) return "";
    return pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + "-" + d.getFullYear();
  }

  function todayIso() {
    var d = new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function parseNamedMonth(text, defaultYear) {
    var s = String(text || "").trim();
    if (!s) return null;
    var m = s.match(new RegExp("^" + MONTH_RE + "\\s+(\\d{1,2})(?:,?\\s*(\\d{4}))?$", "i"));
    if (!m) return null;
    var year = m[3] ? +m[3] : defaultYear != null ? defaultYear : new Date().getFullYear();
    return new Date(year, MONTHS[m[1].slice(0, 3).toLowerCase()], +m[2]);
  }

  /** User-facing format: MM-DD-YYYY */
  function format(input) {
    if (input == null || input === "") return "";
    if (input instanceof Date) return fromDate(input);
    var s = String(input).trim();
    if (!s || s === "—") return s;
    var low = s.toLowerCase();
    if (low === "done" || low === "ongoing" || low === "weekly" || low === "tbd") return s;

    var iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return iso[2] + "-" + iso[3] + "-" + iso[1];

    if (/^\d{2}-\d{2}-\d{4}$/.test(s)) return s;

    var mdy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (mdy) return pad2(mdy[1]) + "-" + pad2(mdy[2]) + "-" + mdy[3];

    var named = parseNamedMonth(s);
    if (named && !isNaN(named.getTime())) return fromDate(named);

    var monYear = s.match(new RegExp("^" + MONTH_RE + "\\s+(\\d{4})$", "i"));
    if (monYear) {
      var d = new Date(+monYear[2], MONTHS[monYear[1].slice(0, 3).toLowerCase()], 1);
      return fromDate(d);
    }

    return s;
  }

  function formatRange(text) {
    if (text == null || text === "") return "";
    var s = String(text).trim();
    var parts = s.split(/\s*[–—]\s*|\s+-\s+/);
    if (parts.length === 2) {
      return format(parts[0].trim()) + " – " + format(parts[1].trim());
    }
    var short = s.match(new RegExp("^(" + MONTH_RE + "\\s+)(\\d{1,2})[–—](\\d{1,2})$", "i"));
    if (short) {
      var year = new Date().getFullYear();
      var mon = short[1].trim();
      return format(mon + " " + short[2]) + " – " + format(mon + " " + short[3]);
    }
    return format(s);
  }

  /** Format dates embedded in labels, ranges, and prose. */
  function formatText(text) {
    if (text == null || text === "") return "";
    var s = String(text);
    var low = s.toLowerCase();
    if (low === "done" || low === "ongoing" || low === "weekly" || low === "tbd") return s;

    s = s.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, function (_, y, m, d) {
      return m + "-" + d + "-" + y;
    });

    s = s.replace(
      new RegExp(
        "(" + MONTH_RE + "\\s+\\d{1,2}(?:,?\\s*\\d{4})?)\\s*[–—]\\s*(" + MONTH_RE + "\\s+\\d{1,2}(?:,?\\s*\\d{4})?)",
        "gi"
      ),
      function (_, a, b) {
        return format(a.trim()) + " – " + format(b.trim());
      }
    );

    s = s.replace(
      new RegExp("(" + MONTH_RE + "\\s+)(\\d{1,2})[–—](\\d{1,2})(?!\\d)", "gi"),
      function (_, mon, d1, d2) {
        var m = mon.trim();
        return format(m + " " + d1) + " – " + format(m + " " + d2);
      }
    );

    s = s.replace(new RegExp(MONTH_RE + "\\s+\\d{1,2}(?:,?\\s*\\d{4})?", "gi"), function (m) {
      return format(m);
    });

    s = s.replace(new RegExp(MONTH_RE + "\\s+\\d{4}", "gi"), function (m) {
      return format(m);
    });

    if (/^today\b/i.test(s)) {
      s = s.replace(/^today\s*[·•\-]\s*/i, "Today · ");
      s = s.replace(new RegExp("Today\\s*[·•\\-]\\s*(" + MONTH_RE + "\\s+\\d{1,2}(?:,?\\s*\\d{4})?)", "i"), function (_, d) {
        return "Today · " + format(d);
      });
    }

    return s;
  }

  function isOverdueIso(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(String(iso))) return false;
    return String(iso) < todayIso();
  }

  global.PRM_DATE_FORMAT = {
    DISPLAY: "MM-DD-YYYY",
    format: format,
    formatText: formatText,
    formatRange: formatRange,
    fromDate: fromDate,
    todayIso: todayIso,
    isOverdueIso: isOverdueIso,
  };
  global.fmtDate = format;
  global.fmtDateText = formatText;
})(typeof window !== "undefined" ? window : this);
