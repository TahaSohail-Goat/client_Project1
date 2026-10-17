async page => {
  page.setDefaultTimeout(20000);
  const base = page.url().startsWith('http') ? new URL(page.url()).origin : 'http://127.0.0.1:4173';
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/?exterior-ready=${Date.now()}#selected-work`);
  await page.mouse.wheel(0, 1);
  await page.locator('.exterior-card').first().scrollIntoViewIfNeeded();
  const photo = page.locator('.exterior-card .depth-photo').first();
  await photo.locator('canvas').waitFor();
  await page.waitForFunction(() => document.querySelector('.exterior-card .depth-photo').dataset.threeReady === 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => !document.querySelector('.exterior-card canvas'));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await photo.scrollIntoViewIfNeeded();
  await photo.locator('canvas').waitFor();
  await page.setViewportSize({ width: 960, height: 900 });
  await page.waitForFunction(() => !document.querySelector('.exterior-card canvas'));
  await page.setViewportSize({ width: 1440, height: 900 });
  await photo.scrollIntoViewIfNeeded();
  await photo.locator('canvas').waitFor();
  await page.screenshot({ path: 'output/playwright/qa-exterior-ready.png' });
  return { base, initialCanvas: true, reducedMotionRemovesCanvas: true, motionRestoresCanvas: true, tabletRemovesCanvas: true, desktopRestoresCanvas: true };
}
