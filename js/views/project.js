/** প্রজেক্ট-ভিউ — সম্পূর্ণ ল্যান্ডিং পেজ রেন্ডারার */
import { CONFIG } from '../config.js';
import { PROJECTS } from '../data/projects.js';
import { PLANS } from '../data/floor-plans.js';
import { i18nState, t, loc } from '../i18n.js';
import { $, $$, icon, iconFilled, escapeHTML as esc } from '../utils/dom.js';
import { formatMoney, formatPerSqft, formatSqft, num, pic } from '../utils/format.js';
import { planSVGBox, planPanelHTML, attachPlanEvents } from '../ui/floor-plan.js';
import { bookingFormHTML } from '../ui/booking-form.js';
import { mountTour } from '../ui/tour.js';

let scrollSpy = null; // পুরনো observer ডিসকানেক্ট করতে (re-render সেফ)

export function renderProjectPage(projectId) {
  const p = PROJECTS.find((x) => x.id === projectId);
  if (!p) { location.hash = '#/'; return; }

  const bn = i18nState.lang === 'bn';
  const aIdx = bn ? 1 : 2;      // amen/near অ্যারে: [icon, bn, en, …]
  const gIdx = bn ? 0 : 1;      // gal অ্যারে: [bn, en]
  const scale = Math.round((p.size / PLANS[p.plan].base) * 100) / 100;
  const waText = encodeURIComponent((bn ? 'প্রজেক্ট: ' : 'Project: ') + loc(p.name));
  const phases = [['ph1', 10], ['ph2', Math.max(35, p.progress - 15)], ['ph3', 80], ['ph4', 100]];

  $('#projectRoot').innerHTML = `
  <section class="pj-hero">
    <div class="wrap">
      <a class="back-link" href="#/">${icon('i-arrow-l')}${t('back')}</a>
      <div class="pj-grid">
        <div>
          <span class="kicker">${esc(loc(p.floors))}</span>
          <h1>${esc(loc(p.name))}</h1>
          <div class="pj-loc">${icon('i-map-pin')}${esc(loc(p.loc))}</div>
          <div class="pj-price">${formatMoney(p.price)} <small>${t('from')} · ${formatPerSqft(p.psf)}</small></div>
          <div class="pj-badges">
            <span class="pj-badge">${icon('i-area')}${formatSqft(p.size)}</span>
            <span class="pj-badge">${icon('i-bed')}${num(p.beds)} ${bn ? 'বেড' : 'beds'}</span>
            <span class="pj-badge">${icon('i-bath')}${num(p.baths)} ${bn ? 'বাথ' : 'baths'}</span>
            <span class="pj-badge">${icon('i-cal')}${esc(loc(p.handover))}</span>
            <span class="pj-badge">${icon('i-shield')}${bn ? 'RAJUK অনুমোদিত' : 'RAJUK approved'}</span>
          </div>
          <div class="pj-cta">
            <button class="btn btn-p" data-action="open-booking" data-pre="${p.id}">${t('prj_book')}${icon('i-cal')}</button>
            <a class="btn btn-wa" target="_blank" rel="noopener" data-action="track-wa"
               href="https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${waText}">
              ${iconFilled('i-whatsapp')}${bn ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}
            </a>
          </div>
        </div>
        <div class="pj-img">
          <img src="${pic(`${p.id}-hero`, 900, 760)}" alt="${esc(loc(p.name))}">
          <div class="prog-wrap">
            <div class="prog-lbl"><span>${t('prog_lbl')}</span><span>${num(p.progress)}%</span></div>
            <div class="prog-bar"><i data-w="${p.progress}"></i></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="pj-subnav" id="pjSubnav">
    <div class="wrap">
      ${[['pj-over', 'i-info', 'sn_over'], ['pj-plan', 'i-grid', 'sn_plan'], ['pj-gal', 'i-eye', 'sn_gal'],
         ['pj-tour', 'i-move', 'sn_tour'], ['pj-loc', 'i-map-pin', 'sn_loc'], ['pj-book', 'i-cal', 'sn_book']]
        .map(([target, ic, key], i) =>
          `<button type="button" data-target="${target}" class="${i === 0 ? 'on' : ''}">${icon(ic)}${t(key)}</button>`).join('')}
    </div>
  </div>

  <section class="pj-sec" id="pj-over">
    <div class="wrap">
      <span class="kicker">${t('sn_over')}</span>
      <h2>${esc(loc(p.name))}</h2>
      <p class="lead">${esc(loc(p.desc))}</p>
      <div class="pj-cols">
        <div>
          <h3 style="font-family:var(--font-display);font-size:1.2rem;margin-bottom:4px">${t('amen_h')}</h3>
          <div class="amen">${p.amen.map((a) => `<span>${icon(a[0], 'width:16px;height:16px')}${esc(a[aIdx])}</span>`).join('')}</div>
          <div class="tbl-x">
          <table class="ut">
            <thead><tr>${t('unit_th').map((h) => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>
              ${p.units.map((u) => `
              <tr>
                <td><b>${num(u.u)}</b></td>
                <td>${formatSqft(u.a)}</td>
                <td>${esc(loc(u.f))}</td>
                <td class="pr-td">${formatMoney(u.p)}</td>
                <td><span class="av-td ${u.av ? 'yes' : 'no'}">${u.av ? t('av_yes') : t('av_no')}</span></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <aside>
          <h3 style="font-family:var(--font-display);font-size:1.2rem;margin-bottom:6px">${t('phase_h')}</h3>
          <div class="phases">
            ${phases.map((ph, i) => {
              const done = +ph[1] <= p.progress;
              const now = !done && i > 0 && +phases[i - 1][1] <= p.progress;
              const dotIcon = done ? 'i-check' : now ? 'i-clock' : 'i-minus';
              return `
              <div class="phase ${done ? 'done' : now ? 'now' : ''}">
                <span class="dot">${icon(dotIcon, 'width:15px;height:15px')}</span>
                <div>
                  <b>${t(ph[0])}</b>
                  <span>${done ? (bn ? 'সম্পন্ন' : 'Done')
                    : now ? `${bn ? 'চলছে · ' + num(p.progress) + '%' : 'Ongoing · ' + p.progress + '%'}`
                    : (bn ? 'পরবর্তী' : 'Upcoming')}</span>
                </div>
              </div>`;
            }).join('')}
          </div>
        </aside>
      </div>
    </div>
  </section>

  <section class="pj-sec bg-paper" id="pj-plan">
    <div class="wrap">
      <span class="kicker">${t('sn_plan')}</span>
      <h2>${t('plan_h')} — ${formatSqft(p.size)}</h2>
      <div class="plan-wrap">
        ${planSVGBox(p.plan, p.size, scale)}
        ${planPanelHTML(p.plan, p.size)}
      </div>
    </div>
  </section>

  <section class="pj-sec" id="pj-gal">
    <div class="wrap">
      <span class="kicker">${t('sn_gal')}</span>
      <h2>${t('gal_h')}</h2>
      <div class="gal">
        ${p.gal.map((g, i) => `
        <figure data-action="pj-lightbox" data-id="${p.id}" data-i="${i}">
          <img loading="lazy" src="${pic(`${p.id}-g${i}`, 600, 400)}" alt="${esc(g[gIdx])}">
          <figcaption>${esc(g[gIdx])}</figcaption>
        </figure>`).join('')}
      </div>
    </div>
  </section>

  <section class="pj-sec bg-ink" id="pj-tour">
    <div class="wrap">
      <span class="kicker">${t('sn_tour')}</span>
      <h2>${t('tour_h')}</h2>
      <div class="tour">
        <img src="${pic(`${p.id}-pano`, 2400, 800)}" alt="">
        <div class="tour-tag">${icon('i-move')}${t('tour_live')}</div>
        <div class="tour-hud">
          <button data-zoom="-" aria-label="Zoom out">${icon('i-minus')}</button>
          <button data-zoom="+" aria-label="Zoom in">${icon('i-plus')}</button>
        </div>
      </div>
      <p style="opacity:.6;font-size:.85rem;margin-top:12px">${t('tour_hint')}</p>
    </div>
  </section>

  <section class="pj-sec bg-paper" id="pj-loc">
    <div class="wrap">
      <span class="kicker">${t('sn_loc')}</span>
      <h2>${t('loc_h')}</h2>
      <div class="pj-cols">
        <div class="map-box" style="min-height:340px">
          <div class="map-load">
            ${icon('i-map-pin', 'width:34px;height:34px')}
            <span>${esc(loc(p.loc))}</span>
            <button data-action="map-load" data-q="${esc(p.mapQ)}">${t('map_load')}</button>
          </div>
        </div>
        <aside>
          <h3 style="font-family:var(--font-display);font-size:1.2rem;margin-bottom:6px">${t('near_h')}</h3>
          <ul class="near">
            ${p.near.map((n) => `<li>${icon(n[0])}<span>${esc(n[aIdx])}</span><span class="dist">${esc(n[bn ? 3 : 4])}</span></li>`).join('')}
          </ul>
          <div style="margin-top:18px;font-size:.85rem;opacity:.6">${icon('i-map-pin')} <b>${t('loc_addr')}:</b> ${esc(loc(p.loc))}</div>
        </aside>
      </div>
    </div>
  </section>

  <section class="pj-sec pj-book" id="pj-book">
    <div class="wrap">
      <span class="kicker">${t('sn_book')}</span>
      <h2>${t('book_h')}</h2>
      <div class="pj-book-wrap">${bookingFormHTML(p.id)}</div>
    </div>
  </section>`;

  /* রেন্ডার-পরবর্তী বাইন্ডিং */
  attachPlanEvents();
  mountTour();

  requestAnimationFrame(() => requestAnimationFrame(() => {
    $$('#projectRoot .prog-bar i').forEach((bar) => { bar.style.width = `${bar.dataset.w}%`; });
  }));

  const navButtons = $$('#pjSubnav button');
  navButtons.forEach((btn) => btn.addEventListener('click', () => {
    navButtons.forEach((b) => b.classList.toggle('on', b === btn));
    document.getElementById(btn.dataset.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  scrollSpy?.disconnect();
  scrollSpy = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navButtons.forEach((b) => b.classList.toggle('on', b.dataset.target === entry.target.id));
    }
  }), { rootMargin: '-30% 0px -60%' });
  ['pj-over', 'pj-plan', 'pj-gal', 'pj-tour', 'pj-loc', 'pj-book']
    .forEach((id) => scrollSpy.observe(document.getElementById(id)));
}
