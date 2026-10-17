async page => {
  page.setDefaultTimeout(20000);
  const errors = [], failed = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) failed.push(r.url()); });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  const visit = id => page.goto(`http://127.0.0.1:4173/?scene-controls=${Date.now()}#${id}`);
  const seek = async (id, p) => {
    await page.evaluate(({ id, p }) => {
      const e = document.getElementById(id), spacer = e.parentElement;
      const start = spacer.getBoundingClientRect().top + scrollY;
      window.dispatchEvent(new CustomEvent('studio:scroll-to', { detail: start + (spacer.offsetHeight - e.offsetHeight) * p }));
    }, { id, p });
    await page.waitForTimeout(1000);
  };
  await visit('main');
  await page.locator('.hero-sequence[data-renderer="webgl"]').waitFor({ timeout: 40000 });
  const [credit] = await Promise.all([page.waitForEvent('popup'), page.locator('.hero-credit').click()]);
  await credit.waitForLoadState('domcontentloaded');
  if (!credit.url().endsWith('/media/residence-realism/ATTRIBUTION.txt')) throw Error('Hero credit link opened the wrong page');
  await credit.close();
  await page.evaluate(() => {
    const e = document.querySelector('.hero-sequence'), spacer = e.parentElement;
    window.dispatchEvent(new CustomEvent('studio:scroll-to', { detail: (spacer.offsetHeight - e.offsetHeight) * .79 }));
  });
  await page.waitForFunction(() => !document.querySelector('.residence-finish').inert && Number(getComputedStyle(document.querySelector('.residence-finish')).opacity) > .99);
  await page.locator('.residence-finish a').click();
  await page.waitForFunction(() => location.hash === '#contact' && Math.abs(document.getElementById('contact').getBoundingClientRect().top - 100) < 5);
  await visit('housing');
  await page.locator('#housing[data-renderer="webgl"]').waitFor();
  const views = [];
  for (const [name, progress] of [['01 Exterior', .08], ['02 Open roof', .54], ['03 Spatial overview', .94]]) {
    await page.getByRole('button', { name, exact: true }).click();
    await page.waitForFunction(p => Math.abs(Number(document.querySelector('#housing').dataset.progress) - p) < .02, progress);
    if (await page.getByRole('button', { name, exact: true }).getAttribute('aria-current') !== 'step') throw Error('Housing active view is wrong');
    views.push(name);
  }
  await page.locator('.housing-next').click();
  await page.waitForFunction(() => location.hash === '#model-studies' && Math.abs(document.querySelector('#model-studies').getBoundingClientRect().top) < 5);
  await page.locator('#model-studies[data-renderer="webgl"]').waitFor();
  const modelFocus = [];
  for (const index of [0, 2, 6]) {
    const card = page.locator('.model-ribbon-card').nth(index);
    await card.focus();
    await page.waitForTimeout(800);
    const rect = await card.boundingBox();
    if (!rect || rect.x >= 1440 || rect.x + rect.width <= 0) throw Error('Focused model is outside viewport');
    modelFocus.push(index + 1);
  }
  await page.keyboard.press('Enter');
  await page.getByRole('dialog').waitFor();
  if (new URL(page.url()).searchParams.get('photo') !== 'supplemental-25') throw Error('Wrong keyboard-selected model opened');
  await page.keyboard.press('Escape');
  await visit('considered-detail');
  await page.locator('#considered-detail[data-renderer="webgl"]').waitFor();
  await seek('considered-detail', .15);
  const canvas = page.locator('.materials-canvas canvas');
  const rect = await canvas.boundingBox();
  let clickedCanvas = false;
  for (const [x, y] of [[.5,.5], [.35,.5], [.65,.5], [.5,.35], [.5,.65]]) {
    await page.mouse.move(rect.x + rect.width * x, rect.y + rect.height * y);
    await page.waitForTimeout(80);
    if (await canvas.evaluate(c => c.style.cursor === 'pointer')) {
      await page.mouse.click(rect.x + rect.width * x, rect.y + rect.height * y);
      await page.getByRole('dialog').waitFor();
      clickedCanvas = true; break;
    }
  }
  if (!clickedCanvas) throw Error('Material photo could not be selected on the canvas');
  await page.keyboard.press('Escape');
  await visit('interiors');
  const slides = [];
  for (const p of [.08, .37, .64, .9, .08]) {
    await seek('interiors', p);
    slides.push(await page.locator('.interior-slide:not([aria-hidden="true"]) h3').innerText());
  }
  if (new Set(slides).size !== 4 || slides[0] !== slides[4]) throw Error('Interior frames failed to advance and reverse');
  await page.screenshot({ path: 'output/playwright/qa-interiors.png' });
  if (errors.length || failed.length) throw Error(JSON.stringify({ errors, failed }));
  return { heroFinalCTA: true, heroCreditPopup: true, housingViews: views, modelKeyboardFocus: modelFocus, modelKeyboardOpen: true, materialCanvasClick: clickedCanvas, interiorSlides: slides, errors, failed };
}
