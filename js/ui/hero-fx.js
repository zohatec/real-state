/** হিরো-ইন্টার‍্যাকশন: মাউস-প্যারালাক্স লেয়ার + 3D টিল্ট কার্ড */
import { $, $$ } from '../utils/dom.js';

export function initHeroFX() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hero = $('#hero');
  const card = $('#heroCard');
  if (!hero || !card) return;

  const layers = $$('#hero [data-px]');
  let tx = 0, ty = 0, cx = 0, cy = 0;

  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
  });
  hero.addEventListener('mouseleave', () => { tx = ty = 0; });

  (function loop() {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    layers.forEach((el) => {
      const depth = +el.dataset.px;
      el.style.transform = `translate(${cx * depth}px, ${cy * depth}px)`;
    });
    requestAnimationFrame(loop);
  })();

  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateY(${px * 7}deg) rotateX(${-py * 7}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
}