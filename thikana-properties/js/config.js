/**
 * ঠিকানা Properties — গ্লোবাল কনফিগ
 * প্রজেক্ট-জুড়ে ব্যবহৃত সব কনস্ট্যান্ট এক জায়গায়।
 */
export const CONFIG = {
  /** WhatsApp বিজনেস নম্বর (আন্তর্জাতিক ফরম্যাট, + ছাড়া) */
  WHATSAPP_NUMBER: '8801712345678',

  STORAGE_KEYS: {
    LEADS: 'thikana_leads',
    EVENTS: 'thikana_events',
    LANG: 'thikana_lang',
  },

  /** localStorage "fetch" লেয়ারের সিমুলেটেড নেটওয়ার্ক লেটেন্সি (ms) */
  FETCH_DELAY_MS: 420,

  /** External SVG স্প্রাইট — প্রতিটি <use> এখানে পয়েন্ট করে */
  SPRITE_URL: 'assets/icons.svg#',
};