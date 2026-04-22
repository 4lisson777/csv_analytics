import { state } from './state.js';
import { $, allFields, esc, buildTable, showResults } from './utils.js';
import { getSumCols } from './controls.js';
import { updateStatusBar } from './upload.js';

export function mergeCSVs() {
  const keyCol  = $('keyCol').value;
  const sumCols = getSumCols();

  if (!keyCol) { alert('Selecione a coluna-chave.'); return; }

  const map1 = new Map(state.data1.map(r => [String(r[keyCol] ?? ''), r]));
  const map2 = new Map(state.data2.map(r => [String(r[keyCol] ?? ''), r]));
  const allKeys = new Set([...map1.keys(), ...map2.keys()]);

  const baseCols = allFields(state.data1, state.data2);
  const sumSet   = new Set(sumCols);

  const outCols = [];
  baseCols.forEach(c => {
    if (sumSet.has(c)) outCols.push(`${c}_1`, `${c}_2`, `${c}_sum`);
    else               outCols.push(c);
  });

  const rows = [];
  allKeys.forEach(key => {
    const r1 = map1.get(key);
    const r2 = map2.get(key);
    const row = {};

    baseCols.forEach(c => {
      if (sumSet.has(c)) {
        const v1 = r1?.[c] ?? '';
        const v2 = r2?.[c] ?? '';
        row[`${c}_1`] = v1;
        row[`${c}_2`] = v2;
        row[`${c}_sum`] = (parseFloat(v1) || 0) + (parseFloat(v2) || 0);
      } else {
        row[c] = r1?.[c] ?? r2?.[c] ?? '';
      }
    });
    rows.push(row);
  });

  state.resultRows = rows;
  state.resultMode = 'merge';

  const sumBadge = sumCols.length
    ? `<span class="badge badge-gray"><span class="k">soma</span><span class="v">${sumCols.map(esc).join(', ')}</span></span>`
    : '';

  $('legendSection').innerHTML = '';
  $('statsSection').innerHTML = `
    <span class="badge badge-gray"><span class="k">total</span><span class="v">${rows.length} registros</span></span>
    <span class="badge badge-gray"><span class="k">chave</span><span class="v">${esc(keyCol)}</span></span>
    ${sumBadge}
  `;

  $('resultsTitle').innerHTML =
    `Resultado da Mesclagem <span class="count">— ${rows.length} registros</span>`;

  $('resultsTbl').innerHTML = buildTable(outCols, rows);

  const crumbRes = $('crumbResult');
  if (crumbRes) crumbRes.textContent = 'mesclagem';

  showResults();
  updateStatusBar();
}
