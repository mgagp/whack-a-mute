import { describe, expect, it } from "vitest";
import { CONFIG } from "../../src/engine/config";
import type { GameEvent } from "../../src/engine/state";
import { newGame, ofType, perfect, play } from "./helpers";

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

  it("R-15 : le guide ne change pas la réunion du jour (mêmes répliques, mêmes collègues)", () => {
    for (const seed of SEEDS.slice(0, 10)) {
      const sequence = (guided: boolean) =>
        announced(play(newGame({ seed, cafe: 1, guided }), perfect, 16).events).map((e) => `${e.participantId}:${e.line.id}`);
      expect(sequence(true)).toEqual(sequence(false));
    }
  });

  it("R-02 : le niveau de café proposé par défaut est le plus calme (#32)", () => {
    expect(CONFIG.defaultCafe).toBe(1);
  });
});
