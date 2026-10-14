/**
 * normalize.js — text normalisation helper for the local chat search.
 */

/**
 * Lower-cases the text, strips accents, punctuation, emojis and extra spaces.
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text) {
  if (typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // strip accents
    .replace(/[^\w\s]/gi, '')         // strip punctuation and emojis, keep letters, numbers, spaces
    .replace(/\s+/g, ' ')             // collapse repeated spaces
    .trim();
}
