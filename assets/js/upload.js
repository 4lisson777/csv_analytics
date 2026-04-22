import { state } from './state.js';
import { $, fields, buildTable } from './utils.js';
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

      markZone(num, file.name);
      showPreview(num, data, meta.fields ?? fields(data));
      refreshControls();
    },
    error(err) { alert(`Erro ao ler arquivo ${num}: ${err.message}`); },
  });
}

function markZone(num, filename) {
  $(`zone${num}`).classList.add('has-file');
  $(`name${num}`).textContent = `✓ ${filename}`;
}

function showPreview(num, data, cols) {
  $(`prevTbl${num}`).innerHTML   = buildTable(cols, data.slice(0, 5));
  $(`preview${num}`).style.display = 'block';
}
