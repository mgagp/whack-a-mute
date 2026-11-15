import { describe, expect, it } from "vitest";
import { loadLines, loadTutoLines } from "../../src/content/lines";
import { CONFIG } from "../../src/engine/config";
import type { GameEvent, GameState } from "../../src/engine/state";
import { step } from "../../src/engine/step";
import { createTutorialGame, sceneLength } from "../../src/engine/tutorial";
import { newGame, ofType, perfect, play } from "./helpers";

const FR = loadTutoLines("fr");
const EN = loadTutoLines("en");

/** Joue une scène jusqu'à ce que toutes ses prises de parole soient résolues (la réunion du tutoriel ne finit pas d'elle-même). */
function playScene(s0: GameState, policy = perfect) {
  let s = s0;
  const events: GameEvent[] = [];
  let last: GameEvent[] = [];
  for (let i = 0; i < 10_000; i++) {
    const r = step(s, 16, policy(s, last));
    s = r.state;
    last = r.events;
    events.push(...r.events);
    if (s.script?.length === 0 && s.participants.every((p) => !p.turn)) break;
  }
  return { state: s, events };
}

describe("Tutoriel du premier meeting", () => {
  it("R-17 : la démonstration fait parler Ginette seule, une phrase correcte puis une déplacée encerclée par le guide", () => {
    const s0 = createTutorialGame("demo", FR, "fr");
    expect(s0.participants.map((p) => p.id)).toEqual(["ginette"]);
    const { events, state } = playScene(s0);
    const said = ofType(events, "announced");
    expect(said.map((e) => [e.participantId, e.line.id, e.mic])).toEqual([
      ["ginette", "fr-t-01", "open"],
      ["ginette", "fr-t-02", "open"],
    ]);
    expect(state.participants[0]!.lastResult?.outcome).toBe("intercepted");
    expect(ofType(events, "guideEnded")).toHaveLength(0);
  });

  it("R-17 : le guide n'encercle que la phrase déplacée de la démonstration, jamais l'étape « À toi »", () => {
    const guided = (scene: "demo" | "live") => {
      const seen: string[] = [];
      let s = createTutorialGame(scene, FR, "fr");
      for (let i = 0; i < 5_000 && s.script!.length + s.participants.filter((p) => p.turn).length > 0; i++) {
        s = step(s, 16).state;
        for (const p of s.participants) if (p.turn?.guided && !seen.includes(p.turn.line.id)) seen.push(p.turn.line.id);
      }
      return seen;
    };
    expect(guided("demo")).toEqual(["fr-t-02"]);
    expect(guided("live")).toEqual([]);
  });

  it("R-17 : l'étape « À toi » réunit Ginette et Kevin, puis plus personne ne parle après le scénario", () => {
    const s0 = createTutorialGame("live", FR, "fr");
    expect(s0.participants.map((p) => p.id)).toEqual(["ginette"]);
    const { events, state } = playScene(s0);
    expect(ofType(events, "participantJoined").map((e) => e.participantId)).toEqual(["kevin"]);
    expect(ofType(events, "announced").map((e) => [e.participantId, e.line.type])).toEqual([
      ["ginette", "correcte"],
      ["kevin", "deplacee"],
    ]);
    expect(sceneLength("live")).toBe(2);
    expect(state.stats.blunders + state.stats.wrongMutes).toBe(0);
    // Après le scénario, la réunion continue sans nouvelle annonce.
    const later = step(state, 60_000);
    expect(ofType(later.events, "announced")).toHaveLength(0);
  });

  it("R-17 : sans geste, la phrase déplacée de l'étape « À toi » devient un malaise", () => {
    const { events } = playScene(createTutorialGame("live", FR, "fr"), () => []);
    expect(ofType(events, "resolved").map((e) => e.outcome)).toEqual(["normal", "blunder"]);
  });

  it("R-17 : le scénario ne dépend d'aucun hasard et se joue au rythme du café 1", () => {
    const a = playScene(createTutorialGame("live", EN, "en")).events;
    const b = playScene(createTutorialGame("live", EN, "en")).events;
    expect(a).toEqual(b);
    const first = ofType(a, "announced")[0]!;
    const end = ofType(a, "resolved")[0]!;
    expect(end.t - first.t).toBe(CONFIG.cafe[CONFIG.tutorial.cafe].readMs);
  });

  it("R-17 et R-60 : les répliques du tutoriel existent dans les deux langues et ne sortent jamais dans une vraie partie", () => {
    expect(FR.map((l) => l.id.slice(3))).toEqual(EN.map((l) => l.id.slice(3)));
    FR.forEach((fr, i) => {
      expect(EN[i]!.type, fr.id).toBe(fr.type);
      expect(EN[i]!.text, fr.id).not.toBe(fr.text);
      expect(fr.text.length, fr.id).toBeLessThanOrEqual(CONFIG.maxLineLength);
    });
    for (const lang of ["fr", "en"] as const) {
      const ids = new Set(loadLines(lang).map((l) => l.id));
      for (const l of loadTutoLines(lang)) expect(ids.has(l.id), l.id).toBe(false);
    }
    // Des parties complètes avec la banque du jeu ne tirent jamais une réplique du tutoriel.
    for (let seed = 0; seed < 10; seed++) {
      const { events } = play(newGame({ seed, cafe: 3 }), perfect, 50);
      for (const e of ofType(events, "announced")) expect(e.line.id).not.toMatch(/-t-/);
    }
  });
});
