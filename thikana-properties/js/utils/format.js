/**
 * ফরম্যাটিং হেল্পার — টাকা (কোটি/লাখ), বাংলা সংখ্যা, তারিখ, প্লেসহোল্ডার ইমেজ।
 * সব ফাংশন i18nState.lang অনুযায়ী আউটপুট দেয়।
 */
import { i18nState } from '../i18n.js';

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const BN_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const toBnDigits = (value) => String(value).replace(/[0-9]/g, (d) => BN_DIGITS[+d]);

/** সংখ্যা — বর্তমান ভাষার অঙ্কে */
export const num = (value) => (i18nState.lang === 'bn' ? toBnDigits(value) : String(value));

const trim2 = (v) =>
  (Math.round(v * 100) / 100).toString().replace(/(\.\d\d?)0+$/, '$1').replace(/\.$/, '');

/** টাকা — কোটি/লাখ পদ্ধতিতে (৳ ৪.১৫ কোটি / ৳ 4.15 Cr) */
export function formatMoney(value) {
  if (value >= 1e7) {
    const cr = trim2(value / 1e7);
    return i18nState.lang === 'bn' ? `৳ ${num(cr)} কোটি` : `৳ ${cr} Cr`;
  }
  const lakh = Math.round(value / 1e5);
  return i18nState.lang === 'bn' ? `৳ ${num(lakh)} লাখ` : `৳ ${lakh} Lakh`;
}

export const formatPerSqft = (value) =>
  i18nState.lang === 'bn'
    ? `৳ ${num(value.toLocaleString('en-IN'))}/বর্গফুট`
    : `৳ ${value.toLocaleString('en-IN')}/sqft`;

export const formatKatha = (k) =>
  i18nState.lang === 'bn' ? `${num(k)} কাঠা` : `${k} Katha`;

export const formatSqft = (value) =>
  i18nState.lang === 'bn'
    ? `${num(value.toLocaleString('en-IN'))} বর্গফুট`
    : `${value.toLocaleString('en-IN')} sqft`;

export function formatDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return i18nState.lang === 'bn'
    ? `${num(d.getDate())} ${BN_MONTHS[d.getMonth()]}, ${num(d.getFullYear())}`
    : `${d.getDate()} ${EN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export const todayISO = () => new Date().toISOString().slice(0, 10);

/** প্লেসহোল্ডার ইমেজ (প্রোডাকশনে আসল URL দিয়ে রিপ্লেস করুন) */
export const pic = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w}/${h}.jpg`;