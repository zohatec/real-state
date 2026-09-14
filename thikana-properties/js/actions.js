/**
 * গ্লোবাল ইভেন্ট-ডেলিগেশন — click / change / submit।
 * ডাটা-অ্যাকশন প্যাটার্ন: ডাইনামিক HTML-এ data-action বসালেই এখানে ধরা পড়ে।
 */
import { CONFIG } from './config.js';
import { i18nState, t, loc, setLang } from './i18n.js';
import { leadStore } from './services/lead-store.js';
import { openModal, closeModal, initModal } from './ui/modal.js';
import { openLightbox, closeLightbox, nextLightbox, prevLightbox, initLightbox } from './ui/lightbox.js';
import { bookingFormHTML } from './ui/booking-form.js';
import { openPropertyModal } from './components/property-modal.js';
import { applyHeroSearch, resetFilters } from './views/home.js';
import { renderAdmin, seedDemoLeads, STATUS_STYLES } from './views/admin.js';
import { showToast } from './ui/toast.js';
import { $, $$, icon, iconFilled, confirmButton, downloadFile, escapeHTML as esc } from './utils/dom.js';
import { pic, todayISO } from './utils/format.js';
import { PROJECTS } from './data/projects.js';

export function initActions() {
  initModal();
  initLightbox();
  document.addEventListener('click', onGlobalClick);
  document.addEventListener('change', onGlobalChange);
  document.addEventListener('submit', onGlobalSubmit);
}

/* ==================== CLICK ==================== */
async function onGlobalClick(event) {
  const el = event.target.closest('[data-action]');
  if (!el) return;

  switch (el.dataset.action) {
    case 'lang':
      setLang(el.dataset.v);
      break;

    case 'view-project':
      location.hash = `#/project/${el.dataset.id}`;
      break;

    case 'open-property':
      openPropertyModal(el.dataset.id);
      break;

    case 'modal-close':
      closeModal();
      break;

    case 'open-booking': {
      closeModal();
      openModal(`
        <button class="m-close" data-action="modal-close" aria-label="Close">${icon('i-x')}</button>
        <div class="m-body">
          <h2 style="font-family:var(--font-display);font-size:1.6rem;margin-bottom:20px">${t('visit_title')}</h2>
          ${bookingFormHTML(el.dataset.pre)}
        </div>`);
      break;
    }

    case 'hero-card':
      location.hash = '#/project/gulshan-crescent';
      break;

    case 'hero-search':
      applyHeroSearch($('#s-area').value, $('#s-type').value, +$('#s-budget').value);
      $('#listings').scrollIntoView({ behavior: 'smooth' });
      break;

    case 'reset-filter':
      resetFilters();
      break;

    case 'track-wa':
      leadStore.track('whatsapp');
      break;

    case 'track-call':
      leadStore.track('phone');
      break;

    case 'map-load': {
      const box = el.closest('.map-box');
      box.innerHTML = `<iframe src="https://maps.google.com/maps?q=${encodeURIComponent(el.dataset.q)}&z=15&output=embed" loading="lazy" title="Google Map"></iframe>`;
      break;
    }

    /* ---- প্রপার্টি মোডালের ভেতরের ট্যাব/থাম্ব ---- */
    case 'pm-tab': {
      const panel = el.closest('.m-panel');
      $$('.pm-tabs button', panel).forEach((b) => b.classList.toggle('on', b === el));
      $$('.pm-tab', panel).forEach((tab) => tab.classList.toggle('on', tab.id === `pmt-${el.dataset.t}`));
      break;
    }
    case 'pm-thumb': {
      $('#pmImg').src = pic(el.dataset.seed, 760, 570);
      $$('.pm-thumbs img').forEach((img) => img.classList.toggle('on', img === el));
      el.closest('.pm-main').dataset.i = el.dataset.i;
      break;
    }

    /* ---- লাইটবক্স ---- */
    case 'lightbox': {
      const seeds = el.dataset.seeds.split(',');
      openLightbox(seeds.map((s) => pic(s, 1400, 1000)), +el.dataset.i);
      break;
    }
    case 'pj-lightbox': {
      const p = PROJECTS.find((x) => x.id === el.dataset.id);
      if (!p) break;
      const i = +el.dataset.i;
      const caption = p.gal[i][i18nState.lang === 'bn' ? 0 : 1];
      openLightbox(p.gal.map((_, gi) => pic(`${p.id}-g${gi}`, 1400, 950)), i, caption);
      break;
    }
    case 'lb-close': closeLightbox(); break;
    case 'lb-prev': prevLightbox(); break;
    case 'lb-next': nextLightbox(); break;

    /* ---- ড্যাশবোর্ড ---- */
    case 'seed-leads':
      await seedDemoLeads();
      break;

    case 'csv': {
      const rows = await leadStore.list();
      const header = ['Lead ID', 'Name', 'Phone', 'Project', 'Visit Date', 'Slot', 'Source', 'Status', 'Submitted', 'Note'];
      const csv = '\uFEFF' + [header, ...rows.map((r) => [
        `THK-${String(r.id).padStart(4, '0')}`, r.name, r.phone, r.project, r.date, r.slot,
        r.source, r.status, new Date(r.ts).toLocaleString(), r.msg ?? '',
      ])]
        .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
      downloadFile('thikana-leads.csv', csv, 'text/csv;charset=utf-8');
      showToast(i18nState.lang === 'bn' ? 'CSV ডাউনলোড হচ্ছে' : 'CSV downloading', 'i-download');
      break;
    }

    case 'json': {
      const rows = await leadStore.list();
      const backup = JSON.stringify({ exported: new Date().toISOString(), leads: rows, events: leadStore.getEvents() }, null, 2);
      downloadFile('thikana-backup.json', backup, 'application/json');
      showToast(i18nState.lang === 'bn' ? 'JSON ব্যাকআপ তৈরি' : 'JSON backup ready', 'i-file');
      break;
    }

    case 'clear-leads':
      confirmButton(el, t('confirm'), () => {
        leadStore.clear();
        renderAdmin();
        showToast(i18nState.lang === 'bn' ? 'সব লিড মুছে ফেলা হয়েছে' : 'All leads cleared', 'i-trash');
      });
      break;

    case 'del-lead':
      confirmButton(el, t('confirm'), async () => {
        await leadStore.remove(+el.dataset.id);
        renderAdmin();
      });
      break;
  }
}

/* ==================== CHANGE (লিড স্ট্যাটাস) ==================== */
async function onGlobalChange(event) {
  const select = event.target.closest('[data-action="st-change"]');
  if (!select) return;
  await leadStore.update(+select.dataset.id, { status: select.value });
  select.className = `status-sel ${STATUS_STYLES[select.value] || 'st-new'}`;
  showToast(i18nState.lang === 'bn' ? 'স্ট্যাটাস আপডেট হয়েছে' : 'Status updated', 'i-check');
}

/* ==================== SUBMIT (ফর্ম → লিড) ==================== */
async function onGlobalSubmit(event) {
  const form = event.target;

  /* নিউজলেটার */
  if (form.dataset.form === 'newsletter') {
    event.preventDefault();
    const email = form.email.value.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    await leadStore.add({
      name: email.split('@')[0], phone: '—', project: 'newsletter',
      date: '—', slot: '—', msg: 'newsletter', source: 'newsletter',
    });
    form.reset();
    showToast(t('ok_nl'), 'i-mail');
    return;
  }

  /* ভিজিট বুকিং */
  if (form.dataset.form !== 'visit') return;
  event.preventDefault();

  const field = (name) => form.querySelector(`[name="${name}"]`);
  const name = field('name').value.trim();
  const phoneRaw = field('phone').value.replace(/[\s\-+]/g, '').replace(/^88/, '');
  const phoneOk = /^01[3-9]\d{8}$/.test(phoneRaw);
  const date = field('date').value;
  const dateOk = !!date && date >= todayISO();

  const setError = (inputName, on) => field(inputName)?.closest('.fld-g')?.classList.toggle('err', on);
  setError('name', !name);
  setError('phone', !phoneOk);
  setError('date', !dateOk);
  if (!name || !phoneOk || !dateOk) return;

  const project = PROJECTS.find((x) => x.id === field('project').value);
  const slotValue = form.querySelector('[name="slot"]:checked')?.value;
  const slot = slotValue === 'm' ? t('slot_m') : slotValue === 'a' ? t('slot_a') : t('slot_e');
  const submitBtn = form.querySelector('[type="submit"]');
  submitBtn.disabled = true;

  const record = await leadStore.add({
    name,
    phone: phoneRaw,
    project: project ? loc(project.name) : t('f_project_any'),
    date,
    slot,
    msg: field('msg').value.trim(),
    source: 'visit-form',
  });

  submitBtn.disabled = false;
  form.reset();
  field('date').min = todayISO();
  closeModal();
  showToast(t('ok_toast')
    .replace('{n}', esc(name))
    .replace('{id}', `THK-${String(record.id).padStart(4, '0')}`));
}