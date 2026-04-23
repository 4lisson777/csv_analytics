import { state } from './state.js';
import { $, fields, esc } from './utils.js';

const SUM_REGEX = /qty|quant|total|valor|amount|price|preco/i;

export function refreshControls() {
  if (!state.data1 || !state.data2) return;

  const cols1   = fields(state.data1);
  const cols2   = fields(state.data2);
  const cols    = [...new Set([...cols1, ...cols2])];
  const autoKey = cols.find(c => /id|cod|sku|code/i.test(c)) ?? cols[0];
  const autoSum = cols.find(c => SUM_REGEX.test(c));

  fillSelect('keyCol', cols, autoKey);
  renderSumCheckboxes(cols, autoSum ? [autoSum] : []);
  refreshColumnMappings();

  $('btnMerge').disabled   = false;
  $('btnCompare').disabled = false;
}

export function initMappingButton() {
  $('btnAddMapping').addEventListener('click', () => {
    if (!state.data1 || !state.data2) return;
    const cols1 = fields(state.data1);
    const cols2 = fields(state.data2);
    addMappingRow(cols1[0] ?? '', cols2[0] ?? '', cols1, cols2);
  });
}

export function getSumCols() {
  return [...document.querySelectorAll('#sumCols input[type=checkbox]:checked')]
    .map(el => el.value);
}

export function getColumnMappings() {
  return [...document.querySelectorAll('.mapping-row')].map(row => ({
    col1: row.querySelector('.map-col1').value,
    col2: row.querySelector('.map-col2').value,
  })).filter(m => m.col1 && m.col2);
}

function refreshColumnMappings() {
  const cols1  = fields(state.data1);
  const cols2  = fields(state.data2);
  const keyCol = $('keyCol').value;

  const nonKeyCols1 = cols1.filter(c => c !== keyCol);
  const nonKeyCols2 = cols2.filter(c => c !== keyCol);

  const matched = nonKeyCols1.filter(c => nonKeyCols2.includes(c));
  const autoMappings = matched.length
    ? matched.map(c => ({ col1: c, col2: c }))
    : [{ col1: nonKeyCols1[0] ?? cols1[0], col2: nonKeyCols2[0] ?? cols2[0] }];

  const container = $('colMappings');
  container.innerHTML = '';
  autoMappings.forEach(m => addMappingRow(m.col1, m.col2, cols1, cols2));

  $('colMappingField').style.display = '';
}

function addMappingRow(col1, col2, cols1, cols2) {
  const row = document.createElement('div');
  row.className = 'mapping-row';
  row.innerHTML = `
    <div class="select-wrap">
      <select class="map-col1">${cols1.map(c => `<option value="${esc(c)}"${c === col1 ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select>
    </div>
    <span class="mapping-arrow">→</span>
    <div class="select-wrap">
      <select class="map-col2">${cols2.map(c => `<option value="${esc(c)}"${c === col2 ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select>
    </div>
    <button class="btn-remove-mapping" type="button" aria-label="Remover par">×</button>
  `;
  row.querySelector('.btn-remove-mapping').addEventListener('click', () => row.remove());
  $('colMappings').appendChild(row);
}

function fillSelect(selId, cols, defaultVal) {
  const sel = $(selId);
  sel.innerHTML = cols.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  if (defaultVal) sel.value = defaultVal;
  sel.disabled = false;
}

function renderSumCheckboxes(cols, defaults) {
  const container = $('sumCols');
  container.classList.remove('disabled');
  container.innerHTML = cols.map(c => {
    const checked = defaults.includes(c) ? ' checked' : '';
    return `<label class="checkbox-item"><input type="checkbox" value="${esc(c)}"${checked}><span>${esc(c)}</span></label>`;
  }).join('');
}
