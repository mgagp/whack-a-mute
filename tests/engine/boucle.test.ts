import { describe, expect, it } from "vitest";
import { CONFIG, type CafeLevel } from "../../src/engine/config";
import { step, turnProgress } from "../../src/engine/step";
import { advanceUntil, fakeLines, newGame, ofType, perfect, play } from "./helpers";

describe("Boucle de jeu", () => {
  it("R-04 : chaque annonce montre le texte complet et dure le temps de lecture du niveau", () => {
    for (const cafe of [1, 2, 3] as CafeLevel[]) {
      const { state, event } = advanceUntil(newGame({ cafe }), (e) => e.type === "announced");
      if (event.type !== "announced") throw new Error();
      const p = state.participants.find((x) => x.id === event.participantId)!;
      expect(p.turn!.line.text.length).toBeGreaterThan(0);
      expect(event.line.text).toBe(p.turn!.line.text);
      expect(p.turn!.endAt - p.turn!.startAt).toBe(CONFIG.cafe[cafe].readMs);
      // Le compte à rebours visuel se calcule à partir de la progression.
      expect(turnProgress(p.turn!, p.turn!.startAt)).toBe(0);
      expect(turnProgress(p.turn!, p.turn!.endAt)).toBe(1);
    }
  });

  it("R-05 : un clic pendant l'annonce bascule le micro, et un second le rebascule", () => {
    const { state, event } = advanceUntil(newGame(), (e) => e.type === "announced");
    if (event.type !== "announced") throw new Error();
    const id = event.participantId;
    const before = state.participants.find((p) => p.id === id)!.turn!.mic;
    const r1 = step(state, 0, [{ type: "tap", participantId: id }]);
    const after1 = r1.state.participants.find((p) => p.id === id)!.turn!.mic;
    expect(after1).not.toBe(before);
    expect(ofType(r1.events, "micToggled")).toHaveLength(1);
    const r2 = step(r1.state, 0, [{ type: "tap", participantId: id }]);
    expect(r2.state.participants.find((p) => p.id === id)!.turn!.mic).toBe(before);
  });

  it("R-06 : le résultat suit la table 3.3 (déplacée/correcte × mute/ouvert)", () => {
    const lines = fakeLines();
    const cases = [
      { type: "deplacee", tap: true, expected: "intercepted" },
      { type: "deplacee", tap: false, expected: "blunder" },
      { type: "correcte", tap: false, expected: "normal" },
      { type: "correcte", tap: true, expected: "wrongMute" },
    ] as const;
    for (const c of cases) {
      let found = false;
      for (let seed = 0; seed < 200 && !found; seed++) {
        const { state, event } = advanceUntil(newGame({ lines, seed }), (e) => e.type === "announced");
        if (event.type !== "announced" || event.line.type !== c.type || event.mic !== "open") continue;
        found = true;
        const tapped = c.tap ? step(state, 0, [{ type: "tap", participantId: event.participantId }]).state : state;
        const { event: res } = advanceUntil(tapped, (e) => e.type === "resolved");
        if (res.type !== "resolved") throw new Error();
        expect(res.outcome).toBe(c.expected);
        expect(res.harmonyDelta).toBe(CONFIG.harmonyDelta[c.expected]);
      }
      expect(found).toBe(true);
    }
  });

  it("R-07 : un clic hors d'une annonce active ne change rien et ne pénalise pas", () => {
    const s0 = newGame();
    const r = step(s0, 16, [{ type: "tap", participantId: "ginette" }]);
    expect(r.events.filter((e) => e.type === "micToggled")).toHaveLength(0);
    expect(r.state.harmony).toBe(CONFIG.harmony.start);
    // Clic sur un participant absent, et clic frénétique entre deux annonces.
    const tapAll = play(newGame({ seed: 7 }), (s) =>
      s.participants.filter((p) => !p.turn).map((p) => ({ type: "tap", participantId: p.id })),
    );
    expect(ofType(tapAll.events, "micToggled")).toHaveLength(0);
    const idle = play(newGame({ seed: 7 }));
    expect(tapAll.state.harmony).toBe(idle.state.harmony);
  });

  it("R-08, #29 : une interception sans clic (déjà sur mute) est signalée à part ; avec un clic, non", () => {
    let found = false;
    for (let seed = 0; seed < 300; seed++) {
      const { state, event } = advanceUntil(newGame({ seed }), (e) => e.type === "announced");
      if (event.type !== "announced" || event.mic !== "muted") continue;
      // Sans clic : interception signalée « déjà sur mute », comptée comme une interception ordinaire.
      const quiet = advanceUntil(state, (e) => e.type === "resolved");
      expect(quiet.event.type === "resolved" && [quiet.event.outcome, quiet.event.selfMuted]).toEqual(["intercepted", true]);
      expect(quiet.state.participants.find((p) => p.id === event.participantId)?.lastResult?.selfMuted).toBe(true);
      expect(quiet.state.stats.intercepted).toBe(1);
      // Deux clics (rouvrir puis recouper) : c'est le joueur qui a coupé.
      const twice = step(state, 0, [
        { type: "tap", participantId: event.participantId },
        { type: "tap", participantId: event.participantId },
      ]).state;
      const res = advanceUntil(twice, (e) => e.type === "resolved").event;
      expect(res.type === "resolved" && [res.outcome, res.selfMuted]).toEqual(["intercepted", false]);
      found = true;
      break;
    }
    expect(found).toBe(true);
    // Une interception par clic n'est jamais signalée « déjà sur mute ».
    for (let seed = 0; seed < 300; seed++) {
      const { state, event } = advanceUntil(newGame({ seed }), (e) => e.type === "announced");
      if (event.type !== "announced" || event.mic !== "open" || event.line.type !== "deplacee") continue;
      const tapped = step(state, 0, [{ type: "tap", participantId: event.participantId }]).state;
      const res = advanceUntil(tapped, (e) => e.type === "resolved").event;
      expect(res.type === "resolved" && [res.outcome, res.selfMuted]).toEqual(["intercepted", false]);
      return;
    }
    throw new Error("aucune déplacée au micro ouvert trouvée");
  });

  it("R-08 : environ 25 % des déplacées arrivent déjà sur mute ; ne rien faire intercepte, cliquer est un piège", () => {
    let deplacees = 0;
    let muted = 0;
    for (let seed = 0; seed < 60; seed++) {
      const { events } = play(newGame({ seed, cafe: 3 }));
      for (const e of ofType(events, "announced")) {
        if (e.line.type !== "deplacee" || e.line.declencheur) continue;
        deplacees++;
        if (e.mic === "muted") muted++;
      }
    }
    const ratio = muted / deplacees;
    expect(ratio).toBeGreaterThan(0.18);
    expect(ratio).toBeLessThan(0.32);
    // Aucune phrase correcte n'est annoncée déjà sur mute.
    const { events } = play(newGame({ seed: 3, cafe: 3 }));
    expect(ofType(events, "announced").filter((e) => e.line.type === "correcte" && e.mic === "muted")).toHaveLength(0);

    // Ne rien faire sur une déplacée déjà sur mute : interception.
    for (let seed = 0; seed < 300; seed++) {
      const { state, event } = advanceUntil(newGame({ seed }), (e) => e.type === "announced");
      if (event.type !== "announced" || event.mic !== "muted") continue;
      const quiet = advanceUntil(state, (e) => e.type === "resolved").event;
      expect(quiet.type === "resolved" && quiet.outcome).toBe("intercepted");
      const trapped = step(state, 0, [{ type: "tap", participantId: event.participantId }]).state;
      const res = advanceUntil(trapped, (e) => e.type === "resolved").event;
      expect(res.type === "resolved" && res.outcome).toBe("blunder");
      return;
    }
    throw new Error("aucune déplacée déjà sur mute trouvée");
  });

  it("R-09 : les annonces simultanées ne dépassent jamais le maximum du niveau", () => {
    for (const cafe of [1, 2, 3] as CafeLevel[]) {
      let maxSeen = 0;
      for (let seed = 0; seed < 10; seed++) {
        const { snapshots } = play(newGame({ seed, cafe }), perfect, 10);
        for (const s of snapshots) maxSeen = Math.max(maxSeen, s.participants.filter((p) => p.turn).length);
      }
      expect(maxSeen).toBeLessThanOrEqual(CONFIG.cafe[cafe].maxSimultaneous);
      expect(maxSeen).toBe(CONFIG.cafe[cafe].maxSimultaneous); // le maximum est bien atteint
    }
  });

  it("R-05 : on ne peut plus basculer le micro une fois la phrase dite", () => {
    const { state, event } = advanceUntil(newGame(), (e) => e.type === "resolved");
    if (event.type !== "resolved") throw new Error();
    const r = step(state, 0, [{ type: "tap", participantId: event.participantId }]);
    expect(ofType(r.events, "micToggled")).toHaveLength(0);
  });
});
