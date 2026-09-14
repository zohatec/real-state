/** টোস্ট নোটিফিকেশন — #toastRoot-এ জমে, ৪ সেকেন্ডে বিদায় */
import { $, icon } from '../utils/dom.js';

export function showToast(message, iconName = 'i-check') {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${icon(iconName)}<div>${message}</div>`;
  $('#toastRoot').appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 450);
  }, 4000);
}