/**
 * ============================================================
 *  ঠিকানা Properties — অ্যাপ্লিকেশন এন্ট্রি পয়েন্ট (composition root)
 *  সব মডিউল এখানে জোড়া লাগে; অন্য কোনো মডিউল app.js-কে ইমপোর্ট করে না।
 * ============================================================
 */
import { i18nState, setLang, onLanguageChange } from './i18n.js';
import { initRouter, route } from './router.js';
import { initActions } from './actions.js';
import { initRevealSystem, observeReveal, refreshStatement, countUp } from './ui/reveal.js';
import { initCursor } from './ui/cursor.js';
import { initHeroFX } from './ui/hero-fx.js';
import { initHomeFilters, refreshHome } from './views/home.js';
import { renderProjectPage } from './views/project.js';
import { renderAdmin } from './views/admin.js';
import { $, $$ } from './utils/dom.js';
import { num } from './utils/format.js';

/* ভাষা বদলালে সক্রিয় ভিউ অনুযায়ী রি-রেন্ডার */
onLanguageChange(() => {
  refreshHome();
  refreshStatement();
  const hash = location.hash;
  if (hash.startsWith('#/project/')) renderProjectPage(hash.replace('#/project/', ''));
  else if (hash.startsWith('#/admin')) renderAdmin();
});

/* হেডার-স্ক্রল ও মোবাইল মেনু */
function initChrome() {
  let lastY = 0;
  addEventListener('scroll', () => {
    $('#hdr').classList.toggle('solid', scrollY > 30);
    if (Math.abs(scrollY - lastY) > 60) {
      $('#mMenu').classList.remove('open');
      lastY = scrollY;
    }
  }, { passive: true });

  $('#navToggle').addEventListener('click', () => $('#mMenu').classList.toggle('open'));
  $$('#mMenu a').forEach((a) => a.addEventListener('click', () => $('#mMenu').classList.remove('open')));
}

function init() {
  initRevealSystem();
  initCursor();
  initHeroFX();
  initHomeFilters();
  initActions();
  initRouter();
  initChrome();

  $('#yr').textContent = num(new Date().getFullYear());
  setLang(i18nState.lang, { silent: true }); // → refreshHome() সহ সব লিসেনার চলে
  route();
  observeReveal(document.body);
  $$('#hero [data-count]').forEach(countUp);
}

init();