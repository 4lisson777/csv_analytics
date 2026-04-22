import { state } from './state.js';
import { $, allFields, esc } from './utils.js';

export function refreshControls() {
  if (!state.data1 || !state.data2) return;

  const cols   = allFields(state.data1, state.data2);
  const autoKey = cols.find(c => /id|cod|sku|code/i.test(c)) ?? cols[0];
  const autoSum = cols.find(c => /qty|quant|total|valor|amount|price|preco/i.test(c));

  fillSelect('keyCol', cols, autoKey);
  fillSelect('sumCol', cols, autoSum ?? '');

  $('btnMerge').disabled   = false;
  $('btnCompare').disabled = false;
}

function fillSelect(selId, cols, defaultVal) {
  const sel = $(selId);
  sel.innerHTML = cols.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  if (defaultVal) sel.value = defaultVal;
  sel.disabled = false;
}
