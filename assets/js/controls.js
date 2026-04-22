import { state } from './state.js';
import { $, allFields, esc } from './utils.js';

const SUM_REGEX = /qty|quant|total|valor|amount|price|preco/i;

export function refreshControls() {
  if (!state.data1 || !state.data2) return;

  const cols    = allFields(state.data1, state.data2);
  const autoKey = cols.find(c => /id|cod|sku|code/i.test(c)) ?? cols[0];
  const autoSum = cols.find(c => SUM_REGEX.test(c));

  fillSelect('keyCol', cols, autoKey);
  renderSumCheckboxes(cols, autoSum ? [autoSum] : []);

  $('btnMerge').disabled   = false;
  $('btnCompare').disabled = false;
}

export function getSumCols() {
  return [...document.querySelectorAll('#sumCols input[type=checkbox]:checked')]
    .map(el => el.value);
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
