import { describe, expect, it } from "vitest";
import { dailyKey, dailyResultOf, freeSeed, parseDaily, playKind } from "../../src/ui/daily";
import { newGame, perfect, play } from "../engine/helpers";

describe("Premier essai du jour (#49)", () => {
  it("R-54 : le stand-up du jour se joue une fois ; ensuite, parties libres ; ?seed= reste une partie de debug", () => {
    const played = { harmony: 85, intercepted: 4, deplacees: 5, outcomes: [] };
    expect(playKind(null, null)).toBe("daily");
    expect(playKind(null, played)).toBe("free");
    expect(playKind("abc", null)).toBe("debug");
    expect(playKind("abc", played)).toBe("debug");
  });

  it("R-54 : un stand-up du jour par date, par café et par langue", () => {
    const day = new Date(2026, 10, 15, 9);
    const keys = new Set([
      dailyKey(day, 1, "fr"),
      dailyKey(day, 2, "fr"),
      dailyKey(day, 1, "en"),
      dailyKey(new Date(2026, 10, 16, 9), 1, "fr"),
    ]);
    expect(keys.size).toBe(4);
    // Plus tard dans la même journée, c'est le même stand-up.
    expect(dailyKey(new Date(2026, 10, 15, 23, 59), 1, "fr")).toBe(dailyKey(day, 1, "fr"));
  });

  it("R-54 : le résultat mémorisé se relit tel quel ; une valeur abîmée compte comme « pas encore joué »", () => {
    const game = play(newGame({ seed: 3 }), perfect).state;
    const result = dailyResultOf(game);
    expect(parseDaily(JSON.stringify(result))).toEqual(result);
    expect(parseDaily(null)).toBeNull();
    expect(parseDaily("{pas du json")).toBeNull();
    expect(parseDaily(JSON.stringify({ harmony: "beaucoup" }))).toBeNull();
  });

  it("R-54 : chaque partie libre a sa propre réunion", () => {
    const seeds = new Set(Array.from({ length: 20 }, () => freeSeed()));
    expect(seeds.size).toBe(20);
    expect(freeSeed(() => 0.5)).toBe(freeSeed(() => 0.5));
  });
});
