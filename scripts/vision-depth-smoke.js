async (page) => {
  const engine = page.context().browser().browserType().name();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => route.continue());
  const visit = () => page.goto(`http://127.0.0.1:4173/?vision=${Date.now()}`);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await visit();
  await page.locator('.video-hero[data-video-state="ready"]').waitFor();
  const go = async progress => {
    await page.evaluate(p => {
      const hero = document.querySelector('.hero-sequence');
      const spacer = hero.parentElement;
      const start = spacer.getBoundingClientRect().top + scrollY;
      window.dispatchEvent(new CustomEvent('studio:scroll-to', {
        detail: start + (spacer.offsetHeight - hero.offsetHeight) * p,
      }));
    }, progress);
    await page.waitForFunction(p => Math.abs(Number(document.querySelector('.video-hero').dataset.progress) - p) < .003, progress);
    await page.waitForTimeout(300);
  };
  const film = await page.locator('.video-hero').evaluate(e => ({
    duration: e.querySelector('video').duration,
    source: e.querySelector('video').currentSrc,
    clientImages: Array.from(e.querySelectorAll('img')).filter(img => !img.src.includes('/hero-film/')).length,
    retiredStills: document.querySelectorAll('.video-stills').length,
  }));
  if (film.duration < 29 || !film.source.includes('/hero-film/') || film.clientImages || film.retiredStills) throw Error('Hero source separation: '+JSON.stringify(film));
  await go(.5);
  const resize = [];
  for (const [width, height] of [[960,700], [390,844], [1440,900]]) {
    await page.setViewportSize({width, height});
    await page.waitForFunction(() => {
      const p = Number(document.querySelector('.hero-sequence').dataset.progress);
      const sequence = document.querySelector('.hero-sequence');
      const distance = sequence.parentElement.offsetHeight - sequence.offsetHeight;
      const video = document.querySelector('.video-hero video');
      return Math.abs(p - .5) < .003 && Math.abs(scrollY - distance * .5) < 3 && !video.seeking && Math.abs(video.currentTime - 17.75) < .08;
    });
    const view = await page.locator('.video-hero video').evaluate(e => ({time:e.currentTime,source:e.currentSrc}));
    if (view.source !== film.source) throw Error('Resize changed video rendition');
    resize.push({width,height,...view});
  }
  const pose = () => page.locator('.vision-composition').evaluate(e => ({
    transform: getComputedStyle(e).transform,
    opacity: Number(getComputedStyle(e).opacity),
    clip: getComputedStyle(e.querySelector('.vision-photo-mask')).clipPath,
    layers: e.querySelectorAll('.vision-photo-sheet').length,
  }));
  await go(.84);
  const entering = await pose();
  await page.screenshot({ path: `output/playwright/vision-${engine}-entering.png` });
  await go(.9);
  await page.screenshot({ path: `output/playwright/vision-${engine}-forward.png` });
  await go(.98);
  const settled = await pose();
  const panelReady = await page.locator('.video-editorial').evaluate(e => !e.inert && e.getAttribute('aria-hidden') === 'false');
  if (!panelReady || settled.opacity < .99 || settled.layers !== 2 || !settled.transform.startsWith('matrix3d')) throw Error('Depth scene did not settle');
  if (settled.transform === entering.transform) throw Error('Photo plane has no scroll perspective');
  await page.screenshot({ path: `output/playwright/vision-${engine}-settled.png` });
  const pointer = page.locator('.vision-photo-tilt');
  const bounds = await pointer.boundingBox();
  await page.mouse.move(bounds.x + bounds.width * .9, bounds.y + bounds.height * .25);
  await page.waitForTimeout(650);
  const hovered = await pointer.evaluate(e => getComputedStyle(e).transform);
  await page.mouse.move(10, 10);
  await go(.70);
  const reversed = await pose();
  if (reversed.opacity > .05) throw Error('Photo reveal did not reverse');
  await go(.98);
  const replayed = await pose();
  if (replayed.transform !== settled.transform) throw Error('Photo perspective drifted after reverse');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.video-hero[data-static="true"]').waitFor();
  const liveReducedPhoto = await page.locator('.vision-photo-camera > img').evaluate(e => Number(getComputedStyle(e).opacity));
  if (liveReducedPhoto < .99) throw Error('Live reduced-motion change hid the editorial photograph');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const mobile = [];
  for (const [width, height] of [[390,844], [390,640], [320,568], [1366,600]]) {
    await page.setViewportSize({width, height});
    await visit();
    await page.locator('.video-hero[data-video-state="ready"]').waitFor();
    await go(.98);
    const layout = await page.locator('.ivory-panel').evaluate(e => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      copyBottom: e.querySelector('.vision-copy').getBoundingClientRect().bottom,
      imageHeight: e.querySelector('.vision-photo-stack').getBoundingClientRect().height,
      imageBottom: e.querySelector('.vision-composition').getBoundingClientRect().bottom,
      imageHidden: getComputedStyle(e.querySelector('.vision-composition')).display === 'none',
      controls: document.querySelectorAll('.journey-controls').length,
    }));
    if (layout.overflow > 1 || layout.copyBottom > height - 5 || (!layout.imageHidden && (layout.imageBottom > height - 5 || layout.imageHeight < 90)) || layout.controls) throw Error('Responsive depth layout: '+JSON.stringify({width,height,...layout}));
    mobile.push({width,height,...layout});
    await page.screenshot({ path: `output/playwright/vision-${engine}-${width}-${height}.png` });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await visit();
  await page.locator('.video-hero[data-static="true"]').waitFor();
  const reduced = await page.locator('.vision-depth-stage').evaluate(e => ({
    transform: getComputedStyle(e).transform,
    layers: Array.from(e.querySelectorAll('.vision-photo-sheet')).filter(p=>getComputedStyle(p).display !== 'none').length,
    pins: document.querySelectorAll('.pin-spacer').length,
    videos: document.querySelectorAll('video').length,
  }));
  if (reduced.transform !== 'none' || reduced.layers || reduced.pins || reduced.videos || errors.length) throw Error(JSON.stringify({reduced,errors}));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('**/hero-film/*.mp4', route => route.abort());
  await visit();
  await page.locator('.video-hero[data-static="true"]').waitFor();
  const failure = await page.locator('.hero-sequence').evaluate(e => ({
    pinned: e.parentElement.classList.contains('pin-spacer'),
    video: e.querySelectorAll('video').length,
    poster: e.querySelector('.video-poster').getAttribute('src'),
    posterReady: e.querySelector('.video-poster').naturalWidth > 0,
    links: e.querySelectorAll('.video-opening .hero-actions a').length,
  }));
  if (failure.pinned || failure.video || !failure.poster.includes('/hero-film/') || !failure.posterReady || failure.links !== 2 || errors.length) throw Error(JSON.stringify({failure,errors}));
  await page.unroute('**/hero-film/*.mp4');
  return {engine, film, resize, entering, settled, hovered, reversed, replayed: true, liveReducedPhoto, mobile, reduced, failure, errors};
}
