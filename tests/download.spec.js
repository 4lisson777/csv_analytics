// @ts-check
const { test, expect } = require('playwright/test');
const { mergeFiles, compareFiles } = require('./helpers');

test.describe('Download', () => {
  // ── Merge download ────────────────────────────────────────────────
  test('merge result downloads a .csv file with the correct filename', async ({ page }) => {
    await page.goto('/');
    await mergeFiles(page);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#btnDownload').click(),
    ]);

    expect(download.suggestedFilename()).toBe('resultado_mesclagem.csv');
  });

  test('merge CSV download contains a header row and 8 data rows', async ({ page }) => {
    await page.goto('/');
    await mergeFiles(page);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#btnDownload').click(),
    ]);

    const content = await download.path().then(p => require('fs').promises.readFile(p, 'utf-8'));
    const lines   = content.trim().split('\n').filter(Boolean);

    // 1 header + 8 data rows
    expect(lines.length).toBe(9);
  });

  test('merge CSV download does not contain a _status column', async ({ page }) => {
    await page.goto('/');
    await mergeFiles(page);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#btnDownload').click(),
    ]);

    const content = await download.path().then(p => require('fs').promises.readFile(p, 'utf-8'));
    expect(content).not.toContain('_status');
    expect(content).not.toContain('_cls');
  });

  test('merge CSV header contains expected columns', async ({ page }) => {
    await page.goto('/');
    await mergeFiles(page);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#btnDownload').click(),
    ]);

    const content = await download.path().then(p => require('fs').promises.readFile(p, 'utf-8'));
    // Strip BOM if present
    const header  = content.replace(/^﻿/, '').split('\n')[0];
    expect(header).toContain('product_id');
    expect(header).toContain('total_quantity');
  });

  test('merge CSV contains summed value for P001 (150)', async ({ page }) => {
    await page.goto('/');
    await mergeFiles(page);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#btnDownload').click(),
    ]);

    const content = await download.path().then(p => require('fs').promises.readFile(p, 'utf-8'));
    expect(content).toContain('P001');
    expect(content).toContain('150');
  });

  // ── Compare download ──────────────────────────────────────────────
  test('compare result downloads a .csv file with the correct filename', async ({ page }) => {
    await page.goto('/');
    await compareFiles(page);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#btnDownload').click(),
    ]);

    expect(download.suggestedFilename()).toBe('resultado_comparacao.csv');
  });

  test('compare CSV download contains a header row and 8 data rows', async ({ page }) => {
    await page.goto('/');
    await compareFiles(page);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#btnDownload').click(),
    ]);

    const content = await download.path().then(p => require('fs').promises.readFile(p, 'utf-8'));
    const lines   = content.trim().split('\n').filter(Boolean);

    // 1 header + 8 data rows
    expect(lines.length).toBe(9);
  });

  test('compare CSV download does not contain internal _cls column', async ({ page }) => {
    await page.goto('/');
    await compareFiles(page);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#btnDownload').click(),
    ]);

    const content = await download.path().then(p => require('fs').promises.readFile(p, 'utf-8'));
    expect(content).not.toContain('_cls');
  });

  test('compare CSV includes the Status column', async ({ page }) => {
    await page.goto('/');
    await compareFiles(page);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#btnDownload').click(),
    ]);

    const content = await download.path().then(p => require('fs').promises.readFile(p, 'utf-8'));
    const header  = content.replace(/^﻿/, '').split('\n')[0];
    expect(header).toContain('Status');
  });
});
