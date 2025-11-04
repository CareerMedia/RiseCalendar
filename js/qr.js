/* ================================
   qr.js - QR Code Generator Logic
   ================================ */

/**
 * Generates a QR code in the given container element
 * @param {HTMLElement} container - The DOM node to render the QR code in
 * @param {string} url - The link to encode into the QR code
 */
function generateQRCode(container, url) {
  if (!url || !container) {
    console.warn("QR Code generation failed: missing URL or container.");
    return;
  }

  // Clear previous QR code (if any)
  container.innerHTML = "";

  new QRCode(container, {
    text: url,
    width: 160,
    height: 160,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H // Highest error correction for clarity
  });
}
