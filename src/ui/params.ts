/**
 * Paramètres de debug dans l'adresse (R-42) : ?seed=, ?vitesse=, ?participants=, ?cafe=.
 * `?lang=` (R-60) choisit la langue, `?guide=0|1` (R-15) impose le mode « Premier meeting »
 * et `?tuto=0|1` (R-17) son tutoriel ; ce ne sont pas des paramètres de debug.
 */
import { CONFIG, type CafeLevel } from "../engine/config";

export interface DebugParams {
  seed: string | null;
  speed: number;
  participants: number | undefined;
  cafe: CafeLevel | null;
  /** Langue demandée par `?lang=`, telle quelle (validée par resolveLang). */
  lang: string | null;
  /** Mode « Premier meeting » imposé par `?guide=1` ou `?guide=0`, sinon null (R-15). */
  guide: boolean | null;
  /** Tutoriel imposé par `?tuto=1` ou `?tuto=0`, sinon null (R-17). */
  tuto: boolean | null;
  /** Vrai dès qu'un paramètre de debug est présent. */
  debug: boolean;
}

export function readParams(search: string): DebugParams {
  const q = new URLSearchParams(search);
  const seed = q.get("seed");
  const rawSpeed = Number(q.get("vitesse"));
  const speed = Number.isFinite(rawSpeed) && rawSpeed > 0
    ? Math.min(CONFIG.speed.max, Math.max(CONFIG.speed.min, rawSpeed))
    : CONFIG.speed.default;
  const rawP = Number(q.get("participants"));
  const participants = Number.isInteger(rawP) && rawP >= 1 ? Math.min(rawP, CONFIG.cast.length) : undefined;
  const rawCafe = Number(q.get("cafe"));
  const cafe = rawCafe === 1 || rawCafe === 2 || rawCafe === 3 ? (rawCafe as CafeLevel) : null;
  const debug = ["seed", "vitesse", "participants", "cafe"].some((k) => q.has(k));
  const rawGuide = q.get("guide");
  const guide = rawGuide === "1" ? true : rawGuide === "0" ? false : null;
  const rawTuto = q.get("tuto");
  const tuto = rawTuto === "1" ? true : rawTuto === "0" ? false : null;
  return { seed, speed, participants, cafe, lang: q.get("lang"), guide, tuto, debug };
}
