/** ফুলস্ক্রিন ইমেজ-লাইটবক্স — কীবোর্ড নেভিগেশন সহ */
import { $, icon } from '../utils/dom.js';
import { num } from '../utils/format.js';

let sources = [];
let index = 0;

export function openLightbox(list, startIndex = 0, caption = '') {
  sources = list;
  index = startIndex ?? 0;
  $('#lightboxRoot').innerHTML = `
    <div class="light-ov" id="lbOv">
      <button class="light-close" data-action="lb-close" aria-label="Close">${icon('i-x')}</button>
      <span class="light-count" id="lbCount"></span>
      <button class="light-nav light-prev" data-action="lb-prev" aria-label="Previous">${icon('i-arrow-l')}</button>
      <img id="lbImg" src="${sources[index]}" alt="">
      <button class="light-nav light-next" data-action="lb-next" aria-label="Next">${icon('i-arrow-r')}</button>
      <div class="light-cap">${caption}</div>
    </div>`;
  document.body.classList.add('lock');
  updateView();
}

export function closeLightbox() {
  const root = $('#lightboxRoot');
  if (!root.innerHTML) return;
  root.innerHTML = '';
  if (!$('#modalRoot').innerHTML) document.body.classList.remove('lock');
}

export function nextLightbox() {
  index = (index + 1) % sources.length;
  updateView();
}

export function prevLightbox() {
  index = (index - 1 + sources.length) % sources.length;
  updateView();
}

function updateView() {
  $('#lbImg').src = sources[index];
  $('#lbCount').textContent = `${num(index + 1)} / ${num(sources.length)}`;
}

export function initLightbox() {
  document.addEventListener('keydown', (e) => {
    if (!$('#lightboxRoot').innerHTML) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
  });
}