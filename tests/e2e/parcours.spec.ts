import { expect, test, type Page } from "@playwright/test";

// R-52 : aucun test ne contacte le vrai compteur ; le script bloqué montre aussi que le jeu s'en passe.
test.beforeEach(async ({ page }) => {
  await page.route("https://gc.zgo.at/**", (route) => route.abort());
});

/** Le bouton « Rejoindre » pulse sans arrêt : on clique sans attendre qu'il soit immobile. */
async function start(page: Page) {
  await page.getByTestId("start").click({ force: true });
}

/** Joue en coupant toutes les phrases déplacées dont le micro est ouvert (attribut de debug data-type). */
async function playPerfectly(page: Page) {
  const end = page.getByTestId("end");
  while (!(await end.isVisible())) {
    const targets = page.locator('.tile[data-type="deplacee"][data-mic="open"]');
    const n = await targets.count();
    for (let i = 0; i < n; i++) {
      await targets.nth(i).dispatchEvent("pointerdown").catch(() => {});
    }
    await page.waitForTimeout(20);
  }
}

test("R-01 : l'accueil affiche le titre, l'anecdote et un bouton pour commencer", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("MUTE");
  await expect(page.getByText("t'es pas sur mute")).toBeVisible();
  // L'anecdote de Marc : c'est un collègue (masculin) qui l'a averti.
  await expect(page.getByText("Un collègue, en pleine réunion")).toBeVisible();
  await expect(page.getByTestId("start")).toBeVisible();
});

test("R-02 : le joueur choisit son café parmi trois, directement sur l'accueil", async ({ page }) => {
  await page.goto("./");
  const radios = page.getByRole("radio");
  await expect(radios).toHaveCount(3);
  await expect(page.getByTestId("cafe-2")).toHaveAttribute("aria-checked", "true");
  await page.getByTestId("cafe-3").click();
  await expect(page.getByTestId("cafe-3")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("cafe-2")).toHaveAttribute("aria-checked", "false");
});

test("R-42 : ?cafe= présélectionne le niveau de café", async ({ page }) => {
  await page.goto("./?cafe=1");
  await expect(page.getByTestId("cafe-1")).toHaveAttribute("aria-checked", "true");
});

test("R-12 : partie complète parfaite, de l'accueil à l'écran de fin", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("./?seed=parcours&vitesse=6");
  await start(page);
  await expect(page.getByTestId("game")).toBeVisible();
  await playPerfectly(page);
  await expect(page.getByTestId("final-harmony")).toContainText("100 %");
  await expect(page.getByTestId("end-title")).toHaveText("Champion·ne de la synergie");
  const [got, total] = (await page.getByTestId("stat-intercepted").innerText()).split("/").map(Number);
  expect(total).toBeGreaterThan(3);
  expect(got).toBe(total);
});

test("R-03 et R-11 : sans rien faire, la réunion finit ; on rejoue en un clic ou on change de café", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("./?seed=paresseux&vitesse=20&cafe=3");
  await start(page);
  await expect(page.getByTestId("end")).toBeVisible({ timeout: 20_000 });
  const harmony = Number((await page.getByTestId("final-harmony").innerText()).match(/\d+/)![0]);
  expect(harmony).toBeLessThan(100);
  await expect(page.getByTestId("end-title")).not.toBeEmpty();

  // Rejouer : même niveau, nouvelle réunion.
  await page.getByTestId("replay").click();
  await expect(page.getByTestId("game")).toBeVisible();
  await expect(page.getByText("☕☕☕").first()).toBeVisible();
  await expect(page.getByTestId("end")).toBeVisible({ timeout: 20_000 });

  // Changer le niveau de café : retour à l'accueil, le choix précédent est conservé.
  await page.getByTestId("change-cafe").click();
  await expect(page.getByTestId("home")).toBeVisible();
  await expect(page.getByTestId("cafe-3")).toHaveAttribute("aria-checked", "true");
});

test("R-43 : la réunion à 4 tient dans l'écran, sans défilement", async ({ page }) => {
  await page.goto("./?seed=ecran&participants=4&vitesse=1");
  await start(page);
  await expect(page.locator(".tile")).toHaveCount(4);
  await page.waitForTimeout(400);
  const fits = await page.evaluate(() => {
    const doc = document.scrollingElement!;
    const tiles = [...document.querySelectorAll(".tile")].map((t) => t.getBoundingClientRect());
    const bottom = document.querySelector(".bottombar")!.getBoundingClientRect();
    return {
      noScroll: doc.scrollHeight <= window.innerHeight + 1 && doc.scrollWidth <= window.innerWidth + 1,
      inside: tiles.every((r) => r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth),
      bottomVisible: bottom.bottom <= window.innerHeight,
      minTile: Math.min(...tiles.map((r) => Math.min(r.width, r.height))),
    };
  });
  expect(fits.noScroll).toBe(true);
  expect(fits.inside).toBe(true);
  expect(fits.bottomVisible).toBe(true);
  expect(fits.minTile).toBeGreaterThan(120);
});

test("R-30 : le clic sur une tuile qui va parler change le micro en moins de 100 ms", async ({ page }) => {
  await page.goto("./?seed=reflexe&vitesse=0.5");
  await start(page);
  const tile = page.locator('.tile[data-state="announcing"]').first();
  await expect(tile).toBeVisible({ timeout: 10_000 });
  const elapsed = await tile.evaluate(async (el) => {
    const before = el.getAttribute("data-mic");
    const t0 = performance.now();
    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    while (el.getAttribute("data-mic") === before && performance.now() - t0 < 1000) {
      await new Promise((r) => setTimeout(r, 0));
    }
    return performance.now() - t0;
  });
  expect(elapsed).toBeLessThan(100);
});

test("R-30 : chaque résultat a son retour visuel distinct", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("./?seed=retours&vitesse=3&participants=4");
  await start(page);
  const seen = new Set<string>();
  // Politique mixte : on coupe toujours Ginette, jamais Kevin, et les autres seulement s'ils vont déraper.
  while (!(await page.getByTestId("end").isVisible()) && seen.size < 4) {
    const states = await page.locator(".tile").evaluateAll((els) => els.map((e) => e.getAttribute("data-state")));
    states.forEach((s) => s && ["intercepted", "blunder", "normal", "wrongMute"].includes(s) && seen.add(s));
    const targets = page.locator(
      '.tile[data-state="announcing"][data-mic="open"]:is([data-testid="tile-ginette"], [data-testid="tile-josee"][data-type="deplacee"], [data-testid="tile-boss"][data-type="deplacee"])',
    );
    for (let k = (await targets.count()) - 1; k >= 0; k--) {
      await targets.nth(k).dispatchEvent("pointerdown").catch(() => {});
    }
    await page.waitForTimeout(30);
  }
  for (const s of ["intercepted", "blunder", "normal", "wrongMute"]) seen.has(s) || seen.add(`manque:${s}`);
  expect([...seen].filter((s) => s.startsWith("manque"))).toEqual([]);
});

test("R-08, #29 : déjà sur mute et sans clic, le retour dit « Bien vu ! », pas « MUTE ! »", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("./?seed=deja&vitesse=2&participants=4");
  await start(page);
  // On ne touche à rien : la première interception ne peut venir que d'un collègue déjà sur mute.
  const tile = page.locator('.tile[data-state="intercepted"]').first();
  await expect(tile).toHaveAttribute("data-self", "true", { timeout: 40_000 });
  await expect(tile.locator(".stamp")).toHaveText("BIEN VU !");
  await expect(tile.locator(".bubble .tag")).toHaveText("🤐 Déjà sur mute");
  // Pas de « SCHLAC ! » : il est réservé au clic du joueur.
  await expect(tile.locator(".boom")).toHaveCount(0);
  await expect(page.getByTestId("toast")).toContainText("Bien vu !");
});

test("R-31 : le bouton de son coupe ou rétablit le son, et le choix est mémorisé", async ({ page }) => {
  await page.goto("./");
  const btn = page.getByTestId("sound");
  await expect(btn).toHaveAttribute("aria-pressed", "false");
  await btn.click();
  await expect(btn).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByTestId("sound")).toHaveAttribute("aria-pressed", "true");
  await start(page);
  await expect(page.getByTestId("sound")).toHaveAttribute("aria-pressed", "true");
});

test("R-37 : le texte des bulles a un contraste d'au moins 4,5:1", async ({ page }) => {
  await page.goto("./?seed=contraste&vitesse=0.5&participants=4");
  await start(page);
  await expect(page.locator(".bubble").first()).toBeVisible({ timeout: 10_000 });
  const ratios = await page.evaluate(() => {
    const parse = (c: string) => c.match(/[\d.]+/g)!.slice(0, 3).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!);
    };
    const ratio = (a: string, b: string) => {
      const [l1, l2] = [lum(parse(a)), lum(parse(b))].sort((x, y) => y - x);
      return (l1! + 0.05) / (l2! + 0.05);
    };
    // Toutes les variantes de bulles, rendues hors écran avec les vraies classes.
    const variants = ["bubble think", "bubble said normal", "bubble said blunder", "bubble hushed", "bubble hushed wrong"];
    const host = document.querySelector(".tile")!;
    return variants.map((cls) => {
      const b = document.createElement("div");
      b.className = cls;
      b.innerHTML =
        '<svg class="cloud" viewBox="0 0 240 100"><path d="M0 0H240V100H0Z"/></svg><div class="tag">tag</div><q>texte</q><span class="note">note</span>';
      host.appendChild(b);
      // La bulle-pensée (#10) tient son fond dans le nuage SVG ; les autres, dans leur arrière-plan.
      const bg = cls.includes("think") ? getComputedStyle(b.querySelector(".cloud path")!).fill : getComputedStyle(b).backgroundColor;
      const out = [b.querySelector("q")!, b.querySelector(".tag")!, b.querySelector(".note")!].map((el) => ratio(getComputedStyle(el).color, bg));
      b.remove();
      return { cls, min: Math.min(...out) };
    });
  });
  for (const r of ratios) expect(r.min, r.cls).toBeGreaterThanOrEqual(4.5);
});

test("R-51 : la page a une image d'aperçu et une description pour le partage du lien", async ({ page, request }) => {
  await page.goto("./");
  const meta = (sel: string) => page.locator(sel).getAttribute("content");
  expect(await meta('meta[property="og:title"]')).toBe("Whack-a-Mute");
  expect(await meta('meta[property="og:description"]')).toMatch(/mute/);
  expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");
  const image = await meta('meta[property="og:image"]');
  expect(image).toMatch(/^https:\/\/.+\/apercu\.jpg$/);
  // L'image est bien servie avec le site (on la demande au serveur local).
  const res = await request.get("./apercu.jpg");
  expect(res.ok()).toBe(true);
  expect(res.headers()["content-type"]).toContain("image/jpeg");
});

/** Le texte copié : phrase du score, ligne d'émojis, puis « whack-a-mute » suivi de l'adresse (#19). */
function expectShareLayout(copied: string, headline: RegExp, url: string) {
  const lines = copied.split("\n");
  expect(lines).toHaveLength(3);
  expect(lines[0]).toMatch(headline);
  expect(lines[1]).toMatch(/^[🔇😬🤐]+…?$/u);
  expect(lines[2]).toBe(`whack-a-mute ${url}`);
}

test("R-50, #19 : sur ordinateur, « Partager » copie le stand-up du jour, ses émojis et l'adresse du jeu", async ({ page, context, isMobile }) => {
  test.skip(isMobile, "sur téléphone, c'est le partage natif");
  test.setTimeout(60_000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  // Sans ?seed=, c'est le stand-up du jour (#19).
  await page.goto("./?vitesse=20");
  await start(page);
  await expect(page.getByTestId("end")).toBeVisible({ timeout: 20_000 });
  await page.getByTestId("share").click({ force: true });
  await expect(page.getByTestId("share")).toContainText("Copié");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expectShareLayout(copied, /^J'ai gardé \d+ % d'harmonie au stand-up du jour /, `${new URL("./", page.url().replace(/\?.*$/, "")).href}?lang=fr&ref=partage`);
});

test("R-52, #20 : les parties lancées et les partages sont comptés, avec leur langue", async ({ page, context, isMobile }) => {
  test.skip(isMobile, "sur téléphone, c'est le partage natif");
  test.setTimeout(60_000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  // Faux script du compteur : il note les événements au lieu de les envoyer.
  await page.route("https://gc.zgo.at/count.js", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: "window.__comptes = []; window.goatcounter = { count: (v) => window.__comptes.push(v) };",
    }),
  );
  await page.goto("./?vitesse=20");
  await expect(page.locator('script[data-goatcounter="https://whack-a-mute.goatcounter.com/count"]')).toHaveCount(1);
  await page.waitForFunction(() => "__comptes" in window);
  await start(page);
  await expect(page.getByTestId("end")).toBeVisible({ timeout: 20_000 });
  await page.getByTestId("share").click({ force: true });
  const comptes = await page.evaluate(() => (window as unknown as { __comptes: unknown[] }).__comptes);
  expect(comptes).toEqual([
    { path: "partie-fr", event: true },
    { path: "partage-fr", event: true },
  ]);
});

test("R-60, #26 : un score partagé en français s'ouvre en français, même sur un appareil en anglais", async ({ browser }) => {
  const context = await browser.newContext({ locale: "en-US" });
  const page = await context.newPage();
  await page.route("https://gc.zgo.at/**", (route) => route.abort());
  await page.goto("./?lang=fr&ref=partage");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.getByTestId("start")).toContainText("Rejoindre");
  await context.close();
});

test("#28 : « Changer le niveau de café » tient sur une ligne, dans les deux langues", async ({ page }) => {
  test.setTimeout(60_000);
  for (const [lang, text] of [["fr", "Changer le niveau de café ☕"], ["en", "Change coffee level ☕"]]) {
    await page.goto(`./?lang=${lang}&seed=cafe&vitesse=20`);
    await start(page);
    const link = page.getByTestId("change-cafe");
    await expect(link).toHaveText(text, { timeout: 20_000 });
    // Un rectangle par ligne de texte : une seule ligne, un seul rectangle.
    const lines = await link.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size;
    });
    expect(lines, lang).toBe(1);
  }
});

test("#4 : icônes d'onglet et d'écran d'accueil, avec un manifeste", async ({ page, request }) => {
  await page.goto("./");
  const href = (sel: string) => page.locator(sel).getAttribute("href");
  for (const sel of ['link[rel="icon"]', 'link[rel="apple-touch-icon"]', 'link[rel="manifest"]']) {
    const res = await request.get(new URL((await href(sel))!, page.url()).href);
    expect(res.ok(), sel).toBe(true);
  }
  const manifestUrl = new URL((await href('link[rel="manifest"]'))!, page.url());
  const manifest = await (await request.get(manifestUrl.href)).json();
  expect(manifest.name).toBe("Whack-a-Mute");
  const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
  expect(sizes).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  expect(manifest.icons.some((i: { purpose: string }) => i.purpose === "maskable")).toBe(true);
  for (const icon of manifest.icons) {
    const res = await request.get(new URL(icon.src, manifestUrl).href);
    expect(res.headers()["content-type"]).toContain("image/png");
  }
});

test("#10 : ce qui va être dit est une bulle-pensée ; ce qui est dit, une bulle de parole", async ({ page }) => {
  test.setTimeout(30_000);
  await page.goto("./?seed=pensee&participants=4&cafe=3&vitesse=2");
  await start(page);
  const announcing = page.locator('.tile[data-state="announcing"]').first();
  await expect(announcing).toBeVisible({ timeout: 10_000 });
  await expect(announcing.locator(".bubble.think .cloud")).toHaveCount(1);
  const said = page.locator('.tile[data-state="normal"], .tile[data-state="blunder"]').first();
  await expect(said).toBeVisible({ timeout: 15_000 });
  await expect(said.locator(".bubble.said")).toHaveCount(1);
  await expect(said.locator(".bubble.think, .cloud")).toHaveCount(0);
});

test.describe("Version anglaise (R-60)", () => {
  test("R-60 : avec ?lang=en, une partie complète se joue en anglais", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("./?lang=en&seed=english&vitesse=6");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle(/save the meeting/);
    await expect(page.getByText("you're not on mute")).toBeVisible();
    await expect(page.getByText("A coworker, mid-meeting")).toBeVisible();
    await expect(page.getByTestId("start")).toContainText("Join the meeting");
    await start(page);
    await expect(page.getByTestId("harmony")).toContainText("Team harmony · 100%");
    await expect(page.locator(".bubble.think .tag").first()).toContainText("About to say", { timeout: 10_000 });
    await playPerfectly(page);
    await expect(page.getByTestId("final-harmony")).toContainText("100%");
    await expect(page.getByTestId("end-title")).toHaveText("Synergy champion");
    await expect(page.getByTestId("replay")).toContainText("Play again");
    // Aucun texte français ne traîne sur l'écran de fin.
    await expect(page.getByTestId("end")).not.toContainText(/harmonie|Rejouer|Partager|réunion/i);
  });

  test("R-60 : la page /en/ est en anglais, avec son propre aperçu de lien", async ({ page, request }) => {
    await page.goto("./en/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByTestId("start")).toContainText("Join the meeting");
    const meta = (sel: string) => page.locator(sel).getAttribute("content");
    expect(await meta('meta[property="og:url"]')).toMatch(/\/en\/$/);
    expect(await meta('meta[property="og:description"]')).toContain("you're not on mute");
    expect(await meta('meta[property="og:image"]')).toMatch(/^https:\/\/.+\/apercu-en\.jpg$/);
    const res = await request.get("./apercu-en.jpg");
    expect(res.ok()).toBe(true);
    expect(res.headers()["content-type"]).toContain("image/jpeg");
    // Les icônes et le manifeste, partagés avec la page française, répondent aussi depuis /en/.
    for (const sel of ['link[rel="icon"]', 'link[rel="apple-touch-icon"]', 'link[rel="manifest"]']) {
      const href = await page.locator(sel).getAttribute("href");
      expect((await request.get(new URL(href!, page.url()).href)).ok(), sel).toBe(true);
    }
  });

  test("R-60 : le bouton FR/EN change la langue, et le choix est mémorisé", async ({ page }) => {
    await page.goto("./");
    await expect(page.getByTestId("lang-fr")).toHaveAttribute("aria-pressed", "true");
    await page.getByTestId("lang-en").click();
    await expect(page.getByTestId("start")).toContainText("Join the meeting");
    await expect(page.getByTestId("lang-en")).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(page.getByTestId("start")).toContainText("Join the meeting");
    await page.getByTestId("lang-fr").click();
    await expect(page.getByTestId("start")).toContainText("Rejoindre la réunion");
    await page.reload();
    await expect(page.getByTestId("start")).toContainText("Rejoindre la réunion");
  });

  test.describe("appareil en anglais", () => {
    test.use({ locale: "en-US" });
    test("R-60 : un appareil en anglais voit le jeu en anglais dès l'arrivée", async ({ page }) => {
      await page.goto("./");
      await expect(page.getByTestId("start")).toContainText("Join the meeting");
      await expect(page.getByTestId("lang-en")).toHaveAttribute("aria-pressed", "true");
    });
  });

  test("R-43 : en anglais aussi, l'accueil et la réunion à 4 tiennent dans l'écran", async ({ page }) => {
    await page.goto("./?lang=en&seed=ecran&participants=4&vitesse=1");
    const noScroll = () =>
      page.evaluate(() => {
        const doc = document.scrollingElement!;
        return doc.scrollWidth <= window.innerWidth + 1;
      });
    expect(await noScroll()).toBe(true);
    await start(page);
    await expect(page.locator(".tile")).toHaveCount(4);
    await page.waitForTimeout(400);
    const fits = await page.evaluate(() => {
      const doc = document.scrollingElement!;
      const tiles = [...document.querySelectorAll(".tile")].map((t) => t.getBoundingClientRect());
      return {
        noScroll: doc.scrollHeight <= window.innerHeight + 1 && doc.scrollWidth <= window.innerWidth + 1,
        inside: tiles.every((r) => r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth),
        bottomVisible: document.querySelector(".bottombar")!.getBoundingClientRect().bottom <= window.innerHeight,
      };
    });
    expect(fits).toEqual({ noScroll: true, inside: true, bottomVisible: true });
  });

  test("R-50, #19 : en anglais, « Share » copie le stand-up du jour avec l'adresse de la page anglaise", async ({ page, context, isMobile }) => {
    test.skip(isMobile, "sur téléphone, c'est le partage natif");
    test.setTimeout(60_000);
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("./?lang=en&vitesse=20");
    await start(page);
    await expect(page.getByTestId("end")).toBeVisible({ timeout: 20_000 });
    await page.getByTestId("share").click({ force: true });
    await expect(page.getByTestId("share")).toContainText("Copied");
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expectShareLayout(copied, /^I kept \d+% harmony at today's stand-up /, `${new URL("./en/", page.url().replace(/\?.*$/, "")).href}?ref=partage`);
  });
});

