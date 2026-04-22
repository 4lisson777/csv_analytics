import { state } from './state.js';
import { $, allFields, buildTable, showResults } from './utils.js';

export function compareCSVs() {
  const keyCol = $('keyCol').value;
  if (!keyCol) { alert('Selecione a coluna-chave.'); return; }

  const map1    = new Map(state.data1.map(r => [String(r[keyCol] ?? ''), r]));
  const map2    = new Map(state.data2.map(r => [String(r[keyCol] ?? ''), r]));
  const allKeys = new Set([...map1.keys(), ...map2.keys()]);
  const cols    = allFields(state.data1, state.data2);

  let c1 = 0, c2 = 0, cdiff = 0, csame = 0;
  const rows = [];

  allKeys.forEach(key => {
    const r1 = map1.get(key);
    const r2 = map2.get(key);

    if (r1 && !r2) {
      rows.push({ _cls: 'only-file1', _status: 'Apenas Arquivo 1', ...r1 });
      c1++;
    } else if (!r1 && r2) {
      rows.push({ _cls: 'only-file2', _status: 'Apenas Arquivo 2', ...r2 });
      c2++;
    } else {
      const identical = cols.every(c => String(r1[c] ?? '') === String(r2[c] ?? ''));
      if (identical) {
        rows.push({ _cls: 'identical', _status: 'Idêntico', ...r1 });
        csame++;
      } else {
        const merged = { _cls: 'diff-values', _status: 'Diferente' };
        cols.forEach(c => {
          const v1 = String(r1[c] ?? ''), v2 = String(r2[c] ?? '');
          merged[c] = v1 === v2 ? v1 : `${v1} → ${v2}`;
        });
        rows.push(merged);
        cdiff++;
      }
    }
  });

  const sortOrder = { 'only-file1': 0, 'only-file2': 1, 'diff-values': 2, 'identical': 3 };
  rows.sort((a, b) => sortOrder[a._cls] - sortOrder[b._cls]);

  state.resultRows = rows;
  state.resultMode = 'compare';

  $('legendSection').innerHTML = `
    <div class="legend">
      <div class="legend-item">
        <div class="legend-swatch" style="background:#d4edda;border:1px solid #c3e6cb"></div>
        Apenas no Arquivo 1
      </div>
      <div class="legend-item">
        <div class="legend-swatch" style="background:#cce5ff;border:1px solid #b8daff"></div>
        Apenas no Arquivo 2
      </div>
      <div class="legend-item">
        <div class="legend-swatch" style="background:#fff3cd;border:1px solid #ffeeba"></div>
        Valores diferentes
      </div>
      <div class="legend-item">
        <div class="legend-swatch" style="background:#fff;border:1px solid #ddd"></div>
        Idênticos
      </div>
    </div>`;

  $('statsSection').innerHTML = `
    <div class="stats-bar">
      <span class="badge badge-green">🟢 Apenas Arq. 1: ${c1}</span>
      <span class="badge badge-blue">🔵 Apenas Arq. 2: ${c2}</span>
      <span class="badge badge-yellow">🟡 Diferentes: ${cdiff}</span>
      <span class="badge badge-gray">⚪ Idênticos: ${csame}</span>
    </div>`;

  $('resultsTitle').textContent = `🔍 Resultado da Comparação — ${rows.length} registros`;

  const displayCols = [...cols, '_status'];
  $('resultsTbl').innerHTML = buildTable(
    displayCols.map(c => (c === '_status' ? 'Status' : c)),
    rows.map(r => {
      const out = {};
      displayCols.forEach(c => { out[c === '_status' ? 'Status' : c] = r[c] ?? ''; });
      return { ...out, _cls: r._cls };
    }),
    r => r._cls,
  );

  showResults();
}
