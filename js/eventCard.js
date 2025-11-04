/* ======================================
   js/eventCard.js — Show & Teardown Card
   ====================================== */

const overlay = document.getElementById("event-overlay");

/**
 * Show the event card with image above the title on the left.
 * Adds a “continue reading” cue if the blurb is too long.
 * @param {Object} evt
 * @returns {Promise<void>}
 */
function showEventCard(evt) {
  return new Promise(resolve => {
    overlay.style.display = "flex";
    overlay.innerHTML = "";

    const card = document.createElement("div");
    card.className = "event-card";

    // LEFT: image + content
    const left = document.createElement("div");
    left.className = "event-content";

    // Hero image (900x600 aspect)
    const hero = document.createElement("div");
    hero.className = "event-hero";
    const img = document.createElement("img");
    img.src = evt.Image || "assets/placeholder-900x600.png";
    img.alt = evt.Title || "Event Image";
    hero.appendChild(img);

    const title = document.createElement("h2");
    title.textContent = evt.Title || "";

    const meta = document.createElement("div");
    meta.className = "meta";
    const dt = document.createElement("div");
    dt.textContent = `${evt.Date || ""} • ${evt.Time || ""}`;
    const loc = document.createElement("div");
    loc.textContent = evt.Location || "";
    meta.append(dt, loc);

    const blurb = document.createElement("div");
    blurb.className = "blurb";
    blurb.textContent = evt.Blurb || "";

    // Optional note if truncated
    const blurbNote = document.createElement("div");
    blurbNote.style.display = "none";
    blurbNote.style.marginTop = ".5rem";
    blurbNote.style.color = "#666";
    blurbNote.style.fontSize = ".95rem";
    blurbNote.style.fontWeight = "600";
    blurbNote.textContent = "... Scan QR Code to Continue Reading";

    left.append(hero, title, meta, blurb, blurbNote);

    // RIGHT: QR
    const right = document.createElement("div");
    right.className = "qr-section";
    const qrHolder = document.createElement("div");
    qrHolder.id = "qr-code";
    const qrLabel = document.createElement("span");
    qrLabel.textContent = "Scan to RSVP";
    right.append(qrHolder, qrLabel);

    // Generate QR from event link
    generateQRCode(qrHolder, evt.QR_Link || window.location.href);

    // Logo
    const logo = document.createElement("img");
    logo.id = "event-logo";
    logo.src = "assets/logo.png";
    logo.alt = "Career Center Logo";

    card.append(left, right, logo);
    overlay.append(card);

    // Animate in
    card.style.animation = "fadeInSlide 0.6s ease-out forwards";

    // After layout, detect overflow and show the note if needed
    requestAnimationFrame(() => {
      if (blurb.scrollHeight > blurb.clientHeight + 2) {
        blurbNote.style.display = "block";
      }
      resolve();
    });
  });
}

/**
 * Fade out & hide overlay.
 * @returns {Promise<void>}
 */
function hideEventCard() {
  return new Promise(resolve => {
    const card = overlay.querySelector(".event-card");
    if (!card) {
      overlay.style.display = "none";
      return resolve();
    }
    card.style.animation = "fadeOutSlide 0.6s ease-in forwards";
    card.addEventListener("animationend", () => {
      overlay.style.display = "none";
      overlay.innerHTML = "";
      resolve();
    }, { once: true });
  });
}
