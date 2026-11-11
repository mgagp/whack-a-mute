/** Types de l'état du jeu. Aucun import de React ni du navigateur. */
import type { CafeLevel, ParticipantId } from "./config";

export type LineType = "correcte" | "deplacee";

export interface Line {
  id: string;
  lang: string;
  type: LineType;
  text: string;
  signature?: boolean;
  declencheur?: ParticipantId;
  /** Participants qui ne disent jamais cette réplique (ex. : le boss ne parle pas de lui-même, R-26). */
  pasDitePar?: ParticipantId[];
}

export type Mic = "open" | "muted";

export type Outcome = "intercepted" | "blunder" | "normal" | "wrongMute";

/** Une prise de parole en cours d'annonce (section 3.2). */
export interface Turn {
  line: Line;
  startAt: number;
  endAt: number;
  mic: Mic;
  initiallyMuted: boolean;
}

/** Résultat de la dernière prise de parole, affiché un moment sur la tuile. */
export interface LastResult {
  line: Line;
  outcome: Outcome;
  at: number;
}

export interface Participant {
  id: ParticipantId;
  joinedAt: number;
  turn: Turn | null;
  lastResult: LastResult | null;
  /** Le participant ne peut pas être de nouveau annoncé avant ce moment. */
  restUntil: number;
}

export interface Stats {
  intercepted: number;
  blunders: number;
  wrongMutes: number;
  normals: number;
  /** Nombre de phrases déplacées arrivées au bout de leur annonce. */
  deplacees: number;
}

export type EndReason = "temps" | "harmonie";

export interface GameState {
  t: number;
  durationMs: number;
  cafe: CafeLevel;
  rng: number;
  harmony: number;
  participants: Participant[];
  /** Participants qui n'ont pas encore rejoint, dans l'ordre d'arrivée. */
  pendingArrivals: { id: ParticipantId; atMs: number }[];
  lines: readonly Line[];
  usedLineIds: string[];
  /**
   * Places d'annonce libres (au plus le maximum simultané du niveau, R-09),
   * avec le moment où chacune redevient utilisable (après la pause du niveau, R-14).
   */
  slotsFreeAt: number[];
  /** Début de la dernière annonce, pour espacer deux débuts d'au moins `minStartGapMs`. */
  lastAnnounceAt: number;
  /** Fin de la fenêtre pendant laquelle une réplique `declencheur: "boss"` est permise (R-24). */
  bossReactionUntil: number;
  /** Vrai entre la fin d'une prise de parole du boss et l'annonce suivante. */
  bossReactionPending: boolean;
  stats: Stats;
  /** Résultat de chaque prise de parole, dans l'ordre : sert au récapitulatif partagé (#19). */
  outcomes: Outcome[];
  over: boolean;
  endReason: EndReason | null;
  /** Compteur pour donner un identifiant unique à chaque événement. */
  eventSeq: number;
}

export type Input = { type: "tap"; participantId: ParticipantId };

interface EventBase {
  id: number;
  t: number;
}

export type GameEvent =
  | (EventBase & { type: "participantJoined"; participantId: ParticipantId })
  | (EventBase & { type: "announced"; participantId: ParticipantId; line: Line; mic: Mic })
  | (EventBase & { type: "micToggled"; participantId: ParticipantId; mic: Mic })
  | (EventBase & {
      type: "resolved";
      participantId: ParticipantId;
      line: Line;
      outcome: Outcome;
      harmonyDelta: number;
      harmony: number;
    })
  | (EventBase & { type: "gameOver"; reason: EndReason; harmony: number });

export type GameEventType = GameEvent["type"];

export interface StepResult {
  state: GameState;
  events: GameEvent[];
}
