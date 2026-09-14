/** অ্যাডমিন ভিউ — লিড ড্যাশবোর্ড (leadStore থেকে ডাটা "ফেচ" করে) */
import { leadStore } from '../services/lead-store.js';
import { PROJECTS } from '../data/projects.js';
import { i18nState, t } from '../i18n.js';
import { $, $$, icon, escapeHTML as esc } from '../utils/dom.js';
import { num, formatDate, todayISO } from '../utils/format.js';
import { showToast } from '../ui/toast.js';

export const STATUSES = ['new', 'contacted', 'visited', 'won', 'lost'];
export const STATUS_STYLES = {
  new: 'st-new', contacted: 'st-contacted', visited: 'st-visited', won: 'st-won', lost: 'st-lost',
};
const statusLabel = (key) => t({ new: 'st_new', contacted: 'st_contacted', visited: 'st_visited', won: 'st_won2', lost: 'st_lost' }[key]);
const sourceLabel = (source) =>
  ({ 'visit-form': () => t('src_form'), newsletter: () => t('src_nl') })[source]?.() ?? source;

export async function renderAdmin() {
  const bn = i18nState.lang === 'bn';

  /* ১) শেল + স্কেলিটন — "ফেচিং" অবস্থা দেখায় */
  $('#adminRoot').innerHTML = `
  <div class="adm-head">
    <div class="wrap">
      <div>
        <h1>${t('adm_t')}</h1>
        <p class="sub">${t('adm_sub')}</p>
      </div>
      <a class="btn btn-g" href="#/" style="border-color:var(--line-d)">${icon('i-arrow-l')}${t('adm_back')}</a>
    </div>
  </div>
  <div class="adm-statbar">
    <div class="wrap" id="admStats">
      ${[0, 1, 2, 3, 4].map(() => '<div class="adm-stat"><b>—</b><span>…</span></div>').join('')}
    </div>
  </div>
  <div class="adm-body">
    <div class="wrap" id="admMain">
      <div class="skel"></div><div class="skel"></div><div class="skel"></div>
      <p style="opacity:.5;font-size:.85rem">${t('loading')}</p>
    </div>
  </div>`;

  /* ২) ডাটা ফেচ (localStorage + সিমুলেটেড লেটেন্সি) */
  const leads = await leadStore.list();
  const events = leadStore.getEvents();
  const today = todayISO();
  const weekAgo = Date.now() - 7 * 864e5;

  const stats = [
    [num(leads.length), t('st_total')],
    [num(leads.filter((l) => new Date(l.ts).toISOString().slice(0, 10) === today).length), t('st_today')],
    [num(leads.filter((l) => l.ts >= weekAgo).length), t('st_week')],
    [num(leads.filter((l) => l.status === 'won').length), t('st_won')],
    [num(events.filter((e) => e.t === 'whatsapp' && e.ts >= weekAgo).length), t('st_wa')],
  ];
  $('#admStats').innerHTML = stats.map((s) => `<div class="adm-stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join('');

  /* ৩) খালি-স্টেট */
  if (!leads.length) {
    $('#admMain').innerHTML = `
    <div class="adm-empty">${icon('i-chart')}
      <h3>${t('adm_empty_h')}</h3>
      <p>${t('adm_empty_p')}</p>
      <button class="a-btn seed" data-action="seed-leads">${icon('i-plus')}${t('btn_seed')}</button>
    </div>`;
    return;
  }

  /* ৪) চার্ট + টেবিল */
  const sources = {};
  leads.forEach((l) => { sources[l.source] = (sources[l.source] || 0) + 1; });
  const sourceTotal = Object.values(sources).reduce((a, b) => a + b, 0) || 1;

  $('#admMain').innerHTML = `
  <div class="adm-tools">
    <input class="sel txt" id="admQ" type="search" placeholder="${t('search_ph')}">
    <select class="sel" id="admSt">
      <option value="all">${t('flt_all')}</option>
      ${STATUSES.map((s) => `<option value="${s}">${statusLabel(s)}</option>`).join('')}
    </select>
    <button class="a-btn" data-action="csv">${icon('i-download')}${t('btn_csv')}</button>
    <button class="a-btn" data-action="json">${icon('i-file')}${t('btn_json')}</button>
    <button class="a-btn seed" data-action="seed-leads">${icon('i-plus')}${t('btn_seed')}</button>
    <button class="a-btn danger" data-action="clear-leads">${icon('i-trash')}${t('btn_clear')}</button>
  </div>
  <div class="adm-chart">
    <h3>${t('chart_h')}<small>${bn ? 'তারিখ-ভিত্তিক গণনা, localStorage থেকে' : 'Counted by date, from localStorage'}</small></h3>
    <div class="chart-flex">
      <div><canvas id="wkChart" style="width:100%;height:150px"></canvas></div>
      <div class="src-bars">
        <div style="font-family:var(--font-display);font-weight:700;font-size:1rem">${t('src_h')}</div>
        ${Object.entries(sources).map(([k, v]) => `
          <div class="src-bar">
            <span>${sourceLabel(k)}</span>
            <span class="sb-tr"><i data-w="${Math.round((v / sourceTotal) * 100)}"></i></span>
            <b>${num(v)}</b>
          </div>`).join('')}
      </div>
    </div>
  </div>
  <div class="tbl-scroll">
    <table class="lead-table">
      <thead><tr>${t('th_lead').map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody id="leadRows"></tbody>
    </table>
  </div>`;

  drawChart(leads);
  renderRows(leads, 'all', '');
  requestAnimationFrame(() => $$('#admMain .sb-tr i').forEach((b) => { b.style.width = `${b.dataset.w}%`; }));

  $('#admQ').addEventListener('input', (e) => renderRows(leads, $('#admSt').value, e.target.value));
  $('#admSt').addEventListener('change', (e) => renderRows(leads, e.target.value, $('#admQ').value));

  /* ---- অভ্যন্তরীণ হেল্পার ---- */

  function renderRows(rows, status, query) {
    const q = (query || '').toLowerCase();
    const list = rows
      .filter((r) =>
        (status === 'all' || r.status === status) &&
        (!q || r.name.toLowerCase().includes(q) || String(r.phone).includes(q)))
      .slice()
      .sort((a, b) => b.ts - a.ts);

    $('#leadRows').innerHTML = list.length ? list.map((r) => {
      const leadId = `THK-${String(r.id).padStart(4, '0')}`;
      return `
      <tr>
        <td class="lt-id">#${leadId}</td>
        <td class="lt-name"><b>${esc(r.name)}</b><span>${num(r.phone)}</span></td>
        <td>${esc(r.project)}</td>
        <td>${r.date && r.date !== '—' ? `${formatDate(r.date)} · ${esc(r.slot)}` : '—'}</td>
        <td>${sourceLabel(r.source)}</td>
        <td>
          <select class="status-sel ${STATUS_STYLES[r.status] || 'st-new'}" data-action="st-change" data-id="${r.id}">
            ${STATUSES.map((s) => `<option value="${s}" ${r.status === s ? 'selected' : ''}>${statusLabel(s)}</option>`).join('')}
          </select>
        </td>
        <td>
          <div class="lt-act">
            <a href="tel:${r.phone}" title="Call" class="tel">${icon('i-phone')}</a>
            <a href="https://wa.me/880${r.phone}" target="_blank" rel="noopener" title="WhatsApp">${iconFilledWa()}</a>
            <button class="del" data-action="del-lead" data-id="${r.id}" title="Delete">${icon('i-trash')}</button>
          </div>
        </td>
      </tr>`;
    }).join('') : `<tr><td colspan="7" style="text-align:center;padding:30px;opacity:.5">—</td></tr>`;
  }

  function drawChart(rows) {
    const canvas = $('#wkChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = devicePixelRatio || 1;
    const W = canvas.clientWidth || 560;
    const H = 150;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const dayNames = t('days');
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5);
      days.push({ key: d.toISOString().slice(0, 10), label: dayNames[d.getDay()], count: 0 });
    }
    rows.forEach((r) => {
      const key = new Date(r.ts).toISOString().slice(0, 10);
      const day = days.find((d) => d.key === key);
      if (day) day.count++;
    });

    const max = Math.max(1, ...days.map((d) => d.count));
    const barW = Math.min(46, (W - 70) / 7 - 10);
    ctx.font = `10px ${getComputedStyle(document.body).fontFamily}`;

    days.forEach((d, i) => {
      const x = 42 + i * ((W - 60) / 7);
      const h = Math.max(3, (d.count / max) * (H - 46));
      ctx.fillStyle = d.count ? '#b58a2c' : '#e8e0ca';
      ctx.beginPath();
      ctx.roundRect(x, H - 30 - h, barW, h, 4);
      ctx.fill();
      ctx.fillStyle = '#7a766c';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x + barW / 2, H - 12);
      if (d.count) {
        ctx.fillStyle = '#101b14';
        ctx.fillText(num(d.count), x + barW / 2, H - 36 - h);
      }
    });
  }
}

const iconFilledWa = () => '<svg class="ic ic-f"><use href="assets/icons.svg#i-whatsapp"/></svg>';

/** ডেমো-লিড সিডার — ড্যাশবোর্ড খালি থাকলে ক্লায়েন্ট ডেমো দেখাতে */
export async function seedDemoLeads() {
  const names = ['রাশেদুল ইসলাম', 'তানিয়া আহমেদ', 'মেহেদী হাসান', 'শারমিন আক্তার', 'আরিফুল ইসলাম', 'নুসরাত জাহান', 'কামরুল হাসান'];
  const projs = [PROJECTS[0].name.bn, PROJECTS[1].name.bn, PROJECTS[2].name.bn, 'উত্তরা সেক্টর-৭ রেসিডেন্স', 'বসুন্ধরা ব্লক-J প্লট'];
  const statuses = ['new', 'new', 'contacted', 'visited', 'won', 'new', 'contacted'];

  for (let i = 0; i < 7; i++) {
    await leadStore.add({
      name: names[i],
      phone: `01712${String(340000 + i * 1357).slice(0, 6)}`,
      project: projs[i % 5],
      date: new Date(Date.now() + (2 + i) * 864e5).toISOString().slice(0, 10),
      slot: t('slot_m'),
      msg: '',
      source: i % 3 === 2 ? 'newsletter' : 'visit-form',
      status: statuses[i],
      ts: Date.now() - (i < 5 ? i * 0.9 * 864e5 : 0),
    });
  }
  showToast(i18nState.lang === 'bn' ? '৭টি ডেমো লিড যোগ হয়েছে' : '7 demo leads added', 'i-plus');
  renderAdmin();
}