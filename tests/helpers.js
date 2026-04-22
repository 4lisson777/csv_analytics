const path = require('path');

const FIXTURES = path.join(__dirname, 'fixtures');

/**
 * Upload a fixture CSV file into a numbered drop zone.
 * Uses setInputFiles on the hidden <input type="file"> overlaid on the zone.
 */
async function uploadFile(page, zoneNum, filename) {
  const input = page.locator(`#input${zoneNum}`);
  await input.setInputFiles(path.join(FIXTURES, filename));
  // Wait for the preview to appear, confirming PapaParse finished
  await page.locator(`#preview${zoneNum}`).waitFor({ state: 'visible' });
}

/**
 * Upload both fixture files and wait for both previews to be visible.
 */
async function uploadBoth(page) {
  await uploadFile(page, 1, 'file1.csv');
  await uploadFile(page, 2, 'file2.csv');
}

/**
 * Upload both files and click the Mesclar button.
 */
async function mergeFiles(page) {
  await uploadBoth(page);
  await page.locator('#btnMerge').click();
  await page.locator('#resultsCard').waitFor({ state: 'visible' });
}

/**
 * Upload both files and click the Comparar button.
 */
async function compareFiles(page) {
  await uploadBoth(page);
  await page.locator('#btnCompare').click();
  await page.locator('#resultsCard').waitFor({ state: 'visible' });
}

/**
 * Return the text of every cell in a given column (by header name) from a table.
 */
async function getColumnValues(page, tableSelector, headerName) {
  const headers = await page.locator(`${tableSelector} thead th`).allTextContents();
  const colIndex = headers.indexOf(headerName);
  if (colIndex === -1) throw new Error(`Column "${headerName}" not found`);
  const cells = page.locator(`${tableSelector} tbody tr td:nth-child(${colIndex + 1})`);
  return cells.allTextContents();
}

/**
 * Return the CSS class list of every body row in a table.
 */
async function getRowClasses(page, tableSelector) {
  return page.locator(`${tableSelector} tbody tr`).evaluateAll(
    rows => rows.map(r => r.className),
  );
}

module.exports = { uploadFile, uploadBoth, mergeFiles, compareFiles, getColumnValues, getRowClasses, FIXTURES };
