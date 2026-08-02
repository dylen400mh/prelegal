// Builds the document registry consumed by the frontend and backend from the
// Common Paper templates in templates/ and catalog.json.
//
// Run from the repo root:  node scripts/build-registry.mjs
//
// Emits:
//   frontend/nda/registry.json  — full (metadata + fields + verbatim terms)
//   backend/app/registry.json   — lite  (metadata + fields; no terms)
//
// The LLM never writes legal text: it only picks a document type and collects
// field values. The verbatim Standard Terms embedded here are what gets rendered.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATES = join(ROOT, "templates");

// Variable span class -> human group label.
const GROUPS = {
  coverpage: "Cover Page",
  orderform: "Order Form",
  keyterms: "Key Terms",
  sow: "Statement of Work",
  businessterms: "Business Terms",
};

// The 11 supported document types: catalog filename -> registry id. The MNDA
// cover-page entry is intentionally excluded (it is not a standalone document).
const EXCLUDE = new Set(["mutual-nda-coverpage.md"]);

/** Strip HTML tags, markdown links/bold, and autolinks; collapse whitespace. */
function clean(text) {
  return text
    .replace(/<(https?:[^>]+)>/g, "$1") // keep autolinked URLs
    .replace(/<[^>]+>/g, "") // drop HTML tags, keep inner text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // markdown links -> text
    .replace(/\*\*/g, "") // drop bold markers
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Normalize a Variable name (drop possessives / surrounding punctuation). */
function normalizeField(name) {
  return clean(name)
    .replace(/[’']s$/u, "")
    .replace(/^["“”']+|["“”':.]+$/gu, "")
    .trim();
}

/** Extract the ordered, de-duplicated list of fillable Variables. */
function extractFields(raw) {
  const re =
    /<span class="(coverpage|orderform|keyterms|sow|businessterms)_link"[^>]*>([^<]+)<\/span>/g;
  const seen = new Set();
  const fields = [];
  let m;
  while ((m = re.exec(raw)) !== null) {
    const name = normalizeField(m[2]);
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    fields.push({ name, group: GROUPS[m[1]] });
  }
  return fields;
}

/** Parse a template body into ordered { n, heading, blocks } sections. */
function extractTerms(raw) {
  const lines = raw.split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    if (/^#\s/.test(line)) continue; // H1 title
    if (/^Common Paper .*CC BY/.test(line)) continue; // footer attribution
    if (line.trim() === "") continue;

    const topLevel = /^(\d+)\.\s+(.*)$/.exec(line); // no leading indent
    if (topLevel) {
      const rest = topLevel[2];
      const header2 = /<span class="header_2"[^>]*>([^<]+)<\/span>/.exec(rest);
      if (header2) {
        // Style B: header line, body arrives in nested sub-clauses.
        current = { n: sections.length + 1, heading: clean(header2[1]), blocks: [] };
        sections.push(current);
      } else {
        // Style A: "N. **Heading**. body" all on one line.
        const flat = /^\*\*(.+?)\*\*\.?\s*(.*)$/.exec(rest);
        current = {
          n: sections.length + 1,
          heading: flat ? clean(flat[1]) : clean(rest),
          blocks: flat && flat[2] ? [clean(flat[2])] : [],
        };
        sections.push(current);
      }
      continue;
    }

    // Nested sub-clause / definition line.
    if (current) {
      const text = clean(line);
      if (text) current.blocks.push(text);
    }
  }

  return sections;
}

/** Build the attribution line (verbatim footer if present, else derived). */
function extractAttribution(raw, name) {
  const footer = raw.split("\n").find((l) => /^Common Paper .*CC BY/.test(l));
  if (footer) return clean(footer);
  const version = /Version (\d+\.\d+)/.exec(raw);
  const ver = version ? ` Version ${version[1]}` : "";
  return `Common Paper ${name}${ver} — free to use under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).`;
}

/** Strip catalog parentheticals like " (Standard Terms)" for display. */
function displayName(name) {
  return name.replace(/\s*\((Standard Terms|Cover Page)\)\s*$/i, "").trim();
}

const catalog = JSON.parse(readFileSync(join(ROOT, "catalog.json"), "utf8"));

// full  -> frontend: metadata + verbatim terms (used to render the document).
// lite  -> backend:  metadata + fields (used to build the LLM prompt). The
//                    frontend never reads `fields`, so it's kept out of `full`.
const full = [];
const lite = [];
for (const entry of catalog.templates) {
  if (EXCLUDE.has(entry.filename)) continue;
  const raw = readFileSync(join(TEMPLATES, entry.filename), "utf8").replace(/\r\n?/g, "\n");
  const id = entry.filename.replace(/\.md$/, "");
  const name = displayName(entry.name);
  const description = entry.description;
  const fields = extractFields(raw);
  full.push({ id, name, description, terms: extractTerms(raw), attribution: extractAttribution(raw, name) });
  lite.push({ id, name, description, fields });
}

writeFileSync(join(ROOT, "frontend/nda/registry.json"), JSON.stringify(full, null, 2) + "\n");
writeFileSync(join(ROOT, "backend/app/registry.json"), JSON.stringify(lite, null, 2) + "\n");

console.log(`Wrote ${full.length} documents to the registry.`);
for (let i = 0; i < full.length; i++) {
  console.log(`  ${full[i].id}: ${lite[i].fields.length} fields, ${full[i].terms.length} sections`);
}
