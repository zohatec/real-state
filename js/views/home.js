/**
 * হোম ভিউ — টিকার, ফ্ল্যাগশিপ কার্ড, লিস্টিং + ফিল্টার, ভিজিট ফর্ম।
 * ফিল্টার-স্টেট মডিউল-স্কোপড — বাইরে থেকে applyHeroSearch()/resetFilters() দিয়ে বদলান।
 */
import { CONFIG } from '../config.js';
import { AREAS, TICKER } from '../data/locations.js';
import { PROPERTIES } from '../data/properties.js';
import { i18nState, t, loc } from '../i18n.js';
import { $, $$, icon, iconFilled, escapeHTML as esc } from '../utils/dom.js';
import { formatMoney, formatPerSqft, formatSqft, formatKatha, num, pic } from '../utils/format.js';
import { observeReveal } from '../ui/reveal.js';
import { bookingFormHTML } from '../ui/booking-form.js';

const MAX_PRICE = 60_000_000;
const filters = { type: 'all', loc: 'all', beds: 0, max: MAX_PRICE, sort: 'def' };

/* ---------- বাজারদর টিকার ---------- */
export function renderTicker() {
  const items = TICKER.map((x) => {
    const up = x.c >= 0;
    return `<div class="tk-item"><span>${esc(loc(x))}</span><b>${formatPerSqft(x.v)}</b>
      <span class="${up ? 'tk-up' : 'tk-dn'}">${icon(up ? 'i-trend-up' : 'i-trend-dn')}${num(Math.abs(x.c))}%</span></div>`;
  }).join('');
  $('#tkTrack').innerHTML = items + items; // seamless লুপের জন্য দুইবার
}

/* ---------- সিলেক্ট-অপশন (ভাষা বদলালেও সিলেকশন বহাল) ---------- */
function setOptions(select, html) {
  const prev = select.value;
  select.innerHTML = html;
  if ([...select.options].some((o) => o.value === prev)) select.value = prev;
}

export function fillSelects() {
  const areaOptions = `<option value="all">${t('area_all')}</option>` +
    AREAS.map((a) => `<option value="${a.k}">${esc(loc(a))}</option>`).join('');

  setOptions($('#s-area'), areaOptions);
  setOptions($('#f-loc'), areaOptions);
  setOptions($('#s-type'),
    `<option value="all">${t('type_all')}</option><option value="flat">${t('type_flat')}</option><option value="plot">${t('type_plot')}</option><option value="comm">${t('type_comm')}</option>`);
  setOptions($('#s-budget'),
    [6000000, 10000000, 20000000, MAX_PRICE].map((v) => `<option value="${v}">${formatMoney(v)}</option>`).join(''));
}

/* ---------- ফ্ল্যাগশিপ ---------- */
export function renderFlagship() {
  const { PROJECTS } = require_projects();
  const bn = i18nState.lang === 'bn';

  $('#prjHome').innerHTML = PROJECTS.map((p, i) => `
    <div class="fp ${i % 2 ? 'rev' : ''} reveal" style="--d:${i * 0.08}s">
      <div class="fp-media" data-action="view-project" data-id="${p.id}">
        <img loading="lazy" src="${pic(`${p.id}-hero`, 1000, 700)}" alt="${esc(loc(p.name))}">
        <span class="fp-badge">${p.progress >= 85 ? (bn ? 'প্রায় রেডি' : 'Near ready') : (bn ? 'চলমান' : 'Ongoing')}</span>
      </div>
      <div class="fp-info">
        <h3>${esc(loc(p.name))}</h3>
        <div class="fp-loc">${icon('i-map-pin')}${esc(loc(p.loc))}</div>
        <div class="fp-price">${formatMoney(p.price)}<small>${t('from')} · ${formatSqft(p.size)}</small></div>
        <div class="fp-specs">
          <div>${icon('i-bed')}${num(p.beds)} ${bn ? 'বেড' : 'beds'}</div>
          <div>${icon('i-bath')}${num(p.baths)} ${bn ? 'বাথ' : 'baths'}</div>
          <div>${icon('i-layers')}${esc(loc(p.floors))}</div>
          <div>${icon('i-cal')}${esc(loc(p.handover))}</div>
        </div>
        <div class="prog">
          <div class="prog-lbl"><span>${t('prog_lbl')}</span><span>${num(p.progress)}%</span></div>
          <div class="prog-bar"><i data-w="${p.progress}"></i></div>
        </div>
        <div class="fp-act">
          <button class="btn btn-p" data-action="view-project" data-id="${p.id}">${t('prj_view')}${icon('i-arrow-r')}</button>
          <button class="btn btn-g" data-action="open-booking" data-pre="${p.id}">${t('prj_book')}</button>
        </div>
      </div>
    </div>`).join('');

  requestAnimationFrame(() => requestAnimationFrame(() => {
    $$('#prjHome .prog-bar i').forEach((bar) => { bar.style.width = `${bar.dataset.w}%`; });
  }));
  observeReveal($('#prjHome'));
}

/* ---------- লিস্টিং ---------- */
export function renderListings() {
  const bn = i18nState.lang === 'bn';
  let list = PROPERTIES.filter((p) =>
    (filters.type === 'all' || p.type === filters.type) &&
    (filters.loc === 'all' || p.areaKey === filters.loc) &&
    p.price <= filters.max &&
    p.beds >= filters.beds
  );
  if (filters.sort === 'asc') list = [...list].sort((a, b) => a.price - b.price);
  if (filters.sort === 'desc') list = [...list].sort((a, b) => b.price - a.price);
  if (filters.sort === 'area') list = [...list].sort((a, b) => b.size - a.size);

  const pattern = ['w', '', '', '', 'w', '', '', '']; // asymmetric grid

  $('#lsGrid').innerHTML = list.length ? list.map((p, i) => {
    const specs = p.type === 'plot'
      ? `<span>${icon('i-area')}${formatKatha(p.katha)}</span><span>${icon('i-layers')}${formatSqft(p.size)}</span>`
      : `<span>${icon('i-bed')}${p.beds ? `${num(p.beds)} ${bn ? 'বেড' : 'beds'}` : '—'}</span>
         <span>${icon('i-bath')}${p.baths ? `${num(p.baths)} ${bn ? 'বাথ' : 'baths'}` : '—'}</span>
         <span>${icon('i-area')}${formatSqft(p.size)}</span>`;
    const badge = p.flagship
      ? `<span class="pl-badge">${t('b_flag')}</span>`
      : (i === list.length - 1 ? `<span class="pl-badge new">${t('b_new')}</span>` : '');

    return `
    <article class="pl-card reveal ${pattern[i % 8]}" style="--d:${(i % 4) * 0.06}s"
             data-action="${p.flagship ? 'view-project' : 'open-property'}" data-id="${p.id}">
      <div class="pl-media">
        <img loading="lazy" src="${pic(p.seed, p.flagship ? 1100 : 700, 520)}" alt="${esc(loc(p.title))}">
        ${badge}<span class="pl-type">${t(`t_${p.type}`)}</span>
      </div>
      <div class="pl-body">
        <div class="pl-price">${formatMoney(p.price)}<small>${p.psf ? formatPerSqft(p.psf) : esc(loc(p.handover))}</small></div>
        <h3>${esc(loc(p.title))}</h3>
        <div class="pl-loc">${icon('i-map-pin')}${esc(loc(p.loc))}</div>
        <div class="pl-specs">${specs}</div>
        <div class="pl-foot">
          <span class="pl-more">${t('ls_details')}${icon('i-arrow-r')}</span>
          <a class="pl-wa" href="https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent((bn ? 'আসসালামু আলাইকুম! ' : 'Hello! ') + loc(p.title))}"
             target="_blank" rel="noopener" data-action="track-wa" aria-label="WhatsApp">${iconFilled('i-whatsapp')}</a>
        </div>
      </div>
    </article>`;
  }).join('') : `
    <div class="ls-empty">
      ${icon('i-search')}
      <h3>${t('ls_empty_h')}</h3><p>${t('ls_empty_p')}</p>
      <button class="btn btn-p" data-action="reset-filter">${t('ls_reset')}</button>
    </div>`;

  $('#lsCount').innerHTML = t('ls_showing')
    .replace('{m}', num(list.length))
    .replace('{n}', num(PROPERTIES.length));
  observeReveal($('#lsGrid'));
}

/* ---------- ভিজিট ফর্ম + লেবেল ---------- */
export const renderVisitForm = () => { $('#visitFormBox').innerHTML = bookingFormHTML(); };

export function refreshPriceLabel() {
  const bn = i18nState.lang === 'bn';
  $('#priceLbl').textContent = filters.max >= MAX_PRICE
    ? (bn ? '৳ ৬ কোটি পর্যন্ত (সব)' : 'Up to ৳ 6 Cr (all)')
    : `${formatMoney(filters.max)} ${bn ? 'পর্যন্ত' : 'max'}`;
}

/* ---------- ফিল্টার ইন্টার‍্যাকশন (একবার বাঁধা হয়) ---------- */
export function initHomeFilters() {
  $('#f-type').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    $$('#f-type button').forEach((b) => b.classList.toggle('on', b === btn));
    filters.type = btn.dataset.v;
    renderListings();
  });
  $('#f-loc').addEventListener('change', (e) => { filters.loc = e.target.value; renderListings(); });
  $('#f-beds').addEventListener('change', (e) => { filters.beds = +e.target.value; renderListings(); });
  $('#f-sort').addEventListener('change', (e) => { filters.sort = e.target.value; renderListings(); });
  $('#f-price').addEventListener('input', (e) => {
    filters.max = +e.target.value;
    refreshPriceLabel();
    renderListings();
  });
}

/** হিরো সার্চ ফিল্টারে অ্যাপ্লাই হয়, তারপর লিস্টিং সেকশনে স্ক্রল */
export function applyHeroSearch(area, type, budget) {
  Object.assign(filters, { loc: area, type, max: budget });
  $$('#f-type button').forEach((b) => b.classList.toggle('on', b.dataset.v === type));
  $('#f-loc').value = area;
  $('#f-price').value = budget;
  refreshPriceLabel();
  renderListings();
}

export function resetFilters() {
  Object.assign(filters, { type: 'all', loc: 'all', beds: 0, max: MAX_PRICE, sort: 'def' });
  $$('#f-type button').forEach((b) => b.classList.toggle('on', b.dataset.v === 'all'));
  ['#f-loc', '#f-beds', '#f-sort'].forEach((sel) => { $(sel).selectedIndex = 0; });
  $('#f-price').value = MAX_PRICE;
  refreshPriceLabel();
  renderListings();
}

/** ভাষা পরিবর্তনে হোম-ভিউয়ের সব ডাইনামিক অংশ রি-রেন্ডার */
export function refreshHome() {
  fillSelects();
  renderTicker();
  renderFlagship();
  renderListings();
  renderVisitForm();
  refreshPriceLabel();
  $('#heroCardPr').textContent = formatMoney(41_500_000);
}

/* ছোট হেল্পার — PROJECTS ইমপোর্ট এক জায়গায় রাখতে */
import { PROJECTS } from '../data/projects.js';
const require_projects = () => ({ PROJECTS });