// Programmatic verification of the pitch flow (geometry + state).
// Usage: bun run scripts/verify.mjs
import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const geo = {
  permissions: ['geolocation'],
  geolocation: { latitude: 52.2003, longitude: 0.1197 },
};

async function onboard(page) {
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Get started' }).click();
  await page.waitForTimeout(300);
  await page.fill('input[placeholder="e.g. Alex"]', 'Carol');
  await page.getByRole('button', { name: 'Start exploring' }).click();
  await page.waitForTimeout(1000);
}

const pointsText = async (page) =>
  page.locator('header div[title="Points — redeem for rewards"] span').textContent();

// ================= DESKTOP SHELL =================
{
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, ...geo })).newPage();
  await onboard(page);

  // Shell structure
  check('desktop shows pitch backdrop', await page.locator('.pitch-backdrop').isVisible());
  check('desktop shows branding panel', await page.locator('aside').isVisible());
  const brand = await page.locator('aside').boundingBox();
  const frame = await page.locator('.rounded-\\[3rem\\]').boundingBox();
  // boundingBox includes the fit-to-screen scale transform, so check the ratio
  const frameRatio = frame ? frame.width / frame.height : 0;
  check('frame keeps 390:844 phone ratio', Math.abs(frameRatio - 390 / 844) < 0.01, frame && `${Math.round(frame.width)}x${Math.round(frame.height)}`);
  check('branding sits left of frame', brand && frame && brand.x + brand.width < frame.x);

  // App content stays inside the frame
  const app = await page.locator('nav').boundingBox();
  check('bottom nav inside frame', app && app.x >= frame.x && app.x + app.width <= frame.x + frame.width + 2);

  // Home tab content
  check('home greeting visible', await page.getByText('Good ').first().isVisible());
  const p0 = await pointsText(page);
  check('home shows 340 starting points', p0.trim() === '340', p0.trim());

  // Quest complete → +90 (the Continue card is the daily quest)
  await page.getByRole('button', { name: /Continue|Start/ }).first().click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Complete Quest' }).click();
  await page.waitForTimeout(1700);
  const p1 = await pointsText(page);
  check('quest adds +90 points', p1.trim() === '430', `${p0.trim()} → ${p1.trim()}`);
  await page.getByRole('button', { name: 'Keep exploring' }).click();
  await page.waitForTimeout(500);

  // Booking → +60
  await page.locator('nav button', { hasText: 'Explore' }).click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Gardens' }).click();
  await page.waitForTimeout(400);
  await page.locator('button', { hasText: 'Botanic Garden' }).first().click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: /Book visit/ }).click();
  await page.waitForTimeout(500);
  check('booking modal shows venue', await page.getByText('Botanic Garden', { exact: false }).first().isVisible());
  await page.getByRole('button', { name: /Confirm booking/ }).click();
  await page.waitForTimeout(1200);
  const p2 = await pointsText(page);
  check('booking adds +60 points', p2.trim() === '490', `${p1.trim()} → ${p2.trim()}`);
  check('BOOKED stamp shown', await page.getByText('BOOKED', { exact: true }).isVisible());
  await page.getByRole('button', { name: 'Keep exploring' }).click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Close' }).first().click().catch(() => {});
  await page.waitForTimeout(300);

  // Home shows the booking chip
  await page.locator('nav button', { hasText: 'Home' }).click();
  await page.waitForTimeout(600);
  check('home shows latest booking chip', await page.getByText('Botanic Garden ·', { exact: false }).first().isVisible());

  // Redeem → -150
  await page.locator('nav button', { hasText: 'Rewards' }).click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Get voucher' }).first().click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForTimeout(900);
  const p3 = await pointsText(page);
  check('redeem deducts -150 points', p3.trim() === '340', `${p2.trim()} → ${p3.trim()}`);
  check('voucher shows CQ- code', await page.locator('text=/CQ-[A-Z0-9]{4}/').first().isVisible());
  check('voucher shows countdown', await page.locator('text=/left$/').first().isVisible());

  await browser.close();
}

// ================= MOBILE RAW =================
{
  const browser = await chromium.launch();
  const page = await (await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    ...geo,
  })).newPage();
  await onboard(page);

  check('mobile has NO pitch backdrop (raw app)', (await page.locator('.pitch-backdrop').count()) === 0);
  const nav = await page.locator('nav').boundingBox();
  check('mobile nav spans 390px width', nav && Math.round(nav.width) === 390, nav && `${Math.round(nav.width)}px`);
  check('mobile shows 6 tabs', (await page.locator('nav button').count()) === 6);
  check('home greeting visible on mobile', await page.getByText('Good ').first().isVisible());

  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length > 0 ? 1 : 0);
