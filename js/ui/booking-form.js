/** "Book a Visit" ফর্ম টেমপ্লেট — হোম, প্রজেক্ট পেজ ও মোডালে ব্যবহৃত */
import { PROJECTS } from '../data/projects.js';
import { t } from '../i18n.js';
import { formatMoney, todayISO } from '../utils/format.js';

export function bookingFormHTML(preselectedProjectId = null) {
  const projectOptions = PROJECTS.map((p) =>
    `<option value="${p.id}" ${preselectedProjectId === p.id ? 'selected' : ''}>${p.name[document.documentElement.dataset.lang || 'bn'] ?? p.name.bn} — ${formatMoney(p.price)}</option>`
  ).join('');

  return `
  <form class="vf-form" data-form="visit" novalidate>
    <div class="vf-row">
      <div class="fld-g">
        <label>${t('f_name')}</label>
        <input name="name" type="text" autocomplete="name">
        <span class="err-t">${t('err_name')}</span>
      </div>
      <div class="fld-g">
        <label>${t('f_phone')}</label>
        <input name="phone" type="tel" inputmode="tel" placeholder="01XXXXXXXXX" autocomplete="tel">
        <span class="err-t">${t('err_phone')}</span>
      </div>
    </div>
    <div class="vf-row">
      <div class="fld-g full">
        <label>${t('f_project')}</label>
        <select name="project">
          <option value="any">${t('f_project_any')}</option>
          ${projectOptions}
        </select>
      </div>
    </div>
    <div class="vf-row">
      <div class="fld-g">
        <label>${t('f_date')}</label>
        <input name="date" type="date" min="${todayISO()}">
        <span class="err-t">${t('err_date')}</span>
      </div>
      <div class="fld-g">
        <label>${t('f_slot')}</label>
        <div class="slots">
          <label><input type="radio" name="slot" value="m" checked><span class="sl">${t('slot_m')}</span></label>
          <label><input type="radio" name="slot" value="a"><span class="sl">${t('slot_a')}</span></label>
          <label><input type="radio" name="slot" value="e"><span class="sl">${t('slot_e')}</span></label>
        </div>
      </div>
    </div>
    <div class="fld-g full">
      <label>${t('f_msg')}</label>
      <textarea name="msg" rows="3"></textarea>
    </div>
    <button class="btn btn-p f-sub" type="submit">${t('f_submit')}</button>
    <p class="f-note">${t('f_note')}</p>
  </form>`;
}