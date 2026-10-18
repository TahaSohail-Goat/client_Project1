async page => {
  const errors = [], failures = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:4173/#contact');
  await page.waitForFunction(() => Math.abs(document.getElementById('contact').getBoundingClientRect().top - 100) < 5);
  await page.waitForTimeout(800);
  const hiddenHero = await page.evaluate(() => ({
    canvas: !!document.querySelector('.hero-walkthrough canvas'),
    geometryRequests: performance.getEntriesByType('resource').filter(entry => entry.name.includes('/residence-realism/')).length,
  }));
  if (hiddenHero.canvas || hiddenHero.geometryRequests) throw Error('Offscreen hero fetched its 3D scene');
  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  if (robots !== 'index,follow') throw Error('Launch indexing is disabled');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('studio:scroll-to', { detail: 0 })));
  await page.locator('.hero-sequence[data-renderer="webgl"]').waitFor({ timeout: 35000 });
  await page.locator('.hero-poster').evaluate(image => image.decode());
  const delivery = await page.evaluate(() => ({
    buffers: performance.getEntriesByType('resource').filter(entry => entry.name.endsWith('/scene.bin'))
      .map(entry => ({ url: entry.name, transferred: entry.transferSize, encoded: entry.encodedBodySize })),
    eagerGalleryPhotos: document.querySelectorAll('.spatial-card img[loading="eager"]').length,
  }));
  if (delivery.buffers.length !== 6 || delivery.buffers.reduce((n, entry) => n + entry.encoded, 0) > 5300000)
    throw Error('Model delivery budget exceeded: ' + JSON.stringify(delivery));
  if (delivery.eagerGalleryPhotos) throw Error('Below-fold gallery photos compete with the hero');
  await page.screenshot({ path: 'output/playwright/launch-final-desktop.png' });
  if (errors.length || failures.length) throw Error(JSON.stringify({ errors, failures }));
  return { hiddenHero, robots, delivery, errors, failures };
}
