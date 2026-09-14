/** 360°-স্টাইল প্যানোরামা ট্যুর — ড্র্যাগ-প্যান, বাটন-জুম, অটো-ড্রিফট */

let driftFrame = 0; // পুরনো ড্রিফ্ট-লুপ বাতিল করতে (re-render সেফ)

export function mountTour() {
  const box = document.querySelector('.tour');
  if (!box) return;
  const img = box.querySelector('img');

  const state = { x: 0, s: 1, drag: false, startX: 0, startOffset: 0, hover: false };
  const apply = () => {
    img.style.transform = `translate(-50%,-50%) translate(${state.x}px,0) scale(${state.s})`;
  };
  const minX = () => -((2400 * state.s) - box.clientWidth) * 0.5 - 40;
  const clamp = (v) => Math.min(0, Math.max(minX(), v));

  state.x = clamp(-120);

  box.addEventListener('pointerdown', (e) => {
    state.drag = true;
    state.startX = e.clientX;
    state.startOffset = state.x;
    box.classList.add('drag');
    box.setPointerCapture(e.pointerId);
  });
  box.addEventListener('pointermove', (e) => {
    if (!state.drag) return;
    state.x = clamp(state.startOffset + (e.clientX - state.startX));
    apply();
  });
  box.addEventListener('pointerup', () => { state.drag = false; box.classList.remove('drag'); });
  box.addEventListener('pointerenter', () => { state.hover = true; });
  box.addEventListener('pointerleave', () => { state.hover = false; });

  box.parentElement.querySelectorAll('[data-zoom]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.s = Math.min(2.4, Math.max(1, state.s + (btn.dataset.zoom === '+' ? 0.3 : -0.3)));
      state.x = clamp(state.x);
      apply();
    });
  });

  cancelAnimationFrame(driftFrame);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { apply(); return; }
  (function drift() {
    if (!state.drag && !state.hover) {
      state.x -= 0.4;
      if (state.x < minX()) state.x = 0;
      apply();
    }
    driftFrame = requestAnimationFrame(drift);
  })();
  apply();
}