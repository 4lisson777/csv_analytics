import { state } from './state.js';
import { $, fields, buildTable, esc } from './utils.js';
import { refreshControls } from './controls.js';

export function setupZone(zoneId, inputId, num) {
  const zone  = $(zoneId);
  const input = $(inputId);

  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });

  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));

  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file, num);
  });

  input.addEventListener('change', e => {
    if (e.target.files[0]) loadFile(e.target.files[0], num);
  });
}

function loadFile(file, num) {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    alert('Por favor, selecione um arquivo .csv válido.');
    return;
  }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete({ data, meta }) {
      if (num === 1) state.data1 = data;
      else           state.data2 = data;

      const cols = meta.fields ?? fields(data);
      markZone(num, file.name, data.length, cols.length, file.size);
      showPreview(num, data, cols);
      refreshControls();
      updateStatusBar();
    },
    error(err) { alert(`Erro ao ler arquivo ${num}: ${err.message}`); },
  });
}

function markZone(num, filename, rows, ncols, sizeBytes) {
  $(`zone${num}`).classList.add('has-file');
  $(`name${num}`).textContent = filename;

  const slotName = $(`slotName${num}`);
  if (slotName) slotName.textContent = filename;

  const stats = $(`fstats${num}`);
  if (stats) {
    const rowsFmt = rows.toLocaleString('pt-BR');
    const kb = sizeBytes ? ` · <b>${(sizeBytes / 1024).toFixed(1)} KB</b>` : '';
    stats.innerHTML = `<b>${esc(rowsFmt)}</b> linhas · <b>${ncols}</b> colunas${kb}`;
  }

  const crumb = $(`crumb${num}`);
  if (crumb) crumb.textContent = num === 1 ? '01' : '02';
}

function showPreview(num, data, cols) {
  $(`prevTbl${num}`).innerHTML     = buildTable(cols, data.slice(0, 5));
  $(`preview${num}`).style.display = 'block';
}

/* ------- Status bar ------- */
export function updateStatusBar() {
  const text = $('statusText');
  const dot  = $('statusDot');
  if (!text || !dot) return;

  const hasResult = state.resultRows != null;
  const both      = state.data1 && state.data2;
  const some      = state.data1 || state.data2;

  dot.className = 'dot';
  if (hasResult) {
    dot.classList.add('ok');
    const kind = state.resultMode === 'merge' ? 'mesclagem' : 'comparação';
    text.textContent = `Resultado: ${kind} · ${state.resultRows.length} registros`;
  } else if (both) {
    dot.classList.add('live');
    text.textContent = 'Pronto para operar';
  } else if (some) {
    text.textContent = 'Aguardando segundo arquivo';
  } else {
    text.textContent = 'Aguardando arquivos';
  }
}
