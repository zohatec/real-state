/** ইন্টার‍্যাকটিভ SVG ফ্লোর প্ল্যান — রুমে hover করলে পাশের প্যানেলে বিবরণ */
import { PLANS } from '../data/floor-plans.js';
import { t } from '../i18n.js';
import { $$ } from '../utils/dom.js';
import { formatSqft, num } from '../utils/format.js';

/** SVG বক্স (রুম-রেক্ট + দরজা + উত্তর-কম্পাস + স্কেল-বার) */
export function planSVGBox(planKey, totalSqft, scale) {
  const P = PLANS[planKey];
  const rooms = P.rooms.map((r) => {
    const area = Math.round(r.a * scale);
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const isBig = r.w > 120 && r.h > 60; // লেবেল বসার মতো জায়গা আছে কি
    return `
      <rect class="room" data-room="${r.k}" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="3"/>
      <text class="rm-name" x="${cx}" y="${isBig ? cy - 4 : cy + 4}" text-anchor="middle">${r.n[t('days') ? 'bn' : 'bn']}</text>`
      .replace(`>${r.n['bn']}<`, `>${r.n[i18nLang()]}<`) + `
      ${isBig ? `<text class="rm-area" x="${cx}" y="${cy + 15}" text-anchor="middle">${num(area)} ${i18nLang() === 'bn' ? 'বর্গফুট' : 'sqft'}</text>` : ''}`;
  }).join('');

  const doors = P.rooms.map((r) => {
    const dx = r.x + Math.min(r.w / 2, 60);
    return `<path class="rm-door" d="M${dx - 14} ${r.y + 2} a14 14 0 0 1 14 14"/>`;
  }).join('');

  return `
  <div class="plan-svg-box">
    <svg class="plan-svg" viewBox="0 0 ${P.vw} ${P.vh}" role="img" aria-label="Floor plan" data-plan="${planKey}" data-scale="${scale}">
      <rect class="rm-wall" x="20" y="20" width="${P.vw - 40}" height="${P.vh - 40}" fill="none"/>
      ${rooms}${doors}
      <g opacity=".65">
        <circle cx="${P.vw - 52}" cy="52" r="20" fill="none" stroke="#8a7c58" stroke-width="1.5"/>
        <path d="M${P.vw - 52} 62 l6 -14 -6 4 -6 -4 z" fill="#b58a2c"/>
        <text x="${P.vw - 52}" y="30" text-anchor="middle" style="font:600 11px var(--font-body);fill:#8a7c58">${i18nLang() === 'bn' ? 'উ' : 'N'}</text>
        <line x1="60" y1="${P.vh - 16}" x2="160" y2="${P.vh - 16}" stroke="#8a7c58" stroke-width="2"/>
        <text x="110" y="${P.vh - 26}" text-anchor="middle" class="rm-area">${i18nLang() === 'bn' ? '০ — ১০ ফুট' : '0 — 10 ft'}</text>
      </g>
    </svg>
    <span class="sr-only" hidden>${formatSqft(totalSqft)}</span>
  </div>`;
}

function i18nLang() {
  return document.documentElement.dataset.lang || 'bn';
}

/** ডান পাশের তথ্য-প্যানেল */
export function planPanelHTML(planKey, totalSqft) {
  const P = PLANS[planKey];
  const first = P.rooms[0];
  return `
  <div class="plan-panel">
    <span class="pp-hint">${hoverIcon()}${t('plan_hint')}</span>
    <h3 id="ppName">${first.n[i18nLang()]}</h3>
    <div class="pp-area" id="ppArea">${formatSqft(Math.round(first.a * (totalSqft / P.base)))}</div>
    <p class="pp-note" id="ppNote">${first.note?.[i18nLang()] || t('plan_note_def')}</p>
    <div class="plan-legend">
      <span><i style="background:#faf7ef;border:1px solid #26432f"></i>${i18nLang() === 'bn' ? 'কক্ষ' : 'Room'}</span>
      <span><i style="background:rgba(194,91,46,.13);border:1px solid #c25b2e"></i>${i18nLang() === 'bn' ? 'নির্বাচিত' : 'Selected'}</span>
      <span><b>${i18nLang() === 'bn' ? 'মোট' : 'Total'}: ${formatSqft(totalSqft)}</b></span>
    </div>
  </div>`;
}

const hoverIcon = () => `<svg class="ic" style="width:14px;height:14px"><use href="assets/icons.svg#i-move"/></svg>`;

/** সব .plan-svg-তে hover/leave হ্যান্ডলার বসায় — পেজ রেন্ডারের পর কল করুন */
export function attachPlanEvents() {
  $$('.plan-svg').forEach((svg) => {
    const P = PLANS[svg.dataset.plan];
    const scale = +svg.dataset.scale;

    svg.addEventListener('pointerover', (e) => {
      const rect = e.target.closest('.room');
      if (!rect) return;
      $$('.room', svg).forEach((r) => r.classList.remove('on'));
      rect.classList.add('on');
      const room = P.rooms.find((r) => r.k === rect.dataset.room);
      if (!room) return;
      const name = $('#ppName');
      if (name) {
        name.textContent = room.n[i18nLang()];
        $('#ppArea').textContent = formatSqft(Math.round(room.a * scale));
        $('#ppNote').textContent = room.note?.[i18nLang()] || '';
      }
    });
    svg.addEventListener('pointerleave', () => {
      $$('.room', svg).forEach((r) => r.classList.remove('on'));
    });
  });
}