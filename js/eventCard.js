/* ======================================
   js/eventCard.js — Show & Teardown Card
   (Class-driven overlay; starts closed)
   ====================================== */

const overlay = document.getElementById("event-overlay");

/** Hard-close overlay in case anything left styles behind */
function forceOverlayClosed() {
  if (!overlay) return;
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = "";
  // Nuke any inline styles that might have been set elsewhere
  overlay.style.background = "none";
  overlay.style.backdropFilter = "none";
  overlay.style.webkitBackdropFilter = "none";
  overlay.style.pointerEvents = "none";
  overlay.style.visibility = "hidden";
  overlay.style.opacity = "0";
}

/**
 * Show the event card.
 * Adds a “continue reading” cue if the blurb is too long.
 * @param {Object} evt
 * @returns {Promise<void>}
 */
function showEventCard(evt) {
  return new Promise(resolve => {
    // Open overlay (enables blur + clicks)
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    overlay.innerHTML = "";

    const card = document.createElement("div");
    card.className = "event-card";

    // LEFT: image + content
    const left = document.createElement("div");
    left.className = "event-content";

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
 * Fade out & close overlay.
 * @returns {Promise<void>}
 */
function hideEventCard() {
  return new Promise(resolve => {
    const card = overlay.querySelector(".event-card");
    if (!card) {
      forceOverlayClosed();
      return resolve();
    }
    card.style.animation = "fadeOutSlide 0.6s ease-in forwards";
    card.addEventListener("animationend", () => {
      forceOverlayClosed();
      resolve();
    }, { once: true });
  });
}

/* Ensure overlay starts hard-closed even if CSS/HTML changed */
document.addEventListener("DOMContentLoaded", forceOverlayClosed);
