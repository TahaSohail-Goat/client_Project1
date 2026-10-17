async page => {
  const axePath = 'node_modules/axe-core/axe.min.js';
  page.setDefaultTimeout(15000);
  const scan = async name => {
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.header').evaluate(async header => {
      await Promise.all(header.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {})));
    });
    if (!await page.evaluate(() => !!window.axe)) await page.addScriptTag({ path: axePath });
    const result = await page.evaluate(async () => {
      const results = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
      return { violations: results.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })), passes: results.passes.length, incomplete: results.incomplete.map(v => ({ id: v.id, nodes: v.nodes.length })) };
    });
    return { name, ...result };
  };
  const scans = [];
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`http://127.0.0.1:4173/?accessibility=${Date.now()}#contact`);
  scans.push(await scan('desktop static page'));
  await page.locator('.work-card').first().click();
  await page.getByRole('dialog').waitFor();
  scans.push(await scan('photograph dialog'));
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog'));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  scans.push(await scan('mobile navigation'));
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`http://127.0.0.1:4173/?accessibility=${Date.now()}#work`);
  await page.locator('.spatial-gallery').waitFor();
  await page.waitForFunction(() => document.querySelector('.desktop-nav a[href$="/#work"].active') && !document.querySelector('.header.is-over-hero'));
  scans.push(await scan('animated gallery page'));
  if (scans.some(scan => scan.violations.length)) throw Error(JSON.stringify(scans));
  return { engine: page.context().browser().browserType().name(), scans, totalViolations: scans.reduce((n, s) => n + s.violations.length, 0) };
}
