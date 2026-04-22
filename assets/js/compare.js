import { state } from './state.js';
import { $, allFields, buildTable, showResults } from './utils.js';
import { getSumCols } from './controls.js';

export function compareCSVs() {
  const keyCol    = $('keyCol').value;
  const deltaCols = getSumCols();
  if (!keyCol) { alert('Selecione a coluna-chave.'); return; }

  const map1    = new Map(state.data1.map(r => [String(r[keyCol] ?? ''), r]));
  const map2    = new Map(state.data2.map(r => [String(r[keyCol] ?? ''), r]));
  const allKeys = new Set([...map1.keys(), ...map2.keys()]);
  const cols    = allFields(state.data1, state.data2);

  const deltaSet = new Set(deltaCols);

  let c1 = 0, c2 = 0, cdiff = 0, csame = 0;
  const rows = [];

  const addDeltas = (row, r1, r2) => {
    deltaCols.forEach(dc => {
      row[`Δ ${dc}`] = (r1 && r2) ? formatDelta(r1[dc], r2[dc]) : '';
    });
  };

  allKeys.forEach(key => {
    const r1 = map1.get(key);
    const r2 = map2.get(key);

    if (r1 && !r2) {
      const row = { _cls: 'only-file1', _status: 'Apenas Arquivo 1', ...r1 };
      addDeltas(row, r1, null);
      rows.push(row);
      c1++;
    } else if (!r1 && r2) {
      const row = { _cls: 'only-file2', _status: 'Apenas Arquivo 2', ...r2 };
      addDeltas(row, null, r2);
      rows.push(row);
      c2++;
    } else {
      const identical = cols.every(c => String(r1[c] ?? '') === String(r2[c] ?? ''));
      if (identical) {
        const row = { _cls: 'identical', _status: 'Idêntico', ...r1 };
        addDeltas(row, r1, r2);
        rows.push(row);
        csame++;
      } else {
        const merged = { _cls: 'diff-values', _status: 'Diferente' };
        cols.forEach(c => {
          const v1 = String(r1[c] ?? ''), v2 = String(r2[c] ?? '');
          merged[c] = v1 === v2 ? v1 : `${v1} → ${v2}`;
        });
        addDeltas(merged, r1, r2);
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

  const displayCols = [];
  cols.forEach(c => {
    displayCols.push(c);
    if (deltaSet.has(c)) displayCols.push(`Δ ${c}`);
  });
  displayCols.push('_status');

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

function formatDelta(a, b) {
  const n1 = parseFloat(a);
  const n2 = parseFloat(b);
  if (Number.isNaN(n1) || Number.isNaN(n2)) return '';
  const d = n2 - n1;
  if (d === 0) return '0';
  return d > 0 ? `+${d}` : String(d);
}
