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
  const frameRatio = frame ? frame.width / frame.height : 0;
  check('frame keeps 390:844 phone ratio', Math.abs(frameRatio - 390 / 844) < 0.01, frame && `${Math.round(frame.width)}x${Math.round(frame.height)}`);
  check('branding sits left of frame', brand && frame && brand.x + brand.width < frame.x);

  // Home content
  check('home greeting visible', await page.getByText('Good ').first().isVisible());
  const p0 = await pointsText(page);
  check('home shows 340 starting points', p0.trim() === '340', p0.trim());
  check('home has NO streak', (await page.getByText(/streak/i).count()) === 0);
  check('home has NO friend activity', (await page.getByText('Maya', { exact: false }).count()) === 0);
  check('home has NO continue-hunt card', (await page.getByText(/Continue your hunt|Your next hunt/i).count()) === 0);

  // Featured challenge = Fitzwilliam scavenger hunt → +200 (+50 level-up bonus: 140+150 XP crosses 250)
  await page.getByRole('button', { name: /Start challenge/ }).click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Complete Quest' }).click();
  await page.waitForTimeout(1700);
  const p1 = await pointsText(page);
  check('featured quest adds +250 incl. level-up bonus', p1.trim() === '590', `${p0.trim()} → ${p1.trim()}`);
  await page.getByRole('button', { name: 'Keep exploring' }).click();
  await page.waitForTimeout(500);
  const lvl = page.getByRole('button', { name: 'Continue' });
  if (await lvl.isVisible().catch(() => false)) {
    check('level-up modal shown after quest', true);
    await lvl.click();
    await page.waitForTimeout(400);
  } else {
    check('level-up modal shown after quest', false);
  }

  // Explore: Leaflet map + pins
  await page.locator('nav button', { hasText: 'Explore' }).click();
  await page.waitForTimeout(1500);
  check('leaflet map container present', await page.locator('.leaflet-container').isVisible());
  check('no radar pulse animation', (await page.locator('.animate-radar').count()) === 0);
  const allPins = await page.locator('.cq-pin-wrap').count();
  check('8 venue pins on the map', allPins === 8, `${allPins} pins`);
  await page.getByRole('button', { name: 'Museums' }).click();
  await page.waitForTimeout(500);
  const museumPins = await page.locator('.cq-pin-wrap').count();
  check('Museums filter leaves 4 pins', museumPins === 4, `${museumPins} pins`);
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.waitForTimeout(500);

  // Bookmark a quest from the Fitzwilliam venue sheet
  await page.locator('.cq-pin-wrap').first().click();
  await page.waitForTimeout(700);
  await page.getByRole('button', { name: 'Bookmark quest' }).first().click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Close' }).first().click();
  await page.waitForTimeout(400);

  // Quests tab: bookmarked quest appears
  await page.locator('nav button', { hasText: 'Quests' }).click();
  await page.waitForTimeout(700);
  check('bookmarked quest visible in Quests', await page.getByText('Treasures of Antiquity Scavenger Hunt', { exact: false }).first().isVisible());

  // Booking → +60 (Gardens filter → Botanic Garden pin)
  await page.locator('nav button', { hasText: 'Explore' }).click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Gardens' }).click();
  await page.waitForTimeout(500);
  await page.locator('.cq-pin-wrap').first().click();
  await page.waitForTimeout(700);
  await page.getByRole('button', { name: /Book visit/ }).click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: /Confirm booking/ }).click();
  await page.waitForTimeout(1200);
  const p2 = await pointsText(page);
  check('booking adds +60 points', p2.trim() === '650', `${p1.trim()} → ${p2.trim()}`);
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
  check('redeem deducts -150 points', p3.trim() === '500', `${p2.trim()} → ${p3.trim()}`);
  check('voucher shows CQ- code', await page.locator('text=/CQ-[A-Z0-9]{4}/').first().isVisible());
  await page.getByRole('button', { name: 'Close' }).first().click();
  await page.waitForTimeout(300);

  // Profile: no streak section
  await page.locator('nav button', { hasText: 'You' }).click();
  await page.waitForTimeout(600);
  check('profile has NO streak section', (await page.getByText('Daily streak').count()) === 0);
  check('profile keeps friend activity', await page.getByText('Maya', { exact: false }).first().isVisible());

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
  check('mobile shows 5 tabs', (await page.locator('nav button').count()) === 5);
  check('home greeting visible on mobile', await page.getByText('Good ').first().isVisible());
  await page.locator('nav button', { hasText: 'Explore' }).click();
  await page.waitForTimeout(1500);
  check('mobile map renders leaflet', await page.locator('.leaflet-container').isVisible());

  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length > 0 ? 1 : 0);
