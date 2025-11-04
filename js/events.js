/* ==============================================
   js/events.js — Load & Parse events.csv data
   ============================================== */

const CSV_PATH = "data/events.csv";

/** Fetch & parse the CSV, preserving row order */
async function loadEventsFromCSV() {
  try {
    const res  = await fetch(CSV_PATH);
    const text = await res.text();
    const rows = parseCSV(text);
    const cleaned = rows.filter(e => {
      const d = parseInt(e.Day, 10);
      return !isNaN(d) && d >= 1 && d <= 31;
    });
    console.log(`📥 Loaded ${rows.length} rows, ${cleaned.length} with valid Day`);
    return cleaned;
  } catch (err) {
    console.error("❌ Could not load events.csv:", err);
    return [];
  }
}

/** Convert CSV to array of objects in original order */
function parseCSV(raw) {
  const [header, ...lines] = raw.trim().split("\n");
  const keys = header.split(",").map(h => h.trim());
  return lines.map(line => {
    const vals = line.split(",").map(cell => cell.trim());
    const obj  = {};
    keys.forEach((k, i) => (obj[k] = vals[i] || ""));
    return obj;
  });
}
