// @ts-check
const { test, expect } = require('@playwright/test');
const { uploadFile, uploadBoth } = require('./helpers');

test.describe('Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ── Initial state ────────────────────────────────────────────────
  test('renders both drop zones on load', async ({ page }) => {
    await expect(page.locator('#zone1')).toBeVisible();
    await expect(page.locator('#zone2')).toBeVisible();
  });

  test('action buttons are disabled before any upload', async ({ page }) => {
    await expect(page.locator('#btnMerge')).toBeDisabled();
    await expect(page.locator('#btnCompare')).toBeDisabled();
  });

  test('column selects are disabled before any upload', async ({ page }) => {
    await expect(page.locator('#keyCol')).toBeDisabled();
    await expect(page.locator('#sumCol')).toBeDisabled();
  });

  test('results card is hidden on load', async ({ page }) => {
    await expect(page.locator('#resultsCard')).toBeHidden();
  });

  // ── Single file upload ───────────────────────────────────────────
  test('uploading file 1 marks its zone as has-file', async ({ page }) => {
    await uploadFile(page, 1, 'file1.csv');
    await expect(page.locator('#zone1')).toHaveClass(/has-file/);
  });

  test('uploading file 1 shows its filename', async ({ page }) => {
    await uploadFile(page, 1, 'file1.csv');
    await expect(page.locator('#name1')).toContainText('file1.csv');
  });

  test('uploading file 2 marks its zone as has-file', async ({ page }) => {
    await uploadFile(page, 2, 'file2.csv');
    await expect(page.locator('#zone2')).toHaveClass(/has-file/);
  });

  test('uploading file 2 shows its filename', async ({ page }) => {
    await uploadFile(page, 2, 'file2.csv');
    await expect(page.locator('#name2')).toContainText('file2.csv');
  });

  // ── Preview table ────────────────────────────────────────────────
  test('preview 1 is visible after upload', async ({ page }) => {
    await uploadFile(page, 1, 'file1.csv');
    await expect(page.locator('#preview1')).toBeVisible();
  });

  test('preview 1 shows at most 5 rows', async ({ page }) => {
    await uploadFile(page, 1, 'file1.csv');
    const rows = page.locator('#prevTbl1 tbody tr');
    await expect(rows).toHaveCount(5);
  });

  test('preview 1 shows all CSV column headers', async ({ page }) => {
    await uploadFile(page, 1, 'file1.csv');
    const headers = page.locator('#prevTbl1 thead th');
    const texts = await headers.allTextContents();
    expect(texts).toEqual(expect.arrayContaining(['product_id', 'product_name', 'total_quantity', 'price']));
  });

  test('preview 2 shows at most 5 rows', async ({ page }) => {
    await uploadFile(page, 2, 'file2.csv');
    const rows = page.locator('#prevTbl2 tbody tr');
    await expect(rows).toHaveCount(5);
  });

  test('preview 2 shows correct first row data', async ({ page }) => {
    await uploadFile(page, 2, 'file2.csv');
    const firstRow = page.locator('#prevTbl2 tbody tr:first-child td');
    const cells = await firstRow.allTextContents();
    expect(cells[0]).toBe('P001');
    expect(cells[1]).toBe('Widget A');
    expect(cells[2]).toBe('50');
  });

  // ── Both files uploaded ───────────────────────────────────────────
  test('buttons enable after both files are uploaded', async ({ page }) => {
    await uploadBoth(page);
    await expect(page.locator('#btnMerge')).toBeEnabled();
    await expect(page.locator('#btnCompare')).toBeEnabled();
  });

  test('column selects enable after both files are uploaded', async ({ page }) => {
    await uploadBoth(page);
    await expect(page.locator('#keyCol')).toBeEnabled();
    await expect(page.locator('#sumCol')).toBeEnabled();
  });

  test('key column select contains all CSV headers', async ({ page }) => {
    await uploadBoth(page);
    const options = await page.locator('#keyCol option').allTextContents();
    expect(options).toEqual(expect.arrayContaining(['product_id', 'product_name', 'total_quantity', 'price']));
  });

  test('auto-selects key column containing "id"', async ({ page }) => {
    await uploadBoth(page);
    await expect(page.locator('#keyCol')).toHaveValue('product_id');
  });

  test('auto-selects sum column containing "quantity"', async ({ page }) => {
    await uploadBoth(page);
    await expect(page.locator('#sumCol')).toHaveValue('total_quantity');
  });

  // ── Drag-over visual state ────────────────────────────────────────
  test('zone gains drag-over class on dragover event', async ({ page }) => {
    await page.locator('#zone1').dispatchEvent('dragover', {
      dataTransfer: await page.evaluateHandle(() => new DataTransfer()),
    });
    await expect(page.locator('#zone1')).toHaveClass(/drag-over/);
  });

  test('zone loses drag-over class on dragleave', async ({ page }) => {
    const zone = page.locator('#zone1');
    await zone.dispatchEvent('dragover', {
      dataTransfer: await page.evaluateHandle(() => new DataTransfer()),
    });
    await zone.dispatchEvent('dragleave');
    await expect(zone).not.toHaveClass(/drag-over/);
  });
});
