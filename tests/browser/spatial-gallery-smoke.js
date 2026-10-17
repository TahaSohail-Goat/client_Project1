async page => {
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(30000);
  const base = 'http://127.0.0.1:4173';
  const engine = page.context().browser().browserType().name();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => route.continue());
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:1000});
  const visit = () => page.goto(`${base}/?gallery-qa=${Date.now()}#work`);
  const align = async () => {
    await page.evaluate(()=>{const e=document.querySelector('#work');window.dispatchEvent(new CustomEvent('studio:scroll-to',{detail:e.getBoundingClientRect().top+scrollY-100}));});
    await page.waitForTimeout(250);
  };
  const button = mode => page.getByRole('group',{name:'Gallery arrangement'}).getByRole('button',{name:new RegExp(mode,'i')});
  const checkComposition = () => page.locator('#work').evaluate(section => {
    const title = section.querySelector('#portfolio-title');
    const stage = section.querySelector('.spatial-viewport');
    const controls = section.querySelector('.spatial-controls');
    const heading = title.getBoundingClientRect(), images = stage.getBoundingClientRect();
    const toolbar = controls.getBoundingClientRect();
    if (section.querySelectorAll('#portfolio-title').length !== 1 || stage.contains(title) ||
        heading.bottom + 24 > images.top || toolbar.bottom > images.top + 1 ||
        title.scrollWidth > title.clientWidth + 1) {
      throw Error('Portfolio heading or controls overlap the gallery');
    }
    return { headingGap: Math.round(images.top - heading.bottom), toolbarGap: Math.round(images.top - toolbar.bottom) };
  });
  const setMode = async mode => {
    if(page.viewportSize().width < 768) await page.getByLabel('Gallery layout',{exact:true}).selectOption(mode);
    else await button(mode).click();
    await page.waitForTimeout(1200);
  };
  const transform = () => page.locator('.spatial-card').nth(3).evaluate(e=>getComputedStyle(e).transform);
  await visit();
  await page.locator('.spatial-gallery').waitFor();
  await align();
  const original = await transform();
  const layouts = {};
  for (const mode of ['list','grid','helix','barrel','ring','sphere','stack','coverflow']) {
    if(mode!=='list') await setMode(mode);
    if(await page.locator('.spatial-gallery').getAttribute('data-layout')!==mode) throw Error('Wrong layout');
    layouts[mode] = await transform();
    await checkComposition();
    if(['list','helix','sphere','coverflow'].includes(mode)) {
      await align();
      await page.screenshot({path:`output/playwright/gallery-${engine}-${mode}.png`});
    }
  }
  if(new Set(Object.values(layouts)).size!==8) throw Error('Gallery arrangements are not distinct');
  await setMode('list');
  if(await transform()!==original) throw Error('Layout reversal drifted');
  await button('helix').click(); await page.waitForTimeout(180);
  await button('coverflow').click(); await page.waitForTimeout(1200);
  if(await page.locator('.spatial-layouts button[aria-pressed="true"]').count()!==1) throw Error('Interrupted transition corrupted layout');
  await setMode('list'); await align();
  const area=await page.locator('.spatial-viewport').boundingBox();
  const previous=Number(await page.locator('.spatial-gallery').getAttribute('data-active'));
  await page.mouse.move(area.x+area.width*.82,area.y+area.height*.65);
  await page.mouse.down();
  await page.mouse.move(area.x+area.width*.45,area.y+area.height*.65,{steps:12});
  await page.mouse.up(); await page.waitForTimeout(700);
  const dragged=Number(await page.locator('.spatial-gallery').getAttribute('data-active'));
  if(dragged<=previous || await page.getByRole('dialog').count()) throw Error('Drag did not navigate cleanly');
  await page.locator('.spatial-card[aria-current="true"]').focus();
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(650);
  const keyboard=Number(await page.locator('.spatial-gallery').getAttribute('data-active'));
  if(keyboard!==dragged+1) throw Error('Keyboard navigation failed');
  await page.keyboard.press('Enter'); await page.getByRole('dialog').waitFor();
  await page.waitForFunction(()=>document.querySelector('.lightbox-image img').naturalWidth>0);
  const fullImage=await page.locator('.lightbox-image img').getAttribute('src');
  if(/-(480|768)\.webp/.test(fullImage)) throw Error('Lightbox did not load full resolution');
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('Escape');
  await page.waitForFunction(()=>document.activeElement?.classList.contains('spatial-card'));
  const focused=true;
  await setMode('sphere');
  const filters={};
  for(const [category,count] of [['Architecture',11],['Interiors',25],['Model Studies',7],['All',43]]) {
    await page.getByRole('group',{name:'Filter photographs'}).getByRole('button',{name:new RegExp('^'+category)}).click();
    await page.waitForFunction(n=>document.querySelectorAll('.work-card').length===n,count);
    if(await page.locator('.spatial-gallery').getAttribute('data-layout')!=='sphere') throw Error('Filter reset the arrangement');
    filters[category]=await page.locator('.work-card').count();
  }
  const decoded=await page.locator('.spatial-card img').evaluateAll(async images=>Promise.all(images.map(async image=>{image.loading='eager';await image.decode();return image.naturalWidth;})));
  if(decoded.length!==43 || decoded.some(w=>!w)) throw Error('A photograph failed to load');
  const mobile=[];
  for(const [width,height] of [[390,844],[320,568]]) {
    await page.setViewportSize({width,height});await visit();await page.locator('.spatial-gallery').waitFor();await align();
    const state=await page.locator('.spatial-viewport').evaluate(e=>({overflow:document.documentElement.scrollWidth-innerWidth,touchAction:getComputedStyle(e).touchAction,width:e.clientWidth}));
    if(state.overflow>1 || !state.touchAction.includes('pan-y')) throw Error(JSON.stringify(state));
    await setMode('coverflow');await align();
    await checkComposition();
    await page.screenshot({path:`output/playwright/gallery-${engine}-${width}.png`});
    mobile.push({width,height,...state});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.spatial-static').waitFor();
  const reduced=await page.locator('#work').evaluate(e=>({cards:e.querySelectorAll('.work-grid .work-card').length,stage:e.querySelectorAll('.spatial-viewport').length,hidden:Array.from(e.querySelectorAll('.work-card')).filter(c=>Number(getComputedStyle(c).opacity)<.99).length,headingGap:e.querySelector('.work-grid').getBoundingClientRect().top-e.querySelector('#portfolio-title').getBoundingClientRect().bottom}));
  if(reduced.cards!==43 || reduced.stage || reduced.hidden || reduced.headingGap < 24 || errors.length) throw Error(JSON.stringify({reduced,errors}));
  return {engine,layouts,interrupted:true,dragged,keyboard,fullImage,focused,filters,decoded:decoded.length,mobile,reduced,errors};
}
