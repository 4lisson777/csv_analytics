// @ts-check
const { test, expect } = require('playwright/test');
const { mergeFiles, getColumnValues } = require('./helpers');

// Expected merge outcome for file1.csv + file2.csv (key=product_id, sum=total_quantity):
//  P001: 100 + 50  = 150   (in both)
//  P002: 50  + 25  = 75    (in both)
//  P003: 200              (only file1)
//  P004: 75               (only file1)
//  P005: 30  + 15  = 45   (in both)
//  P006: 60               (only file1)
//  P007: 40               (only file2)
//  P008: 10  + 10  = 20   (in both, identical)
// Total: 8 unique rows

test.describe('Merge', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await mergeFiles(page);
  });

  // ── UI ───────────────────────────────────────────────────────────
  test('results card becomes visible', async ({ page }) => {
    await expect(page.locator('#resultsCard')).toBeVisible();
  });

  test('title mentions "Mesclagem"', async ({ page }) => {
    await expect(page.locator('#resultsTitle')).toContainText('Mesclagem');
  });

  test('stats badge shows total row count', async ({ page }) => {
    await expect(page.locator('#statsSection')).toContainText('8 registros');
  });

  test('stats badge shows selected key column', async ({ page }) => {
    await expect(page.locator('#statsSection')).toContainText('product_id');
  });

  test('stats badge shows selected sum column', async ({ page }) => {
    await expect(page.locator('#statsSection')).toContainText('total_quantity');
  });

  test('no legend is shown (merge does not need one)', async ({ page }) => {
    const legend = page.locator('#legendSection .legend');
    await expect(legend).toHaveCount(0);
  });

  test('result table has 8 data rows', async ({ page }) => {
    await expect(page.locator('#resultsTbl tbody tr')).toHaveCount(8);
  });

  test('download button is visible', async ({ page }) => {
    await expect(page.locator('#btnDownload')).toBeVisible();
  });

  // ── Merged values ─────────────────────────────────────────────────
  test('P001 total_quantity is summed to 150', async ({ page }) => {
    const values = await getColumnValues(page, '#resultsTbl', 'total_quantity');
    const ids    = await getColumnValues(page, '#resultsTbl', 'product_id');
    const idx    = ids.indexOf('P001');
    expect(values[idx]).toBe('150');
  });

  test('P002 total_quantity is summed to 75', async ({ page }) => {
    const values = await getColumnValues(page, '#resultsTbl', 'total_quantity');
    const ids    = await getColumnValues(page, '#resultsTbl', 'product_id');
    const idx    = ids.indexOf('P002');
    expect(values[idx]).toBe('75');
  });

  test('P005 total_quantity is summed to 45', async ({ page }) => {
    const values = await getColumnValues(page, '#resultsTbl', 'total_quantity');
    const ids    = await getColumnValues(page, '#resultsTbl', 'product_id');
    const idx    = ids.indexOf('P005');
    expect(values[idx]).toBe('45');
  });

  test('P008 total_quantity is summed to 20 (same key in both files)', async ({ page }) => {
    const values = await getColumnValues(page, '#resultsTbl', 'total_quantity');
    const ids    = await getColumnValues(page, '#resultsTbl', 'product_id');
    const idx    = ids.indexOf('P008');
    expect(values[idx]).toBe('20');
  });

  test('P003 is preserved from file 1 only', async ({ page }) => {
    const ids = await getColumnValues(page, '#resultsTbl', 'product_id');
    expect(ids).toContain('P003');
  });

  test('P007 is added from file 2 only', async ({ page }) => {
    const ids = await getColumnValues(page, '#resultsTbl', 'product_id');
    expect(ids).toContain('P007');
  });

  test('P003 total_quantity unchanged at 200 (only in file 1)', async ({ page }) => {
    const values = await getColumnValues(page, '#resultsTbl', 'total_quantity');
    const ids    = await getColumnValues(page, '#resultsTbl', 'product_id');
    const idx    = ids.indexOf('P003');
    expect(values[idx]).toBe('200');
  });

  test('P001 product_name kept from file 1', async ({ page }) => {
    const names = await getColumnValues(page, '#resultsTbl', 'product_name');
    const ids   = await getColumnValues(page, '#resultsTbl', 'product_id');
    const idx   = ids.indexOf('P001');
    expect(names[idx]).toBe('Widget A');
  });

  // ── Column completeness ───────────────────────────────────────────
  test('result table contains all expected columns', async ({ page }) => {
    const headers = await page.locator('#resultsTbl thead th').allTextContents();
    expect(headers).toEqual(
      expect.arrayContaining(['product_id', 'product_name', 'total_quantity', 'price']),
    );
  });

  test('no duplicate product_id rows in result', async ({ page }) => {
    const ids = await getColumnValues(page, '#resultsTbl', 'product_id');
    expect(ids.length).toBe(new Set(ids).size);
  });
});
