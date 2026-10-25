async page => {
  const errors=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);});
  await page.emulateMedia({reducedMotion:'reduce'});
  // Keep the user's system clipboard untouched while exercising the copy action.
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__briefCopy=text;}}}));
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(`http://127.0.0.1:4173/?contact-qa=${Date.now()}#contact`);
  const form=page.getByRole('form',{name:'Project inquiry',exact:true});
  const button=form.getByRole('button',{name:'Review inquiry',exact:true});
  await button.click();
  if(await page.locator('.inquiry-draft').count())throw Error('Empty form was accepted');
  await form.getByRole('textbox',{name:'Your name',exact:true}).fill('   ');
  await form.getByRole('textbox',{name:'Email address',exact:true}).fill('client@example.test');
  await form.getByRole('combobox',{name:'I’m interested in',exact:true}).selectOption('Interior Design');
  await form.getByRole('textbox',{name:'About your space',exact:true}).fill('A warm living space with natural light.\nA flexible study area.');
  await form.getByRole('checkbox').check();
  await button.click();
  if(await page.locator('.inquiry-draft').count())throw Error('Whitespace-only name was accepted');
  await form.getByRole('textbox',{name:'Your name',exact:true}).fill('Contact QA');
  await form.getByRole('textbox',{name:'Email address',exact:true}).fill('invalid');await button.click();
  if(await page.locator('.inquiry-draft').count())throw Error('Invalid email was accepted');
  await form.getByRole('textbox',{name:'Email address',exact:true}).fill('client@example.test');
  await form.getByLabel('Project location',{exact:false}).fill('Karachi');
  await form.getByRole('checkbox').uncheck();await button.click();
  if(await page.locator('.inquiry-draft').count())throw Error('Consent was bypassed');
  await form.getByRole('checkbox').check();await button.click();
  await page.locator('.inquiry-draft').waitFor();
  if(!await page.locator('.inquiry-draft').evaluate(e=>e===document.activeElement))throw Error('Review did not receive focus');
  const draft=await page.locator('.inquiry-draft').innerText();
  if(!/not sent/i.test(draft)||!draft.includes('Karachi'))throw Error('Review omitted draft state or location');
  const href=await page.getByRole('link',{name:'Open email draft'}).getAttribute('href');
  const mail=new URL(href);
  if(mail.protocol!=='mailto:'||mail.pathname!=='Eco28development@gmail.com'||!mail.searchParams.get('body').includes('Contact QA')||!mail.searchParams.get('body').includes('Karachi'))throw Error('Email draft content or recipient incorrect');
  await page.getByRole('button',{name:'Copy brief',exact:true}).click();
  await page.getByRole('status').filter({hasText:'Brief copied'}).waitFor();
  if(!await page.evaluate(()=>window.__briefCopy.includes('Contact QA')))throw Error('Copy omitted inquiry');
  const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download brief',exact:true}).click()]);
  if(download.suggestedFilename()!=='eco28-project-inquiry.txt')throw Error('Download filename incorrect');
  await download.saveAs('output/playwright/contact-brief.txt');
  await page.locator('.inquiry-draft').screenshot({path:'output/playwright/contact-draft.png'});
  // Edits invalidate the old review instead of allowing an out-of-date draft to be sent.
  await form.getByRole('textbox',{name:'Your name',exact:true}).fill('Updated QA');
  if(await page.locator('.inquiry-draft').count())throw Error('Editing retained a stale review');
  const layouts=[];
  for(const [width,height] of [[1440,1000],[768,1024],[390,844],[320,568]]){
    await page.setViewportSize({width,height});await page.goto(`http://127.0.0.1:4173/?contact-qa=${Date.now()}#contact`);
    await page.locator('.contact-photo img').evaluate(im=>{im.loading='eager';return im.decode();});
    await page.locator('.footer img').evaluateAll(ims=>Promise.all(ims.map(im=>{im.loading='eager';return im.decode();})));
    // Keep fixed navigation out of the standalone section captures.
    const style=await page.addStyleTag({content:'.header,.skip-link{visibility:hidden!important}'});
    await page.locator('.contact-section').screenshot({path:`output/playwright/contact-final-${width}.png`});
    await page.locator('.footer').screenshot({path:`output/playwright/footer-final-${width}.png`});
    await style.evaluate(e=>e.remove());
    const layout=await page.locator('.contact-section').evaluate(e=>({width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,formWidth:e.querySelector('.contact-form-wrap').getBoundingClientRect().width,inputFont:getComputedStyle(e.querySelector('input')).fontSize}));
    if(layout.overflow>1||(width<768&&layout.inputFont!=='16px'))throw Error(JSON.stringify(layout));
    layouts.push(layout);
  }
  await page.setViewportSize({width:1440,height:1000});
  const footer=page.getByRole('contentinfo');
  await footer.getByRole('link',{name:'Discuss your project',exact:true}).click();
  await page.waitForFunction(()=>Math.abs(document.querySelector('#contact').getBoundingClientRect().top-100)<4);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('studio:scroll-to',{detail:document.body.scrollHeight})));
  await footer.getByRole('link',{name:'Discuss your project',exact:true}).click();
  await page.waitForFunction(()=>Math.abs(document.querySelector('#contact').getBoundingClientRect().top-100)<4);
  await footer.getByRole('link',{name:'Back to top'}).click();
  await page.waitForFunction(()=>scrollY<2);
  const links=await footer.locator('a[href^="/#"]').evaluateAll(links=>links.map(link=>({href:link.getAttribute('href'),exists:!!document.querySelector(link.hash)})));
  if(links.some(link=>!link.exists))throw Error('Footer contains an invalid section link');
  if(await footer.locator('a[href="mailto:Eco28development@gmail.com"]').count()!==1)throw Error('Footer email missing');
  if(errors.length||failed.length)throw Error(JSON.stringify({errors,failed}));
  return {validation:true,consent:true,review:true,copy:true,download:true,emailRecipient:mail.pathname,staleDraftCleared:true,layouts,repeatContactLink:true,backToTop:true,links,errors,failed};
}
