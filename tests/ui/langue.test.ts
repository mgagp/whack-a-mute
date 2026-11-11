import { describe, expect, it } from "vitest";
import { resolveLang, shareUrl } from "../../src/ui/lang";
import { ALL_STRINGS } from "../../src/ui/i18n";

const base = { param: null, pageLang: undefined, stored: null, deviceLangs: [] as string[] };

describe("Choix de la langue", () => {
  it("R-60 : ?lang= l'emporte sur tout le reste", () => {
    expect(resolveLang({ param: "en", pageLang: undefined, stored: "fr", deviceLangs: ["fr-CA"] })).toBe("en");
    expect(resolveLang({ param: "fr", pageLang: "en", stored: "en", deviceLangs: ["en-US"] })).toBe("fr");
  });

  it("R-60 : la page /en/ est en anglais, même si le joueur avait choisi le français", () => {
    expect(resolveLang({ ...base, pageLang: "en", stored: "fr", deviceLangs: ["fr-CA"] })).toBe("en");
  });

  it("R-60 : sinon, le choix mémorisé du joueur, puis la langue de l'appareil", () => {
    expect(resolveLang({ ...base, stored: "en", deviceLangs: ["fr-CA"] })).toBe("en");
    expect(resolveLang({ ...base, deviceLangs: ["fr-CA", "en"] })).toBe("fr");
    expect(resolveLang({ ...base, deviceLangs: ["fr"] })).toBe("fr");
    expect(resolveLang({ ...base, deviceLangs: ["en-US", "fr"] })).toBe("en");
  });

  it("R-60 : une langue inconnue ou absente donne l'anglais, la langue la plus répandue", () => {
    expect(resolveLang({ ...base, deviceLangs: ["de-DE"] })).toBe("en");
    expect(resolveLang(base)).toBe("en");
    expect(resolveLang({ ...base, param: "klingon", stored: "??", deviceLangs: ["fr-CA"] })).toBe("fr");
  });

  it("R-60 : on partage l'adresse de la langue jouée", () => {
    const o = "https://exemple.test";
    expect(shareUrl(o, "/whack-a-mute/", "fr")).toBe("https://exemple.test/whack-a-mute/");
    expect(shareUrl(o, "/whack-a-mute/", "en")).toBe("https://exemple.test/whack-a-mute/en/");
    expect(shareUrl(o, "/whack-a-mute/en/", "en")).toBe("https://exemple.test/whack-a-mute/en/");
    expect(shareUrl(o, "/whack-a-mute/en/", "fr")).toBe("https://exemple.test/whack-a-mute/");
    expect(shareUrl(o, "/whack-a-mute/en/index.html", "en")).toBe("https://exemple.test/whack-a-mute/en/");
    expect(shareUrl(o, "/", "en")).toBe("https://exemple.test/en/");
  });

  it("R-60 : chaque langue a ses propres textes", () => {
    expect(ALL_STRINGS.fr.lang).toBe("fr");
    expect(ALL_STRINGS.en.lang).toBe("en");
    expect(ALL_STRINGS.en.home.start).not.toBe(ALL_STRINGS.fr.home.start);
    expect(ALL_STRINGS.en.percent(85)).toBe("85%");
    expect(ALL_STRINGS.fr.percent(85)).toBe("85 %");
  });
});
