// Normalizes Lingui compiled catalog keys from URL-safe base64 (-, _) to
// standard base64 (+, /) so they match the ids emitted by
// @lingui/babel-plugin-lingui-macro (v5 family) at build time.
//
// Why: @lingui/cli v6 changed its message-id hash encoding to URL-safe base64,
// while the babel macro (still v5 because @lingui/vite-plugin v6 requires
// vite >= 6) emits standard base64 ids. Catalogs compiled by cli 6.x therefore
// miss every key containing + or / and the UI renders raw ids.
//
// This script is a no-op when the compiled catalogs already use standard
// base64 (e.g. after a future full @lingui v6 + vite 6 migration).

import { readFileSync, writeFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const LOCALES_DIR = join(process.cwd(), "src/shared/i18n/locales");

function normalizeKey(key) {
  if (!/^[A-Za-z0-9_-]+$/.test(key)) return key; // not a hash id (msgid-keyed entry)
  if (!key.includes("-") && !key.includes("_")) return key; // alnum ids are identical in both encodings
  return key.replace(/-/g, "+").replace(/_/g, "/");
}

let totalRenamed = 0;

for (const locale of readdirSync(LOCALES_DIR)) {
  const file = join(LOCALES_DIR, locale, "messages.mjs");
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue; // locale without compiled catalog
  }
  const match = content.match(/export const messages=JSON\.parse\((".*")\)/s);
  if (!match) {
    console.log(`[${locale}] no JSON.parse payload found — skipping`);
    continue;
  }
  const catalog = JSON.parse(JSON.parse(match[1]));
  let renamed = 0;
  const normalized = {};
  for (const [key, value] of Object.entries(catalog)) {
    const nk = normalizeKey(key);
    if (nk !== key) renamed++;
    normalized[nk] = value;
  }
  if (renamed === 0) {
    console.log(`[${locale}] already standard base64 — no-op`);
    continue;
  }
  const payload = JSON.stringify(JSON.stringify(normalized));
  const next = content.replace(/export const messages=JSON\.parse\(.*\)/s, `export const messages=JSON.parse(${payload})`);
  writeFileSync(file, next);
  totalRenamed += renamed;
  console.log(`[${locale}] normalized ${renamed} hash keys to standard base64`);
}

console.log(`normalize-lingui-keys: ${totalRenamed} keys fixed`);
