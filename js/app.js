/* ===================================
   js/app.js — Loader + Main Orchestrator (JSON feed)
   =================================== */

const INITIAL_LOADER_DURATION  = 2000;   // loader
const CALENDAR_PAUSE_DURATION  = 20000;  // calendar visible
const EVENT_CARD_DURATION      = 15000;  // per event
const BETWEEN_EVENTS_DELAY     = 1200;   // tiny gap
const HOURLY = 60 * 60 * 1000;

let eventList = [];        // current-month events (feed order)
let currentIndex = 0;
let dayTiles = [];

/** Sleep helper */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Hide loader & show the app */
function showApp() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
  document.getElementById("app").classList.remove("hidden");
}

/** Load calendar + current-month events */
async function initializeData() {
  setMonthTitle();        // calendar.js
  drawCalendarGrid();     // calendar.js

  eventList = await loadEventsFromFeedForCurrentMonth(); // events.js
  highlightCalendarDays(eventList);                       // calendar.js

  dayTiles = Array.from(document.querySelectorAll(".calendar-day"));
  console.log(`🔔 Scheduling ${eventList.length} pop-ups (current month)`);
}

/** Refresh events hourly (non-blocking to the loop) */
function scheduleHourlyRefresh() {
  setInterval(async () => {
    const updated = await refreshEventsIntoState(); // events.js
    if (updated && Array.isArray(updated)) {
      highlightCalendarDays(updated);
      eventList = updated;
      console.log(`⟳ Feed refreshed. Current-month events: ${eventList.length}`);
      if (currentIndex >= eventList.length) currentIndex = 0;
    }
  }, HOURLY);
}

/** The perpetual loop */
async function runEventLoop() {
  if (!eventList.length) {
    console.warn("No events to display.");
    return;
  }

  // Initial calendar pause
  await sleep(CALENDAR_PAUSE_DURATION);

  while (true) {
    const evt = eventList[currentIndex];
    const dayNum = Number(evt.Day) - 1;
    const tile = dayTiles[dayNum];

    if (tile) {
      // Pulse the tile
      tile.classList.add("pulse");
      await sleep(500);

      // Show pop-up
      if (typeof window.showEventCard === "function") {
        await window.showEventCard(evt);
      }
      await sleep(EVENT_CARD_DURATION);

      // Hide
      tile.classList.remove("pulse");
      if (typeof window.hideEventCard === "function") {
        await window.hideEventCard();
      }
    }

    // Calendar pause
    await sleep(CALENDAR_PAUSE_DURATION);

    // Advance & wrap
    currentIndex = (currentIndex + 1) % eventList.length;

    await sleep(BETWEEN_EVENTS_DELAY);
  }
}

/** Entry */
document.addEventListener("DOMContentLoaded", async () => {
  // Ensure overlay is definitely closed at boot
  if (typeof window.forceOverlayClosed === "function") window.forceOverlayClosed();

  await initializeData();

  setTimeout(() => {
    showApp();
    runEventLoop().catch(err => console.error("Loop error:", err));
    scheduleHourlyRefresh();
  }, INITIAL_LOADER_DURATION);
});
