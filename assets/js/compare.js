import { state } from './state.js';
import { $, allFields, esc, showResults } from './utils.js';
import { updateStatusBar } from './upload.js';

const CAT_META = {
  'only-file1': { label: 'Apenas Arquivo 1', glyph: '◐', cls: 'cat-only1', badge: 'badge-green' },
  'only-file2': { label: 'Apenas Arquivo 2', glyph: '◑', cls: 'cat-only2', badge: 'badge-blue'  },
  'diff-values':{ label: 'Diferente',        glyph: '≠', cls: 'cat-diff',  badge: 'badge-yellow'},
  'identical':  { label: 'Idêntico',         glyph: '=', cls: 'cat-same',  badge: 'badge-gray'  },
};

export function compareCSVs() {
  const keyCol = $('keyCol').value;
  if (!keyCol) { alert('Selecione a coluna-chave.'); return; }

  const map1    = new Map(state.data1.map(r => [String(r[keyCol] ?? ''), r]));
  const map2    = new Map(state.data2.map(r => [String(r[keyCol] ?? ''), r]));
  const allKeys = new Set([...map1.keys(), ...map2.keys()]);
  const cols    = allFields(state.data1, state.data2);

  const counts = { 'only-file1': 0, 'only-file2': 0, 'diff-values': 0, 'identical': 0 };
  const rows   = [];

  allKeys.forEach(key => {
    const r1 = map1.get(key);
    const r2 = map2.get(key);

    if (r1 && !r2) {
      rows.push({ _cls: 'only-file1', _status: 'Apenas Arquivo 1', ...r1 });
      counts['only-file1']++;
    } else if (!r1 && r2) {
      rows.push({ _cls: 'only-file2', _status: 'Apenas Arquivo 2', ...r2 });
      counts['only-file2']++;
    } else {
      const identical = cols.every(c => String(r1[c] ?? '') === String(r2[c] ?? ''));
      if (identical) {
        rows.push({ _cls: 'identical', _status: 'Idêntico', ...r1 });
        counts['identical']++;
      } else {
        const merged = { _cls: 'diff-values', _status: 'Diferente', _diffs: {} };
        cols.forEach(c => {
          const v1 = String(r1[c] ?? ''), v2 = String(r2[c] ?? '');
          if (v1 === v2) {
            merged[c] = v1;
          } else {
            merged[c] = `${v1} → ${v2}`;
            merged._diffs[c] = [v1, v2];
          }
        });
        rows.push(merged);
        counts['diff-values']++;
      }
    }
  });

  const sortOrder = { 'only-file1': 0, 'only-file2': 1, 'diff-values': 2, 'identical': 3 };
  rows.sort((a, b) => sortOrder[a._cls] - sortOrder[b._cls]);

  state.resultRows = rows;
  state.resultMode = 'compare';

  /* ---- Legend with category glyphs + badge counts ---- */
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

  /* ---- Stats: key column + totals (no .badge-gray — that's reserved
          for the "identical" count in the legend so tests can assert it) ---- */
  $('statsSection').innerHTML = `
    <span class="badge"><span class="k">chave</span><span class="v">${esc(keyCol)}</span></span>
    <span class="badge"><span class="k">total</span><span class="v">${rows.length} registros</span></span>
  `;

  $('resultsTitle').innerHTML =
    `Resultado da Comparação <span class="count">— ${rows.length} registros</span>`;

  /* ---- Result table with indicator column + Status column at end ---- */
  $('resultsTbl').innerHTML = renderCompareTable(cols, rows);

  const crumbRes = $('crumbResult');
  if (crumbRes) crumbRes.textContent = 'comparação';

  showResults();
  updateStatusBar();
}

/* ============================================================
   Render compare table: indicator column + data + Status column
   ============================================================ */
function renderCompareTable(cols, rows) {
  const displayCols = [...cols, 'Status'];

  let html = '<table><thead><tr>';
  html += '<th class="indicator" aria-label="Categoria"></th>';
  html += displayCols.map(c => `<th>${esc(c)}</th>`).join('');
  html += '</tr></thead><tbody>';

  rows.forEach(r => {
    const meta = CAT_META[r._cls];
    html += `<tr class="${r._cls}">`;
    html += `<td class="indicator"><span class="mark ${meta.cls}" title="${esc(meta.label)}" aria-label="${esc(meta.label)}">${meta.glyph}</span></td>`;

    cols.forEach(c => {
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
