/**
 * Show the event card.
 * @param {Object} evt
 * @returns {Promise} resolves immediately so we can await a fixed display duration.
 */
function showEventCard(evt) {
  return new Promise(resolve => {
    const overlay = document.getElementById("event-overlay");
    overlay.style.display = "flex";
    overlay.innerHTML = `
      <div class="event-card">
        <div class="event-content">
          <h2>${evt.Title}</h2>
          <div class="datetime">${evt.Date} | ${evt.Time}</div>
          <div class="location">${evt.Location}</div>
          <div class="blurb">${evt.Blurb}</div>
        </div>
        <div class="qr-section">
          <div id="qr-code"></div>
          <span>Scan to RSVP</span>
        </div>
        <img id="event-logo" src="assets/logo.png" alt="Logo" />
      </div>`;
    generateQRCode(document.getElementById("qr-code"), evt.QR_Link);

    // kick off fadeIn
    const card = overlay.querySelector(".event-card");
    card.style.animation = "fadeInSlide 0.6s ease-out forwards";

    resolve();
  });
}

/**
 * Hide the event card with fade-out, then clear overlay.
 * @returns {Promise} resolves after fade-out completes.
 */
function hideEventCard() {
  return new Promise(resolve => {
    const overlay = document.getElementById("event-overlay");
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
