import { state } from './state.js';
import { $, allFields, esc, buildTable, showResults } from './utils.js';
import { updateStatusBar } from './upload.js';

export function mergeCSVs() {
  const keyCol = $('keyCol').value;
  const sumCol = $('sumCol').value;

  if (!keyCol) { alert('Selecione a coluna-chave.');              return; }
  if (!sumCol) { alert('Selecione a coluna numérica para soma.'); return; }

  const map = new Map();
  state.data1.forEach(r => map.set(String(r[keyCol] ?? ''), { ...r }));

  state.data2.forEach(r => {
    const k = String(r[keyCol] ?? '');
    if (map.has(k)) {
      const base = map.get(k);
      base[sumCol] = (parseFloat(base[sumCol]) || 0) + (parseFloat(r[sumCol]) || 0);
    } else {
      map.set(k, { ...r });
    }
  });

  const cols = allFields(state.data1, state.data2);
  state.resultRows = Array.from(map.values());
  state.resultMode = 'merge';

  $('legendSection').innerHTML = '';
  $('statsSection').innerHTML = `
    <span class="badge badge-gray"><span class="k">total</span><span class="v">${state.resultRows.length} registros</span></span>
    <span class="badge badge-gray"><span class="k">chave</span><span class="v">${esc(keyCol)}</span></span>
    <span class="badge badge-gray"><span class="k">soma</span><span class="v">${esc(sumCol)}</span></span>
  `;

  $('resultsTitle').innerHTML =
    `Resultado da Mesclagem <span class="count">— ${state.resultRows.length} registros</span>`;

  $('resultsTbl').innerHTML = buildTable(cols, state.resultRows);

  const crumbRes = $('crumbResult');
  if (crumbRes) crumbRes.textContent = 'mesclagem';

  showResults();
  updateStatusBar();
}
