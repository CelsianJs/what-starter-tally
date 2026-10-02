import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { clients, seedInvoices } from '../../src/data/invoices.js';

test.beforeEach(async ({ page }) => {
  page.consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource: the server responded with a status of 404')) {
      page.consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => page.consoleErrors.push(error.message));
  await page.addInitScript(() => localStorage.removeItem('what-starter-tally-v1'));
});

test.afterEach(async ({ page }) => {
  expect(page.consoleErrors).toEqual([]);
});

test('edits a draft, saves it, exports JSON, opens receipt, and screenshots', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /draft, total, and print/i })).toBeVisible();
  await expect(page.getByText('Subtotal')).toBeVisible();
  await expect(page.getByText('Tax 8.5%')).toBeVisible();
  await expect(page.getByText('Total incl. 8.5% tax')).toBeVisible();

  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Drafts', exact: true }).click();
  await page.getByRole('link', { name: 'October launch system' }).click();
  await expect(page.locator('.action-row').getByRole('link', { name: 'Receipt view' })).toBeVisible();
  if (page.viewportSize().width <= 760) {
    await expect(page.locator('article.line-row').first().getByText('Line total')).toBeVisible();
  } else {
    await expect(page.locator('.line-header').getByText('Line total')).toBeVisible();
  }
  await page.getByLabel('Landing page production quantity').fill('4');
  await expect(page.getByText('Total $4,502.75')).toBeVisible();
  await page.getByRole('button', { name: 'Save draft' }).click();

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  expect((await download).suggestedFilename()).toBe('inv-1007.json');

  await page.getByRole('link', { name: 'Receipt view' }).click();
  await expect(page.getByRole('heading', { name: 'inv-1007' })).toBeVisible();
  await expect(page.getByText('Total $4,502.75')).toBeVisible();

  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Home', exact: true }).click();
  await page.waitForTimeout(350);
  mkdirSync('test-results/screenshots', { recursive: true });
  await page.screenshot({ path: `test-results/screenshots/tally-${testInfo.project.name}.png`, fullPage: false });
});

test('every generated detail route is directly addressable', async ({ page }) => {
  for (const client of clients) {
    await page.goto(`/clients/${client.id}`);
    await expect(page.getByRole('heading', { name: client.name })).toBeVisible();
  }
  for (const invoice of seedInvoices) {
    await page.goto(`/invoices/${invoice.id}`);
    await expect(page.getByRole('heading', { name: invoice.title })).toBeVisible();
    await page.goto(`/receipt/${invoice.id}`);
    await expect(page.getByRole('heading', { name: invoice.id })).toBeVisible();
  }
});

test('storage-denied browsers keep session edits without crashing', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('storage denied by test');
    };
  });
  await page.goto('/invoices/inv-1007');
  await page.getByLabel('Launch QA pass quantity').fill('5');
  await expect(page.getByText(/not saved in this browser/i)).toBeVisible();
  await expect(page.getByText('Total $3,895.15')).toBeVisible();
});

test('invoice line editing preserves focus and DOM identity during continuous typing', async ({ page }) => {
  async function replaceWithKeyboard(locator, value, key) {
    await locator.evaluate((node, marker) => {
      window[marker] = node;
    }, key);
    await locator.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await expect(locator).toBeFocused();
    expect(await locator.evaluate((node, marker) => node === window[marker], key)).toBe(true);
    expect(await page.evaluate((marker) => document.activeElement === window[marker], key)).toBe(true);
    await page.keyboard.type(value);
    await expect(locator).toHaveValue(value);
    await expect(locator).toBeFocused();
    expect(await locator.evaluate((node, marker) => node === window[marker], key)).toBe(true);
    expect(await page.evaluate((marker) => document.activeElement === window[marker], key)).toBe(true);
  }

  await page.goto('/invoices/inv-1007');

  const landingRow = page.locator('.line-row').nth(2);
  await replaceWithKeyboard(landingRow.locator('input').nth(1), '2', '__tallyQtyInput');
  await expect(page.getByText('Total $3,027.15')).toBeVisible();

  const messagingRow = page.locator('.line-row').nth(1);
  await replaceWithKeyboard(messagingRow.locator('input').first(), 'Messaging sprint', '__tallyDescriptionInput');
  await expect(messagingRow.locator('input').first()).toHaveValue('Messaging sprint');

  const qaRow = page.locator('.line-row').nth(3);
  await replaceWithKeyboard(qaRow.locator('input').nth(2), '150', '__tallyUnitPriceInput');
  await expect(page.getByText('Total $3,157.35')).toBeVisible();

  await page.getByRole('button', { name: 'Add line' }).click();
  const newRow = page.locator('.line-row').last();
  await replaceWithKeyboard(newRow.locator('input').first(), 'Retainer support', '__tallyNewLineDescriptionInput');
  await expect(newRow.locator('input').first()).toHaveValue('Retainer support');
});

test('invoice line grid keeps aligned desktop columns and visible mobile labels', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/invoices/inv-1007');

  const columns = await page.locator('article.line-row').evaluateAll((rows) => rows.map((row) => {
    const inputs = row.querySelectorAll('input');
    const total = row.querySelector('strong');
    return {
      qtyLeft: inputs[1].getBoundingClientRect().left,
      unitLeft: inputs[2].getBoundingClientRect().left,
      totalLeft: total.getBoundingClientRect().left,
      totalRight: total.getBoundingClientRect().right,
    };
  }));
  for (const key of ['qtyLeft', 'unitLeft', 'totalLeft', 'totalRight']) {
    const values = columns.map((column) => column[key]);
    expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(1);
  }

  await page.setViewportSize({ width: 390, height: 900 });
  await page.reload();
  await expect(page.locator('.line-header')).toBeHidden();

  const firstLine = page.locator('article.line-row').first();
  await expect(firstLine.getByText('Description')).toBeVisible();
  await expect(firstLine.getByText('Qty')).toBeVisible();
  await expect(firstLine.getByText('Unit price')).toBeVisible();
  await expect(firstLine.getByText('Line total')).toBeVisible();
});

test('unknown route renders fallback and keyboard focus works', async ({ page }) => {
  await page.goto('/not-a-draft');
  await expect(page.getByRole('heading', { name: /not filed/i })).toBeVisible();
  await page.goto('/drafts');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeVisible();
});
