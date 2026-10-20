async page => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const ids = ['interiors', 'considered-detail', 'model-studies', 'work', 'studio', 'contact'];
  const assert = (condition, message) => { if (!condition) throw Error(message); };
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`http://127.0.0.1:4173/?navigation-qa=${Date.now()}`);
  await page.locator('#interiors').waitFor();
  assert(await page.locator('#selected-work, #housing, #approach, #expertise, .architectural-ribbon, .studio-home, .consultation').count() === 0, 'A removed module is still rendered');
  const desktopIds = await page.locator('.desktop-nav a, .header-inquiry').evaluateAll(links => links.map(link => new URL(link.href).hash.slice(1)));
  assert(JSON.stringify(desktopIds) === JSON.stringify(ids), 'Desktop order differs from chapter order');
  assert(await page.evaluate(ids => ids.every((id, index) => {
    const target = document.getElementById(id);
    return target && (!index || !!(document.getElementById(ids[index - 1]).compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING));
  }), ids), 'Chapter targets are missing or out of DOM order');
  const footerIds = await page.locator('.footer-navigation a').evaluateAll(links => links.map(link => new URL(link.href).hash.slice(1)));
  assert(JSON.stringify(footerIds) === JSON.stringify(ids), 'Footer order differs');
  for (const id of ids) {
    const link = page.locator(`header a[href="/#${id}"]`);
    await link.click();
    await page.waitForFunction(id => Math.abs(document.getElementById(id).getBoundingClientRect().top - Number(document.getElementById(id).dataset.scrollOffset ?? 100)) < 5, id);
    await page.waitForFunction(id => document.querySelector(`header a[href="/#${id}"]`)?.getAttribute('aria-current') === 'location', id);
    // Reusing the same URL after scrolling within a pinned chapter must reset its entry.
    if (['interiors', 'considered-detail', 'model-studies'].includes(id)) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(700);
      await link.click();
      await page.waitForFunction(id => Math.abs(document.getElementById(id).getBoundingClientRect().top - Number(document.getElementById(id).dataset.scrollOffset ?? 100)) < 5, id);
    }
  }
  const layouts = [];
  for (const width of [1920, 1440, 1280, 1279, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(300);
    const layout = await page.evaluate(() => {
      const rect = element => element.getBoundingClientRect();
      const nav = document.querySelector('.desktop-nav');
      const desktop = getComputedStyle(nav).display !== 'none';
      const logo = rect(document.querySelector('.wordmark'));
      const inquiry = rect(document.querySelector('.header-inquiry'));
      const links = [...nav.querySelectorAll('a')].map(rect);
      return { width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth,
        desktop, fits: !desktop || (links[0].left >= logo.right && links.at(-1).right <= inquiry.left && links.every(link => link.top >= 0 && link.bottom <= 90)) };
    });
    assert(!layout.overflow && layout.fits, `Header overflow: ${JSON.stringify(layout)}`);
    layouts.push(layout);
    if (width === 1440 || width === 1280) await page.screenshot({ path: `output/playwright/navigation-${width}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  const menu = page.getByRole('dialog', { name: 'Site navigation' });
  const mobileIds = await menu.locator('nav a').evaluateAll(links => links.map(link => new URL(link.href).hash.slice(1)));
  assert(JSON.stringify(mobileIds) === JSON.stringify(ids), 'Mobile order differs');
  assert(await menu.locator('nav small').last().textContent() === '06', 'Sixth chapter number is incorrect');
  assert(await page.locator('main').evaluate(element => element.inert), 'Background not inert');
  await page.screenshot({ path: 'output/playwright/navigation-mobile.png' });
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('.mobile-navigation'));
  assert(await page.getByRole('button', { name: 'Open navigation', exact: true }).evaluate(element => element === document.activeElement), 'Escape did not restore toggle focus');
  for (const id of ids) {
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await page.locator(`.mobile-navigation nav a[href="/#${id}"]`).click();
    await page.waitForFunction(() => !document.querySelector('.mobile-navigation'));
    await page.waitForFunction(id => Math.abs(document.getElementById(id).getBoundingClientRect().top - Number(document.getElementById(id).dataset.scrollOffset ?? 100)) < 5, id);
    assert(await page.locator('main').evaluate(element => !element.inert), 'Background remained inert after navigation');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`http://127.0.0.1:4173/?navigation-reduced=${Date.now()}#interiors`);
  await page.waitForFunction(() => Math.abs(document.getElementById('interiors').getBoundingClientRect().top - 100) < 5);
  assert(!errors.length, JSON.stringify(errors));
  return { chapterOrder: ids, desktopLinks: 6, mobileLinks: 6, repeatedPinnedLinks: true, reducedMotionDeepLink: true, layouts, errors };
}
