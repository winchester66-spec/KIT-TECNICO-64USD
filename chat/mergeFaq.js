/**
 * mergeFaq.js — build script.
 * Merges every knowledge/faq_*.json file into a single knowledge/faq.json.
 * Deduplicates by intent id, keeping the highest priority version.
 *
 * Usage:  node chat/mergeFaq.js
 */

const fs = require('fs');
const path = require('path');

const knowledgeDir = path.join(__dirname, '..', 'knowledge');
const outputFile = path.join(knowledgeDir, 'faq.json');

try {
  const files = fs.readdirSync(knowledgeDir).sort();
  let allIntents = [];

  for (const file of files) {
    if (file.startsWith('faq_') && file.endsWith('.json')) {
      const filePath = path.join(knowledgeDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      try {
        const intents = JSON.parse(fileContent);
        if (Array.isArray(intents)) {
          allIntents = allIntents.concat(intents);
        } else if (intents && typeof intents === 'object') {
          allIntents.push(intents);
        }
        console.log(`  ✔ ${file}: ${Array.isArray(intents) ? intents.length : 1} intent(s)`);
      } catch (err) {
        console.error(`  ✘ Could not parse ${file}:`, err.message);
      }
    }
  }

  // Deduplicate by id, keeping the highest priority (later files win ties)
  const intentMap = new Map();
  for (const intent of allIntents) {
    if (!intent.id) continue;
    const existing = intentMap.get(intent.id);
    const newPriority = intent.priority || 1;
    const existingPriority = existing ? (existing.priority || 1) : -1;
    if (!existing || newPriority >= existingPriority) {
      intentMap.set(intent.id, intent);
    }
  }

  const mergedIntents = Array.from(intentMap.values());

  fs.writeFileSync(outputFile, JSON.stringify(mergedIntents, null, 2), 'utf-8');
  console.log(`\nDone: ${mergedIntents.length} unique intents written to ${outputFile}`);
  console.log(`(Intents read before deduplication: ${allIntents.length})`);

} catch (error) {
  console.error('Error while merging the FAQ files:', error);
}
