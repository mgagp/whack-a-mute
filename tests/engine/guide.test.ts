import { describe, expect, it } from "vitest";
import { CONFIG } from "../../src/engine/config";
import type { GameEvent } from "../../src/engine/state";
import { muteEverything, newGame, ofType, perfect, play } from "./helpers";

const SEEDS = Array.from({ length: 40 }, (_, i) => `guide-${i}`);
const announced = (events: GameEvent[]) => ofType(events, "announced");

describe("Mode « Premier meeting » (#32)", () => {
  it("R-15 : sans guide, aucune annonce n'est guidée et le guide ne prend jamais fin", () => {
    const { snapshots, events } = play(newGame({ seed: "sans-guide", cafe: 1 }), perfect, 16);
    expect(snapshots.every((s) => s.participants.every((p) => !p.turn?.guided))).toBe(true);
    expect(ofType(events, "guideEnded")).toHaveLength(0);
  });

  it("R-15 : pendant le guide, chaque phrase déplacée est guidée, et seulement elles", () => {
    let guidedSeen = 0;
    for (const seed of SEEDS) {
      const { snapshots } = play(newGame({ seed, cafe: 1, guided: true }), perfect, 16);
      for (const s of snapshots) {
        for (const p of s.participants) {
          if (!p.turn) continue;
          const inGuide = p.turn.startAt < CONFIG.guide.durationMs;
          expect(p.turn.guided).toBe(inGuide && p.turn.line.type === "deplacee");
          if (p.turn.guided) guidedSeen++;
        }
      }
    }
    expect(guidedSeen).toBeGreaterThan(0);
  });

  it("R-15 : le guide prend fin une seule fois, au bout de sa durée", () => {
    const { events } = play(newGame({ seed: "fin", cafe: 1, guided: true }), perfect, 16);
    const ended = ofType(events, "guideEnded");
    expect(ended).toHaveLength(1);
    expect(ended[0]!.t).toBe(CONFIG.guide.durationMs);
  });

  it("R-15 : pas de collègue déjà sur mute (R-08) pendant le guide ; le piège revient ensuite", () => {
    let mutedInGuide = 0;
    let mutedWithoutGuide = 0;
    let mutedAfterGuide = 0;
    for (const seed of SEEDS) {
      for (const guided of [true, false]) {
        const { events } = play(newGame({ seed, cafe: 2, guided }), perfect, 16);
        for (const e of announced(events)) {
          if (e.mic !== "muted") continue;
          if (e.t < CONFIG.guide.durationMs) guided ? mutedInGuide++ : mutedWithoutGuide++;
          else if (guided) mutedAfterGuide++;
        }
      }
    }
    expect(mutedInGuide).toBe(0);
    expect(mutedWithoutGuide).toBeGreaterThan(0); // le même début de réunion, sans guide, en aurait eu
    expect(mutedAfterGuide).toBeGreaterThan(0);
  });

  it("R-15 : la première prise de parole d'une partie guidée est toujours une phrase déplacée, guidée", () => {
    for (const seed of SEEDS) {
      const { snapshots, events } = play(newGame({ seed, cafe: 1, guided: true }), perfect, 16);
      const first = announced(events)[0]!;
      expect(first.line.type).toBe("deplacee");
      expect(first.mic).toBe("open");
      const turn = snapshots.flatMap((s) => s.participants).find((p) => p.turn?.line.id === first.line.id)!.turn!;
      expect(turn.guided).toBe(true);
    }
  });

  it("R-15 : sans guide, la première prise de parole reste tirée au hasard", () => {
    const types = new Set(SEEDS.map((seed) => announced(play(newGame({ seed, cafe: 1 }), perfect, 16).events)[0]!.line.type));
    expect(types).toEqual(new Set(["correcte", "deplacee"]));
  });

  it("R-02 : le niveau de café proposé par défaut est le plus calme (#32)", () => {
    expect(CONFIG.defaultCafe).toBe(1);
  });

  it("R-18 : pendant le guide, la première erreur arrête le jeu, les suivantes s'expliquent sans arrêt", () => {
    let checked = 0;
    for (const seed of SEEDS) {
      // Le joueur qui coupe tout le monde : des malaises évités, mais des « coupé à tort ».
      for (const policy of [() => [], muteEverything]) {
        const { events } = play(newGame({ seed, cafe: 2, guided: true }), policy, 16);
        const errors = ofType(events, "resolved").filter((e) => e.outcome === "blunder" || e.outcome === "wrongMute");
        const inGuide = errors.filter((e) => e.t <= CONFIG.guide.durationMs);
        expect(inGuide.map((e) => e.explain)).toEqual(inGuide.map((_, i) => (i === 0 ? "pause" : "note")));
        for (const e of errors.filter((x) => x.t > CONFIG.guide.durationMs)) expect(e.explain).toBeNull();
        checked += inGuide.length;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it("R-18 : sans guide, ni arrêt ni explication ; les bons coups ne s'expliquent jamais", () => {
    const { events, snapshots } = play(newGame({ seed: "sans-guide", cafe: 2 }), () => [], 16);
    expect(ofType(events, "resolved").every((e) => e.explain === null)).toBe(true);
    expect(snapshots.every((s) => s.participants.every((p) => !p.lastResult?.explain))).toBe(true);
    const guided = play(newGame({ seed: "guide-0", cafe: 1, guided: true }), perfect, 16).events;
    expect(ofType(guided, "resolved").every((e) => e.explain === null)).toBe(true);
  });

  it("R-18 : la tuile garde l'explication avec le résultat de l'erreur", () => {
    const { snapshots } = play(newGame({ seed: "guide-1", cafe: 1, guided: true }), () => [], 16);
    const shown = snapshots.flatMap((s) => s.participants.map((p) => p.lastResult)).filter((r) => r?.explain);
    expect(shown.length).toBeGreaterThan(0);
    for (const r of shown) expect(["blunder", "wrongMute"]).toContain(r!.outcome);
  });
});
