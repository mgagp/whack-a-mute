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

/**
 * Tutoriel du premier meeting (R-17, #42) : joué avant la première partie guidée, puis mémorisé
 * comme fait (terminé ou passé). Réactiver « Premier meeting » sur l'accueil le propose de nouveau.
 * `?tuto=0` ou `?tuto=1` impose le choix (tests, démonstration).
 */
const TUTO_KEY = "whack-a-mute:tutoriel-fait";

export function readTutoDone(): boolean {
  try {
    return localStorage.getItem(TUTO_KEY) === "1";
  } catch {
    return false;
  }
}

export function storeTutoDone() {
  try {
    localStorage.setItem(TUTO_KEY, "1");
  } catch {
    // Stockage indisponible : le tutoriel sera proposé de nouveau à la prochaine visite.
  }
}

/** Tutoriel en attente : le paramètre d'adresse d'abord, sinon seulement s'il n'a jamais été fait ou passé. */
export function initialTuto(param: boolean | null, done: boolean): boolean {
  return param ?? !done;
}
