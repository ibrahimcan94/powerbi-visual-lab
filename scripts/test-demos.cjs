const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
(async () => {
  const browser = await chromium.launch({headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge'});
  try {
    const page = await browser.newPage({viewport: {width: 1600, height: 1100}});
    const errors = [], network = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {if (/^https?:/.test(request.url())) network.push(request.url());});
    const open = file => page.goto(pathToFileURL(path.join(root, file)).href);
    await open('START-DEMO.html');
    for (const href of await page.locator('a').evaluateAll(links => links.map(a => a.getAttribute('href')))) {
      await open(href);
      await page.locator('.finance-dashboard').waitFor();
    }
    await open('demos/finance/index.html');
    await page.getByLabel('Reporting close', {exact: true}).waitFor();
    assert(await page.getByLabel('Reporting close', {exact: true}).isEnabled());
    const financeTotal = await page.locator('.fd-kpi-body strong').first().innerText();
    await page.getByLabel('Region', {exact: true}).selectOption('Europe');
    assert.notEqual(await page.locator('.fd-kpi-body strong').first().innerText(), financeTotal);
    await page.getByRole('button', {name: 'Reset filters', exact: true}).click();
    for (const name of ['Receivables', 'Collections', 'Customers', 'Invoices']) {
      await page.locator('nav').getByRole('button', {name, exact: false}).click();
      assert.equal(await page.locator('h1').innerText(), name);
    }
    assert((await page.locator('tbody tr').count()) > 0);
    await open('demos/workforce/index.html');
    const total = () => page.locator('.fd-kpi-body strong').first().innerText();
    assert.equal(await total(), '714');
    await page.locator('.fd-filterbar label').filter({hasText: 'Country'}).locator('select').selectOption('Poland');
    assert(Number(await total()) < 714);
    await page.getByRole('button', {name: 'Reset', exact: true}).click();
    assert.equal(await total(), '714');
    for (const name of ['Organization', 'Workforce mix', 'Tenure & hiring', 'Worker directory', 'Data quality']) {
      await page.locator('nav').getByRole('button', {name, exact: false}).click();
      assert.equal(await page.locator('h1').innerText(), name);
    }
    await page.getByRole('button', {name: 'Dark appearance', exact: false}).click();
    assert.equal(await page.locator('.finance-dashboard.dark').count(), 1);
    await open('demos/workforce/targets.html');
    await page.getByText('932', {exact: true}).first().waitFor();
    await page.getByLabel('Workstream', {exact: true}).selectOption('I2C');
    await page.getByLabel('Director country').selectOption('Costa Rica');
    assert((await page.locator('.wt-kpis').innerText()).includes('142'));
    await page.getByLabel('Reporting month').selectOption('2026-11');
    assert((await page.locator('.wt-kpis').innerText()).includes('—'));
    await page.getByRole('button', {name: 'Dark appearance'}).click();
    assert.equal(await page.locator('.finance-dashboard.dark').count(), 1);
    assert.deepEqual(errors, []);
    assert.deepEqual(network, []);
    console.log('PASS: offline launcher, all three demos, navigation, data, filters, missing actuals, theme; no browser errors or network requests.');
  } finally {await browser.close();}
})().catch(error => {console.error(error); process.exitCode = 1;});
