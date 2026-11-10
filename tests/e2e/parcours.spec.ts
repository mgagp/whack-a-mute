import { expect, test, type Page } from "@playwright/test";

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

  // Changer de café : retour à l'accueil, le choix précédent est conservé.
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
    const variants = ["bubble", "bubble said normal", "bubble said blunder", "bubble hushed", "bubble hushed wrong"];
    const host = document.querySelector(".tile")!;
    return variants.map((cls) => {
      const b = document.createElement("div");
      b.className = cls;
      b.innerHTML = '<div class="tag">tag</div><q>texte</q><span class="note">note</span>';
      host.appendChild(b);
      const bg = getComputedStyle(b).backgroundColor;
      const out = [b.querySelector("q")!, b.querySelector(".tag")!, b.querySelector(".note")!].map((el) => ratio(getComputedStyle(el).color, bg));
      b.remove();
      return { cls, min: Math.min(...out) };
    });
  });
  for (const r of ratios) expect(r.min, r.cls).toBeGreaterThanOrEqual(4.5);
});
