async page => {
  page.setDefaultTimeout(12000);
  page.setDefaultNavigationTimeout(15000);
  const base = 'http://127.0.0.1:4173';
  const errors = [], failed = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const visit = () => page.goto(`${base}/?links-qa=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await visit();
  const inventory = await page.evaluate(() => ({
    links: [...document.querySelectorAll('a[href]')].map(a => ({ text: (a.getAttribute('aria-label') || a.textContent).trim(), href: a.getAttribute('href'), target: a.target })),
    duplicates: [...document.querySelectorAll('[id]')].map(e => e.id).filter((id, i, ids) => ids.indexOf(id) !== i),
    brokenAnchors: [...document.querySelectorAll('a[href]')].filter(a => a.hash && !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a => a.href),
    unnamedButtons: [...document.querySelectorAll('button')].filter(b => !b.getAttribute('aria-label') && !b.textContent.trim()).length,
    unlabeledImages: document.querySelectorAll('img:not([alt])').length,
    h1: document.querySelectorAll('h1').length,
  }));
  if (inventory.duplicates.length || inventory.brokenAnchors.length || inventory.unnamedButtons || inventory.unlabeledImages || inventory.h1 !== 1) throw Error(JSON.stringify(inventory));
  const mainHrefs = [...new Set(await page.locator('main a[href]').evaluateAll(links => links.map(a => a.getAttribute('href'))))];
  const clicked = [], credits = [];
  for (const href of mainHrefs) {
    if (!href.startsWith('/')) continue;
    if (href.startsWith('/media/')) {
      const response = await page.request.get(base + href);
      if (!response.ok() || !(await response.text()).length) throw Error('Missing credit file ' + href);
      credits.push(href); continue;
    }
    await visit();
    const candidates = page.locator(`main a[href=${JSON.stringify(href)}]`);
    let target;
    for (let i = 0; i < await candidates.count(); i++) if (await candidates.nth(i).isVisible()) { target = candidates.nth(i); break; }
    if (!target) throw Error('No usable content link ' + href);
    await target.click({ timeout: 10000 });
    const expected = new URL(href, base);
    await page.waitForFunction(expected => location.pathname === expected.pathname && location.hash === expected.hash && new URLSearchParams(location.search).get('photo') === expected.photo && new URLSearchParams(location.search).get('category') === expected.category,
      { pathname: expected.pathname, hash: expected.hash, photo: expected.searchParams.get('photo'), category: expected.searchParams.get('category') });
    if (expected.searchParams.has('photo')) {
      await page.getByRole('dialog').waitFor();
      await page.locator('.lightbox-image img').evaluate(image => image.decode());
      await page.getByRole('button', { name: 'Close photograph', exact: true }).click();
      await page.waitForFunction(() => !document.querySelector('dialog'));
    } else if (expected.hash) {
      await page.waitForFunction(id => { const e = document.getElementById(id); return Math.abs(e.getBoundingClientRect().top - Number(e.dataset.scrollOffset ?? 100)) < 5; }, expected.hash.slice(1));
    }
    const category = expected.searchParams.get('category');
    const counts = { Architecture: 11, Interiors: 25, 'Model Studies': 7 };
    if (category && await page.locator('.work-card').count() !== counts[category]) throw Error('Incorrect category ' + href);
    clicked.push(href);
  }
  // Every footer entry also has to work from the bottom of the page.
  await visit();
  const footerHrefs = await page.locator('footer a[href^="/#"]').evaluateAll(links => links.map(a => a.getAttribute('href')));
  for (const href of [...new Set(footerHrefs)]) {
    await page.locator(`footer a[href=${JSON.stringify(href)}]`).first().click();
    await page.waitForFunction(id => { const e = document.getElementById(id); return id === 'main' ? scrollY < 2 : Math.abs(e.getBoundingClientRect().top - Number(e.dataset.scrollOffset ?? 100)) < 5; }, href.split('#')[1]);
  }
  const routes = [];
  for (const path of ['/work?category=Interiors#work', '/studio#expertise', '/contact#contact', '/?category=Unknown&photo=unknown#work']) {
    await page.goto(base + path, { waitUntil: 'domcontentloaded' });
    await page.locator('h1').waitFor({ state: 'attached' });
    if (await page.locator('.work-card').count() !== (path.includes('Interiors') ? 25 : 43)) throw Error('Route failed ' + path);
    routes.push(path);
  }
  await page.goto(base + '/not-a-real-page');
  await page.getByRole('heading', { name: 'Page not found.' }).waitFor();
  await page.getByRole('link', { name: /Return home/ }).click();
  await page.getByRole('heading', { level: 1, name: 'Design, made tangible.' }).waitFor();
  // Native keyboard activation of the skip link must move focus into main.
  await page.goto(base + '/?skip-qa=' + Date.now());
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.activeElement?.id === 'main');
  if (errors.length || failed.length) throw Error(JSON.stringify({ errors, failed }));
  return { inventory, clickedContentLinks: clicked, footerLinks: [...new Set(footerHrefs)], credits, routes, notFoundRecovery: true, keyboardSkip: true, errors, failed };
}
