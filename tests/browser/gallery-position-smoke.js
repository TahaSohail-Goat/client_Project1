async page => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`http://127.0.0.1:4173/?position-qa=${Date.now()}#work`);
  await page.waitForFunction(() => Math.abs(document.getElementById('work').getBoundingClientRect().top - 100) < 5);
  const before = await page.evaluate(() => ({ hash: location.hash, scroll: scrollY }));
  await page.getByRole('group', { name: 'Filter photographs' }).getByRole('button', { name: /^Interiors/ }).click();
  await page.waitForTimeout(250);
  const afterFilter = await page.evaluate(() => ({ hash: location.hash, scroll: scrollY, top: document.getElementById('work').getBoundingClientRect().top }));
  if (afterFilter.hash !== '#work' || Math.abs(afterFilter.top - 100) > 5) throw Error(JSON.stringify({ before, afterFilter, bug: 'Filtering loses the gallery anchor and scroll position' }));
  await page.locator('.work-card').first().scrollIntoViewIfNeeded();
  const openPosition = await page.evaluate(() => scrollY);
  await page.locator('.work-card').first().click();
  await page.getByRole('dialog').waitFor();
  await page.getByRole('button', { name: 'Next photograph', exact: true }).click();
  await page.getByRole('button', { name: 'Close photograph', exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('dialog'));
  await page.waitForFunction(() => document.activeElement?.classList.contains('work-card'));
  const afterClose = await page.evaluate(() => ({ hash: location.hash, top: document.getElementById('work').getBoundingClientRect().top, focused: document.activeElement?.className }));
  if (afterClose.hash !== '#work' || Math.abs(await page.evaluate(() => scrollY) - openPosition) > 5 || !afterClose.focused.includes('work-card')) throw Error(JSON.stringify(afterClose));
  return { before, afterFilter, afterClose, positionPreserved: true };
}
