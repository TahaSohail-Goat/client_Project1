async page => {
  page.setDefaultTimeout(15000);
  const errors = [], failed = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) failed.push(r.url()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`http://127.0.0.1:4173/?photo-collection=${Date.now()}#work`);
  const opened = [];
  for (let i = 0; i < 43; i++) {
    const card = page.locator('.work-card').nth(i), id = await card.getAttribute('id');
    await card.click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    await page.waitForFunction(id => new URLSearchParams(location.search).get('photo') === id, id);
    const image = await dialog.locator('img').evaluate(async image => { await image.decode(); return { width: image.naturalWidth, src: image.getAttribute('src') }; });
    if (!image.width || /-(480|768)\.webp$/.test(image.src)) throw Error('Full-size image missing ' + id);
    await page.getByRole('button', { name: 'Close photograph', exact: true }).click();
    await page.waitForFunction(id => !document.querySelector('dialog') && document.activeElement?.id === id, id);
    opened.push({ id, ...image });
  }
  if (errors.length || failed.length) throw Error(JSON.stringify({ errors, failed }));
  return { engine: page.context().browser().browserType().name(), fullPhotographsOpened: opened.length, opened, focusRestored: true, errors, failed };
}
