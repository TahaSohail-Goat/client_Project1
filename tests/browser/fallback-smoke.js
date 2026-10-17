async page => {
  const browser = page.context().browser();
  const cases = [];
  for (const mode of ['save-data', 'no-webgl', 'failed-model']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
    const test = await context.newPage();
    test.setDefaultTimeout(30000);
    const errors = [], diagnostics = [];
    test.on('pageerror', e => errors.push(e.message));
    test.on('console', m => { if (m.type() === 'error') diagnostics.push(m.text()); });
    try {
      if (mode === 'save-data') await context.addInitScript(() => Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } }));
      if (mode === 'no-webgl') await context.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) { return /webgl/i.test(type) ? null : original.call(this, type, ...args); };
      });
      if (mode === 'failed-model') await test.route('**/residence-realism/sofa/scene.gltf', route => route.abort());
      await test.goto(`http://127.0.0.1:4173/?fallback-qa=${Date.now()}`);
      await test.locator('.hero-sequence[data-static="true"]').waitFor({ timeout: 35000 });
      const poster = await test.locator('.hero-poster').evaluate(async image => { await image.decode(); return image.naturalWidth; });
      if (!poster || await test.locator('.hero-walkthrough canvas').count()) throw Error(mode + ' retained a blank hero');
      await test.locator('.hero-opening').getByRole('link', { name: 'Explore the work', exact: true }).click();
      await test.waitForFunction(() => Math.abs(document.getElementById('work').getBoundingClientRect().top - 100) < 5);
      await test.getByRole('button', { name: 'View photograph', exact: true }).click();
      await test.getByRole('dialog').waitFor();
      await test.keyboard.press('Escape');
      await test.waitForFunction(() => !document.querySelector('dialog'));
      await test.screenshot({ path: `output/playwright/qa-fallback-${mode}.png` });
      cases.push({ mode, posterWidth: poster, galleryUsable: true, errors, expectedDiagnostics: diagnostics });
    } finally { await context.close(); }
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const test = await context.newPage();
  try {
    await context.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw Error('Clipboard permission denied for QA'); } } }));
    await test.goto(`http://127.0.0.1:4173/?clipboard-qa=${Date.now()}#contact`);
    const form = test.getByRole('form', { name: 'Project inquiry' });
    await form.getByRole('textbox', { name: 'Your name', exact: true }).fill('  QA Visitor  ');
    await form.getByRole('textbox', { name: 'Email address', exact: true }).fill('qa@example.test');
    await form.getByRole('combobox').selectOption('Architecture & Interior Design');
    await form.getByRole('textbox', { name: 'About your space', exact: true }).fill('  A family home with daylight.  ');
    await form.getByRole('checkbox').check();
    await form.getByRole('button', { name: 'Review inquiry' }).click();
    await test.locator('.inquiry-draft').waitFor();
    await test.getByRole('button', { name: 'Copy brief', exact: true }).click();
    await test.getByText('Copy is unavailable. You can download your brief instead.', { exact: true }).waitFor();
    const [download] = await Promise.all([test.waitForEvent('download'), test.getByRole('button', { name: 'Download brief', exact: true }).click()]);
    if (download.suggestedFilename() !== 'eco28-project-inquiry.txt') throw Error('Clipboard recovery download failed');
    const href = await test.getByRole('link', { name: 'Open email draft' }).getAttribute('href');
    if (!new URL(href).searchParams.get('body').includes('Interested in: Architecture & Interior Design')) throw Error('Both disciplines selection lost');
    return { engine: browser.browserType().name(), cases, clipboardDeniedRecovery: true, bothDisciplines: true, downloadFallback: true };
  } finally { await context.close(); }
}
