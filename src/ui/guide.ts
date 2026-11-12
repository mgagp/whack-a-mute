/**
 * Mode « Premier meeting » (R-15, #32) : actif par défaut tant que le joueur n'a pas terminé
 * une partie guidée sur cet appareil. `?guide=0` ou `?guide=1` impose le choix (tests, démonstration).
 */
const STORAGE_KEY = "whack-a-mute:premier-meeting-fait";

export function readGuideDone(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function storeGuideDone() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Stockage indisponible : le guide sera proposé de nouveau à la prochaine visite.
  }
}

/** Guide proposé à l'accueil : le paramètre d'adresse d'abord, sinon seulement si aucune partie guidée n'a été terminée. */
export function initialGuided(param: boolean | null, done: boolean): boolean {
  return param ?? !done;
}
