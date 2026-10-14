async (page) => {
  const base = "http://127.0.0.1:4173";
  const visit = (id) => page.goto(`${base}/?qa=${Date.now()}#${id}`);
  const engine = page.context().browser().browserType().name();
  const errors = [],
    failedAssets = [];
  // Rebuilding a Vite preview changes hashed assets; bypass the previous HTML cache.
  await page.route("**/*", (route) => route.continue());
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400 && /\/media\//.test(response.url()))
      failedAssets.push(response.url());
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/?qa=${Date.now()}`);
  await page.locator('.video-hero[data-video-state="ready"]').waitFor();
  const initialModelDownloads = await page.evaluate(
    () =>
      performance
        .getEntriesByType("resource")
        .filter((r) => /model-experience/.test(r.name)).length,
  );
  if (initialModelDownloads)
    throw Error("WebGL bundle loaded before the architecture chapter");
  await visit("selected-work");
  await page.waitForFunction(
    () =>
      Math.abs(
        document.querySelector("#selected-work").getBoundingClientRect().top -
          100,
      ) < 4,
  );
  await page.locator('.exterior-card:first-child .depth-photo[data-three-ready="true"] canvas').waitFor({ timeout: 20000 });
  await page.mouse.wheel(0, 1);
  const scroll = async (selector, top = 100) => {
    await page.evaluate(
      ({ selector, top }) => {
        const e = document.querySelector(selector);
        window.dispatchEvent(
          new CustomEvent("studio:scroll-to", {
            detail: e.getBoundingClientRect().top + scrollY - top,
          }),
        );
      },
      { selector, top },
    );
    await page.waitForTimeout(800);
  };
  const screenshot = async (name) =>
    page.screenshot({
      path: `output/playwright/cinematic-${engine}-${name}.png`,
    });
  const overflow = async () =>
    page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await scroll("#work-title", 100);
  const read = await page
    .locator("#work-title .cinematic-word")
    .first()
    .evaluate((e) => Number(getComputedStyle(e).opacity));
  if (read < 0.99) throw Error("Heading did not reveal");
  const spacing = await page
    .locator("#work-title .cinematic-word")
    .evaluateAll(
      (words) =>
        words[1].getBoundingClientRect().left -
        words[0].getBoundingClientRect().right,
    );
  if (spacing < 2) throw Error("Heading word spaces collapsed");
  await screenshot("exterior");
  await scroll("#work-title", 900);
  const reversed = await page
    .locator("#work-title .cinematic-word")
    .first()
    .evaluate((e) => Number(getComputedStyle(e).opacity));
  if (reversed > 0.4) throw Error("Heading did not reverse");
  await scroll(".materials", 100);
  await page.locator(".materials img").first().waitFor();
  await screenshot("materials");
  const interior = async (progress) => {
    await page.evaluate(p => {
      const stage = document.querySelector('.interior-sequence');
      const start = stage.parentElement.getBoundingClientRect().top + scrollY;
      window.dispatchEvent(new CustomEvent('studio:scroll-to', {detail:start+innerHeight*2.25*p}));
    }, progress);
    await page.waitForTimeout(900);
    return page.locator('.interior-slide:not([aria-hidden="true"]) h3').textContent();
  };
  const interiorFinal = await interior(.88);
  const interiorFirst = await interior(.08);
  if (interiorFinal !== 'Order, beautifully.' || interiorFirst !== 'Places to gather.') throw Error('Interior sequence failed to reverse');
  await visit("housing");
  await page
    .locator('#housing[data-renderer="webgl"]')
    .waitFor({ timeout: 20000 });
  await page.waitForFunction(
    () =>
      Math.abs(document.querySelector("#housing").getBoundingClientRect().top) <
      4,
  );
  await page
    .getByRole("button", { name: "03 Spatial overview", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    () => Number(document.querySelector("#housing").dataset.progress) > 0.92,
  );
  await screenshot("housing-plan");
  await page.setViewportSize({ width: 1420, height: 900 });
  await page.waitForTimeout(700);
  if (await page.locator('#housing').evaluate(e => Number(e.dataset.progress) < .85)) throw Error('Resize reset a keyboard-selected model view');
  await page.setViewportSize({ width: 1440, height: 900 });
  const plan = await page.locator(".housing-coordinate").textContent();
  await page.getByRole("button", { name: "01 Exterior", exact: true }).click();
  await page.waitForFunction(
    () => Number(document.querySelector("#housing").dataset.progress) < 0.1,
  );
  await screenshot("housing-exterior");
  const exterior = await page.locator(".housing-coordinate").textContent();
  await page.mouse.wheel(0, 1);
  await scroll("#model-studies", 100);
  await page
    .locator(".model-depth-stage.canvas-ready")
    .waitFor({ timeout: 15000 });
  const planeFallbacks = await page
    .locator(".model-depth-fallback img")
    .count();
  if (
    planeFallbacks !== 3 ||
    (await page.locator(".model-grid a").count()) !== 7
  )
    throw Error("Physical model collection changed");
  await screenshot("model-photos");
  await scroll("#approach", 100);
  await screenshot("approach");
  await scroll(".studio-home", 100);
  await screenshot("studio-teaser");
  await scroll(".consultation", 100);
  await screenshot("consultation");
  await visit("work");
  await page.locator("#work").waitFor();
  await page.waitForFunction(
    () =>
      Math.abs(
        document.querySelector("#work").getBoundingClientRect().top - 100,
      ) < 4,
  );
  const filters = {};
  for (const [name, count] of [
    ["Architecture", 11],
    ["Interiors", 25],
    ["Model Studies", 7],
    ["All", 43],
  ]) {
    await page
      .getByRole("button", { name: new RegExp(`^${name}\\s*${count}$`) })
      .click();
    await page.waitForFunction(
      (expected) => document.querySelectorAll(".work-card").length === expected,
      count,
    );
    filters[name] = await page.locator(".work-card").count();
  }
  await page.locator(".work-card").first().click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() =>
    document.activeElement.classList.contains("work-card"),
  );
  const loadedPhotos = await page.locator('.work-card img').evaluateAll(async images => {
    // Force offscreen photos eager only in QA, so every supplied asset is decoded.
    return Promise.all(images.map(async img => { img.loading='eager'; await img.decode(); return img.naturalWidth; }));
  });
  if (loadedPhotos.length !== 43 || loadedPhotos.some(width => !width)) throw Error('A client photograph failed to decode');
  await visit("contact");
  await page.getByLabel("Your name", { exact: true }).fill("Preview Visitor");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("visitor@example.com");
  await page
    .getByRole("combobox", { name: "I’m interested in", exact: true })
    .selectOption("Architecture");
  await page
    .getByLabel("About your space", { exact: true })
    .fill("A considered space with daylight and warm materials.");
  await page
    .getByRole("button", { name: "Preview inquiry", exact: true })
    .click();
  await page.waitForFunction(() =>
    document.activeElement.classList.contains("inquiry-draft"),
  );
  const draft = await page.locator(".inquiry-draft").textContent();
  if (!draft.includes("Not sent")) throw Error("Inquiry claimed delivery");
  if ((await overflow()) > 1) throw Error("Desktop horizontal overflow");
  await page.setViewportSize({ width: 390, height: 844 });
  await visit("approach");
  await page.locator("#approach").waitFor();
  await page.waitForFunction(
    () =>
      Math.abs(
        document.querySelector("#approach").getBoundingClientRect().top - 100,
      ) < 4,
  );
  await screenshot("mobile-approach");
  const mobileOverflow = await overflow();
  if (mobileOverflow > 1)
    throw Error("Mobile horizontal overflow: " + mobileOverflow);
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page.getByRole("dialog", { name: "Site navigation" }).waitFor();
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () =>
      document.activeElement.getAttribute("aria-label") === "Open navigation",
  );
  await visit("housing");
  await page
    .locator('#housing[data-renderer="webgl"]')
    .waitFor({ timeout: 15000 });
  const mobileHousingPin = await page
    .locator("#housing")
    .evaluate((e) => e.parentElement.classList.contains("pin-spacer"));
  if (mobileHousingPin) throw Error("Housing pinned on mobile");
  await screenshot("mobile-housing");
  await page.setViewportSize({ width: 1440, height: 900 });
  await visit("housing");
  await page
    .locator('#housing[data-renderer="webgl"]')
    .waitFor({ timeout: 20000 });
  await page
    .locator(".housing-canvas canvas")
    .evaluate((canvas) =>
      canvas
        .getContext("webgl2")
        .getExtension("WEBGL_lose_context")
        .loseContext(),
    );
  await page.locator('#housing[data-renderer="fallback"]').waitFor();
  const fallback = await page
    .locator(".housing-poster-wrap")
    .evaluate((e) => Number(getComputedStyle(e).opacity));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await visit("approach");
  await page.waitForTimeout(700);
  const reduced = await page.evaluate(() => ({
    pins: document.querySelectorAll(".pin-spacer").length,
    videos: document.querySelectorAll("video").length,
    canvases: document.querySelectorAll("canvas").length,
    hiddenWords: Array.from(
      document.querySelectorAll(".cinematic-word"),
    ).filter((e) => Number(getComputedStyle(e).opacity) < 1).length,
  }));
  if (Object.values(reduced).some(Boolean))
    throw Error("Reduced motion failed: " + JSON.stringify(reduced));
  if (errors.length || failedAssets.length)
    throw Error(JSON.stringify({ errors, failedAssets }));
  return {
    engine,
    initialModelDownloads,
    wordSpacing: spacing,
    headingReveal: read,
    headingReverse: reversed,
    housing: { plan, exterior, mobileHousingPin, fallback },
    filters,
    loadedPhotographs: loadedPhotos.length,
    interior: {final: interiorFinal, reversed: interiorFirst},
    inquiry: "preview, focus restored, not sent",
    mobileOverflow,
    reduced,
    errors,
    failedAssets,
  };
}
