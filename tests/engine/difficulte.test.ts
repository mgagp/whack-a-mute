import { describe, expect, it } from "vitest";
import { CONFIG, type CafeLevel } from "../../src/engine/config";
import { newGame, ofType, perfect, play } from "./helpers";

describe("Difficulté et participants", () => {
  it("R-13 : les participants arrivent à 0, 15, 35 et 55 s, avec une notification", () => {
    const { events } = play(newGame({ seed: 2 }), perfect, 10);
    const joins = ofType(events, "participantJoined");
    expect(joins.map((e) => e.participantId)).toEqual(["ginette", "kevin", "josee", "boss"]);
    expect(joins.map((e) => e.t)).toEqual([0, 15_000, 35_000, 55_000]);
  });

  it("R-13 : personne ne parle avant d'avoir rejoint la réunion", () => {
    const { events } = play(newGame({ seed: 4, cafe: 3 }), perfect, 10);
    const joinedAt = new Map(ofType(events, "participantJoined").map((e) => [e.participantId, e.t]));
    for (const a of ofType(events, "announced")) {
      expect(a.t).toBeGreaterThanOrEqual(joinedAt.get(a.participantId)!);
    }
  });

  it("R-14 : le temps de lecture et la pause suivent le niveau de café", () => {
    for (const cafe of [1, 2, 3] as CafeLevel[]) {
      const { readMs, pauseMs } = CONFIG.cafe[cafe];
      for (let seed = 0; seed < 5; seed++) {
        const { events } = play(newGame({ seed, cafe }), perfect, 10);
        const ann = ofType(events, "announced");
        const res = ofType(events, "resolved");
        expect(ann.length).toBeGreaterThan(5);
        // Chaque annonce se résout exactement après le temps de lecture.
        for (const r of res) {
          const a = [...ann].reverse().find((x) => x.participantId === r.participantId && x.t < r.t + 1)!;
          expect(r.t - a.t).toBeCloseTo(readMs, 6);
        }
        // Une place libérée ne resert qu'après la pause : au début de chaque annonce,
        // les annonces en cours plus les places encore « en pause » restent sous le maximum.
        const { maxSimultaneous } = CONFIG.cafe[cafe];
        for (const a of ann) {
          if (a.line.declencheur) continue; // la réaction au boss suit sa propre règle (R-24)
          const active = ann.filter((x) => x.t < a.t && !res.some((r) => r.participantId === x.participantId && r.t > x.t && r.t <= a.t)).length;
          // La place libérée par le boss peut servir tout de suite à la réaction (R-24).
          const reusedByReaction = (r: (typeof res)[number]) =>
            r.participantId === "boss" && ann.some((x) => x.line.declencheur && x.t > r.t && x.t <= a.t);
          const resting = res.filter((r) => r.t > a.t - pauseMs && r.t <= a.t && !reusedByReaction(r)).length;
          expect(active + resting).toBeLessThan(maxSimultaneous);
        }
        // Deux débuts d'annonce ne tombent jamais en même temps.
        for (let i = 1; i < ann.length; i++) {
          if (ann[i]!.line.declencheur) continue;
          expect(ann[i]!.t - ann[i - 1]!.t).toBeGreaterThanOrEqual(CONFIG.minStartGapMs - 1e-6);
        }
      }
    }
  });

  it("R-14 : plus il y a de café, plus il y a de prises de parole", () => {
    const count = (cafe: CafeLevel) =>
      ofType(play(newGame({ seed: 9, cafe }), perfect, 10).events, "announced").length;
    expect(count(1)).toBeLessThan(count(2));
    expect(count(2)).toBeLessThan(count(3));
  });

  it("R-42 : ?participants= met un nombre fixe de participants dès le départ", () => {
    const { events } = play(newGame({ seed: 1, participants: 3 }), perfect, 10);
    const joins = ofType(events, "participantJoined");
    expect(joins.map((e) => e.participantId)).toEqual(["ginette", "kevin", "josee"]);
    expect(joins.every((e) => e.t === 0)).toBe(true);
  });
});
