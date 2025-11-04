/* ======================================
   js/eventCard.js — Show & Teardown Card
   (Overlay at body root; robust guards & globals)
   ====================================== */

(function () {
  const overlay = document.getElementById("event-overlay");

  /** Hard-close overlay in case anything left styles behind */
  function forceOverlayClosed() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = "";
    overlay.style.background = "none";
    overlay.style.backdropFilter = "none";
    overlay.style.webkitBackdropFilter = "none";
    overlay.style.pointerEvents = "none";
    overlay.style.visibility = "hidden";
    overlay.style.opacity = "0";
    try { console.debug("[overlay] forced closed"); } catch {}
  }

  /**
   * Show the event card.
   * @param {Object} evt
   * @returns {Promise<void>}
   */
  async function showEventCard(evt) {
    return new Promise(resolve => {
      if (!overlay) {
        console.error("[overlay] #event-overlay not found");
        return resolve();
      }

      try {
        // Open overlay (enables blur + clicks)
        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        overlay.innerHTML = "";
        console.debug("[overlay] open & cleared");

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

        // Generate QR from event link (guarded)
        try {
          if (typeof generateQRCode === "function") {
            generateQRCode(qrHolder, evt.QR_Link || window.location.href);
          } else {
            console.warn("[overlay] generateQRCode missing");
          }
        } catch (qrErr) {
          console.warn("[overlay] QR generation failed:", qrErr);
        }

        // Logo
        const logo = document.createElement("img");
        logo.id = "event-logo";
        logo.src = "assets/logo.png";
        logo.alt = "Career Center Logo";

        card.append(left, right, logo);
        overlay.append(card);
        console.debug("[overlay] card appended");

        // Force a reflow before starting CSS animation (prevents no-op)
        // eslint-disable-next-line no-unused-expressions
        card.offsetHeight;

        // Animate in
        card.style.animation = "fadeInSlide 0.6s ease-out forwards";

        // After layout, detect overflow and show the note if needed
        requestAnimationFrame(() => {
          try {
            if (blurb.scrollHeight > blurb.clientHeight + 2) {
              blurbNote.style.display = "block";
            }
          } catch {}
          resolve();
        });
      } catch (err) {
        console.error("[overlay] showEventCard failed:", err);
        forceOverlayClosed();
        resolve();
      }
    });
  }

  /**
   * Fade out & close overlay.
   * @returns {Promise<void>}
   */
  function hideEventCard() {
    return new Promise(resolve => {
      if (!overlay) return resolve();

      try {
        const card = overlay.querySelector(".event-card");
        if (!card) {
          forceOverlayClosed();
          return resolve();
        }

        // Force reflow before starting fadeOut (reliable on more browsers)
        // eslint-disable-next-line no-unused-expressions
        card.offsetHeight;

        card.style.animation = "fadeOutSlide 0.6s ease-in forwards";
        card.addEventListener("animationend", () => {
          forceOverlayClosed();
          resolve();
        }, { once: true });
      } catch (err) {
        console.error("[overlay] hideEventCard failed:", err);
        forceOverlayClosed();
        resolve();
      }
    });
  }

  /* Ensure overlay starts hard-closed even if CSS/HTML changed */
  document.addEventListener("DOMContentLoaded", forceOverlayClosed);

  /* Expose globally in case of scope/bundler differences */
  window.showEventCard = showEventCard;
  window.hideEventCard = hideEventCard;
  window.forceOverlayClosed = forceOverlayClosed;
})();
