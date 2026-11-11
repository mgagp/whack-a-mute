import { describe, expect, it } from "vitest";
import { CONFIG } from "../../src/engine/config";
import { createGame, step } from "../../src/engine/step";
import type { GameEvent } from "../../src/engine/state";
import { BANKS, parseLineBank } from "../../src/content/lines";
import { LINES, fakeLines, newGame, ofType, perfect, play } from "./helpers";

describe("Contenu : les répliques", () => {
  it("R-20 : la banque est validée au démarrage ; chaque réplique a un identifiant, un texte, un type et une langue", () => {
    expect(LINES.length).toBeGreaterThan(0);
    for (const l of LINES) {
      expect(l.id).toMatch(/\S/);
      expect(l.text).toMatch(/\S/);
      expect(["correcte", "deplacee"]).toContain(l.type);
      expect(l.lang).toBe("fr");
    }
    expect(new Set(LINES.map((l) => l.id)).size).toBe(LINES.length);
  });

  it("R-20 : une banque invalide est refusée", () => {
    const bad = structuredClone(BANKS.fr) as { lines: Record<string, unknown>[] };
    bad.lines[0]!.type = "bof";
    expect(() => parseLineBank(bad)).toThrow();
    const dup = structuredClone(BANKS.fr) as { lines: Record<string, unknown>[] };
    dup.lines[1]!.id = dup.lines[0]!.id;
    expect(() => parseLineBank(dup)).toThrow();
  });

  it("R-21 : aucune réplique n'est répétée dans une même partie", () => {
    for (let seed = 0; seed < 30; seed++) {
      for (const cafe of [1, 2, 3] as const) {
        const { events } = play(newGame({ seed, cafe }), perfect, 16);
        const ids = ofType(events, "announced").map((e) => e.line.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });

  it("R-21 : quand la banque est épuisée, le moteur cesse d'annoncer plutôt que de répéter", () => {
    const tiny = fakeLines(2);
    const { events } = play(createGame({ lines: tiny, cafe: 3, seed: 1, participants: 4 }), perfect, 16);
    const ids = ofType(events, "announced").map((e) => e.line.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeLessThanOrEqual(tiny.length);
  });

  it("R-22 : chaque réplique fait au plus 70 caractères et le volume minimal est atteint", () => {
    for (const l of LINES) expect(l.text.length, l.id).toBeLessThanOrEqual(CONFIG.maxLineLength);
    expect(LINES.filter((l) => l.type === "correcte").length).toBeGreaterThanOrEqual(CONFIG.minLines.correcte);
    expect(LINES.filter((l) => l.type === "deplacee").length).toBeGreaterThanOrEqual(CONFIG.minLines.deplacee);
  });

  it("R-23 : la réplique signature « Ben oui, c'est ça. » est une déplacée marquée signature", () => {
    const sig = LINES.find((l) => l.id === "fr-d-00");
    expect(sig).toBeDefined();
    expect(sig!.text).toBe("Ben oui, c'est ça.");
    expect(sig!.type).toBe("deplacee");
    expect(sig!.signature).toBe(true);
    expect(sig!.declencheur).toBe("boss");
  });

  it("R-24 : une réplique « declencheur: boss » n'est annoncée que juste après le boss, par quelqu'un d'autre", () => {
    let checked = 0;
    for (let seed = 0; seed < 60; seed++) {
      for (const cafe of [1, 2, 3] as const) {
        const { events } = play(newGame({ seed, cafe }), perfect, 16);
        const timeline = events.filter((e) => e.type === "announced" || e.type === "resolved");
        timeline.forEach((e, i) => {
          if (e.type !== "announced" || !e.line.declencheur) return;
          checked++;
          expect(e.participantId).not.toBe("boss");
          // L'événement précédent de la chronologie est la fin d'une prise de parole du boss…
          const lastBossEnd = [...timeline.slice(0, i)].reverse().find(
            (x): x is Extract<GameEvent, { type: "resolved" }> => x.type === "resolved",
          );
          expect(lastBossEnd?.participantId).toBe("boss");
          // …et aucune autre annonce n'a eu lieu entre les deux.
          const between = timeline.slice(timeline.indexOf(lastBossEnd!) + 1, i);
          expect(between.filter((x) => x.type === "announced")).toHaveLength(0);
          expect(e.t - lastBossEnd!.t).toBeLessThanOrEqual(CONFIG.bossReaction.windowMs);
        });
      }
    }
    expect(checked).toBeGreaterThan(10);
  });

  it("R-24 : sans boss dans la réunion, la réplique signature n'est jamais annoncée", () => {
    for (let seed = 0; seed < 30; seed++) {
      const { events } = play(newGame({ seed, cafe: 3, participants: 3 }), perfect, 16);
      expect(ofType(events, "announced").some((e) => e.line.declencheur)).toBe(false);
    }
  });

  it("R-25 : si le boss est présent, la réplique signature est annoncée au moins une fois (cas usuel)", () => {
    let withSig = 0;
    const total = 40;
    for (let seed = 0; seed < total; seed++) {
      const { events } = play(newGame({ seed, cafe: 2 }), perfect, 16);
      if (ofType(events, "announced").some((e) => e.line.id === "fr-d-00")) withSig++;
    }
    expect(withSig / total).toBeGreaterThan(0.9);
  });

  it("R-24 : la réaction n'est pas possible si la fenêtre après le boss est passée", () => {
    // On force un état où le boss a parlé il y a longtemps : rien ne doit déclencher la signature.
    let s = newGame({ seed: 1, participants: 4 });
    s = { ...s, bossReactionPending: true, bossReactionUntil: -1 };
    const { events } = step(s, 3000);
    expect(ofType(events, "announced").some((e) => e.line.declencheur)).toBe(false);
  });

  it("R-26 : un participant exclu par pasDitePar n'annonce jamais la réplique", () => {
    expect(LINES.find((l) => l.id === "fr-d-14")?.pasDitePar).toContain("boss");
    // Banque de test : le boss n'a le droit de dire aucune déplacée.
    const lines = fakeLines(30).map((l) => (l.type === "deplacee" ? { ...l, pasDitePar: ["boss" as const] } : l));
    let saidByOthers = 0;
    for (let seed = 0; seed < 20; seed++) {
      const { events } = play(newGame({ seed, cafe: 3, participants: 4, lines }), perfect, 16);
      for (const e of ofType(events, "announced")) {
        if (!e.line.pasDitePar) continue;
        expect(e.participantId).not.toBe("boss");
        saidByOthers++;
      }
    }
    expect(saidByOthers).toBeGreaterThan(0);
    // La vraie banque : le boss ne dit jamais fr-d-14.
    let fr14 = 0;
    for (let seed = 0; seed < 60; seed++) {
      const { events } = play(newGame({ seed, cafe: 3, participants: 4 }), perfect, 16);
      const said = ofType(events, "announced").filter((e) => e.line.id === "fr-d-14");
      fr14 += said.length;
      expect(said.some((e) => e.participantId === "boss")).toBe(false);
    }
    expect(fr14).toBeGreaterThan(0);
  }, 30_000);

  it("R-26 : pasDitePar doit nommer des participants connus", () => {
    const bad = structuredClone(BANKS.fr) as { lines: Record<string, unknown>[] };
    bad.lines[0]!.pasDitePar = ["madame-x"];
    expect(() => parseLineBank(bad)).toThrow();
  });
});
