/**
 * matcher.js — local intent matching algorithm (no external API needed).
 */

import { normalizeText } from './normalize.js';

/** Levenshtein distance between two words (typo tolerance). */
export function getLevenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1,   // insertion
            matrix[i - 1][j] + 1    // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Returns the best matching intent for a visitor question.
 * @param {string} query
 * @param {Array} intents - collection of intents from faq.json
 * @returns {Object|null}
 */
export function findBestIntent(query, intents) {
  const normQuery = normalizeText(query);
  if (!normQuery) return null;

  const queryWords = normQuery.split(' ').filter((w) => w.length > 0);
  let bestIntent = null;
  let maxScore = 0;

  for (const intent of intents) {
    let intentMaxScore = 0;
    const patterns = intent.patterns || [];

    for (const pattern of patterns) {
      const normPattern = normalizeText(pattern);

      // 1) Exact match
      if (normQuery === normPattern) {
        intentMaxScore = Math.max(intentMaxScore, 1.0);
        break;
      }

      // 2) Substring match (both directions)
      if (normQuery.includes(normPattern) && normPattern.length > 3) {
        intentMaxScore = Math.max(intentMaxScore, 0.85);
      }
      if (normPattern.includes(normQuery) && normQuery.length > 3) {
        intentMaxScore = Math.max(intentMaxScore, 0.8);
      }

      // 3) Token overlap with simple typo tolerance
      const patternWords = normPattern.split(' ').filter((w) => w.length > 0);
      let matchCount = 0;

      for (const qWord of queryWords) {
        for (const pWord of patternWords) {
          if (qWord === pWord) { matchCount++; break; }
          if (Math.abs(qWord.length - pWord.length) <= 2) {
            const dist = getLevenshteinDistance(qWord, pWord);
            const maxAllowed = qWord.length >= 6 ? 2 : 1;
            if (qWord.length >= 4 && dist <= maxAllowed) { matchCount++; break; }
          }
        }
      }

      const overlapScore = matchCount / Math.max(queryWords.length, patternWords.length);
      intentMaxScore = Math.max(intentMaxScore, overlapScore);
    }

    // 4) Keyword validation and bonus
    let keywordMatch = false;
    for (const kw of (intent.keywords || [])) {
      const normKw = normalizeText(kw);
      if (!normKw) continue;
      if (normQuery.includes(normKw)) { keywordMatch = true; break; }
      for (const qWord of queryWords) {
        if (Math.abs(qWord.length - normKw.length) <= 1 && getLevenshteinDistance(qWord, normKw) <= 1) {
          keywordMatch = true;
          break;
        }
      }
      if (keywordMatch) break;
    }

    let finalScore = intentMaxScore;
    if (keywordMatch) {
      finalScore += 0.15;      // strong signal
    } else {
      finalScore = finalScore * 0.4;  // heavy penalty without a keyword hit
    }

    // 5) Small priority nudge to break ties
    const priority = intent.priority || 1;
    finalScore += (priority - 1) * 0.001;
    finalScore = Math.min(finalScore, 1.0);

    const threshold = 0.5;
    if (finalScore >= threshold && finalScore > maxScore) {
      maxScore = finalScore;
      bestIntent = intent;
    }
  }

  return bestIntent;
}
