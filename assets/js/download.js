import { state } from './state.js';

export function downloadResult() {
  if (!state.resultRows) return;

  const clean = state.resultRows.map(r => {
    const row = { ...r };
    delete row._cls;
    delete row._status;
    return row;
  });

  const csv  = Papa.unparse(clean);
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');

  a.href     = url;
  a.download = state.resultMode === 'merge'
    ? 'resultado_mesclagem.csv'
    : 'resultado_comparacao.csv';
  a.click();

  URL.revokeObjectURL(url);
}
