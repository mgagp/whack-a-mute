/**
 * Paramètres de debug dans l'adresse (R-42) : ?seed=, ?vitesse=, ?participants=, ?cafe=.
 */
import { CONFIG, type CafeLevel } from "../engine/config";

export interface DebugParams {
  seed: string | null;
  speed: number;
  participants: number | undefined;
  cafe: CafeLevel | null;
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
  const participants = Number.isInteger(rawP) && rawP >= 1 ? Math.min(rawP, CONFIG.arrivals.length) : undefined;
  const rawCafe = Number(q.get("cafe"));
  const cafe = rawCafe === 1 || rawCafe === 2 || rawCafe === 3 ? (rawCafe as CafeLevel) : null;
  const debug = ["seed", "vitesse", "participants", "cafe"].some((k) => q.has(k));
  return { seed, speed, participants, cafe, debug };
}
