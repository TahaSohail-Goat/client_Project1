async (page) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:4173/");
  await page.locator("#hero-title").waitFor({ state: "attached" });
  await page.waitForTimeout(600);
  await page.evaluate(() => scrollTo(0, 400));
  await page.waitForTimeout(800);
  const zoom = await page
    .locator(".hero-photo")
    .evaluate((e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).a);
  if (zoom < 1.01 || zoom > 1.11)
    throw Error("Unexpected hero push-in: " + zoom);
  await page.getByRole('button', { name: 'Jump to Vision chapter' }).click();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.ivory-panel')).clipPath === 'inset(0%)');
  const panel = await page
    .locator(".ivory-panel")
    .evaluate((e) => getComputedStyle(e).clipPath);
  await page.getByRole("button", { name: "Jump to Arrival chapter" }).click();
  await page.waitForFunction(
    () =>
      Math.abs(
        new DOMMatrixReadOnly(
          getComputedStyle(document.querySelector(".hero-photo")).transform,
        ).a - 1,
      ) < 0.0001,
  );
  await page.goto("http://127.0.0.1:4173/work?category=Interiors");
  await page.locator(".work-card").first().waitFor();
  const count = await page.locator(".work-card").count();
  if (count !== 25) throw Error("Filter failed");
  await page.locator(".work-card").first().click();
  await page.getByRole("dialog").waitFor({ state: "visible" });
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(
    () =>
      document.querySelector("#lightbox-title").textContent ===
      "bedroom marble",
  );
  await page.keyboard.press("Escape");
  await page.locator("dialog").waitFor({ state: "detached" });
  await page.waitForFunction(() =>
    document.activeElement.classList.contains("work-card"),
  );
  const focus = await page.evaluate(() => document.activeElement.className);
  await page.goto("http://127.0.0.1:4173/studio#expertise");
  await page.locator("#expertise").waitFor();
  await page.waitForTimeout(600);
  const anchor = await page
    .locator("#expertise")
    .evaluate((e) => e.getBoundingClientRect().top);
  if (anchor < 80 || anchor > 120) throw Error("Anchor offset: " + anchor);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:4173/");
  await page.locator("#hero-title").waitFor({ state: "attached" });
  await page.waitForTimeout(400);
  const pins = await page.locator(".pin-spacer").count();
  if (pins) throw Error("Reduced motion retained pins");
  return {
    engine: page.context().browser().browserType().name(),
    zoom,
    panel,
    filteredInteriors: count,
    dialogFocus: focus,
    anchorTop: anchor,
    reducedMotionPins: pins,
    errors,
  };
}
