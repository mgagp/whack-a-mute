import { createGame, step, type NewGameOptions } from "../../src/engine/step";
import type { GameEvent, GameState, Input, Line } from "../../src/engine/state";
import { loadLines } from "../../src/content/lines";

export const LINES = loadLines("fr");

/** Petite banque de test : n correctes et n déplacées, plus la réplique signature. */
export function fakeLines(n = 60): Line[] {
  const lines: Line[] = [];
  for (let i = 0; i < n; i++) {
    lines.push({ id: `c-${i}`, lang: "fr", type: "correcte", text: `correcte ${i}` });
    lines.push({ id: `d-${i}`, lang: "fr", type: "deplacee", text: `deplacee ${i}` });
  }
  lines.push({ id: "sig", lang: "fr", type: "deplacee", text: "Ben oui, c'est ça.", signature: true, declencheur: "boss" });
  return lines;
}

export function newGame(opts: Partial<NewGameOptions> = {}): GameState {
  return createGame({ lines: LINES, cafe: 2, seed: "test", ...opts });
}

export type Policy = (state: GameState, events: GameEvent[]) => Input[];

/** Joue une partie complète avec des images de `frameMs`, en laissant une politique décider des clics. */
export function play(state: GameState, policy: Policy = () => [], frameMs = 16) {
  const all: GameEvent[] = [];
  const snapshots: GameState[] = [];
  let last: GameEvent[] = [];
  let s = state;
  let guard = 0;
  while (!s.over && guard++ < 1_000_000) {
    const r = step(s, frameMs, policy(s, last));
    s = r.state;
    last = r.events;
    all.push(...r.events);
    snapshots.push(s);
  }
  return { state: s, events: all, snapshots };
}

/** Le joueur parfait : coupe les déplacées ouvertes, ne touche pas au reste. */
export const perfect: Policy = (s) =>
  s.participants
    .filter((p) => p.turn && p.turn.line.type === "deplacee" && p.turn.mic === "open")
    .map((p) => ({ type: "tap", participantId: p.id }));

/** Le joueur qui coupe tout le monde, tout le temps (un clic par annonce). */
export const muteEverything: Policy = (s) =>
  s.participants
    .filter((p) => p.turn && p.turn.mic === "open")
    .map((p) => ({ type: "tap", participantId: p.id }));

/** Avance jusqu'au premier événement du type donné. */
export function advanceUntil(state: GameState, pred: (e: GameEvent, s: GameState) => boolean, frameMs = 10) {
  let s = state;
  for (let i = 0; i < 100_000 && !s.over; i++) {
    const r = step(s, frameMs);
    s = r.state;
    const hit = r.events.find((e) => pred(e, s));
    if (hit) return { state: s, event: hit };
  }
  throw new Error("événement jamais atteint");
}

export function ofType<T extends GameEvent["type"]>(events: GameEvent[], type: T) {
  return events.filter((e): e is Extract<GameEvent, { type: T }> => e.type === type);
}
