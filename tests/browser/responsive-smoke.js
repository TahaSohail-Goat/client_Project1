async page => {
  page.setDefaultTimeout(15000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const layouts = [];
  for (const [width, height] of [[320,568], [390,844], [768,1024], [1024,768], [1280,720], [1440,900], [1920,1080], [844,390]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`http://127.0.0.1:4173/?responsive-qa=${Date.now()}`);
    await page.evaluate(() => document.fonts.ready);
    const images = await page.locator('img').evaluateAll(images => Promise.all(images.map(async image => {
      image.loading = 'eager'; await image.decode(); return image.naturalWidth;
    })));
    const layout = await page.evaluate(() => ({
      width: innerWidth, height: innerHeight, overflow: document.documentElement.scrollWidth - innerWidth,
      clippedHeadings: [...document.querySelectorAll('main h1, main h2')].filter(e => {
        const rect = e.getBoundingClientRect();
        return rect.width > 1 && (rect.left < -2 || rect.right > innerWidth + 2);
      }).map(e => e.id || e.textContent),
      formInputs: [...document.querySelectorAll('.inquiry-form input:not([type=checkbox]), .inquiry-form select, .inquiry-form textarea')].map(e => ({ font: getComputedStyle(e).fontSize, width: e.getBoundingClientRect().width })),
    }));
    if (layout.overflow > 1 || layout.clippedHeadings.length || images.some(w => !w)) throw Error(JSON.stringify(layout));
    if (width < 768 && layout.formInputs.some(e => Number.parseFloat(e.font) < 16 || e.width > width)) throw Error('Mobile form does not fit');
    if (width < 1280) {
      await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
      const menu = page.getByRole('dialog', { name: 'Site navigation' });
      if (await menu.evaluate(e => e.scrollWidth > e.clientWidth + 1)) throw Error('Menu horizontal overflow');
      await menu.locator('nav a').last().focus();
      await page.keyboard.press('Tab');
      if (!await page.getByRole('button', { name: 'Close navigation', exact: true }).evaluate(e => e === document.activeElement)) throw Error('Mobile menu focus did not wrap');
      await page.keyboard.press('Shift+Tab');
      if (!await menu.locator('nav a').last().evaluate(e => e === document.activeElement)) throw Error('Reverse menu focus did not wrap');
      if (width === 320 || height === 390) await page.screenshot({ path: `output/playwright/qa-menu-${width}-${height}.png` });
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.querySelector('.mobile-navigation'));
    }
    if ([320,768,1440].includes(width)) {
      const style = await page.addStyleTag({ content: '.header,.skip-link{visibility:hidden!important}' });
      await page.locator('#contact').screenshot({ path: `output/playwright/qa-contact-${width}.png` });
      await page.locator('footer').screenshot({ path: `output/playwright/qa-footer-${width}.png` });
      await style.evaluate(e => e.remove());
    }
    layouts.push({ ...layout, decodedImages: images.length, focusTrap: width < 1280 });
  }
  return { engine: page.context().browser().browserType().name(), layouts, passed: true };
}
