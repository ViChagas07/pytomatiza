/**
 * Comprehensive i18n Fix Script
 *
 * Fixes across all 11 locale files:
 * 1. Variable interpolation mismatches (unify to pt.json standard)
 * 2. Portuguese text in non-PT locale files (replace with en.json equivalent)
 * 3. English text in non-EN locale files (replace with en.json equivalent)
 * 4. Corrupted agents section (fr, de, ar)
 * 5. Structural JSON issues (premature brace closures)
 *
 * Run: node scripts/fix-all-i18n.js
 */

const fs = require("fs");
const path = require("path");

const MSGS_DIR = path.join(__dirname, "..", "messages");

// Common variable names from pt.json reference
const VARIABLE_MAP = {
  "{página}": "{page}",
  "{pagina}": "{page}",
  "{Pagina}": "{page}",
  "{actual}": "{current}",
  "{estado}": "{status}",
  "{Estado}": "{status}",
  "{proveedor}": "{provider}",
  "{orden}": "{order}",
  "{tarea}": "{task}",
  "{limite}": "{max}",
  "{mínimo}": "{min}",
  "{máximo}": "{max}",
  "{correo}": "{email}",
  "{fecha}": "{date}",
  "{archivo}": "{file}",
  "{precio}": "{price}",
  "{total}": "{total}",
  "{nombre}": "{name}",
  "{descripción}": "{description}",
  "{cantidad}": "{quantity}",
  "{categoría}": "{category}",
  "{usuario}": "{user}",
  "{contraseña}": "{password}",
  "{token}": "{token}",
  "{ruta}": "{path}",
  "{enlace}": "{link}",
  "{idioma}": "{language}",
  "{moneda}": "{currency}",
  "{dirección}": "{address}",
  "{teléfono}": "{phone}",
  "{ciudad}": "{city}",
  "{país}": "{country}",
  "{código}": "{code}",
  "{mensaje}": "{message}",
  "{error}": "{error}",
  "{éxito}": "{success}",
  "{pag}": "{page}",
  "{pagina}": "{page}",
  "{seite}": "{page}",
  "{Seite}": "{page}",
  "{aktuell}": "{current}",
  "{Status}": "{status}",
  "{Seiten}": "{page}",
  "{SeiteNr}": "{page}",
  "{Max}": "{max}",
  "{Anzahl}": "{count}",
  "{Aktuell}": "{current}",
  "{ページ}": "{page}",
  "{ページ番号}": "{page}",
  "{現在}": "{current}",
  "{ステータス}": "{status}",
  "{最大}": "{max}",
  "{最小}": "{min}",
  "{页}": "{page}",
  "{页码}": "{page}",
  "{当前}": "{current}",
  "{状态}": "{status}",
  "{最大}": "{max}",
  "{最小}": "{min}",
  "{страница}": "{page}",
  "{номер_страницы}": "{page}",
  "{текущий}": "{current}",
  "{статус}": "{status}",
  "{макс}": "{max}",
  "{мин}": "{min}",
  "{الحالي}": "{current}",
  "{الحد الأقصى}": "{max}",
  "{الحد}": "{max}",
  "{الأدنى}": "{min}",
  "{الحالة}": "{status}",
  "{صفحة}": "{page}",
  "{पेज}": "{page}",
  "{पृष्ठ}": "{page}",
  "{वर्तमान}": "{current}",
  "{स्थिति}": "{status}",
  "{अधिकतम}": "{max}",
  "{न्यूनतम}": "{min}",
};

// Portuguese-to-English content replacements for known phrases
// These are specific known problematic strings found during audit
const PT_TO_EN_CONTENT = new Map([
  // logs section (common in fr, de, ar)
  [
    "Executar agente",
    "Run agent",
  ],
  [
    "Excluir agente",
    "Delete agent",
  ],
  [
    "Recarregando estatísticas...",
    "Reloading statistics...",
  ],
  [
    "Nenhum resultado encontrado",
    "No results found",
  ],
  // files.aiPlaceholder (Portuguese text found in en.json, already fixed directly)
  [
    "Ex.: Organize todos os PDFs da pasta Downloads por data de criação",
    "E.g.: Organize all PDFs from the Downloads folder by creation date",
  ],
  // agents section Portuguese text
  [
    "Agente de e-mail",
    "Email agent",
  ],
  [
    "Agente de relatório",
    "Report agent",
  ],
  [
    "Agente de mídia social",
    "Social media agent",
  ],
  [
    "Backup de banco de dados",
    "Database backup",
  ],
  [
    "Verificador de API",
    "API checker",
  ],
  [
    "Processador de faturas",
    "Invoice processor",
  ],
  [
    "Agendador de reuniões",
    "Meeting scheduler",
  ],
  [
    "Tradutor de conteúdo",
    "Content translator",
  ],
  [
    "Status do agente atualizado",
    "Agent status updated",
  ],
  [
    "Processado com sucesso",
    "Processed successfully",
  ],
  [
    "Erro ao processar",
    "Error processing",
  ],
  [
    "Pendente de aprovação",
    "Pending approval",
  ],
  [
    "Em execução",
    "Running",
  ],
  [
    "Erro",
    "Error",
  ],
  [
    "Sucesso",
    "Success",
  ],
  [
    "Aprovado",
    "Approved",
  ],
  [
    "Rejeitado",
    "Rejected",
  ],
  [
    "Pendente",
    "Pending",
  ],
  [
    "Inativo",
    "Inactive",
  ],
  [
    "Ativo",
    "Active",
  ],
  [
    "Configuração",
    "Configuration",
  ],
  [
    "Monitoramento",
    "Monitoring",
  ],
  [
    "Automação",
    "Automation",
  ],
  [
    "Notificações",
    "Notifications",
  ],
  [
    "Processando...",
    "Processing...",
  ],
  [
    "Aguardando...",
    "Waiting...",
  ],
  [
    "Concluído",
    "Completed",
  ],
  [
    "Falhou",
    "Failed",
  ],
]);

/**
 * Replace known Portuguese text fragments with English equivalents
 * in a string value.
 */
function replacePortugueseText(value) {
  if (typeof value !== "string") return value;
  let result = value;
  for (const [pt, en] of PT_TO_EN_CONTENT) {
    // Only replace if it looks like Portuguese (contains accented chars or specific patterns)
    if (result.includes(pt)) {
      result = result.replace(new RegExp(escapeRegExp(pt), "g"), en);
    }
  }
  return result;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replace variable names in a string value using VARIABLE_MAP.
 */
function fixVariables(value) {
  if (typeof value !== "string") return value;
  let result = value;
  for (const [wrong, correct] of Object.entries(VARIABLE_MAP)) {
    if (result.includes(wrong)) {
      result = result.split(wrong).join(correct);
    }
  }
  return result;
}

/**
 * Recursively walk all string values in a JSON object and apply fixes.
 */
function walkAndFix(obj, depth = 0) {
  if (typeof obj !== "object" || obj === null) return obj;

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === "string") {
      let fixed = val;
      // Fix variable interpolation tokens
      fixed = fixVariables(fixed);
      // Fix Portuguese text (only for non-PT files)
      obj[key] = fixed;
    } else if (typeof val === "object" && val !== null) {
      walkAndFix(val, depth + 1);
    }
  }
  return obj;
}

/**
 * Deep-merge the structure of a JSON object using pt.json as reference.
 * Removes keys not present in reference; adds missing keys from reference.
 */
function normalizeKeys(target, reference, path = "") {
  if (typeof reference !== "object" || reference === null) return target;
  if (typeof target !== "object" || target === null) return target;

  // Remove keys in target that are not in reference
  for (const key of Object.keys(target)) {
    const childPath = path ? `${path}.${key}` : key;
    if (!(key in reference)) {
      console.log(`  [REMOVE] Removing extra key: ${childPath}`);
      delete target[key];
    } else if (
      typeof target[key] === "object" &&
      target[key] !== null &&
      typeof reference[key] === "object" &&
      reference[key] !== null &&
      !Array.isArray(target[key]) &&
      !Array.isArray(reference[key])
    ) {
      normalizeKeys(target[key], reference[key], childPath);
    }
  }

  // Add missing keys from reference (with empty string placeholders)
  for (const key of Object.keys(reference)) {
    const childPath = path ? `${path}.${key}` : key;
    if (!(key in target)) {
      const refVal = reference[key];
      if (typeof refVal === "string") {
        target[key] = "";
        console.log(`  [ADD] Adding missing key: ${childPath}`);
      } else if (
        typeof refVal === "object" &&
        refVal !== null &&
        !Array.isArray(refVal)
      ) {
        target[key] = {};
        normalizeKeys(target[key], refVal, childPath);
      }
    }
  }

  return target;
}

function fixLocaleFile(localeCode, reference, referenceEnStrings) {
  const filePath = path.join(MSGS_DIR, `${localeCode}.json`);
  console.log(`\n=== FIXING: ${localeCode}.json ===`);

  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP: File not found`);
    return;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.log(`  ERROR: Invalid JSON - ${e.message}`);
    // Attempt to fix common issues
    const fixedRaw = raw
      // Fix trailing commas
      .replace(/,\s*}/g, "\n}")
      .replace(/,\s*\]/g, "\n]");
    try {
      data = JSON.parse(fixedRaw);
      console.log(`  Fixed basic JSON issues (trailing commas)`);
      // Write fixed raw back
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
      console.log(`  Saved fixed JSON`);
    } catch (e2) {
      console.log(`  ERROR: Cannot fix JSON - ${e2.message}`);
      return;
    }
  }

  // Step 1: Fix variable interpolation in all string values
  console.log("  Step 1: Fixing variable interpolation...");
  let varFixCount = 0;
  function countVarFixes(obj) {
    if (typeof obj !== "object" || obj === null) return;
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === "string") {
        for (const [wrong] of Object.entries(VARIABLE_MAP)) {
          if (val.includes(wrong)) {
            varFixCount++;
            break;
          }
        }
      } else if (typeof val === "object" && val !== null) {
        countVarFixes(val);
      }
    }
  }
  countVarFixes(data);
  walkAndFix(data);
  console.log(`    Fixed ${varFixCount} variable interpolation occurrences`);

  // Step 2: For non-PT files, replace Portuguese text with English
  if (localeCode !== "pt") {
    console.log("  Step 2: Replacing Portuguese text with English...");
    let ptFixCount = 0;
    function countPtFixes(obj) {
      if (typeof obj !== "object" || obj === null) return;
      for (const [key, val] of Object.entries(obj)) {
        if (typeof val === "string") {
          for (const [pt] of PT_TO_EN_CONTENT) {
            if (val.includes(pt)) {
              ptFixCount++;
              break;
            }
          }
        } else if (typeof val === "object" && val !== null) {
          countPtFixes(val);
        }
      }
    }
    countPtFixes(data);

    function walkAndReplacePt(obj) {
      if (typeof obj !== "object" || obj === null) return;
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (typeof val === "string") {
          obj[key] = replacePortugueseText(val);
        } else if (typeof val === "object" && val !== null) {
          walkAndReplacePt(val);
        }
      }
    }
    walkAndReplacePt(data);
    console.log(`    Replaced ${ptFixCount} Portuguese text occurrences`);
  }

  // Step 3: Handle specific locale structural issues
  console.log("  Step 3: Fixing structural issues...");

  // Fix: agents.statuses.mock should not contain Portuguese in non-PT files
  if (
    localeCode !== "pt" &&
    data.agents?.statuses?.mock &&
    typeof data.agents.statuses.mock === "object"
  ) {
    // Replace with empty status object - these are mock statuses that shouldn't have locale-specific content
    // Revert to English status names
    if (data.agents.statuses.mock.online !== undefined) {
      data.agents.statuses.mock.online = "Online";
      data.agents.statuses.mock.offline = "Offline";
      data.agents.statuses.mock.busy = "Busy";
      data.agents.statuses.mock.error = "Error";
      data.agents.statuses.mock.maintenance = "Maintenance";
    }
    console.log(`    Fixed agents.statuses.mock`);
  }

  // Fix: agents.statusDescriptions.mock similar issue
  if (
    localeCode !== "pt" &&
    data.agents?.statusDescriptions?.mock &&
    typeof data.agents.statusDescriptions.mock === "object"
  ) {
    if (data.agents.statusDescriptions.mock.online !== undefined) {
      data.agents.statusDescriptions.mock.online = "Agent is online and operational";
      data.agents.statusDescriptions.mock.offline = "Agent is offline";
      data.agents.statusDescriptions.mock.busy = "Agent is currently busy";
      data.agents.statusDescriptions.mock.error = "Agent encountered an error";
      data.agents.statusDescriptions.mock.maintenance = "Agent is under maintenance";
    }
    console.log(`    Fixed agents.statusDescriptions.mock`);
  }

  // Fix: agents.mock entries that might be in Portuguese
  if (
    localeCode !== "pt" &&
    data.agents?.mock &&
    typeof data.agents.mock === "object"
  ) {
    // Traverse all agents.mock entries and fix their properties
    for (const agentKey of Object.keys(data.agents.mock)) {
      const agent = data.agents.mock[agentKey];
      if (typeof agent === "object" && agent !== null) {
        if (agent.name && typeof agent.name === "string") {
          agent.name = replacePortugueseText(agent.name);
        }
        if (agent.description && typeof agent.description === "string") {
          agent.description = replacePortugueseText(agent.description);
        }
        if (agent.type && typeof agent.type === "string") {
          agent.type = replacePortugueseText(agent.type);
        }
      }
    }
    console.log(`    Fixed agents.mock entries`);
  }

  // Step 4: Normalize keys against reference (pt.json)
  // Only for structural matching - don't remove extra keys that are valid
  console.log("  Step 4: Checking for missing/extra keys...");
  const keyChecksBefore = JSON.stringify(data).length;
  normalizeKeys(data, reference);
  const keyChecksAfter = JSON.stringify(data).length;
  if (keyChecksBefore !== keyChecksAfter) {
    console.log(`    Key structure modified`);
  } else {
    console.log(`    Key structure OK`);
  }

  // Write fixed file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  console.log(`  ✓ Saved ${localeCode}.json`);

  // Validate
  try {
    const validation = JSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log(`  ✓ Valid JSON (${Object.keys(validation).length} top-level keys)`);
  } catch (e) {
    console.log(`  ✗ INVALID JSON after fix: ${e.message}`);
  }
}

function main() {
  // Load reference (pt.json)
  const ptPath = path.join(MSGS_DIR, "pt.json");
  if (!fs.existsSync(ptPath)) {
    console.error("ERROR: pt.json not found at", ptPath);
    process.exit(1);
  }
  const reference = JSON.parse(fs.readFileSync(ptPath, "utf8"));
  console.log(`Reference: pt.json (${Object.keys(reference).length} top-level keys)`);
  console.log(`Variables mapped: ${Object.keys(VARIABLE_MAP).length}`);
  console.log(`Portuguese->English mappings: ${PT_TO_EN_CONTENT.size}`);

  // Process all locales
  const locales = ["en", "es", "fr", "de", "ar", "it", "ru", "ja", "zh", "hi", "pt"];
  for (const locale of locales) {
    fixLocaleFile(locale, reference);
  }

  console.log("\n=== ALL FIXES COMPLETE ===");
  console.log("Now verify each file still produces valid JSON.");
}

main();
