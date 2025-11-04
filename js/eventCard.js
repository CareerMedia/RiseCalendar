/* ======================================
   js/eventCard.js — Show & Teardown Card
   (Guaranteed overlay creation + inline visibility overrides)
   ====================================== */

(function () {
  const OVERLAY_ID = "event-overlay";
  const TOP_Z = 2147483647;

  function ensureOverlay() {
    let overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = OVERLAY_ID;
      document.body.appendChild(overlay);
    }

    // Ensure it lives at the very end of <body> (on top of all siblings)
    if (overlay.parentElement !== document.body || document.body.lastElementChild !== overlay) {
      document.body.appendChild(overlay);
    }

    // Absolute top-most + fixed full-viewport
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = String(TOP_Z);
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    // Default hidden (no blur, no paint, no clicks)
    overlay.style.visibility = "hidden";
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    overlay.style.background = "none";
    overlay.style.backdropFilter = "none";
    overlay.style.webkitBackdropFilter = "none";

    // Safe padding via CSS variables if your CSS is present; fallback here
    overlay.style.padding = overlay.style.padding || "24px";

    return overlay;
  }

  function forceOverlayClosed() {
    const overlay = ensureOverlay();
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = "";

    // Inline hard-hide (beats any CSS conflicts)
    overlay.style.display = "flex";          // keep centering context
    overlay.style.visibility = "hidden";
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    overlay.style.background = "none";
    overlay.style.backdropFilter = "none";
    overlay.style.webkitBackdropFilter = "none";
  }

  /**
   * Opens the overlay and injects the event card
   * @param {Object} evt
   */
  function showEventCard(evt) {
    return new Promise((resolve) => {
      const overlay = ensureOverlay();

      // Make overlay visible (inline overrides + class for your CSS)
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      overlay.style.display = "flex";
      overlay.style.visibility = "visible";
      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "auto";
      overlay.style.background = "rgba(255,255,255,0.2)";
      overlay.style.backdropFilter = "blur(30px)";
      overlay.style.webkitBackdropFilter = "blur(30px)";

      // Clear then build card
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

      // Note when truncated
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

      try {
        if (typeof generateQRCode === "function") {
          generateQRCode(qrHolder, evt.QR_Link || window.location.href);
        }
      } catch (qrErr) {
        console.warn("[eventCard] QR generation failed:", qrErr);
      }

      // Logo
      const logo = document.createElement("img");
      logo.id = "event-logo";
      logo.src = "assets/logo.png";
      logo.alt = "Career Center Logo";

      card.append(left, right, logo);
      overlay.append(card);

      // Force reflow then animate
      void card.offsetHeight;
      card.style.animation = "fadeInSlide 0.6s ease-out forwards";

      // After layout, detect overflow
      requestAnimationFrame(() => {
        try {
          if (blurb.scrollHeight > blurb.clientHeight + 2) {
            blurbNote.style.display = "block";
          }
        } catch {}
        resolve();
      });
    });
  }

  /**
   * Closes the overlay (with fade)
   */
  function hideEventCard() {
    return new Promise((resolve) => {
      const overlay = ensureOverlay();
      const card = overlay.querySelector(".event-card");
      if (!card) {
        forceOverlayClosed();
        return resolve();
      }
      void card.offsetHeight;
      card.style.animation = "fadeOutSlide 0.6s ease-in forwards";
      card.addEventListener(
        "animationend",
        () => {
          forceOverlayClosed();
          resolve();
        },
        { once: true }
      );
    });
  }

  // Ensure overlay starts hard-closed
  document.addEventListener("DOMContentLoaded", forceOverlayClosed);

  // Expose globally
  window.showEventCard = showEventCard;
  window.hideEventCard = hideEventCard;
  window.forceOverlayClosed = forceOverlayClosed;
})();
