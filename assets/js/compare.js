import { state } from './state.js';
import { $, esc, showResults } from './utils.js';
import { getSumCols, getColumnMappings } from './controls.js';
import { updateStatusBar } from './upload.js';

const CAT_META = {
  'only-file1': { label: 'Apenas Arquivo 1', glyph: '◐', cls: 'cat-only1', badge: 'badge-green' },
  'only-file2': { label: 'Apenas Arquivo 2', glyph: '◑', cls: 'cat-only2', badge: 'badge-blue'  },
  'diff-values':{ label: 'Diferente',        glyph: '≠', cls: 'cat-diff',  badge: 'badge-yellow'},
  'identical':  { label: 'Idêntico',         glyph: '=', cls: 'cat-same',  badge: 'badge-gray'  },
};

export function compareCSVs() {
  const keyCol   = $('keyCol').value;
  const mappings = getColumnMappings();
  const deltaSet = new Set(getSumCols());

  if (!keyCol) { alert('Selecione a coluna-chave.'); return; }
  if (mappings.length === 0) { alert('Adicione ao menos um mapeamento de colunas.'); return; }

  const map1    = new Map(state.data1.map(r => [String(r[keyCol] ?? ''), r]));
  const map2    = new Map(state.data2.map(r => [String(r[keyCol] ?? ''), r]));
  const allKeys = new Set([...map1.keys(), ...map2.keys()]);

  const counts = { 'only-file1': 0, 'only-file2': 0, 'diff-values': 0, 'identical': 0 };
  const rows   = [];

  allKeys.forEach(key => {
    const r1 = map1.get(key);
    const r2 = map2.get(key);

    if (r1 && !r2) {
      const row = { _cls: 'only-file1', _status: 'Apenas Arquivo 1', [keyCol]: key };
      mappings.forEach(({ col1 }) => {
        row[col1] = r1[col1] ?? '';
        if (deltaSet.has(col1)) row[`Δ ${col1}`] = '';
      });
      rows.push(row);
      counts['only-file1']++;

    } else if (!r1 && r2) {
      const row = { _cls: 'only-file2', _status: 'Apenas Arquivo 2', [keyCol]: key };
      mappings.forEach(({ col1, col2 }) => {
        row[col1] = r2[col2] ?? '';
        if (deltaSet.has(col1)) row[`Δ ${col1}`] = '';
      });
      rows.push(row);
      counts['only-file2']++;

    } else {
      const identical = mappings.every(({ col1, col2 }) =>
        String(r1[col1] ?? '') === String(r2[col2] ?? '')
      );

      if (identical) {
        const row = { _cls: 'identical', _status: 'Idêntico', [keyCol]: key };
        mappings.forEach(({ col1, col2 }) => {
          row[col1] = r1[col1] ?? '';
          if (deltaSet.has(col1)) row[`Δ ${col1}`] = formatDelta(r1[col1], r2[col2]);
        });
        rows.push(row);
        counts['identical']++;

      } else {
        const row = { _cls: 'diff-values', _status: 'Diferente', _diffs: {}, [keyCol]: key };
        mappings.forEach(({ col1, col2 }) => {
          const v1 = String(r1[col1] ?? '');
          const v2 = String(r2[col2] ?? '');
          if (v1 === v2) {
            row[col1] = v1;
          } else {
            row[col1] = `${v1} → ${v2}`;
            row._diffs[col1] = [v1, v2];
          }
          if (deltaSet.has(col1)) row[`Δ ${col1}`] = formatDelta(r1[col1], r2[col2]);
        });
        rows.push(row);
        counts['diff-values']++;
      }
    }
  });

  const sortOrder = { 'only-file1': 0, 'only-file2': 1, 'diff-values': 2, 'identical': 3 };
  rows.sort((a, b) => sortOrder[a._cls] - sortOrder[b._cls]);

  state.resultRows = rows;
  state.resultMode = 'compare';

  $('legendSection').innerHTML = `
    <div class="legend">
      ${['only-file1', 'only-file2', 'diff-values', 'identical'].map(cat => {
        const m = CAT_META[cat];
        return `
          <div class="legend-item">
            <span class="mark ${m.cls}" aria-hidden="true">${m.glyph}</span>
            <span class="lbl">${esc(m.label)}</span>
            <span class="badge ${m.badge}">${counts[cat]}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;

  const mappingLabels = mappings.map(({ col1, col2 }) =>
    col1 === col2 ? esc(col1) : `${esc(col1)} → ${esc(col2)}`
  ).join(', ');

  $('statsSection').innerHTML = `
    <span class="badge"><span class="k">chave</span><span class="v">${esc(keyCol)}</span></span>
    <span class="badge"><span class="k">colunas</span><span class="v">${mappingLabels}</span></span>
    <span class="badge"><span class="k">total</span><span class="v">${rows.length} registros</span></span>
  `;

  $('resultsTitle').innerHTML =
    `Resultado da Comparação <span class="count">— ${rows.length} registros</span>`;

  const displayCols = [keyCol];
  mappings.forEach(({ col1 }) => {
    displayCols.push(col1);
    if (deltaSet.has(col1)) displayCols.push(`Δ ${col1}`);
  });

  $('resultsTbl').innerHTML = renderCompareTable(displayCols, rows);

  const crumbRes = $('crumbResult');
  if (crumbRes) crumbRes.textContent = 'comparação';

  showResults();
  updateStatusBar();
}

function renderCompareTable(displayCols, rows) {
  let html = '<table><thead><tr>';
  html += '<th class="indicator" aria-label="Categoria"></th>';
  html += displayCols.map(c => `<th>${esc(c)}</th>`).join('');
  html += '<th>Status</th>';
  html += '</tr></thead><tbody>';

  rows.forEach(r => {
    const meta = CAT_META[r._cls];
    html += `<tr class="${r._cls}">`;
    html += `<td class="indicator"><span class="mark ${meta.cls}" title="${esc(meta.label)}" aria-label="${esc(meta.label)}">${meta.glyph}</span></td>`;

    displayCols.forEach(c => {
      const val = r[c] ?? '';
      if (r._diffs && r._diffs[c]) {
        const [a, b] = r._diffs[c];
        html += `<td><span class="diff-cell"><span class="old">${esc(a || '∅')}</span> <span class="arr">→</span> <span class="new">${esc(b || '∅')}</span></span></td>`;
      } else {
        html += `<td>${esc(val)}</td>`;
      }
    });

    html += `<td>${esc(r._status)}</td>`;
    html += '</tr>';
  });

  return html + '</tbody></table>';
}

function formatDelta(a, b) {
  const n1 = parseFloat(a);
  const n2 = parseFloat(b);
  if (Number.isNaN(n1) || Number.isNaN(n2)) return '';
  const d = n2 - n1;
  if (d === 0) return '0';
  return d > 0 ? `+${d}` : String(d);
}
