/**
 * Événements comptés par GoatCounter (R-52, #20) : sans cookies ni donnée personnelle.
 * Les visites sont comptées par le script de la page ; ici, seulement les parties lancées et les partages.
 * Si le script n'est pas chargé (bloqueur, hors ligne), on ne fait rien.
 */
import type { Lang } from "../content/lines";

export type StatEvent = "partie" | "partage";

interface GoatCounter {
  count?: (vars: { path: string; title?: string; event?: boolean }) => void;
}

export function countEvent(name: StatEvent, lang: Lang) {
  try {
    (window as { goatcounter?: GoatCounter }).goatcounter?.count?.({ path: `${name}-${lang}`, event: true });
  } catch {
    // Le compteur ne doit jamais gêner le jeu.
  }
}
