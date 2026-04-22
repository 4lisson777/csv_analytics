export const $ = id => document.getElementById(id);

export function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function fields(data) {
  return data?.length ? Object.keys(data[0]) : [];
}

export function allFields(d1, d2) {
  return [...new Set([...fields(d1), ...fields(d2)])];
}

export function buildTable(headers, rows, rowClass) {
  let html = '<table><thead><tr>';
  html += headers.map(c => `<th>${esc(c)}</th>`).join('');
  html += '</tr></thead><tbody>';

  rows.forEach(r => {
    const cls = rowClass ? rowClass(r) : '';
    html += `<tr${cls ? ` class="${cls}"` : ''}>`;
    html += headers.map(c => `<td>${esc(r[c])}</td>`).join('');
    html += '</tr>';
  });

  return html + '</tbody></table>';
}

export function showResults() {
  const card = $('resultsCard');
  card.classList.add('visible');
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
