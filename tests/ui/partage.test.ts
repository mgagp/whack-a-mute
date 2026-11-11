import { describe, expect, it } from "vitest";
import { CONFIG } from "../../src/engine/config";
import type { Outcome } from "../../src/engine/state";
import { ALL_STRINGS } from "../../src/ui/i18n";
import { dailySeed, emojiRecap, shareText } from "../../src/ui/share";
import { newGame, play } from "../engine/helpers";

describe("Partage (#19)", () => {
  it("#19 : un émoji par moment décisif, dans l'ordre ; les répliques correctes laissées passer n'apparaissent pas", () => {
    const outcomes: Outcome[] = ["normal", "intercepted", "blunder", "normal", "wrongMute", "intercepted"];
    expect(emojiRecap(outcomes)).toBe("🔇😬🤐🔇");
    expect(emojiRecap([])).toBe("");
  });

  it("#19 : un récapitulatif trop long est coupé avec « … »", () => {
    const many: Outcome[] = Array.from({ length: CONFIG.ui.shareRecapMax + 5 }, () => "intercepted");
    expect(emojiRecap(many)).toBe(`${"🔇".repeat(CONFIG.ui.shareRecapMax)}…`);
  });

  it("#19 : le texte partagé a la phrase du score, les émojis puis le nom du jeu, dans les deux langues", () => {
    const outcomes: Outcome[] = ["intercepted", "blunder"];
    const fr = shareText(ALL_STRINGS.fr.end.shareText(82, "☕☕", 11, 13, true), outcomes);
    expect(fr).toBe("J'ai gardé 82 % d'harmonie au stand-up du jour ☕☕ (11/13 commentaires interceptés)\n🔇😬\nwhack-a-mute");
    const en = shareText(ALL_STRINGS.en.end.shareText(82, "☕☕", 11, 13, true), outcomes);
    expect(en).toBe("I kept 82% harmony at today's stand-up ☕☕ (11/13 comments intercepted)\n🔇😬\nwhack-a-mute");
    // Partie de debug (?seed=) : ce n'est pas le stand-up du jour, et sans émoji la ligne disparaît.
    expect(shareText(ALL_STRINGS.fr.end.shareText(50, "☕", 0, 0, false), [])).toBe(
      "J'ai gardé 50 % d'harmonie au stand-up ☕ (0/0 commentaires interceptés)\nwhack-a-mute",
    );
  });

  it("#19 : la graine du jour suit la date locale et change à minuit", () => {
    expect(dailySeed(new Date(2026, 10, 11, 0, 0))).toBe("jour-2026-11-11");
    expect(dailySeed(new Date(2026, 10, 11, 23, 59))).toBe("jour-2026-11-11");
    expect(dailySeed(new Date(2026, 10, 12, 0, 0))).toBe("jour-2026-11-12");
  });

  it("#19 : le même jour, tout le monde a la même réunion ; le lendemain, une autre", () => {
    const lines = (seed: string) =>
      play(newGame({ seed })).events.flatMap((e) => (e.type === "announced" ? [`${e.participantId}:${e.line.id}`] : []));
    const today = dailySeed(new Date(2026, 10, 11, 9));
    expect(lines(today)).toEqual(lines(dailySeed(new Date(2026, 10, 11, 21))));
    expect(lines(today)).not.toEqual(lines(dailySeed(new Date(2026, 10, 12, 9))));
  });

  it("#19 : le moteur garde le résultat de chaque prise de parole, cohérent avec les statistiques", () => {
    const { state } = play(newGame({ seed: "recap" }));
    const count = (o: Outcome) => state.outcomes.filter((x) => x === o).length;
    expect(count("intercepted")).toBe(state.stats.intercepted);
    expect(count("blunder")).toBe(state.stats.blunders);
    expect(count("wrongMute")).toBe(state.stats.wrongMutes);
    expect(count("normal")).toBe(state.stats.normals);
  });
});
