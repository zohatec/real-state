/**
 * i18n ইঞ্জিন — ভাষার স্টেট, ট্রান্সলেশন লুকআপ,
 * data-i18n অ্যাট্রিবিউট অ্যাপ্লাই আর ভাষা-পরিবর্তন লিসেনার।
 */
import { TRANSLATIONS } from './data/translations.js';
import { CONFIG } from './config.js';
import { $ } from './utils/dom.js';
import { showToast } from './ui/toast.js';

export const i18nState = {
  lang: localStorage.getItem(CONFIG.STORAGE_KEYS.LANG) || 'bn',
};

const listeners = new Set();

/** কী থেকে বর্তমান ভাষার অনুবাদ; না পেলে বাংলা ফলব্যাক */
export function t(key) {
  const entry = TRANSLATIONS[key];
  if (!entry) return key;
  return entry[i18nState.lang] ?? entry.bn;
}

/** { bn: '…', en: '…' } আকৃতির ডাটা-অবজেক্ট থেকে বর্তমান ভাষার মান */
export const loc = (obj) => (obj ? (obj[i18nState.lang] ?? obj.bn) : '');

/** ভাষা বদলালে যেসব ভিউ নিজেদের রি-রেন্ডার করবে সেগুলো রেজিস্টার করুন */
export function onLanguageChange(handler) {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

/** index.html-এর স্ট্যাটিক [data-i18n] নোডগুলোতে অনুবাদ বসায় */
export function applyStaticI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const entry = TRANSLATIONS[el.dataset.i18n];
    if (entry) el.innerHTML = entry[i18nState.lang] ?? entry.bn;
  });
  $('#langBn').classList.toggle('on', i18nState.lang === 'bn');
  $('#langEn').classList.toggle('on', i18nState.lang === 'en');
  document.documentElement.lang = i18nState.lang;
  document.documentElement.dataset.lang = i18nState.lang;
  document.title = t('doc_title');
}

/** ভাষা পরিবর্তন: স্টেট আপডেট → স্ট্যাটিক অ্যাপ্লাই → সব লিসেনারকে জানানো */
export function setLang(lang, { silent = false } = {}) {
  i18nState.lang = lang;
  localStorage.setItem(CONFIG.STORAGE_KEYS.LANG, lang);
  applyStaticI18n();
  listeners.forEach((handler) => handler(lang));
  if (!silent) {
    showToast(lang === 'bn' ? 'ভাষা: বাংলা' : 'Language: English', 'i-info');
  }
}