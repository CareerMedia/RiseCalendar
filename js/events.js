/* ==============================================
   js/events.js — JSON Feed Loader (hourly refresh)
   ============================================== */

const FEED_URL = "https://news.csun.edu/wp-json/csunfeeds/v1/events-feed/career-center";
const FEED_CACHE_KEY = "csun_events_cache_v1";
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
    return []; // nothing we can do
  }
}

/** Normalize feed to internal structure used by the app */
function normalizeFeed(items) {
  if (!Array.isArray(items)) return [];

  return items.map((e, idx) => {
    // Robust field mapping with safe fallbacks
    const title =
      get(e, ["title", "rendered"]) ||
      e.title ||
      e.name ||
      `Event ${idx + 1}`;

    const url =
      e.link || e.url || e.permalink || e.registration || "#";

    // Dates/times (try multiple keys)
    const startStr =
      e.start || e.start_date || e.date || e.startDate || e.start_time || e.datetime || "";
    const endStr =
      e.end || e.end_date || e.endDate || e.end_time || "";

    const start = parseDate(startStr) || new Date(e.dateTime || Date.now());
    const end   = parseDate(endStr)   || null;

    // Location
    const location = e.location || e.venue || e.place || e.room || "";

    // Description / excerpt
    const blurb =
      stripHTML(e.excerpt || e.description || e.content || e.summary || "");

    // Featured image
    const image =
      get(e, ["featured_image", "url"]) ||
      e.image_url || e.image || e.thumbnail || e.featuredImage || "";

    // Time display
    const time = buildTimeRange(start, end);

    // Date label (e.g., "Wed, Nov 5")
    const dateLabel = start.toLocaleString(undefined, {
      weekday: "short", month: "short", day: "numeric"
    });

    return {
      // calendar fields
      Day: start.getDate(),
      Title: title,
      Date: dateLabel,
      Time: time,
      Location: location,
      Blurb: blurb,
      QR_Link: url,
      Type: "event",
      Image: image,
      // for sorting or debugging
      _start: start
    };
  })
  // Keep original order from feed (no sorting), but
  // if needed, you can sort by start: .sort((a,b)=>a._start-b._start)
  ;
}

/** Filter to events that occur in the current month/year */
function filterToCurrentMonth(arr) {
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();
  return arr.filter(e => {
    const d = e._start || new Date();
    return d.getMonth() === m && d.getFullYear() === y;
  });
}

/** Helpers */
function get(obj, pathArr) {
  let cur = obj;
  for (const key of pathArr) {
    if (!cur) return undefined;
    cur = cur[key];
  }
  return cur;
}

function parseDate(any) {
  if (!any) return null;
  // Try ISO first
  const d = new Date(any);
  if (!isNaN(d.getTime())) return d;

  // Fallbacks: try parsing numbers or trimmed strings further if needed
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
