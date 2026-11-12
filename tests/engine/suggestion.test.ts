import { describe, expect, it } from "vitest";
import { CONFIG } from "../../src/engine/config";
import { suggestedCafe } from "../../src/engine/step";

describe("Suggestion de niveau en fin de partie", () => {
  const { lessBelow, moreFrom } = CONFIG.cafeSuggestion;

  it("R-16 : sous le seuil, on propose un café de moins, sauf au café 1", () => {
    expect(suggestedCafe(0, 3)).toBe(2);
    expect(suggestedCafe(lessBelow - 1, 2)).toBe(1);
    expect(suggestedCafe(0, 1)).toBeNull();
  });

  it("R-16 : à partir du seuil haut, on propose un café de plus, sauf au café 3", () => {
    expect(suggestedCafe(100, 1)).toBe(2);
    expect(suggestedCafe(moreFrom, 2)).toBe(3);
    expect(suggestedCafe(100, 3)).toBeNull();
  });

  it("R-16 : entre les deux seuils, rien n'est proposé", () => {
    for (const cafe of [1, 2, 3] as const) {
      expect(suggestedCafe(lessBelow, cafe)).toBeNull();
      expect(suggestedCafe(moreFrom - 1, cafe)).toBeNull();
    }
  });

  it("R-16 : les seuils reprennent ceux des titres « RH » et « Champion·ne »", () => {
    const min = (key: string) => CONFIG.endTitleThresholds.find((t) => t.key === key)!.min;
    expect(lessBelow).toBe(min("unUn"));
    expect(moreFrom).toBe(min("champion"));
  });
});
