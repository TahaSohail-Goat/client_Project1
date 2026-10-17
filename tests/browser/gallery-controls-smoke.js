async page => {
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(15000);
  const engine = page.context().browser().browserType().name();
  const errors = [], failed = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) failed.push(r.url()); });
  const assert = (value, text) => { if (!value) throw Error(text); };
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`http://127.0.0.1:4173/?all-photos=${Date.now()}#work`);
  const cards = page.locator('.work-card');
  const opened = [];
  for (let i = 0; i < 3; i++) {
    const card = cards.nth(i), id = await card.getAttribute('id');
    await card.click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    assert(new URL(page.url()).searchParams.get('photo') === id, 'Card opened the wrong photograph');
    await dialog.locator('img').evaluate(image => image.decode());
    assert(await dialog.locator('img').evaluate(image => image.naturalWidth > 0), 'Full photograph did not decode');
    await page.getByRole('button', { name: 'Close photograph', exact: true }).click();
    await page.waitForFunction(id => !document.querySelector('dialog') && document.activeElement?.id === id, id);
    opened.push(id);
  }
  await cards.first().click();
  const first = await cards.first().getAttribute('id');
  await page.getByRole('button', { name: 'Previous photograph', exact: true }).click();
  await page.waitForTimeout(500);
  await page.waitForFunction(() => /43 of 43/i.test(document.querySelector('.lightbox-toolbar').innerText));
  await page.getByRole('button', { name: 'Next photograph', exact: true }).click();
  await page.waitForTimeout(500);
  await page.waitForFunction(first => new URLSearchParams(location.search).get('photo') === first, first);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(500);
  await page.waitForFunction(() => /43 of 43/i.test(document.querySelector('.lightbox-toolbar').innerText));
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);
  await page.waitForFunction(first => new URLSearchParams(location.search).get('photo') === first, first);
  await page.getByRole('button', { name: 'Next photograph', exact: true }).focus();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    assert(await page.evaluate(() => document.querySelector('dialog').contains(document.activeElement) || document.activeElement === document.body), 'Focus escaped modal');
  }
  await page.screenshot({ path: `output/playwright/qa-lightbox-${engine}.png` });
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog'));
  await cards.first().click();
  await page.getByRole('dialog').waitFor();
  await page.waitForTimeout(100);
  await page.mouse.click(4, 4);
  await page.waitForFunction(() => !document.querySelector('dialog'));
  // Isolate CSS gallery controls from unrelated WebGL scenes in this long pass.
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', {
    configurable: true, value: { saveData: true },
  }));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`http://127.0.0.1:4173/?controls-qa=${Date.now()}#work`);
  await page.locator('.spatial-gallery').waitFor();
  const active = () => page.locator('.spatial-gallery').getAttribute('data-active').then(Number);
  const previous = page.getByRole('button', { name: 'Previous gallery photograph', exact: true });
  const next = page.getByRole('button', { name: 'Next gallery photograph', exact: true });
  await page.locator('.spatial-card[aria-current="true"]').focus();
  await page.keyboard.press('Home');
  await page.waitForFunction(() => document.querySelector('.spatial-gallery').dataset.active === '0');
  assert(await previous.isDisabled(), 'First photograph has enabled previous button');
  for (let i = 1; i < 3; i++) {
    await next.click();
    assert(await active() === i, 'Gallery next failed at ' + i);
  }
  await page.locator('.spatial-card[aria-current="true"]').focus();
  await page.keyboard.press('End');
  await page.waitForFunction(() => document.querySelector('.spatial-gallery').dataset.active === '42');
  assert(await next.isDisabled(), 'Last photograph has enabled next button');
  await previous.click();
  assert(await active() === 41, 'Gallery previous button failed');
  await page.locator('.spatial-card[aria-current="true"]').focus();
  await page.keyboard.press('Home');
  await page.waitForFunction(() => document.querySelector('.spatial-gallery').dataset.active === '0');
  const modes = ['list', 'grid', 'helix', 'barrel', 'ring', 'sphere', 'stack', 'coverflow'];
  for (let i = 0; i < modes.length; i++) {
    await page.locator('.spatial-card[aria-current="true"]').focus();
    await page.keyboard.press(String(i + 1));
    assert(await page.locator('.spatial-gallery').getAttribute('data-layout') === modes[i], 'Layout shortcut failed');
  }
  for (const transition of ['scatter', 'flow', 'fade']) {
    await page.locator('.spatial-transition select').selectOption(transition);
    assert(await page.locator('.spatial-gallery').getAttribute('data-transition') === transition, 'Transition selection failed');
    await page.getByRole('group', { name: 'Gallery arrangement' }).getByRole('button', { name: /grid/i }).click();
    await page.getByRole('group', { name: 'Gallery arrangement' }).getByRole('button', { name: /list/i }).click();
  }
  await page.locator('.spatial-card[aria-current="true"]').focus();
  await page.keyboard.press('End');
  await page.waitForFunction(() => document.querySelector('.spatial-gallery').dataset.active === '42');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowRight');
  await page.getByRole('button', { name: 'View photograph', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog'));
  await page.setViewportSize({ width: 320, height: 568 });
  for (const mode of modes) {
    await page.getByLabel('Gallery layout', { exact: true }).selectOption(mode);
    assert(await page.locator('.spatial-gallery').getAttribute('data-layout') === mode, 'Mobile layout selection failed');
  }
  await page.getByRole('button', { name: 'View photograph', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await page.locator('.lightbox-image img').evaluate(image => image.decode());
  await page.screenshot({ path: `output/playwright/qa-lightbox-${engine}-320.png` });
  assert(await page.locator('dialog').evaluate(e => e.scrollWidth <= e.clientWidth + 1), 'Mobile lightbox overflows horizontally');
  await page.getByRole('button', { name: 'Close photograph', exact: true }).click();
  assert(!errors.length && !failed.length, JSON.stringify({ errors, failed }));
  return { engine, samplePhotographsOpened: opened.length, opened, lightboxButtons: true, wrapping: true, keyboard: true, backdropClose: true, modalFocus: true, galleryNextSteps: 2, navigationBoundaries: true, layoutShortcuts: 8, transitions: 3, mobileLayouts: 8, mobileLightbox: true, errors, failed };
}
