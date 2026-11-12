/**
 * Toutes les valeurs de jouabilité (R-40).
 * Aucun nombre magique ailleurs dans le moteur ni dans l'interface :
 * pour ajuster le jeu, on modifie ce fichier puis on reporte les valeurs dans SPEC.md, section 6.
 */

export type CafeLevel = 1 | 2 | 3;

export type ParticipantId = "ginette" | "kevin" | "josee" | "boss";

export interface CafeConfig {
  /** Durée de l'annonce (temps de lecture), en ms (R-04, R-14). */
  readMs: number;
  /**
   * Pause entre deux prises de parole, en ms (R-14) : quand une prise de parole se termine,
   * sa « place » ne resert qu'après ce délai. Avec plusieurs places (simultanéité),
   * les annonces peuvent donc se chevaucher jusqu'au maximum du niveau.
   */
  pauseMs: number;
  /** Nombre maximal d'annonces en même temps (R-09). */
  maxSimultaneous: number;
}

export const CONFIG = {
  /** Durée d'une partie, en ms (R-11). */
  gameDurationMs: 90_000,

  /** Harmonie de départ et bornes (R-10). */
  harmony: { start: 100, min: 0, max: 100 },

  /** Effet de chaque résultat sur l'harmonie (section 3.3, R-06, R-10). */
  harmonyDelta: {
    intercepted: 3,
    blunder: -20,
    normal: 0,
    wrongMute: -5,
  },

  /** Rythme selon le niveau de café (section 6.2, R-14). */
  cafe: {
    1: { readMs: 4_000, pauseMs: 2_500, maxSimultaneous: 1 },
    2: { readMs: 3_000, pauseMs: 1_800, maxSimultaneous: 2 },
    3: { readMs: 2_000, pauseMs: 1_000, maxSimultaneous: 3 },
  } satisfies Record<CafeLevel, CafeConfig>,

  /** Niveau de café proposé par défaut sur l'accueil (#32 : le plus calme, pour la première impression). */
  defaultCafe: 1 as CafeLevel,

  /**
   * Mode « Premier meeting » (R-15, #32) : pendant ce temps au début d'une partie guidée,
   * chaque phrase déplacée est signalée sur sa tuile, et personne n'est annoncé déjà sur mute (R-08).
   */
  guide: { durationMs: 30_000 },

  /** Ordre d'arrivée des participants et moment d'arrivée, en ms (section 6.1, R-13). */
  arrivals: [
    { id: "ginette", atMs: 0 },
    { id: "kevin", atMs: 15_000 },
    { id: "josee", atMs: 35_000 },
    { id: "boss", atMs: 55_000 },
  ] satisfies { id: ParticipantId; atMs: number }[],

  /** Écart minimal entre deux débuts d'annonce, pour que deux bulles n'apparaissent pas en même temps, en ms. */
  minStartGapMs: 600,

  /** Délai avant la toute première annonce, en ms. */
  firstAnnounceDelayMs: 1_200,

  /** Temps pendant lequel une tuile affiche le résultat avant de pouvoir reparler, en ms. */
  resultDisplayMs: 1_400,

  /** Proportion de phrases déplacées (section 6.2). */
  deplaceeRatio: 0.35,

  /** Proportion de phrases déplacées annoncées avec le participant déjà sur mute (R-08). */
  alreadyMutedRatio: 0.25,

  /** Réaction au boss (R-24, R-25). */
  bossReaction: {
    /** Identifiant du participant qui déclenche les répliques `declencheur: "boss"`. */
    triggerId: "boss" as ParticipantId,
    /** Délai entre la fin de la prise de parole du boss et la réaction, en ms. */
    delayMs: 350,
    /** Fenêtre après la fin du boss pendant laquelle la réaction reste permise, en ms. */
    windowMs: 2_500,
  },

  /** Horloge de réunion affichée : un « stand-up de 15 minutes » accéléré (section 4). */
  meetingClock: { startMinutes: 9 * 60, durationMinutes: 15 },

  /** Paliers des titres de fin, harmonie minimale incluse (section 4, R-12). */
  endTitleThresholds: [
    { min: 90, key: "champion" },
    { min: 70, key: "modele" },
    { min: 40, key: "unUn" },
    { min: 1, key: "rh" },
    { min: 0, key: "ecourtee" },
  ] as const,

  /**
   * Suggestion de niveau en fin de partie (R-16, #39) : moins de café sous `lessBelow` % d'harmonie,
   * plus de café à partir de `moreFrom` %. Mêmes seuils que les titres « RH » et « Champion·ne ».
   */
  cafeSuggestion: { lessBelow: 40, moreFrom: 90 },

  /** Durées d'affichage côté interface, en ms de jeu (elles suivent donc `?vitesse=`). */
  ui: {
    /**
     * Paliers du compte à rebours, en part de l'annonce écoulée : l'anneau de la bulle
     * et les flèches du guide (#32) passent au jaune puis au rouge aux mêmes moments.
     */
    timerWarnAt: 0.55,
    timerUrgentAt: 0.8,
    /** Notification en bas de la réunion. */
    toastMs: 1_800,
    /** Grande phrase affichée lors d'un malaise. */
    blunderOverlayMs: 1_600,
    /** Réaction 😬 des autres participants après un malaise. */
    reactionMs: 1_600,
    /** Rebond d'une tuile qui vient de rejoindre. */
    joinBounceMs: 700,
    /** Pause avant l'écran de fin, pour voir le dernier effet, en ms réelles (divisées par `?vitesse=`). */
    endScreenDelayMs: 1_300,
    /** Durée de vie de l'effet de marteau à l'endroit touché (R-32), en ms réelles. */
    tapFlashMs: 380,
    /** Nombre maximal d'émojis dans le récapitulatif partagé (#19) ; au-delà, on coupe avec « … ». */
    shareRecapMax: 30,
  },

  /** Bornes du paramètre de debug `?vitesse=` (R-42). */
  speed: { min: 0.1, max: 20, default: 1 },

  /** Pas de temps maximal accepté par image, en ms (évite un saut si l'onglet était caché). */
  maxFrameMs: 100,

  /** Longueur maximale d'une réplique (section 7, R-22). */
  maxLineLength: 70,

  /** Volume minimal de la banque de répliques (section 7, R-22). */
  minLines: { correcte: 40, deplacee: 25 },
} as const;

export type EndTitleKey = (typeof CONFIG.endTitleThresholds)[number]["key"];
