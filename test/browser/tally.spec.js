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

  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Drafts', exact: true }).click();
  await page.getByRole('link', { name: 'October launch system' }).click();
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

test('unknown route renders fallback and keyboard focus works', async ({ page }) => {
  await page.goto('/not-a-draft');
  await expect(page.getByRole('heading', { name: /not filed/i })).toBeVisible();
  await page.goto('/drafts');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeVisible();
});
