/* ========================================
   js/calendar.js — Month View & Multi-Event
   ======================================== */

const calendarGrid = document.getElementById("calendar-grid");
const monthTitleEl = document.getElementById("month-title");

/** 1. Header: “<Month> Events” */
function setMonthTitle() {
  const now   = new Date();
  const names = ["January","February","March","April","May","June",
                 "July","August","September","October","November","December"];
  monthTitleEl.textContent = `${names[now.getMonth()]} Events`;
}

/** 2. Draw 31-day grid */
function drawCalendarGrid() {
  calendarGrid.innerHTML = "";
  for (let d = 1; d <= 31; d++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.dataset.day = d;

    const num = document.createElement("div");
    num.className = "day-number";
    num.textContent = d;

    const preview = document.createElement("div");
    preview.className = "event-title-preview";

    cell.append(num, preview);
    calendarGrid.append(cell);
  }
}

/**
 * 3. Highlight days: stack ALL event titles
 * @param {Array<Object>} items — from loadEventsFromCSV()
 */
function highlightCalendarDays(items) {
  const byDay = {};
  items.forEach(e => {
    const day = parseInt(e.Day, 10);
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(e);
  });

  Object.entries(byDay).forEach(([dayStr, arr]) => {
    const day  = Number(dayStr);
    const cell = calendarGrid.querySelector(`.calendar-day[data-day='${day}']`);
    if (!cell) return;

    // Events = anything NOT explicitly a holiday
    const evs = arr.filter(e => (e.Type||"").trim().toLowerCase() !== "holiday");
    if (evs.length) {
      cell.classList.add("event");
      const previewEl = cell.querySelector(".event-title-preview");
      previewEl.innerHTML = evs
        .map(ev => `<div class="event-preview-item">${ev.Title}</div>`)
        .join("");
    }

    // Holidays (only if no events)
    if (!evs.length) {
      const hol = arr.filter(e => (e.Type||"").trim().toLowerCase() === "holiday");
      if (hol.length) {
        cell.classList.add("holiday");
        const marker = document.createElement("div");
        marker.className = "holiday-marker";
        marker.textContent = hol[0].Title;
        cell.append(marker);
      }
    }
  });
}
