/** প্রপার্টি-ডিটেইল মোডাল — গ্যালারি/ফ্লোর-প্ল্যান/লোকেশন ট্যাব সহ */
import { PROPERTIES } from '../data/properties.js';
import { openModal } from '../ui/modal.js';
import { planSVGBox } from '../ui/floor-plan.js';
import { t, loc } from '../i18n.js';
import { $, $$, icon, escapeHTML as esc } from '../utils/dom.js';
import { formatMoney, formatPerSqft, formatSqft, formatKatha, pic } from '../utils/format.js';

export function openPropertyModal(propertyId) {
  const p = PROPERTIES.find((x) => x.id === propertyId);
  if (!p) return;

  const seeds = [p.seed, `${p.seed}-b`, `${p.seed}-c`, `${p.seed}-d`];
  const specs = [
    ['i-area', t('spec_area'), p.type === 'plot' ? formatKatha(p.katha) : formatSqft(p.size)],
    ['i-layers', t('spec_floor'), esc(loc(p.floor))],
    ['i-sun', t('spec_face'), esc(loc(p.facing))],
    ['i-cal', t('spec_hand'), esc(loc(p.handover))],
  ];

  openModal(`
  <button class="m-close" data-action="modal-close" aria-label="Close">${icon('i-x')}</button>
  <div class="m-body pm-grid">
    <div class="pm-imgs">
      <div class="pm-main" data-action="lightbox" data-seeds="${seeds.join(',')}" data-i="0">
        <img id="pmImg" src="${pic(seeds[0], 760, 570)}" alt="">
      </div>
      <div class="pm-thumbs">
        ${seeds.map((s, i) => `
          <img src="${pic(s, 180, 140)}" data-action="pm-thumb" data-seed="${s}" data-i="${i}" class="${i === 0 ? 'on' : ''}" alt="">`).join('')}
      </div>
    </div>
    <div>
      <h2 class="pm-title">${esc(loc(p.title))}</h2>
      <div class="pm-price">${formatMoney(p.price)} <small>${p.psf ? formatPerSqft(p.psf) : ''}</small></div>
      <div class="pm-loc">${icon('i-map-pin')}${esc(loc(p.loc))}</div>
      <div class="pm-specs">
        ${specs.map((s) => `<div>${icon(s[0])}<span>${s[1]}: <b>${s[2]}</b></span></div>`).join('')}
      </div>
      ${p.desc ? `<p style="opacity:.75;font-size:.95rem">${esc(loc(p.desc))}</p>` : ''}

      <div class="pm-tabs">
        <button class="on" data-action="pm-tab" data-t="gal">${t('tab_gal')}</button>
        ${p.plan ? `<button data-action="pm-tab" data-t="plan">${t('tab_plan')}</button>` : ''}
        <button data-action="pm-tab" data-t="loc">${t('tab_loc')}</button>
      </div>

      <div class="pm-tab on" id="pmt-gal">
        <p style="opacity:.7;font-size:.9rem">${icon('i-eye')} ${esc(loc(p.title))}</p>
      </div>
      ${p.plan ? `<div class="pm-tab" id="pmt-plan">${planSVGBox(p.plan, p.size, Math.round((p.size / PLANS_BASE(p)) * 100) / 100)}</div>` : ''}
      <div class="pm-tab" id="pmt-loc">
        <p style="font-size:.9rem;margin-bottom:12px">${icon('i-map-pin')} <b>${esc(loc(p.loc))}</b></p>
        <div class="map-box" style="min-height:200px">
          <div class="map-load">
            <span style="font-size:.8rem;opacity:.7">${esc(loc(p.loc))}</span>
            <button data-action="map-load" data-q="${esc(p.mapQ)}">${t('map_load')}</button>
          </div>
        </div>
      </div>

      <div class="pm-ctas">
        <button class="btn btn-p" data-action="open-booking" data-pre="${p.projectId || p.id}">${t('pm_book')}${icon('i-cal')}</button>
        <a class="btn btn-wa" target="_blank" rel="noopener" data-action="track-wa"
           href="https://wa.me/${WA()}?text=${encodeURIComponent((document.documentElement.dataset.lang === 'bn' ? 'আগ্রহী: ' : 'Interested: ') + loc(p.title))}">
          ${iconFilled('i-whatsapp')}${t('cta_wa')}
        </a>
      </div>
    </div>
  </div>`);

  // ফ্লোর-প্ল্যান ট্যাবে hover ইভেন্ট বসানো
  import('../ui/floor-plan.js').then(({ attachPlanEvents }) => attachPlanEvents());
}

/* ছোট লোকাল হেল্পার — মডিউল টপ-লেভেল ইমপোর্ট সংক্ষিপ্ত রাখতে */
import { CONFIG } from '../config.js';
import { iconFilled } from '../utils/dom.js';
import { PLANS } from '../data/floor-plans.js';
const WA = () => CONFIG.WHATSAPP_NUMBER;
const PLANS_BASE = (p) => PLANS[p.plan].base;