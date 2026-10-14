/**
 * faqEngine.js — loads the local knowledge base and answers questions.
 *
 * Tokens are replaced at runtime with the values from config.js:
 *   {{CHECKOUT_URL}}  {{SUPPORT_EMAIL}}  {{PRICE}}  {{PRODUCT_NAME}}  {{USB_SIZE}}  {{GUARANTEE}}
 */

import { findBestIntent } from './matcher.js';
import { SITE, PRICE_LABEL } from '../config.js';

let faqData = null;

export async function initFaqEngine() {
  if (faqData) return;

  try {
    const faqUrl = new URL('../knowledge/faq.json', import.meta.url).href;
    const response = await fetch(faqUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    faqData = await response.json();
  } catch (err) {
    console.error('Could not load knowledge/faq.json:', err);
    faqData = [];
  }
}

/** Replace the config tokens inside an answer string */
function applyTokens(text) {
  if (typeof text !== 'string') return text;
  const checkout = SITE.checkoutUrl && SITE.checkoutUrl !== 'PASTE-YOUR-CHECKOUT-LINK-HERE'
    ? SITE.checkoutUrl
    : null;

  const guarantee = SITE.guaranteeDays
    ? `Every purchase is covered by our ${SITE.guaranteeDays}-day money-back guarantee.`
    : '';

  return text
    .replace(/\{\{PRICE\}\}/g, PRICE_LABEL)
    .replace(/\{\{PRODUCT_NAME\}\}/g, SITE.productName)
    .replace(/\{\{USB_SIZE\}\}/g, SITE.usbSize)
    .replace(/\{\{SUPPORT_EMAIL\}\}/g, SITE.supportEmail)
    .replace(/\{\{GUARANTEE\}\}/g, guarantee)
    .replace(/\{\{CHECKOUT_URL\}\}/g, checkout || '#offer')
    .replace(/\{\{CHECKOUT_LINK\}\}/g, checkout ? `[Get instant access](${checkout})` : 'the checkout button on this page');
}

export function getReply(query) {
  if (!faqData || faqData.length === 0) {
    return {
      response: "Hi! I'm still loading my question database. Could you send that again in a moment?",
      followup: 'Want to try once more?'
    };
  }

  const matchedIntent = findBestIntent(query, faqData);

  if (matchedIntent) {
    return {
      response: applyTokens(matchedIntent.response),
      followup: applyTokens(matchedIntent.followup)
    };
  }

  return {
    response: `I'm not 100% sure I understood that one. I can help with what's included, price and payment, delivery, Windows compatibility, USB setup and support — or you can reach a human at ${SITE.supportEmail}.`,
    followup: 'Would you like the purchase link so you can check it out yourself?'
  };
}
