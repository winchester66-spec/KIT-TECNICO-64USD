/**
 * config.js — SINGLE SOURCE OF TRUTH for the whole site.
 *
 * Edit the values below and they update everywhere:
 *   - every "Buy" button on the page (index.html)
 *   - the price shown in the offer section
 *   - the chat assistant answers (it replaces {{PRICE}}, {{CHECKOUT_URL}}, {{SUPPORT_EMAIL}})
 *   - the refund / guarantee line
 *
 * >>> BEFORE YOU RUN ANY ADS: set `checkoutUrl` to your US checkout link. <<<
 *     (Stripe Payment Link, Gumroad, Lemon Squeezy, PayPal, Payhip, etc.)
 *     The old KiwiFy link charges in BRL (Brazilian Real) and will not accept
 *     most US cards at a USD price, so do not use it here.
 */

export const SITE = {
  // ---- Product & price -------------------------------------------------
  productName: 'Tech Toolkit 64GB 2026',
  price: 12,                    // number only
  currency: 'USD',
  currencySymbol: '$',
  compareAtPrice: null,         // e.g. 39 — leave null unless it is a real previous price
  billing: 'one-time payment',  // shown under the price
  priceNote: 'One-time payment. Lifetime access and updates included.',

  // ---- Checkout --------------------------------------------------------
  // Paste your own international checkout link here (must accept USD).
  checkoutUrl: 'PASTE-YOUR-CHECKOUT-LINK-HERE',

  // ---- Support ---------------------------------------------------------
  // Replace with the e-mail you actually monitor.
  supportEmail: 'support@yourdomain.com',
  supportHours: 'Mon–Fri, 9am–6pm (EST)',

  // ---- Refund policy ---------------------------------------------------
  // Leave null if you do not advertise a refund window.
  // Set to 7 or 30 to display the badge and enable the refund answer in chat.
  guaranteeDays: null,

  // ---- Extras ----------------------------------------------------------
  usbSize: '64 GB',
  programCount: '160+',
  showUsbRecommendation: true,
};

/** Convenience string used across the page and the chat: "$12" */
export const PRICE_LABEL = `${SITE.currencySymbol}${SITE.price}`;
