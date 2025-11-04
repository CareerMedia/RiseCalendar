/* ========================================
   js/calendar.js — Month View & Multi-Event
   ======================================== */

const calendarGrid = document.getElementById("calendar-grid");
const monthTitleEl = document.getElementById("month-title");

/** Header: “<Month> Events” */
function setMonthTitle() {
  const now = new Date();
  const names = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  monthTitleEl.textContent = `${names[now.getMonth()]} Events`;
}

/** Draw a fixed 31-day grid with small weekday label */
function drawCalendarGrid() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  calendarGrid.innerHTML = "";
  for (let i = 1; i <= 31; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.dataset.day = i;

    const dateObj = new Date(y, m, i);
    const dow = dateObj.toLocaleString(undefined, { weekday: "short" });

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

/** Show ALL titles for a day, in feed order (titles only) */
function highlightCalendarDays(events) {
  // Group by day number already computed in events.js
  const byDay = {};
  events.forEach(e => {
    const d = Number(e.Day);
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(e);
  });

  Object.entries(byDay).forEach(([dayStr, list]) => {
    const day = Number(dayStr);
    const cell = calendarGrid.querySelector(`.calendar-day[data-day='${day}']`);
    if (!cell) return;

    if (list.length) {
      cell.classList.add("event");
      const previewEl = cell.querySelector(".event-title-preview");
      // Only show the title for each event
      previewEl.innerHTML = list
        .map(ev => `<div class="event-preview-item">${escapeHTML(ev.Title || "")}</div>`)
        .join("");
    }
  });
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, m =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[m])
  );
}
