/** স্ক্রল-রিভিল, কাউন্ট-আপ আর স্টেটমেন্ট-অ্যানিমেশন */
import { $, $$ } from '../utils/dom.js';
import { t } from '../i18n.js';
import { num } from '../utils/format.js';

let observer = null;

export function initRevealSystem() {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (entry.target.id === 'statement') {
        animateStatement();
      } else {
        entry.target.classList.add('in');
      }
      $$('[data-count]', entry.target).forEach(countUp);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -40px' });
}

export function observeReveal(root = document) {
  $$('.reveal:not(.in)', root).forEach((el) => observer?.observe(el));
}

/** শব্দ-ধরে-ধরে স্টেটমেন্ট রিভিল — শব্দ আগে বসে, তারপর .in যোগ হয় (transition চালু হয়) */
export function animateStatement() {
  const box = $('#stWords');
  if (!box) return;
  box.innerHTML = '';
  t('st_words').forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'w';
    span.style.setProperty('--d', `${i * 0.14}s`);
    span.innerHTML = word;
    box.appendChild(span);
  });
  requestAnimationFrame(() => requestAnimationFrame(() => $('#statement')?.classList.add('in')));
}

/** ভাষা বদলালে ইতিমধ্যে দৃশ্যমান স্টেটমেন্টের শব্দ নতুন ভাষায় বসে যায় */
export function refreshStatement() {
  if ($('#statement')?.classList.contains('in')) animateStatement();
}

export function countUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const target = +el.dataset.count;
  const duration = 1500;
  const t0 = performance.now();
  (function frame(now) {
    const p = Math.min(1, (now - t0) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = num(Math.round(target * eased).toLocaleString('en-IN'));
    if (p < 1) requestAnimationFrame(frame);
  })(t0);
}