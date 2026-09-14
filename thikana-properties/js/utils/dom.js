/**
 * DOM হেল্পার — সিলেক্টর, এস্কেপিং, আইকন, ফাইল-ডাউনলোড।
 */
import { CONFIG } from '../config.js';

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export const escapeHTML = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** স্প্রাইট থেকে লাইন-আইকন */
export const icon = (name, style = '') =>
  `<svg class="ic"${style ? ` style="${style}"` : ''}><use href="${CONFIG.SPRITE_URL}${name}"/></svg>`;

/** স্প্রাইট থেকে ফিলড আইকন (WhatsApp-এর মতো) */
export const iconFilled = (name, style = '') =>
  `<svg class="ic ic-f"${style ? ` style="${style}"` : ''}><use href="${CONFIG.SPRITE_URL}${name}"/></svg>`;

/** ক্লায়েন্ট-সাইড ফাইল ডাউনলোড (CSV/JSON এক্সপোর্ট) */
export function downloadFile(filename, content, mimeType) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type: mimeType }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/** দুই-ধাপ কনফার্মেশন — native confirm() ছাড়াই ডিস্ট্রাকটিভ অ্যাকশনের জন্য */
export function confirmButton(button, confirmLabel, onConfirm) {
  if (button.dataset.armed) { onConfirm(); return; }
  button.dataset.armed = '1';
  const original = button.innerHTML;
  button.innerHTML = icon('i-info') + confirmLabel;
  button.style.borderColor = '#c0391d';
  setTimeout(() => {
    button.dataset.armed = '';
    button.innerHTML = original;
    button.style.borderColor = '';
  }, 2600);
}