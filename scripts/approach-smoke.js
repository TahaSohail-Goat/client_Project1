async (page) => {
  const base = 'http://127.0.0.1:4173';
  const engine = page.context().browser().browserType().name();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => route.continue());
  const visit = () => page.goto(`${base}/?approach-qa=${Date.now()}#approach`);
  const go = async p => {
    await page.evaluate(p => {
      const node = document.querySelector('#approach'), spacer = node.parentElement;
      const start = spacer.getBoundingClientRect().top + scrollY;
      window.dispatchEvent(new CustomEvent('studio:scroll-to', {
        detail: start + (spacer.offsetHeight - node.offsetHeight) * p,
      }));
    }, p);
    // WebKit rounds document scroll positions to whole CSS pixels.
    await page.waitForFunction(p => Math.abs(Number(document.querySelector('#approach').dataset.progress) - p) < .001, p);
    await page.waitForTimeout(350);
  };
  const pose = () => page.locator('#approach canvas').getAttribute('data-pose');
  const bounds = () => page.locator('#approach').evaluate(e => ({
    pinned: e.dataset.pinned,
    overflow: document.documentElement.scrollWidth - innerWidth,
    caption: e.querySelector('figcaption').getBoundingClientRect().bottom,
    copy: e.querySelector('.approach-copy').getBoundingClientRect().bottom,
    canvasWidth: e.querySelector('canvas')?.clientWidth,
    containerWidth: e.querySelector('.approach-three')?.clientWidth,
    hiddenWords: Array.from(e.querySelectorAll('.cinematic-word')).filter(w => Number(getComputedStyle(w).opacity) < .99).length,
  }));
  await page.emulateMedia({reducedMotion: 'no-preference'});
  const desktop = [];
  for (const [width, height] of [[1440,900], [1920,1080], [1366,768], [1024,768]]) {
    await page.setViewportSize({width,height});
    await visit();
    await page.locator('#approach[data-renderer="webgl"]').waitFor();
    await go(.5);
    const layout = await bounds();
    if (layout.pinned !== 'true' || layout.overflow > 1 || layout.caption > height - 10 || layout.copy > height - 10 || layout.hiddenWords || Math.abs(layout.canvasWidth-layout.containerWidth)>1) throw Error(JSON.stringify({width,height,layout}));
    desktop.push({width,height,...layout});
    await page.screenshot({path:`output/playwright/approach-${engine}-${width}.png`});
  }
  const mid = await pose();
  await go(.93);
  const end = await pose();
  await go(.5);
  const reversed = await pose();
  if (Math.abs(Number(mid.split(':')[0])-Number(reversed.split(':')[0]))>.001 || end===mid) throw Error('3D scroll did not reverse');
  await page.mouse.move(900,600);
  await page.waitForTimeout(900);
  const pointer = await pose();
  if (pointer === reversed) throw Error('Motion springs did not affect the 3D scene');
  await page.mouse.move(10,10);
  await page.waitForTimeout(800);
  await page.locator('#approach .line-link').focus();
  const focused = await page.locator('#approach .line-link').evaluate(e => document.activeElement===e && getComputedStyle(e).outlineStyle!=='none');
  if (!focused) throw Error('Studio link has no keyboard focus');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => location.hash==='#studio' && Math.abs(document.querySelector('#studio').getBoundingClientRect().top-100)<5);

  await visit();
  await page.locator('#approach[data-renderer="webgl"]').waitFor();
  await go(.5);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(() => !document.querySelector('#approach canvas') && !document.querySelector('#approach').parentElement.classList.contains('pin-spacer'));
  const liveReduced = await page.locator('#approach .approach-fallback').evaluate(e => getComputedStyle(e).opacity);
  if (liveReduced !== '1') throw Error('Live motion preference hid the illustration');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await visit();
  await page.locator('#approach[data-renderer="webgl"]').waitFor();
  await go(.5);
  await page.locator('#approach canvas').evaluate(c => c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await page.locator('#approach[data-renderer="fallback"]').waitFor();
  await page.waitForFunction(() => !document.querySelector('#approach').parentElement.classList.contains('pin-spacer'));
  const fallback = await page.locator('#approach .approach-fallback').evaluate(e => ({opacity:getComputedStyle(e).opacity, frames:e.querySelectorAll('rect').length}));
  if (fallback.opacity !== '1' || fallback.frames !== 6) throw Error('WebGL failure did not restore the illustration');

  const mobile = [];
  for (const [width,height] of [[390,844],[320,568],[1366,600]]) {
    await page.setViewportSize({width,height});
    await visit();
    await page.locator('#approach').scrollIntoViewIfNeeded();
    await page.waitForTimeout(450);
    const layout = await bounds();
    if (layout.pinned==='true' || layout.canvasWidth || layout.overflow>1) throw Error(JSON.stringify({width,height,layout}));
    mobile.push({width,height,pinned:layout.pinned,overflow:layout.overflow});
    await page.screenshot({path:`output/playwright/approach-${engine}-${width}-${height}.png`});
  }
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  await visit();
  const reduced = await page.locator('#approach').evaluate(e => ({
    pinned:e.parentElement.classList.contains('pin-spacer'), canvas:e.querySelectorAll('canvas').length,
    opacity:getComputedStyle(e.querySelector('.approach-fallback')).opacity,
    hiddenWords:Array.from(e.querySelectorAll('.cinematic-word')).filter(w=>Number(getComputedStyle(w).opacity)<.99).length,
  }));
  if (reduced.pinned || reduced.canvas || reduced.hiddenWords || reduced.opacity!=='1' || errors.length) throw Error(JSON.stringify({reduced,errors}));
  return {engine,desktop,mid,end,reversed,pointer,focused,liveReduced,fallback,mobile,reduced,errors};
}
