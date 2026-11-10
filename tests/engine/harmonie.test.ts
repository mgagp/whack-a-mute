import { describe, expect, it } from "vitest";
import { CONFIG } from "../../src/engine/config";
import { endTitleKey } from "../../src/engine/step";
import { muteEverything, newGame, ofType, perfect, play } from "./helpers";

describe("Harmonie et fin", () => {
  it("R-10 : l'harmonie démarre à 100 %, reste entre 0 et 100 % et varie selon la table 3.3", () => {
    expect(newGame().harmony).toBe(100);
    for (let seed = 0; seed < 20; seed++) {
      for (const policy of [perfect, muteEverything, () => []]) {
        const { snapshots, events } = play(newGame({ seed, cafe: 3 }), policy);
        for (const s of snapshots) {
          expect(s.harmony).toBeGreaterThanOrEqual(0);
          expect(s.harmony).toBeLessThanOrEqual(100);
        }
        let h: number = CONFIG.harmony.start;
        for (const e of ofType(events, "resolved")) {
          expect(e.harmonyDelta).toBe(CONFIG.harmonyDelta[e.outcome]);
          h = Math.min(100, Math.max(0, h + e.harmonyDelta));
          expect(e.harmony).toBe(h);
        }
      }
    }
  });

  it("R-10 : l'harmonie ne dépasse jamais 100 %, même avec que des interceptions", () => {
    const { snapshots } = play(newGame({ seed: 1 }), perfect);
    expect(Math.max(...snapshots.map((s) => s.harmony))).toBe(100);
  });

  it("R-11 : la partie dure 90 secondes", () => {
    const { state, events } = play(newGame({ seed: 5 }), perfect, 16);
    expect(state.over).toBe(true);
    expect(state.endReason).toBe("temps");
    expect(state.t).toBe(CONFIG.gameDurationMs);
    expect(ofType(events, "gameOver")).toHaveLength(1);
  });

  it("R-11 : la partie se termine dès que l'harmonie atteint 0 %", () => {
    let ended = false;
    for (let seed = 0; seed < 20 && !ended; seed++) {
      const { state, events } = play(newGame({ seed, cafe: 3 }));
      if (state.endReason !== "harmonie") continue;
      ended = true;
      expect(state.harmony).toBe(0);
      expect(state.t).toBeLessThan(CONFIG.gameDurationMs);
      const last = events[events.length - 1]!;
      expect(last.type).toBe("gameOver");
      expect(ofType(events, "resolved").at(-1)!.harmony).toBe(0);
    }
    expect(ended).toBe(true);
  });

  it("R-12 : le titre de fin correspond aux paliers de la section 4", () => {
    expect(endTitleKey(100)).toBe("champion");
    expect(endTitleKey(90)).toBe("champion");
    expect(endTitleKey(89)).toBe("modele");
    expect(endTitleKey(70)).toBe("modele");
    expect(endTitleKey(69)).toBe("unUn");
    expect(endTitleKey(40)).toBe("unUn");
    expect(endTitleKey(39)).toBe("rh");
    expect(endTitleKey(1)).toBe("rh");
    expect(endTitleKey(0)).toBe("ecourtee");
  });

  it("R-12 : les statistiques comptent les interceptions sur le total des déplacées", () => {
    const { state, events } = play(newGame({ seed: 11 }), perfect);
    const resolved = ofType(events, "resolved");
    expect(state.stats.deplacees).toBe(resolved.filter((e) => e.line.type === "deplacee").length);
    expect(state.stats.intercepted).toBe(state.stats.deplacees); // joueur parfait
    expect(state.stats.blunders).toBe(0);
    expect(state.stats.wrongMutes).toBe(0);
    expect(state.stats.deplacees).toBeGreaterThan(5);
  });
});
