/**
 * Moteur pur : step(state, dtMs, inputs) → nouvel état et événements.
 * Le temps et le hasard sont injectés : aucune horloge réelle, aucun Math.random.
 *
 * À l'intérieur d'un pas, les échéances (arrivées, fins d'annonce, nouvelles annonces, fin de partie)
 * sont traitées dans l'ordre chronologique exact : le résultat ne dépend pas du découpage en images.
 */
import { CONFIG, type CafeLevel, type ParticipantId } from "./config";
import { Rng, seedFrom } from "./rng";
import type {
  GameEvent,
  GameState,
  Input,
  Line,
  LineType,
  Outcome,
  Participant,
  StepResult,
  Turn,
} from "./state";

export interface NewGameOptions {
  lines: readonly Line[];
  cafe: CafeLevel;
  seed: string | number;
  /** Debug (R-42) : nombre fixe de participants présents dès le départ. */
  participants?: number;
  durationMs?: number;
}

export function createGame(opts: NewGameOptions): GameState {
  const arrivals =
    opts.participants === undefined
      ? CONFIG.arrivals.map((a) => ({ ...a }))
      : CONFIG.arrivals
          .slice(0, clampInt(opts.participants, 1, CONFIG.arrivals.length))
          .map((a) => ({ id: a.id, atMs: 0 }));
  return {
    t: 0,
    durationMs: opts.durationMs ?? CONFIG.gameDurationMs,
    cafe: opts.cafe,
    rng: seedFrom(opts.seed),
    harmony: CONFIG.harmony.start,
    participants: [],
    pendingArrivals: arrivals,
    lines: opts.lines,
    usedLineIds: [],
    slotsFreeAt: Array.from({ length: CONFIG.cafe[opts.cafe].maxSimultaneous }, () => CONFIG.firstAnnounceDelayMs),
    lastAnnounceAt: -Infinity,
    bossReactionUntil: -1,
    bossReactionPending: false,
    stats: { intercepted: 0, blunders: 0, wrongMutes: 0, normals: 0, deplacees: 0 },
    over: false,
    endReason: null,
    eventSeq: 0,
  };
}

/** Résultat d'une prise de parole selon la table 3.3 (R-06). */
export function outcomeFor(type: LineType, mic: Turn["mic"]): Outcome {
  if (type === "deplacee") return mic === "muted" ? "intercepted" : "blunder";
  return mic === "muted" ? "wrongMute" : "normal";
}

export function step(prev: GameState, dtMs: number, inputs: readonly Input[] = []): StepResult {
  if (prev.over) return { state: prev, events: [] };

  const s = cloneState(prev);
  const rng = new Rng(s.rng);
  const events: GameEvent[] = [];
  const emit = (e: DistributiveOmit<GameEvent, "id" | "t">) => {
    events.push({ ...e, id: ++s.eventSeq, t: s.t } as GameEvent);
  };

  // 1. Les clics s'appliquent au moment présent (R-05, R-07).
  for (const input of inputs) {
    if (input.type !== "tap") continue;
    const p = s.participants.find((x) => x.id === input.participantId);
    if (!p || !p.turn || s.t >= p.turn.endAt) continue; // hors annonce : rien ne change (R-07)
    p.turn.mic = p.turn.mic === "open" ? "muted" : "open";
    emit({ type: "micToggled", participantId: p.id, mic: p.turn.mic });
  }

  // 2. On avance le temps en traitant chaque échéance dans l'ordre.
  const target = s.t + Math.max(0, dtMs);
  for (;;) {
    const next = nextDeadline(s);
    if (next === null || next.at > target) break;
    s.t = Math.max(s.t, next.at);
    switch (next.kind) {
      case "turnEnd":
        resolveTurn(s, next.participant, emit);
        break;
      case "gameEnd":
        endGame(s, "temps", emit);
        break;
      case "arrival":
        arrive(s, emit);
        break;
      case "announce":
        announce(s, rng, emit);
        break;
    }
    if (s.over) break;
  }
  if (!s.over) s.t = target;

  s.rng = rng.state;
  return { state: s, events };
}

// ---------------------------------------------------------------------------

type Deadline =
  | { kind: "turnEnd"; at: number; participant: Participant }
  | { kind: "gameEnd" | "arrival" | "announce"; at: number };

/** Ordre de priorité quand deux échéances tombent au même moment. */
const PRIORITY: Record<Deadline["kind"], number> = { turnEnd: 0, gameEnd: 1, arrival: 2, announce: 3 };

function nextDeadline(s: GameState): Deadline | null {
  const list: Deadline[] = [{ kind: "gameEnd", at: s.durationMs }];
  for (const p of s.participants) {
    if (p.turn) list.push({ kind: "turnEnd", at: p.turn.endAt, participant: p });
  }
  const arrival = s.pendingArrivals[0];
  if (arrival) list.push({ kind: "arrival", at: arrival.atMs });
  const announceAt = nextAnnounceTime(s);
  if (announceAt !== null) list.push({ kind: "announce", at: announceAt });

  list.sort((a, b) => a.at - b.at || PRIORITY[a.kind] - PRIORITY[b.kind]);
  return list[0] ?? null;
}

function nextAnnounceTime(s: GameState): number | null {
  const { readMs } = CONFIG.cafe[s.cafe];
  if (s.slotsFreeAt.length === 0) return null; // R-09 : toutes les places sont prises
  const idle = s.participants.filter((p) => !p.turn);
  if (idle.length === 0) return null;
  if (!hasAnyLineLeft(s)) return null; // R-21 : jamais de répétition
  const earliestRest = Math.min(...idle.map((p) => p.restUntil));
  const earliestSlot = Math.min(...s.slotsFreeAt);
  const gap = s.bossReactionPending ? 0 : CONFIG.minStartGapMs;
  const at = Math.max(earliestSlot, earliestRest, s.lastAnnounceAt + gap, s.t);
  if (at + readMs > s.durationMs) return null; // l'annonce doit finir avant la fin de la réunion
  return at;
}

function arrive(s: GameState, emit: Emit) {
  const a = s.pendingArrivals.shift();
  if (!a) return;
  s.participants.push({ id: a.id, joinedAt: s.t, turn: null, lastResult: null, restUntil: s.t });
  emit({ type: "participantJoined", participantId: a.id });
}

function announce(s: GameState, rng: Rng, emit: Emit) {
  const cafe = CONFIG.cafe[s.cafe];
  const candidates = s.participants.filter((p) => !p.turn && p.restUntil <= s.t);
  if (candidates.length === 0) return;

  let speaker: Participant | undefined;
  let line: Line | undefined;

  // Réaction au boss (R-24) : seulement juste après le boss, et par quelqu'un d'autre.
  const reacting = s.bossReactionPending && s.t <= s.bossReactionUntil;
  s.bossReactionPending = false;
  if (reacting) {
    const others = candidates.filter((p) => p.id !== CONFIG.bossReaction.triggerId);
    const reaction = unusedLines(s).filter((l) => l.declencheur === CONFIG.bossReaction.triggerId);
    if (others.length > 0 && reaction.length > 0) {
      speaker = rng.pick(others);
      line = rng.pick(reaction);
    }
  }

  if (!speaker || !line) {
    speaker = rng.pick(candidates);
    const wanted: LineType = rng.chance(CONFIG.deplaceeRatio) ? "deplacee" : "correcte";
    line = pickLine(s, rng, wanted) ?? pickLine(s, rng, wanted === "deplacee" ? "correcte" : "deplacee");
  }
  if (!line) return;

  const alreadyMuted = line.type === "deplacee" && !line.declencheur && rng.chance(CONFIG.alreadyMutedRatio);
  s.usedLineIds.push(line.id);
  speaker.turn = {
    line,
    startAt: s.t,
    endAt: s.t + cafe.readMs,
    mic: alreadyMuted ? "muted" : "open",
    initiallyMuted: alreadyMuted,
  };
  // On occupe la place libre la plus ancienne.
  const slot = s.slotsFreeAt.indexOf(Math.min(...s.slotsFreeAt));
  s.slotsFreeAt.splice(slot, 1);
  s.lastAnnounceAt = s.t;
  emit({ type: "announced", participantId: speaker.id, line, mic: speaker.turn.mic });
}

function resolveTurn(s: GameState, p: Participant, emit: Emit) {
  const turn = p.turn;
  if (!turn) return;
  const cafe = CONFIG.cafe[s.cafe];

  const outcome = outcomeFor(turn.line.type, turn.mic);
  const delta = CONFIG.harmonyDelta[outcome];
  s.harmony = clamp(s.harmony + delta, CONFIG.harmony.min, CONFIG.harmony.max);
  if (turn.line.type === "deplacee") s.stats.deplacees++;
  if (outcome === "intercepted") s.stats.intercepted++;
  if (outcome === "blunder") s.stats.blunders++;
  if (outcome === "wrongMute") s.stats.wrongMutes++;
  if (outcome === "normal") s.stats.normals++;

  p.turn = null;
  p.lastResult = { line: turn.line, outcome, at: s.t };
  p.restUntil = s.t + CONFIG.resultDisplayMs;

  // La place se libère, mais ne resservira qu'après la pause du niveau (R-14).
  let freeAt = s.t + cafe.pauseMs;

  // Le boss vient de parler : quelqu'un pourrait réagir tout de suite (R-24, R-25).
  if (p.id === CONFIG.bossReaction.triggerId) {
    s.bossReactionPending = true;
    s.bossReactionUntil = s.t + CONFIG.bossReaction.windowMs;
    const hasReaction = unusedLines(s).some((l) => l.declencheur === CONFIG.bossReaction.triggerId);
    if (hasReaction) freeAt = s.t + CONFIG.bossReaction.delayMs;
  }
  s.slotsFreeAt.push(freeAt);

  emit({
    type: "resolved",
    participantId: p.id,
    line: turn.line,
    outcome,
    harmonyDelta: delta,
    harmony: s.harmony,
  });

  if (s.harmony <= CONFIG.harmony.min) endGame(s, "harmonie", emit); // R-11
}

function endGame(s: GameState, reason: "temps" | "harmonie", emit: Emit) {
  if (s.over) return;
  s.over = true;
  s.endReason = reason;
  emit({ type: "gameOver", reason, harmony: s.harmony });
}

function unusedLines(s: GameState): Line[] {
  const used = new Set(s.usedLineIds);
  return s.lines.filter((l) => !used.has(l.id));
}

function hasAnyLineLeft(s: GameState): boolean {
  return unusedLines(s).some((l) => !l.declencheur);
}

function pickLine(s: GameState, rng: Rng, type: LineType): Line | undefined {
  const pool = unusedLines(s).filter((l) => l.type === type && !l.declencheur);
  return pool.length ? rng.pick(pool) : undefined;
}

function cloneState(s: GameState): GameState {
  return {
    ...s,
    participants: s.participants.map((p) => ({ ...p, turn: p.turn ? { ...p.turn } : null })),
    pendingArrivals: s.pendingArrivals.map((a) => ({ ...a })),
    usedLineIds: [...s.usedLineIds],
    slotsFreeAt: [...s.slotsFreeAt],
    stats: { ...s.stats },
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function clampInt(v: number, min: number, max: number) {
  return clamp(Math.round(v), min, max);
}

type DistributiveOmit<T, K extends keyof any> = T extends unknown ? Omit<T, K> : never;
type Emit = (e: DistributiveOmit<GameEvent, "id" | "t">) => void;

// ---------------------------------------------------------------------------
// Sélecteurs utiles à l'interface (lecture seule, aucune règle recalculée).

/** Progression de l'annonce, de 0 (début) à 1 (fin). */
export function turnProgress(turn: Turn, t: number): number {
  return clamp((t - turn.startAt) / (turn.endAt - turn.startAt), 0, 1);
}

/** Titre de fin selon l'harmonie (section 4, R-12). */
export function endTitleKey(harmony: number) {
  const found = CONFIG.endTitleThresholds.find((x) => harmony >= x.min);
  return (found ?? CONFIG.endTitleThresholds[CONFIG.endTitleThresholds.length - 1]!).key;
}

/** Horloge de réunion accélérée (section 4) : minutes écoulées depuis minuit. */
export function meetingMinutes(s: Pick<GameState, "t" | "durationMs">): number {
  const { startMinutes, durationMinutes } = CONFIG.meetingClock;
  return startMinutes + Math.floor((s.t / s.durationMs) * durationMinutes);
}

export function isParticipantId(x: string): x is ParticipantId {
  return CONFIG.arrivals.some((a) => a.id === x);
}
