async page => {
  const browser = page.context().browser();
  if(browser.browserType().name()!=='chromium') throw Error('Native CDP touch check requires Chromium');
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  const phone=await context.newPage();
  try {
    await phone.goto('http://127.0.0.1:4173/');
    await phone.locator('.hero-sequence[data-renderer="webgl"]').waitFor({timeout:25000});
    const cdp=await context.newCDPSession(phone);
    const swipe=async (x,y,endX,endY) => {
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
      for(let i=1;i<=10;i++) {
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+(endX-x)*i/10,y:y+(endY-y)*i/10}]});
        await phone.waitForTimeout(20);
      }
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await phone.waitForTimeout(700);
    };
    await swipe(200,700,200,220);
    const hero=await phone.locator('.hero-sequence').getAttribute('data-progress');
    if(Number(hero)<=0) throw Error('Native vertical touch did not move the hero camera');
    await phone.evaluate(()=>{const e=document.querySelector('#work');window.dispatchEvent(new CustomEvent('studio:scroll-to',{detail:e.getBoundingClientRect().top+scrollY-80}));});
    await phone.waitForTimeout(700);
    const stage=await phone.locator('.spatial-viewport').boundingBox();
    const prior=Number(await phone.locator('.spatial-gallery').getAttribute('data-active'));
    const top=await phone.evaluate(()=>scrollY);
    await swipe(340,stage.y+stage.height*.65,90,stage.y+stage.height*.65);
    const active=Number(await phone.locator('.spatial-gallery').getAttribute('data-active'));
    if(active<=prior || await phone.locator('dialog').count()) throw Error('Native horizontal gallery swipe failed');
    if(Math.abs((await phone.evaluate(()=>scrollY))-top)>10) throw Error('Horizontal gesture moved the document');
    await swipe(200,stage.y+stage.height*.6,200,stage.y+stage.height*.6-180);
    const vertical=await phone.evaluate(()=>scrollY);
    if(vertical<=top+30) throw Error('Gallery trapped native vertical scrolling');
    return {nativeTouch:true,heroProgress:hero,prior,active,verticalDelta:Math.round(vertical-top)};
  } finally {await context.close();}
}
