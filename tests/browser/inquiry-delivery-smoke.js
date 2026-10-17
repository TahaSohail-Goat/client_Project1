// Run against a temporary Vite server with VITE_INQUIRY_ENDPOINT=/__qa/inquiry.
// Every submission is intercepted locally: this script never sends an inquiry.
async page => {
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:1440,height:1000});
  let mode='hold',pending,requests=0,payload;
  await page.route('**/__qa/inquiry',async route=>{
    requests++;payload=route.request().postDataJSON();
    if(mode==='hold'){pending=route;return;}
    if(mode==='invalid-json')return route.fulfill({status:200,contentType:'application/json',body:'not-json'});
    await route.fulfill({status:mode==='server-error'?503:200,contentType:'application/json',body:JSON.stringify({received:mode==='server-error'})});
  });
  await page.goto(`http://127.0.0.1:5188/?delivery-qa=${Date.now()}#contact`);
  const form=page.getByRole('form',{name:'Project inquiry',exact:true});
  await form.getByRole('textbox',{name:'Your name',exact:true}).fill('Delivery QA');
  await form.getByRole('textbox',{name:'Email address',exact:true}).fill('qa@example.test');
  await form.getByRole('combobox',{name:'I’m interested in',exact:true}).selectOption('Architecture');
  await form.getByLabel('Project location',{exact:false}).fill('Karachi');
  await form.getByRole('textbox',{name:'About your space',exact:true}).fill('A test brief; no real message is sent.');
  await form.getByRole('checkbox').check();
  await form.getByRole('button',{name:'Send inquiry',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.inquiry-form button[type="submit"]').disabled);
  await form.evaluate(f=>f.requestSubmit());
  if(requests!==1)throw Error('Duplicate request accepted');
  if(payload.name!=='Delivery QA'||payload.location!=='Karachi'||payload.consent!==true)throw Error('Inquiry payload incorrect');
  if(await page.locator('.inquiry-result.received').count())throw Error('Success shown before confirmation');
  await pending.fulfill({status:200,contentType:'application/json',body:'{"received":true}'});
  await page.locator('.inquiry-result.received').waitFor();
  if(!await page.locator('.inquiry-result').evaluate(e=>e===document.activeElement))throw Error('Delivery result did not receive focus');
  await form.getByRole('textbox',{name:'Your name',exact:true}).fill('Updated Delivery QA');
  if(await page.locator('.inquiry-result.received').count())throw Error('Old success retained after an edit');
  for(const next of ['missing-confirmation','invalid-json','server-error']){
    mode=next;await form.getByRole('button',{name:'Send inquiry',exact:true}).click();
    await page.locator('.inquiry-result.error').waitFor();
    if(await form.getByRole('textbox',{name:'Your name',exact:true}).inputValue()!=='Updated Delivery QA')throw Error('Failure erased input');
    if(await page.locator('.inquiry-result.received').count())throw Error('Unconfirmed delivery claimed success');
  }
  mode='hold';await form.getByRole('button',{name:'Send inquiry',exact:true}).click();
  await page.locator('.inquiry-result.sending').waitFor();
  await page.locator('.inquiry-result.error').waitFor({timeout:20000});
  if(await form.getByRole('button',{name:'Send inquiry',exact:true}).isDisabled())throw Error('Timeout did not restore submission');
  try { await pending.abort(); } catch { /* The timeout may already have aborted the intercepted request. */ }
  if(errors.length)throw Error(JSON.stringify(errors));
  return {mocked:true,requests,confirmedSuccess:true,pendingNoSuccess:true,duplicateProtected:true,editClearsSuccess:true,missingConfirmation:true,invalidJson:true,serverError:true,timeout:true,inputPreserved:true,errors};
}
