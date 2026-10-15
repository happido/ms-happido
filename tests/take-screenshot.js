const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://localhost:8083');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'current_rider_app.png' });
  await browser.close();
})();
