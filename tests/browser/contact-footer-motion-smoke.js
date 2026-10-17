async page => {
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:900});
  await page.goto(`http://127.0.0.1:4173/?contact-motion=${Date.now()}#contact`);
  await page.waitForFunction(()=>['webgl','static'].includes(document.querySelector('.hero-sequence')?.dataset.renderer),null,{timeout:40000});
  await page.waitForFunction(()=>Math.abs(document.querySelector('#contact').getBoundingClientRect().top-100)<5);
  await page.waitForTimeout(700);
  const heading=await page.locator('#contact-title .cinematic-word').evaluateAll(words=>words.map(word=>Number(getComputedStyle(word).opacity)));
  if(heading.some(opacity=>opacity<.95))throw Error('Contact heading did not reveal');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('studio:scroll-to',{detail:document.body.scrollHeight})));
  await page.waitForFunction(()=>{
    const style=getComputedStyle(document.querySelector('.footer-signature'));
    return Number(style.opacity)>.99&&(style.transform==='none'||Math.abs(new DOMMatrixReadOnly(style.transform).m42)<1);
  });
  await page.screenshot({path:'output/playwright/contact-footer-motion.png'});
  if(errors.length)throw Error(JSON.stringify(errors));
  return {normalMotion:true,deepLink:true,headingVisible:true,footerReveal:true,errors};
}
