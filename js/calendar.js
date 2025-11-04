/* ========================================
   js/calendar.js — Month View & Multi-Event
   ======================================== */

const calendarGrid = document.getElementById("calendar-grid");
const monthTitleEl = document.getElementById("month-title");

/** Sets header to “<Month> Events” */
function setMonthTitle() {
  const now = new Date();
  const names = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  monthTitleEl.textContent = `${names[now.getMonth()]} Events`;
}

/** Draw a fixed 31-day grid with a small weekday label */
function drawCalendarGrid() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  calendarGrid.innerHTML = "";
  for (let i = 1; i <= 31; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.dataset.day = i;

    // weekday label for the current month date
    const d = new Date(y, m, i);
    const dow = d.toLocaleString(undefined, { weekday: "short" });

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.setAttribute("data-daynum", i);

    const dowSpan = document.createElement("span");
    dowSpan.className = "dow";
    dowSpan.textContent = dow;
    dayNumber.appendChild(dowSpan);

    const preview = document.createElement("div");
    preview.className = "event-title-preview";

    cell.append(dayNumber, preview);
    calendarGrid.append(cell);
  }
}

/** Highlight days & stack ALL events per day in feed order */
function highlightCalendarDays(events) {
  // Group by day
  const byDay = {};
  events.forEach(e => {
    const d = parseInt(e.Day, 10);
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(e);
  });

  Object.keys(byDay).forEach(dayKey => {
    const dayNum = Number(dayKey);
    const cell = calendarGrid.querySelector(`.calendar-day[data-day='${dayNum}']`);
    if (!cell) return;

    const allForDay = byDay[dayNum];

    // Render events (we treat any item as event; the feed doesn’t have 'holiday')
    if (allForDay.length) {
      cell.classList.add("event");
      const previewEl = cell.querySelector(".event-title-preview");
      previewEl.innerHTML = allForDay
        .map(ev => `<div class="event-preview-item">${ev.Title}</div>`)
        .join("");
    }
  });
}
