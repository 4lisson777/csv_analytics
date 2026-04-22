// @ts-check
const { test, expect } = require('playwright/test');
const { compareFiles, getColumnValues, getRowClasses } = require('./helpers');

// Expected compare outcome for file1.csv vs file2.csv (key=product_id):
//  P001: diff-values  (qty 100 vs 50)
//  P002: diff-values  (qty 50  vs 25)
//  P003: only-file1   (not in file2)
//  P004: only-file1   (not in file2)
//  P005: diff-values  (qty 30  vs 15)
//  P006: only-file1   (not in file2)
//  P007: only-file2   (not in file1)
//  P008: identical    (same in both)
// Counts: only1=3, only2=1, diff=3, same=1  (total 8)

test.describe('Compare', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await compareFiles(page);
  });

  // ── UI ────────────────────────────────────────────────────────────
  test('results card becomes visible', async ({ page }) => {
    await expect(page.locator('#resultsCard')).toBeVisible();
  });

  test('title mentions "Comparação"', async ({ page }) => {
    await expect(page.locator('#resultsTitle')).toContainText('Comparação');
  });

  test('legend is shown', async ({ page }) => {
    await expect(page.locator('#legendSection .legend')).toBeVisible();
  });

  test('legend has 4 items', async ({ page }) => {
    await expect(page.locator('#legendSection .legend-item')).toHaveCount(4);
  });

  test('result table has 8 data rows', async ({ page }) => {
    await expect(page.locator('#resultsTbl tbody tr')).toHaveCount(8);
  });

  test('download button is visible', async ({ page }) => {
    await expect(page.locator('#btnDownload')).toBeVisible();
  });

  // ── Stats badges ─────────────────────────────────────────────────
  test('shows count of 3 for only-file1 rows', async ({ page }) => {
    await expect(page.locator('.badge-green')).toContainText('3');
  });

  test('shows count of 1 for only-file2 rows', async ({ page }) => {
    await expect(page.locator('.badge-blue')).toContainText('1');
  });

  test('shows count of 3 for different rows', async ({ page }) => {
    await expect(page.locator('.badge-yellow')).toContainText('3');
  });

  test('shows count of 1 for identical rows', async ({ page }) => {
    await expect(page.locator('.badge-gray')).toContainText('1');
  });

  // ── Row colour classes ────────────────────────────────────────────
  test('P003 row has only-file1 class (green)', async ({ page }) => {
    const ids     = await getColumnValues(page, '#resultsTbl', 'product_id');
    const classes = await getRowClasses(page, '#resultsTbl');
    const idx     = ids.indexOf('P003');
    expect(classes[idx]).toContain('only-file1');
  });

  test('P004 row has only-file1 class (green)', async ({ page }) => {
    const ids     = await getColumnValues(page, '#resultsTbl', 'product_id');
    const classes = await getRowClasses(page, '#resultsTbl');
    const idx     = ids.indexOf('P004');
    expect(classes[idx]).toContain('only-file1');
  });

  test('P006 row has only-file1 class (green)', async ({ page }) => {
    const ids     = await getColumnValues(page, '#resultsTbl', 'product_id');
    const classes = await getRowClasses(page, '#resultsTbl');
    const idx     = ids.indexOf('P006');
    expect(classes[idx]).toContain('only-file1');
  });

  test('P007 row has only-file2 class (blue)', async ({ page }) => {
    const ids     = await getColumnValues(page, '#resultsTbl', 'product_id');
    const classes = await getRowClasses(page, '#resultsTbl');
    const idx     = ids.indexOf('P007');
    expect(classes[idx]).toContain('only-file2');
  });

  test('P001 row has diff-values class (yellow)', async ({ page }) => {
    const ids     = await getColumnValues(page, '#resultsTbl', 'product_id');
    const classes = await getRowClasses(page, '#resultsTbl');
    const idx     = ids.indexOf('P001');
    expect(classes[idx]).toContain('diff-values');
  });

  test('P002 row has diff-values class (yellow)', async ({ page }) => {
    const ids     = await getColumnValues(page, '#resultsTbl', 'product_id');
    const classes = await getRowClasses(page, '#resultsTbl');
    const idx     = ids.indexOf('P002');
    expect(classes[idx]).toContain('diff-values');
  });

  test('P005 row has diff-values class (yellow)', async ({ page }) => {
    const ids     = await getColumnValues(page, '#resultsTbl', 'product_id');
    const classes = await getRowClasses(page, '#resultsTbl');
    const idx     = ids.indexOf('P005');
    expect(classes[idx]).toContain('diff-values');
  });

  test('P008 row has identical class (no colour)', async ({ page }) => {
    const ids     = await getColumnValues(page, '#resultsTbl', 'product_id');
    const classes = await getRowClasses(page, '#resultsTbl');
    const idx     = ids.indexOf('P008');
    expect(classes[idx]).toContain('identical');
  });

  // ── Diff cell content ─────────────────────────────────────────────
  test('P001 total_quantity cell shows "100 → 50"', async ({ page }) => {
    const ids    = await getColumnValues(page, '#resultsTbl', 'product_id');
    const values = await getColumnValues(page, '#resultsTbl', 'total_quantity');
    const idx    = ids.indexOf('P001');
    expect(values[idx]).toBe('100 → 50');
  });

  test('P002 total_quantity cell shows "50 → 25"', async ({ page }) => {
    const ids    = await getColumnValues(page, '#resultsTbl', 'product_id');
    const values = await getColumnValues(page, '#resultsTbl', 'total_quantity');
    const idx    = ids.indexOf('P002');
    expect(values[idx]).toBe('50 → 25');
  });

  // ── Status column ─────────────────────────────────────────────────
  test('Status column shows "Apenas Arquivo 1" for only-file1 rows', async ({ page }) => {
    const ids      = await getColumnValues(page, '#resultsTbl', 'product_id');
    const statuses = await getColumnValues(page, '#resultsTbl', 'Status');
    const idx      = ids.indexOf('P003');
    expect(statuses[idx]).toBe('Apenas Arquivo 1');
  });

  test('Status column shows "Apenas Arquivo 2" for only-file2 rows', async ({ page }) => {
    const ids      = await getColumnValues(page, '#resultsTbl', 'product_id');
    const statuses = await getColumnValues(page, '#resultsTbl', 'Status');
    const idx      = ids.indexOf('P007');
    expect(statuses[idx]).toBe('Apenas Arquivo 2');
  });

  test('Status column shows "Diferente" for diff rows', async ({ page }) => {
    const ids      = await getColumnValues(page, '#resultsTbl', 'product_id');
    const statuses = await getColumnValues(page, '#resultsTbl', 'Status');
    const idx      = ids.indexOf('P001');
    expect(statuses[idx]).toBe('Diferente');
  });

  test('Status column shows "Idêntico" for identical rows', async ({ page }) => {
    const ids      = await getColumnValues(page, '#resultsTbl', 'product_id');
    const statuses = await getColumnValues(page, '#resultsTbl', 'Status');
    const idx      = ids.indexOf('P008');
    expect(statuses[idx]).toBe('Idêntico');
  });

  // ── Sort order ────────────────────────────────────────────────────
  test('rows are sorted: only-file1 first, then only-file2, then diff, then identical', async ({ page }) => {
    const classes = await getRowClasses(page, '#resultsTbl');
    const order   = { 'only-file1': 0, 'only-file2': 1, 'diff-values': 2, 'identical': 3 };
    const nums    = classes.map(cls => {
      for (const [key, val] of Object.entries(order)) {
        if (cls.includes(key)) return val;
      }
      return 99;
    });
    for (let i = 1; i < nums.length; i++) {
      expect(nums[i]).toBeGreaterThanOrEqual(nums[i - 1]);
    }
  });
});
