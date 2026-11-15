import { describe, expect, it } from "vitest";
import { initialGuided, initialTuto } from "../../src/ui/guide";
import { readParams } from "../../src/ui/params";

describe("Mode « Premier meeting » à l'accueil", () => {
  it("R-15 : actif par défaut tant qu'aucune partie guidée n'a été terminée, puis désactivé", () => {
    expect(initialGuided(null, false)).toBe(true);
    expect(initialGuided(null, true)).toBe(false);
  });

  it("R-15 : ?guide=1 ou ?guide=0 impose le choix, sans activer le mode debug", () => {
    expect(readParams("?guide=1").guide).toBe(true);
    expect(readParams("?guide=0").guide).toBe(false);
    expect(readParams("").guide).toBe(null);
    expect(initialGuided(true, true)).toBe(true);
    expect(initialGuided(false, false)).toBe(false);
    expect(readParams("?guide=1").debug).toBe(false);
  });
});

describe("Tutoriel du premier meeting", () => {
  it("R-17 : proposé tant qu'il n'a été ni terminé ni passé ; ?tuto=0|1 impose le choix, sans debug", () => {
    expect(initialTuto(null, false)).toBe(true);
    expect(initialTuto(null, true)).toBe(false);
    expect(readParams("?tuto=1").tuto).toBe(true);
    expect(readParams("?tuto=0").tuto).toBe(false);
    expect(readParams("").tuto).toBe(null);
    expect(initialTuto(true, true)).toBe(true);
    expect(initialTuto(false, false)).toBe(false);
    expect(readParams("?tuto=1").debug).toBe(false);
  });
});
