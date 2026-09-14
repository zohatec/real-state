/** কাস্টম কার্সর — ডট + লেইzy-ফলো রিং (শুধু ফাইন-পয়েন্টারে) */
import { $ } from '../utils/dom.js';

export function initCursor() {
  if (!matchMedia('(pointer: fine)').matches) return;
  const dot = $('#curDot');
  const ring = $('#curRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });

  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();

  addEventListener('mouseover', (e) => {
    ring.classList.toggle(
      'big',
      !!e.target.closest('a, button, [data-action], .room, select, input, textarea, .pl-card')
    );
  });
}