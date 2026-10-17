async page => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`http://127.0.0.1:4173/?edge=${Date.now()}#%E0%A4%A`);
  await page.waitForTimeout(250);
  const malformed = { errors: [...errors], mainVisible: await page.locator('main').count() };
  await page.goto(`http://127.0.0.1:4173/?edge=${Date.now()}#work`);
  await page.waitForFunction(() => Math.abs(document.getElementById('work').getBoundingClientRect().top - 100) < 5);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.locator('.contact-context .line-link').click();
  await page.waitForTimeout(250);
  const repeated = await page.evaluate(() => ({ hash: location.hash, top: document.getElementById('work').getBoundingClientRect().top }));
  await page.locator('header a[href="/#studio"]').click();
  await page.waitForFunction(() => location.hash === '#studio' && Math.abs(document.getElementById('studio').getBoundingClientRect().top - 100) < 5);
  await page.locator('header a[href="/#contact"]').click();
  await page.waitForFunction(() => location.hash === '#contact' && Math.abs(document.getElementById('contact').getBoundingClientRect().top - 100) < 5);
  await page.goBack();
  await page.waitForFunction(() => location.hash === '#studio' && Math.abs(document.getElementById('studio').getBoundingClientRect().top - 100) < 5);
  await page.goForward();
  await page.waitForFunction(() => location.hash === '#contact' && Math.abs(document.getElementById('contact').getBoundingClientRect().top - 100) < 5);
  await page.goto(`http://127.0.0.1:4173/?encoded=${Date.now()}#%63ontact`);
  await page.waitForFunction(() => Math.abs(document.getElementById('contact').getBoundingClientRect().top - 100) < 5);
  if (malformed.errors.length || !malformed.mainVisible || Math.abs(repeated.top - 100) > 5) throw Error(JSON.stringify({ malformed, repeated }));
  return { malformed, repeated, backForward: true, encodedSection: true, errors };
}
