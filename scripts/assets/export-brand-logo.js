// Run through Playwright CLI after preparing the SVGs and starting the preview.
async page => {
  await page.setViewportSize({width:1776,height:1248});
  await page.goto('http://127.0.0.1:4173/media/brand/eco28-logo.svg');
  await page.locator('svg').evaluate(svg=>{
    svg.setAttribute('width','1776');svg.setAttribute('height','1248');
  });
  await page.locator('svg').screenshot({path:'output/brand/eco28-logo.png',omitBackground:true});
  return {transparentPng:true,width:1776,height:1248};
}
