/* ==============================================
   js/events.js — JSON Feed Loader (hourly refresh)
   ============================================== */

const FEED_URL = "https://news.csun.edu/wp-json/csunfeeds/v1/events-feed/career-center";
const FEED_CACHE_KEY = "csun_events_cache_v2";
const FEED_CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Public API used by app.js
 * Loads normalized events for the current month (preserving feed order)
 */
async function loadEventsFromFeedForCurrentMonth() {
  const raw = await fetchFeedWithCache();
  const normalized = normalizeFeed(raw);
  const monthFiltered = filterToCurrentMonth(normalized);
  console.log(`📥 Feed items: ${normalized.length} | This month: ${monthFiltered.length}`);
  return monthFiltered;
}

/** Hourly refetch hook (app.js calls this too) */
async function refreshEventsIntoState() {
  const raw = await fetchFeedWithCache(true); // force network if TTL expired
  const normalized = normalizeFeed(raw);
  return filterToCurrentMonth(normalized);
}

/** Fetch with cache + TTL */
async function fetchFeedWithCache(force = false) {
  try {
    const cached = JSON.parse(localStorage.getItem(FEED_CACHE_KEY) || "null");
    const now = Date.now();
    if (!force && cached && (now - cached.timestamp < FEED_CACHE_TTL) && Array.isArray(cached.data)) {
      return cached.data;
    }

    const res = await fetch(`${FEED_URL}?_=${now}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    localStorage.setItem(FEED_CACHE_KEY, JSON.stringify({ timestamp: now, data }));
    return data;
  } catch (err) {
    console.warn("⚠️ Feed fetch failed, using cache if available:", err);
    const cached = JSON.parse(localStorage.getItem(FEED_CACHE_KEY) || "null");
    if (cached && Array.isArray(cached.data)) return cached.data;
    return [];
  }
}

/** Normalize feed to internal structure used by the app */
function normalizeFeed(items) {
  if (!Array.isArray(items)) return [];

  return items.map((e, idx) => {
    // ---- Robust field mapping from the sample feed ----
    const title =
      (typeof e.title === "string" ? e.title : get(e, ["title", "rendered"])) ||
      e.name ||
      `Event ${idx + 1}`;

    const url =
      e.url || e.link || e.permalink || e.registration || "#";

    // Start / End — prefer event_object.start_date & end_date
    const startStr =
      get(e, ["event_object", "start_date"]) ||
      get(e, ["event_object", "dates", "start", "date"]) ||
      e.start_date || e.start || e.published_date || "";

    const endStr =
      get(e, ["event_object", "end_date"]) ||
      get(e, ["event_object", "dates", "end", "date"]) ||
      e.end_date || e.end || "";

    const start = parseDateFlexible(startStr) || new Date();
    const end   = parseDateFlexible(endStr);

    // Location (several possible places)
    const location = e.location ||
                     get(e, ["venues", 0, "post_title"]) ||
                     get(e, ["event_object", "venues", 0, "post_title"]) ||
                     "";

    // Description / excerpt -> plain text
    const blurb = stripHTML(e.excerpt || e.content || get(e, ["event_object", "excerpt"]) || "");

    // Featured image
    const image =
      get(e, ["featured_image", "url"]) ||
      get(e, ["featured_image", "sizes", "full", "url"]) ||
      e.image_url || e.image || "";

    // Time label
    const time = buildTimeRange(start, end);

    // Date label (e.g., "Wed, Nov 5")
    const dateLabel = start.toLocaleString(undefined, {
      weekday: "short", month: "short", day: "numeric"
    });

    return {
      Day: start.getDate(),       // <-- drives the calendar placement
      Title: title,
      Date: dateLabel,
      Time: time,
      Location: location,
      Blurb: blurb,
      QR_Link: url,
      Type: "event",
      Image: image,
      _start: start               // keep raw for filtering/logging
    };
  });
}

/** Filter to events occurring in the current month/year */
function filterToCurrentMonth(arr) {
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();
  return arr.filter(e => {
    const d = e._start instanceof Date ? e._start : new Date();
    return d.getMonth() === m && d.getFullYear() === y;
  });
}

/** Helpers */
function get(obj, pathArr) {
  let cur = obj;
  for (const key of pathArr) {
    if (cur == null) return undefined;
    cur = cur[key];
  }
  return cur;
}

function parseDateFlexible(any) {
  if (!any) return null;
  if (any instanceof Date && !isNaN(any.getTime())) return any;

  if (typeof any === "number") {
    const d = new Date(any);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof any === "string") {
    // Normalize "YYYY-MM-DD HH:mm:ss" → "YYYY-MM-DDTHH:mm:ss"
    const s = any.trim().replace(" ", "T");
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

function stripHTML(html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
}

function buildTimeRange(start, end) {
  const opts = { hour: "numeric", minute: "2-digit" };
  const s = start.toLocaleTimeString(undefined, opts);
  if (!end) return s;
  const e = end.toLocaleTimeString(undefined, opts);
  return `${s} – ${e}`;
}
