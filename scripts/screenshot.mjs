// Pitch-flow screenshots: desktop shell (1280×900) end-to-end + mobile raw check.
// Usage: bun run scripts/screenshot.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:3000';
mkdirSync('shots', { recursive: true });

async function onboard(page) {
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Get started' }).click();
  await page.waitForTimeout(300);
  await page.fill('input[placeholder="e.g. Alex"]', 'Carol');
  await page.getByRole('button', { name: 'Start exploring' }).click();
  await page.waitForTimeout(1000);
}

const geo = {
  permissions: ['geolocation'],
  geolocation: { latitude: 52.2003, longitude: 0.1197 }, // at the Fitzwilliam
};

// ================= DESKTOP SHELL =================
{
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, ...geo });
  const page = await ctx.newPage();
  await onboard(page);

  // Shell + Home (default tab)
  await page.screenshot({ path: 'shots/desk-01-shell-home.jpg', type: 'jpeg', quality: 70 });

  // Continue hunt → quest → complete → reward stamp
  await page.getByRole('button', { name: /Continue|Start/ }).first().click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'shots/desk-02-quest.jpg', type: 'jpeg', quality: 70 });
  await page.getByRole('button', { name: 'Complete Quest' }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'shots/desk-03-stamped.jpg', type: 'jpeg', quality: 70 });
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'shots/desk-04-reward.jpg', type: 'jpeg', quality: 70 });
  await page.getByRole('button', { name: 'Keep exploring' }).click();
  await page.waitForTimeout(500);
  const lvl = page.getByRole('button', { name: 'Continue' });
  if (await lvl.isVisible().catch(() => false)) {
    await page.screenshot({ path: 'shots/desk-05-levelup.jpg', type: 'jpeg', quality: 70 });
    await lvl.click();
    await page.waitForTimeout(400);
  }

  // Explore → Gardens filter → Botanic Garden → Book visit
  await page.locator('nav button', { hasText: 'Explore' }).click();
  await page.waitForTimeout(700);
  await page.getByRole('button', { name: 'Gardens' }).click();
  await page.waitForTimeout(400);
  await page.locator('button', { hasText: 'Botanic Garden' }).first().click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'shots/desk-06-venue.jpg', type: 'jpeg', quality: 70 });
  await page.getByRole('button', { name: /Book visit/ }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'shots/desk-07-booking.jpg', type: 'jpeg', quality: 70 });
  await page.getByRole('button', { name: /Confirm booking/ }).click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'shots/desk-08-booked.jpg', type: 'jpeg', quality: 70 });
  await page.getByRole('button', { name: 'Keep exploring' }).click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Close' }).first().click().catch(() => {});
  await page.waitForTimeout(400);

  // Rewards → voucher
  await page.locator('nav button', { hasText: 'Rewards' }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'shots/desk-09-rewards.jpg', type: 'jpeg', quality: 70 });
  await page.getByRole('button', { name: 'Get voucher' }).first().click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'shots/desk-10-voucher.jpg', type: 'jpeg', quality: 70 });

  await browser.close();
}

// ================= MOBILE RAW (no shell) =================
{
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    ...geo,
  });
  const page = await ctx.newPage();
  await onboard(page);
  await page.screenshot({ path: 'shots/mob-01-home.jpg', type: 'jpeg', quality: 70 });
  await page.locator('nav button', { hasText: 'Explore' }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'shots/mob-02-map.jpg', type: 'jpeg', quality: 70 });
  await browser.close();
}

console.log('Screenshots saved to shots/');
