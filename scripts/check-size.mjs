// R-44 : la page doit peser moins de 300 Ko compressés, hors sons.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const LIMIT = 300 * 1024;
const files = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (!p.includes("sounds")) files.push(p);
  }
};
walk("dist");
// Les polices sont déjà compressées (woff2) : on compte leur taille brute.
const total = files.reduce((sum, f) => {
  const data = readFileSync(f);
  return sum + (f.endsWith(".woff2") ? data.length : gzipSync(data).length);
}, 0);
console.log(`Poids compressé : ${(total / 1024).toFixed(1)} Ko (limite ${LIMIT / 1024} Ko)`);
if (total > LIMIT) process.exit(1);
