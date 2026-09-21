import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
const origin = process.env.PREVIEW_TEST_ORIGIN ?? 'http://127.0.0.1:3102';
const password = process.env.PREVIEW_TEST_PASSWORD;
assert.ok(password, 'Provide PREVIEW_TEST_PASSWORD without logging it.');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const home = await page.goto(origin);
  assert.equal(home.status(), 200);
  await page.getByText('Coming soon', { exact: true }).waitFor();
  assert.equal(await page.locator('#benefits').count(), 0);
  for (const path of ['/home', '/features', '/account', '/admin', '/marketing/happy-pillow-mascot.png', '/sitemap.xml']) {
    const response = await context.request.get(origin + path, { maxRedirects: 0 });
    assert.equal(response.status(), 307, path);
    assert.match(response.headers().location, /\/login\?next=/, path);
    assert.match(response.headers()['x-robots-tag'], /noindex/, path);
  }
  const spoof = await context.request.get(origin + '/home', { maxRedirects: 0, headers: { 'x-bubs-full-home': '1' } });
  assert.equal(spoof.status(), 307);
  assert.equal((await context.request.get(origin + '/api/voice-demo/session')).status(), 401);
  assert.ok([400, 401, 404].includes((await context.request.get(origin + '/_next/image?url=%2Fmarketing%2Fhappy-pillow-mascot.png&w=640&q=75')).status()));
  assert.equal((await context.request.get(origin + '/marketing/coastal-owner.png')).status(), 200);
  const robots = await (await context.request.get(origin + '/robots.txt')).text();
  assert.match(robots, /Disallow: \/\s/);
  await page.goto(origin + '/login?next=%2Fhome');
  await page.getByLabel('Password', { exact: true }).fill('incorrect-test-password');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByText("That password isn't right.").waitFor();
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForURL(origin + '/home');
  await page.locator('#benefits').waitFor({ state: 'attached' });
  const privateResponse = await page.reload();
  assert.match(privateResponse.headers()['x-robots-tag'], /noindex/);
  assert.match(privateResponse.headers()['cache-control'], /private|no-store/);
  await page.goto(origin + '/admin');
  assert.equal(new URL(page.url()).pathname, '/admin/login');
  await page.goto(origin);
  await page.getByText('Coming soon', { exact: true }).waitFor();
  console.log('PASS: public splash, private routes/assets, forged header rejection, wrong/correct passwords, crawler rules, private caching and separate staff login.');
} finally { await browser.close(); }
