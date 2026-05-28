const msg = document.getElementById('message');
const dataBody = document.getElementById('dataBody');
const stateFilter = document.getElementById('stateFilter');
const groupFilter = document.getElementById('groupFilter');
const searchInput = document.getElementById('search');
const downloadSelectedCsv = document.getElementById('downloadSelectedCsv');
const stats = document.getElementById('stats');
let allRows = [];

function show(text, ok = true) {
  msg.innerHTML = `<div class="notice ${ok ? '' : 'danger'}">${text}</div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function api(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function fillFilters(rows) {
  const currentState = stateFilter.value || 'all';
  const currentGroup = groupFilter.value || 'all';

  const states = uniqueSorted(rows.map(r => r.state));
  const groups = uniqueSorted(rows.map(r => r.group));

  stateFilter.innerHTML = '<option value="all">All states</option>' + states.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  groupFilter.innerHTML = '<option value="all">All groups</option>' + groups.map(g => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join('');

  if (states.includes(currentState)) stateFilter.value = currentState;
  if (groups.includes(currentGroup)) groupFilter.value = currentGroup;
}

function updateDownloadLink() {
  const state = stateFilter.value;
  downloadSelectedCsv.href = state && state !== 'all'
    ? `/api/admin/export-chart-csv?state=${encodeURIComponent(state)}`
    : '/api/admin/export-chart-csv';
  downloadSelectedCsv.textContent = state && state !== 'all'
    ? `Download ${state} CSV`
    : 'Download selected state CSV';
}

function render() {
  const q = searchInput.value.trim().toLowerCase();
  const selectedState = stateFilter.value;
  const selectedGroup = groupFilter.value;

  const rows = allRows.filter(r => {
    const matchesSearch = !q || [r.state, r.group, r.indicator, r.year].some(v => String(v ?? '').toLowerCase().includes(q));
    const matchesState = selectedState === 'all' || r.state === selectedState;
    const matchesGroup = selectedGroup === 'all' || r.group === selectedGroup;
    return matchesSearch && matchesState && matchesGroup;
  });

  dataBody.innerHTML = rows.length ? rows.map(r => `
    <tr>
      <td>${escapeHtml(r.state)}</td>
      <td>${escapeHtml(r.group)}</td>
      <td>${escapeHtml(r.indicator)}</td>
      <td class="num">${escapeHtml(r.state_value)}</td>
      <td class="num">${escapeHtml(r.nigeria_value)}</td>
      <td class="num">${escapeHtml(r.peer_value)}</td>
      <td>${escapeHtml(r.year)}</td>
    </tr>
  `).join('') : '<tr><td colspan="7" class="empty">No data found. Upload a CSV to add indicators.</td></tr>';

  const stateCount = uniqueSorted(allRows.map(r => r.state)).length;
  const groupCount = uniqueSorted(allRows.map(r => r.group)).length;
  stats.innerHTML = `
    <div><b>${allRows.length}</b><span>Total rows</span></div>
    <div><b>${stateCount}</b><span>States with data</span></div>
    <div><b>${groupCount}</b><span>Groups</span></div>
    <div><b>${rows.length}</b><span>Rows showing</span></div>
  `;

  updateDownloadLink();
}

async function loadData() {
  const data = await api('/api/admin/chart-data');
  allRows = data.rows || [];
  fillFilters(allRows);
  render();
}

[stateFilter, groupFilter, searchInput].forEach(el => el.addEventListener('input', render));
document.getElementById('refreshBtn').onclick = () => loadData().then(() => show('Table refreshed.')).catch(err => show(err.message, false));

document.getElementById('csvForm').onsubmit = async event => {
  event.preventDefault();
  const form = event.target;
  const fd = new FormData(form);
  const result = await api('/api/admin/upload-csv', { method: 'POST', body: fd });
  form.reset();
  await loadData();
  show(`CSV uploaded successfully. ${result.count || 0} rows published.`);
};

loadData().catch(err => show(err.message, false));
