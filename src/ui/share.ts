/**
 * Partage du score (R-50, #19) : récapitulatif en émojis et stand-up du jour.
 * Fonctions pures, sans DOM : testées par Vitest.
 */
import { CONFIG } from "../engine/config";
import type { Outcome } from "../engine/state";

/** Un émoji par moment décisif. Une réplique correcte laissée passer n'apparaît pas. */
export const RECAP_EMOJI: Partial<Record<Outcome, string>> = {
  intercepted: "🔇",
  blunder: "😬",
  wrongMute: "🤐",
};

/** Le nom du jeu, identique dans les deux langues. */
export const BRAND = "whack-a-mute";

export function emojiRecap(outcomes: readonly Outcome[], max: number = CONFIG.ui.shareRecapMax): string {
  const marks = outcomes.flatMap((o) => RECAP_EMOJI[o] ?? []);
  return marks.length > max ? `${marks.slice(0, max).join("")}…` : marks.join("");
}

/** Texte partagé : la phrase du score, la ligne d'émojis (si elle n'est pas vide), puis le nom du jeu. */
export function shareText(headline: string, outcomes: readonly Outcome[]): string {
  return [headline, emojiRecap(outcomes), BRAND].filter(Boolean).join("\n");
}

/**
 * Graine du stand-up du jour : la même pour tout le monde à une date donnée (date locale du joueur).
 * Change à minuit ; une partie déjà commencée garde sa graine.
 */
export function dailySeed(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `jour-${y}-${m}-${d}`;
}
