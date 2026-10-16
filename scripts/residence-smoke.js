async page => {
  const base='http://127.0.0.1:4173';
  const engine=page.context().browser().browserType().name();
  const errors=[],warnings=[],failedAssets=[],expectedContextLossNotices=[];
  let inducingContextLoss=false;
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{
    if(m.type()!=='warning')return;
    // R3F's delayed disposal can try to lose the context we deliberately lost.
    if(inducingContextLoss&&m.text()==='THREE.WebGLRenderer: WEBGL_lose_context extension not supported.')expectedContextLossNotices.push(m.text());
    else warnings.push(m.text());
  });
  page.on('response',r=>{if(r.status()>=400)failedAssets.push(`${r.status()} ${r.url()}`);});
  // Disable HTTP cache so asset and fallback checks cover actual requests.
  await page.route('**/*',r=>r.continue());
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:900});
  const visit=()=>page.goto(`${base}/?residence-qa=${Date.now()}`);
  const ready=()=>page.locator('.hero-sequence[data-renderer="webgl"]').waitFor({timeout:35000});
  const canvas=()=>page.locator('.hero-walkthrough canvas');
  const camera=()=>canvas().getAttribute('data-camera');
  const seek=async p=>{
    await page.evaluate(p=>{
      const e=document.querySelector('.hero-sequence'),s=e.parentElement;
      window.dispatchEvent(new CustomEvent('studio:scroll-to',{detail:s.getBoundingClientRect().top+scrollY+(s.offsetHeight-e.offsetHeight)*p*.82}));
    },p);
    // Scroll positions are whole CSS pixels; allow one pixel's normalized error.
    await page.waitForFunction(p=>Math.abs(Number(document.querySelector('.hero-walkthrough canvas')?.dataset.progress)-p)<.0003,p);
    // Wait beyond the 450ms desktop scrub so reads are settled, not in flight.
    await page.waitForTimeout(650);
    return camera();
  };
  const screenshot=name=>page.screenshot({path:`output/playwright/residence-${engine}-${name}.png`});
  await visit();await ready();await page.waitForTimeout(650);
  const initial=await camera();await page.waitForTimeout(300);
  if(await camera()!==initial)throw Error('Camera moved while idle');
  if(await page.locator('video').count())throw Error('Retired video loaded');
  await page.locator('.video-poster').evaluate(im=>im.decode());
  await screenshot('exterior');
  const poses={},levels={},renderBudget={};
  for(const [p,name,level] of [[.19,'entrance',0],[.285,'ground',0],[.385,'stair',1],[.455,'first',1],[.59,'second',2],[.616,'bath',2],[.735,'third',3],[.81,'terrace',3],[.97,'final',-1]]) {
    poses[p]=await seek(p);
    levels[name]=await page.locator('.residence-overlay').getAttribute('data-level');
    if(Number(levels[name])!==level)throw Error(`Wrong floor label: ${name}`);
    await screenshot(name);
    renderBudget[name]=await canvas().evaluate(c=>({calls:Number(c.dataset.calls),triangles:Number(c.dataset.triangles)}));
  }
  const entry=poses[.285].split(',').map(Number);
  if(entry[2]>=5.45||entry[1]>2)throw Error('Camera did not enter the residence');
  for(const [p,height] of [[.455,5.15],[.59,8.65],[.735,12.15]]) {
    if(Math.abs(Number(poses[p].split(',')[1])-height)>.01)throw Error('Floor elevation mismatch');
  }
  for(const p of [.12,.22,.362,.5,.641,.77,.89]) {
    const a=(await seek(p-.0002)).split(',').map(Number),b=(await seek(p+.0002)).split(',').map(Number);
    if(Math.hypot(...b.map((v,i)=>v-a[i]))>.5)throw Error(`Discontinuous boundary ${p}`);
  }
  for(const p of [.735,.59,.455,.285]) {
    const reversed=await seek(p);
    if(reversed!==poses[p])throw Error(`Reverse drift ${p}: ${poses[p]} -> ${reversed}`);
  }
  await seek(.59);
  const before=await camera();
  await page.setViewportSize({width:1280,height:720});await page.waitForTimeout(900);
  const after=(await camera()).split(',').map(Number),prior=before.split(',').map(Number);
  if(Math.hypot(...after.map((v,i)=>v-prior[i]))>.025)throw Error('Laptop resize lost camera position');
  await screenshot('laptop');
  await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(800);
  // Interrupt the scrub repeatedly, without waiting for earlier requests to settle.
  for(const p of [.98,.05,.78,.2,.59])await page.evaluate(p=>{
    const e=document.querySelector('.hero-sequence'),s=e.parentElement;
    window.dispatchEvent(new CustomEvent('studio:scroll-to',{detail:(s.offsetHeight-e.offsetHeight)*p*.82}));
  },p);
  await page.waitForTimeout(1000);
  if(await camera()!==poses[.59])throw Error('Rapid scroll did not settle on the latest pose');
  // Exercise real wheel input through the existing Lenis/native scroll integration.
  await seek(.285);await page.mouse.wheel(0,500);await page.waitForTimeout(1300);
  if(Number(await canvas().getAttribute('data-progress'))<=.285)throw Error('Downward wheel did not advance');
  await page.mouse.wheel(0,-500);await page.waitForTimeout(1300);
  if(Math.abs(Number(await canvas().getAttribute('data-progress'))-.285)>.01)throw Error('Reverse wheel did not return');
  // The final 18% belongs to the existing editorial reveal.
  await page.evaluate(()=>{const e=document.querySelector('.hero-sequence'),s=e.parentElement;window.dispatchEvent(new CustomEvent('studio:scroll-to',{detail:(s.offsetHeight-e.offsetHeight)*.99}));});
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.ivory-panel')).clipPath==='inset(0%)');
  await page.waitForFunction(()=>!document.querySelector('.video-editorial').inert);
  if(await page.locator('.video-editorial').evaluate(e=>e.inert))throw Error('Editorial remained inert');
  await screenshot('editorial');
  await seek(0);if(await camera()!==initial)throw Error('Opening did not restore');
  const sizes=[];
  for(const [width,height] of [[390,844],[320,568]]) {
    await page.setViewportSize({width,height});await visit();await ready();await page.waitForTimeout(500);
    await screenshot(`mobile-${width}-exterior`);
    await seek(.285);await screenshot(`mobile-${width}-ground`);
    await seek(.59);await screenshot(`mobile-${width}-suite`);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    if(overflow>1)throw Error(`Mobile overflow ${width}`);
    await page.getByRole('button',{name:'Open navigation',exact:true}).click();
    await page.getByRole('dialog',{name:'Site navigation'}).waitFor();
    if(!await page.locator('main').evaluate(e=>e.inert))throw Error('Mobile navigation lost isolation');
    await page.keyboard.press('Escape');
    sizes.push({width,height,overflow});
  }
  await page.setViewportSize({width:1440,height:900});await visit();await ready();
  inducingContextLoss=true;
  await canvas().evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await page.locator('.hero-sequence[data-renderer="static"]').waitFor();
  if(await page.locator('.hero-walkthrough canvas').count())throw Error('Context loss retained a blank canvas');
  await page.locator('.video-poster').evaluate(im=>im.decode());
  await screenshot('context-fallback');
  await page.emulateMedia({reducedMotion:'reduce'});await visit();
  await page.locator('.hero-sequence[data-static="true"]').waitFor();
  if(await page.locator('canvas,video,.pin-spacer').count())throw Error('Reduced motion retained animated media/pins');
  await page.locator('.video-poster').evaluate(im=>im.decode());
  await screenshot('reduced-motion');
  await page.locator('.video-opening').getByRole('link',{name:'Explore the work',exact:true}).click();
  await page.locator('#work').waitFor();
  if(!page.url().endsWith('#work'))throw Error('Static navigation failed');
  if(errors.length||failedAssets.length||warnings.length)throw Error(JSON.stringify({errors,failedAssets,warnings}));
  return {engine,levels,poses,renderBudget,sizes,reverse:true,boundaries:true,rapidScroll:true,wheel:true,resize:true,editorial:true,contextLoss:true,reducedMotion:true,errors,warnings,failedAssets,expectedContextLossNotices};
}
