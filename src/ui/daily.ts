/**
 * Premier essai du jour (#49) : seul le premier stand-up du jour terminé compte pour le partage.
 * Les essais suivants, le même jour, au même café et dans la même langue, sont des parties libres
 * sur une réunion au hasard : on ne peut plus améliorer son score en mémorisant la réunion.
 * Mémorisé sur l'appareil (`localStorage`), sans serveur. Les fonctions pures sont testées par Vitest.
 */
import * as z from "zod/mini";
import type { Lang } from "../content/lines";
import type { CafeLevel } from "../engine/config";
import type { GameState, Outcome } from "../engine/state";
import { dailySeed } from "./share";

/** Ce qu'on garde du stand-up du jour : de quoi l'afficher et le partager. */
export interface DailyResult {
  harmony: number;
  intercepted: number;
  deplacees: number;
  outcomes: Outcome[];
}

const OUTCOME = z.enum(["intercepted", "blunder", "normal", "wrongMute"]);
const DailySchema = z.object({
  harmony: z.number(),
  intercepted: z.number(),
  deplacees: z.number(),
  outcomes: z.array(OUTCOME),
});

/** Clé de stockage : une par jour, par café et par langue, comme la réunion du jour elle-même. */
export function dailyKey(day: Date, cafe: CafeLevel, lang: Lang): string {
  return `whack-a-mute:${dailySeed(day)}:cafe-${cafe}:${lang}`;
}

export function dailyResultOf(game: GameState): DailyResult {
  return {
    harmony: game.harmony,
    intercepted: game.stats.intercepted,
    deplacees: game.stats.deplacees,
    outcomes: [...game.outcomes],
  };
}

/** Lit un résultat mémorisé ; une valeur absente ou abîmée compte comme « pas encore joué ». */
export function parseDaily(raw: string | null): DailyResult | null {
  if (raw === null) return null;
  try {
    const parsed = DailySchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Sorte de partie à lancer : `debug` avec `?seed=`, sinon le stand-up du jour s'il n'a pas encore
 * été terminé, sinon une partie libre.
 */
export type PlayKind = "debug" | "daily" | "free";
export function playKind(seedParam: string | null, alreadyPlayed: DailyResult | null): PlayKind {
  if (seedParam !== null) return "debug";
  return alreadyPlayed ? "free" : "daily";
}

/** Graine d'une partie libre : une réunion différente à chaque fois. */
export function freeSeed(random: () => number = Math.random): string {
  return `libre-${Math.floor(random() * 2 ** 32).toString(36)}`;
}

export function readDaily(day: Date, cafe: CafeLevel, lang: Lang): DailyResult | null {
  try {
    return parseDaily(localStorage.getItem(dailyKey(day, cafe, lang)));
  } catch {
    return null;
  }
}

export function storeDaily(day: Date, cafe: CafeLevel, lang: Lang, result: DailyResult) {
  try {
    localStorage.setItem(dailyKey(day, cafe, lang), JSON.stringify(result));
  } catch {
    // Stockage indisponible : la prochaine partie sera encore le stand-up du jour.
  }
}
