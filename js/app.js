/* ===================================
   js/app.js — Loader + Main Orchestrator
   =================================== */

const INITIAL_LOADER_DURATION  = 2000;   // loader time
const CALENDAR_PAUSE_DURATION  = 20000;  // calendar visible time
const EVENT_CARD_DURATION      = 15000;  // per-event display time
const BETWEEN_EVENTS_DELAY     = 1200;   // small gap between loops

let allItems     = [];
let eventList    = [];
let currentIndex = 0;
let dayTiles     = [];

/** Sleep helper */
function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

/** Hide loader & show the app */
function showApp() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("app").classList.remove("hidden");
}

/** Load calendar + data */
async function initializeData() {
  setMonthTitle();                   // calendar.js
  drawCalendarGrid();                // calendar.js

  allItems = await loadEventsFromCSV();     // events.js
  highlightCalendarDays(allItems);          // calendar.js

  // Pop-ups for every non-holiday row
  eventList = allItems.filter(e =>
    (e.Type || "").trim().toLowerCase() !== "holiday"
  );
  console.log(`🔔 ${allItems.length} rows, scheduling ${eventList.length} pop-ups`);
  
  dayTiles = Array.from(document.querySelectorAll(".calendar-day"));
}

/** Main loop */
async function runEventLoop() {
  if (!eventList.length) {
    console.warn("No events to display.");
    return;
  }

  // Initial pause on calendar
  await sleep(CALENDAR_PAUSE_DURATION);

  while (true) {
    const evt    = eventList[currentIndex];
    const dayNum = parseInt(evt.Day, 10) - 1;
    const tile   = dayTiles[dayNum];

    if (tile) {
      // Pulse the tile
      tile.classList.add("pulse");
      await sleep(500);

      // Show pop-up
      console.log(`➡️ Showing event ${currentIndex + 1}/${eventList.length}: "${evt.Title}"`);
      await showEventCard(evt);    // eventCard.js
      await sleep(EVENT_CARD_DURATION);

      // Hide pop-up
      tile.classList.remove("pulse");
      await hideEventCard();       // eventCard.js
    } else {
      console.warn("No tile found for day", evt.Day);
    }

    // Back to calendar
    await sleep(CALENDAR_PAUSE_DURATION);

    // Advance & wrap
    currentIndex = (currentIndex + 1) % eventList.length;
    await sleep(BETWEEN_EVENTS_DELAY);
  }
}

/** Kick off */
document.addEventListener("DOMContentLoaded", async () => {
  await initializeData();
  setTimeout(() => {
    showApp();
    runEventLoop().catch(err => console.error("Loop error:", err));
  }, INITIAL_LOADER_DURATION);
});
