import { describe, expect, it } from "vitest";
import { step } from "../../src/engine/step";
import { nextRandom, seedFrom } from "../../src/engine/rng";
import { newGame, perfect, play } from "./helpers";

describe("Graine et déterminisme", () => {
  it("R-41 : la même graine et les mêmes actions donnent exactement la même partie", () => {
    const a = play(newGame({ seed: "marc" }), perfect, 16);
    const b = play(newGame({ seed: "marc" }), perfect, 16);
    expect(b.events).toEqual(a.events);
    expect(b.state).toEqual(a.state);
  });

  it("R-41 : une autre graine donne une autre partie", () => {
    const a = play(newGame({ seed: 1 }), perfect, 16);
    const b = play(newGame({ seed: 2 }), perfect, 16);
    expect(b.events.map((e) => e.type === "announced" && e.line.id)).not.toEqual(
      a.events.map((e) => e.type === "announced" && e.line.id),
    );
  });

  it("R-41 : le découpage en images ne change pas la partie (sans clic)", () => {
    const strip = (r: ReturnType<typeof play>) => r.events.map(({ id: _id, ...e }) => e);
    const a = play(newGame({ seed: 3 }), () => [], 16);
    const b = play(newGame({ seed: 3 }), () => [], 33);
    const c = play(newGame({ seed: 3 }), () => [], 1000);
    expect(strip(b)).toEqual(strip(a));
    expect(strip(c)).toEqual(strip(a));
  });

  it("R-41 : le générateur est pur et reproductible", () => {
    const s = seedFrom("abc");
    expect(nextRandom(s)).toEqual(nextRandom(s));
    expect(seedFrom("abc")).toBe(seedFrom("abc"));
    expect(seedFrom("abc")).not.toBe(seedFrom("abd"));
  });

  it("R-41 : step() ne modifie jamais l'état reçu", () => {
    const s0 = newGame({ seed: 8 });
    const frozen = structuredClone(s0);
    step(s0, 5000);
    expect(s0).toEqual(frozen);
  });
});
