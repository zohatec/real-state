/** মোডাল ওভারলে — #modalRoot-এ রেন্ডার হয় (লাইটবক্স আলাদা রুটে) */
import { $ } from '../utils/dom.js';

export function openModal(html) {
  $('#modalRoot').innerHTML = `<div class="m-ov"><div class="m-panel">${html}</div></div>`;
  document.body.classList.add('lock');
}

export function closeModal() {
  $('#modalRoot').innerHTML = '';
  // লাইটবক্স খোলা থাকলে scroll-lock বহাল থাকে
  if (!$('#lightboxRoot').innerHTML) document.body.classList.remove('lock');
}

export function initModal() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#modalRoot').innerHTML) closeModal();
  });
}