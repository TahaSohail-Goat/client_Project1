async page => {
  const base = 'http://127.0.0.1:4173';
  const engine = page.context().browser().browserType().name();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({reducedMotion:'no-preference'});
  const visit = () => page.goto(`${base}/?consultation=${Date.now()}`);
  const go = async top => {
    await page.evaluate(top => {
      const e=document.querySelector('.consultation');
      window.dispatchEvent(new CustomEvent('studio:scroll-to',{detail:e.getBoundingClientRect().top+scrollY-top}));
    },top);
    await page.waitForTimeout(1000);
  };
  await page.setViewportSize({width:1440,height:900});
  await visit();
  await go(100); await go(100);
  const sculpture=page.locator('.consultation-sculpture');
  const pose=()=>page.locator('.consultation-cube--outer').evaluate(e=>getComputedStyle(e).transform);
  const before=await pose();
  await go(-200);
  const after=await pose();
  await go(100);
  const reverse=await pose();
  if(before===after || !reverse.startsWith('matrix3d')) throw Error('Cube scroll rotation missing');
  const float=page.locator('.consultation-sculpture-float');
  const idleA=await float.evaluate(e=>getComputedStyle(e).transform);
  await page.waitForTimeout(450);
  const idleB=await float.evaluate(e=>getComputedStyle(e).transform);
  if(idleA===idleB) throw Error('Visible cube did not float');
  const tilt=page.locator('.consultation-sculpture-pointer');
  const tiltBefore=await tilt.evaluate(e=>getComputedStyle(e).transform);
  await page.mouse.move(1200,250);
  await page.waitForTimeout(700);
  const tiltAfter=await tilt.evaluate(e=>getComputedStyle(e).transform);
  if(tiltBefore===tiltAfter) throw Error('Cube did not respond to pointer');
  await page.screenshot({path:`output/playwright/consultation-${engine}-desktop.png`});
  await page.locator('.consultation .inquiry-button').focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>location.hash==='#contact' && Math.abs(document.querySelector('#contact').getBoundingClientRect().top-100)<5);
  const contact=true;
  const layouts=[];
  for(const [width,height] of [[1920,1080],[390,844],[320,568]]) {
    await page.setViewportSize({width,height}); await visit(); await go(100); await go(100);
    const layout=await page.locator('.consultation').evaluate(e=>({
      overflow:document.documentElement.scrollWidth-innerWidth,
      faces:e.querySelectorAll('.consultation-cube-face').length,
      canvas:e.querySelectorAll('canvas').length,
      graphicWidth:e.querySelector('.consultation-sculpture').offsetWidth,
      linkWidth:e.querySelector('.inquiry-button').getBoundingClientRect().width,
      buttonReady:getComputedStyle(e.querySelector('.inquiry-button')).pointerEvents!=='none',
    }));
    if(layout.overflow>1 || layout.faces!==12 || layout.canvas || layout.graphicWidth<200 || !layout.buttonReady) throw Error(JSON.stringify({width,height,layout}));
    layouts.push({width,height,...layout});
    await page.screenshot({path:`output/playwright/consultation-${engine}-${width}.png`});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('.consultation-sculpture').dataset.motion==='false');
  await page.waitForTimeout(100);
  const reducedA=await pose();
  await go(-80);
  const reducedB=await pose();
  const floatReduced=await float.evaluate(e=>getComputedStyle(e).transform);
  if(reducedA!==reducedB || floatReduced!=='none' || errors.length) throw Error(JSON.stringify({reducedA,reducedB,floatReduced,errors}));
  return {engine,scrollChanged:true,reverse,visibleFloat:true,pointer:true,contact,layouts,reducedMotion:true,errors};
}
