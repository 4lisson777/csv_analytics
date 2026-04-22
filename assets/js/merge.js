import { state } from './state.js';
import { $, allFields, esc, buildTable, showResults } from './utils.js';

export function mergeCSVs() {
  const keyCol = $('keyCol').value;
  const sumCol = $('sumCol').value;

  if (!keyCol) { alert('Selecione a coluna-chave.');            return; }
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
    <div class="stats-bar">
      <span class="badge badge-gray">📋 Total: ${state.resultRows.length} registros</span>
      <span class="badge badge-gray">🔑 Chave: ${esc(keyCol)}</span>
      <span class="badge badge-gray">➕ Soma: ${esc(sumCol)}</span>
    </div>`;

  $('resultsTitle').textContent = `🔀 Resultado da Mesclagem — ${state.resultRows.length} registros`;
  $('resultsTbl').innerHTML = buildTable(cols, state.resultRows);
  showResults();
}
