/**
 * Batch Translation Script — Pytomatiza+ i18n
 *
 * Uses google-translate-api-x (already installed) to translate
 * remaining English text blocks in non-English locale files.
 *
 * Uses batch translate for maximum speed.
 *
 * Usage:  node scripts/translate-missing.js
 */

const fs = require("fs");
const path = require("path");
const translateApi = require("google-translate-api-x");

const MSGS_DIR = path.join(__dirname, "..", "messages");

// ── Locale mapping ───────────────────────────────────────────────────

const LOCALE_TO_TRANSLATOR = {
  es: "es",
  fr: "fr",
  de: "de",
  ar: "ar",
  it: "it",
  ru: "ru",
  ja: "ja",
  zh: "zh-CN",
  hi: "hi",
};

// ── Key paths that should NEVER be translated ────────────────────────

const PROTECTED_KEY_PATHS = [
  // Brand names in locale names
  "Pytomatiza",
  // Acronym-only values
  "supportedFormats",
];

// ── Check if a key path is protected ─────────────────────────────────

function isProtectedKeyPath(keyPath) {
  for (const p of PROTECTED_KEY_PATHS) {
    if (keyPath.includes(p)) return true;
  }
  return false;
}

// ── Check if a value contains mostly non-translatable content ────────

function isMostlyNonTranslatable(value) {
  // Count non-letter chars vs letter chars
  if (value.length < 4) return true;

  // Check if it's mostly acronyms, symbols, numbers
  const letters = value.replace(/[^a-zA-Z]/g, "").length;
  if (letters < 4) return true;

  // Check ratio of letters
  const ratio = letters / value.length;
  if (ratio < 0.4) return true; // e.g., "PDF, DOCX, XLSX" = mostly non-letters

  return false;
}

// ── Collect strings that are identical to English and need translation ─

function collectUntranslated(localeData, englishData, keyPath = "", depth = 0) {
  const results = [];

  for (const key of Object.keys(localeData)) {
    const childPath = keyPath ? `${keyPath}.${key}` : key;
    const localeVal = localeData[key];
    const englishVal = englishData?.[key];

    if (typeof localeVal === "string" && typeof englishVal === "string") {
      // Is it identical to English AND long enough to be meaningful?
      if (
        localeVal === englishVal &&
        localeVal.length >= 6 &&
        !isProtectedKeyPath(childPath) &&
        !isMostlyNonTranslatable(localeVal)
      ) {
        results.push({
          keyPath: childPath,
          value: localeVal,
        });
      }
    } else if (
      typeof localeVal === "object" &&
      localeVal !== null &&
      typeof englishVal === "object" &&
      englishVal !== null &&
      !Array.isArray(localeVal) &&
      !Array.isArray(englishVal)
    ) {
      const sub = collectUntranslated(localeVal, englishVal, childPath, depth + 1);
      results.push(...sub);
    }
  }

  return results;
}

// ── Set a value in nested object by key path ─────────────────────────

function setValueByPath(obj, keyPath, value) {
  const parts = keyPath.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]] || typeof current[parts[i]] !== "object") {
      return false;
    }
    current = current[parts[i]];
  }
  const lastKey = parts[parts.length - 1];
  if (lastKey in current) {
    current[lastKey] = value;
    return true;
  }
  return false;
}

// ── Translate a batch of strings ────────────────────────────────────

async function translateBatch(strings, targetLang) {
  if (strings.length === 0) return [];

  // Protect variable tokens and brand names before translating
  const protectedItems = strings.map((s) => protectText(s));
  const textsToTranslate = protectedItems.map((p) => p.text);

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      const results = await translateApi.batchTranslate(textsToTranslate, {
        to: targetLang,
        from: "en",
      });

      if (!Array.isArray(results) || results.length !== textsToTranslate.length) {
        throw new Error(`Unexpected batch result: got ${results?.length || 0}, expected ${textsToTranslate.length}`);
      }

      // Restore protected content in each result
      return results.map((r, i) => ({
        original: strings[i],
        translated: restoreText(r.text, protectedItems[i].placeholders),
      }));
    } catch (err) {
      if (attempts < maxAttempts) {
        const delay = 2000 * attempts;
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

// ── Protect variables and terms ──────────────────────────────────────

function protectText(text) {
  let protected = text;
  const placeholders = [];

  // Protect variable tokens {xxx}
  let idx = 0;
  protected = protected.replace(/\{[^}]+\}/g, (match) => {
    const ph = `⧼${idx}⧽`;
    placeholders.push({ ph, original: match });
    idx++;
    return ph;
  });

  // Protect known brand/technical terms
  const protectedTerms = [
    "Pytomatiza+", "Pytomatiza",
    "Google Drive", "Google Workspace", "Gmail", "Google Sheets",
    "Slack", "GitHub", "Twitter", "LinkedIn", "Reddit",
    "PagerDuty", "YouTube", "Vimeo",
    "Docker", "Kubernetes", "AWS",
    "End-to-end", "Enterprise-Grade",
    "YYYY-MM-DD",
  ];
  for (const term of protectedTerms) {
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    protected = protected.replace(regex, (match) => {
      const ph = `⟪${idx}⟫`;
      placeholders.push({ ph, original: match });
      idx++;
      return ph;
    });
  }

  return { text: protected, placeholders };
}

function restoreText(text, placeholders) {
  let result = text;
  // Sort by placeholder length descending to avoid partial replacements
  const sorted = [...placeholders].sort((a, b) => b.ph.length - a.ph.length);
  for (const { ph, original } of sorted) {
    result = result.split(ph).join(original);
  }
  return result;
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║   Pytomatiza+ — Batch Translation (google-translate-api-x)  ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const enData = JSON.parse(fs.readFileSync(path.join(MSGS_DIR, "en.json"), "utf8"));
  console.log(`✓ Loaded en.json (reference, ${countTotalStrings(enData)} strings)\n`);

  const targetLocales = Object.keys(LOCALE_TO_TRANSLATOR);
  let grandTotalTranslated = 0;

  for (const locale of targetLocales) {
    const filePath = path.join(MSGS_DIR, `${locale}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`✗ ${locale}.json not found`);
      continue;
    }

    const targetLang = LOCALE_TO_TRANSLATOR[locale];
    console.log(`─── ${locale}.json → ${targetLang} ───`);

    const localeData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Collect untranslated strings
    const toTranslate = collectUntranslated(localeData, enData);

    if (toTranslate.length === 0) {
      console.log(`  ✓ Already fully translated\n`);
      continue;
    }

    console.log(`  Found ${toTranslate.length} strings to translate`);

    // Process in batches of 10
    const BATCH_SIZE = 10;
    let translated = 0;
    let failed = 0;

    for (let batchStart = 0; batchStart < toTranslate.length; batchStart += BATCH_SIZE) {
      const batch = toTranslate.slice(batchStart, batchStart + BATCH_SIZE);
      const batchNum = Math.floor(batchStart / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(toTranslate.length / BATCH_SIZE);

      console.log(`\n  Batch ${batchNum}/${totalBatches} (${batch.length} strings):`);

      try {
        const results = await translateBatch(
          batch.map((b) => b.value),
          targetLang
        );

        for (let i = 0; i < results.length; i++) {
          const { original, translated: translatedText } = results[i];
          const item = batch[i];

          if (translatedText && translatedText !== original.value) {
            setValueByPath(localeData, item.keyPath, translatedText);
            translated++;
            console.log(`    ✓ ${item.keyPath.split(".").slice(-2).join(".")}`);
          } else {
            failed++;
            console.log(`    ∼ ${item.keyPath.split(".").slice(-2).join(".")} (unchanged)`);
          }
        }
      } catch (err) {
        console.log(`    ✗ Batch failed: ${err.message.substring(0, 100)}`);
        failed += batch.length;
      }

      // Delay between batches to be polite
      if (batchStart + BATCH_SIZE < toTranslate.length) {
        await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
      }
    }

    // Save the file
    fs.writeFileSync(filePath, JSON.stringify(localeData, null, 2) + "\n");
    grandTotalTranslated += translated;
    console.log(`\n  ✓ Saved ${locale}.json (${translated} translated, ${failed} failed/skipped)\n`);
  }

  console.log("══════════════════════════════════════════════════════════");
  console.log(`  Complete: ${grandTotalTranslated} strings translated across ${targetLocales.length} locales`);
  console.log("══════════════════════════════════════════════════════════");
}

function countTotalStrings(obj) {
  let count = 0;
  for (const v of Object.values(obj)) {
    if (typeof v === "string") count++;
    else if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      count += countTotalStrings(v);
    }
  }
  return count;
}

main().catch((err) => {
  console.error("\nFatal:", err);
  process.exit(1);
});
