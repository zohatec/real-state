/** হ্যাশ-ভিত্তিক SPA রাউটার — home / #/project/:id / #/admin */
import { renderProjectPage } from './views/project.js';
import { renderAdmin } from './views/admin.js';

const VIEW_SELECTORS = { home: '#viewHome', project: '#viewProject', admin: '#viewAdmin' };
let currentView = 'home';

function showView(name) {
  Object.entries(VIEW_SELECTORS).forEach(([key, selector]) => {
    const el = document.querySelector(selector);
    el.hidden = key !== name;
    el.classList.remove('view');
    if (!el.hidden) { void el.offsetWidth; el.classList.add('view'); } // অ্যানিমেশন রিস্টার্ট
  });
  currentView = name;
}

export function route() {
  const hash = location.hash;

  if (hash.startsWith('#/admin')) {
    showView('admin');
    renderAdmin();
    scrollTo(0, 0);
    return;
  }

  if (hash.startsWith('#/project/')) {
    const id = hash.replace('#/project/', '');
    if (currentView !== 'project') showView('project');
    renderProjectPage(id);
    scrollTo(0, 0);
    return;
  }

  const cameFromOtherView = currentView !== 'home';
  if (cameFromOtherView) showView('home');

  const section = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
  if (section && currentView === 'home') {
    setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  } else if (cameFromOtherView) {
    scrollTo(0, 0);
  }
}

export function initRouter() {
  addEventListener('hashchange', route);
}