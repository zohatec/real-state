/**
 * ============================================================
 *  Lead Service — ডাটা-অ্যাক্সেস লেয়ার ("fetch" স্টাইল)
 * ------------------------------------------------------------
 *  এখন: localStorage (ফ্রি, সার্ভার-লেস ডেমো)।
 *  আসল ব্যাকএন্ডে নিতে চাইলে প্রতিটি মেথডের ভেতরের localStorage
 *  লাইন fetch() দিয়ে বদলান — সিগনেচার async-ই থাকবে, তাই
 *  ফর্ম, ড্যাশবোর্ড বা এক্সপোর্টের কোডে কিছু বদলাতে হবে না।
 *
 *  উদাহরণ:
 *    async list()     { return (await fetch('/api/leads')).json(); }
 *    async add(lead)  { return (await fetch('/api/leads', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(lead) })).json(); }
 *    async remove(id) { await fetch(`/api/leads/${id}`, { method:'DELETE' }); }
 * ============================================================
 */
import { CONFIG } from '../config.js';
import { delay } from '../utils/dom.js';

const read = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
};
const write = (key, rows) => localStorage.setItem(key, JSON.stringify(rows));

export const leadStore = {
  /** সব লিড — ড্যাশবোর্ড এটা "ফেচ" করে */
  async list() {
    await delay(CONFIG.FETCH_DELAY_MS);
    return this.listSync();
  },

  /** সিঙ্ক্রোনাস রিড (এক্সপোর্টের জন্য) */
  listSync() {
    return read(CONFIG.STORAGE_KEYS.LEADS);
  },

  /** নতুন লিড যোগ → সম্পূর্ণ রেকর্ড রিটার্ন করে */
  async add(lead) {
    const rows = this.listSync();
    const record = {
      id: rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1,
      ts: Date.now(),
      status: 'new',
      ...lead,
    };
    rows.push(record);
    write(CONFIG.STORAGE_KEYS.LEADS, rows);
    return record;
  },

  async update(id, patch) {
    const rows = this.listSync();
    const record = rows.find((r) => r.id === id);
    if (record) Object.assign(record, patch);
    write(CONFIG.STORAGE_KEYS.LEADS, rows);
  },

  async remove(id) {
    write(CONFIG.STORAGE_KEYS.LEADS, this.listSync().filter((r) => r.id !== id));
  },

  clear() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.LEADS);
  },

  /** WhatsApp/Phone CTA ক্লিক-ট্র্যাকিং */
  track(type) {
    try {
      const events = read(CONFIG.STORAGE_KEYS.EVENTS);
      events.push({ t: type, ts: Date.now() });
      write(CONFIG.STORAGE_KEYS.EVENTS, events);
    } catch { /* quota/tracking ফেইল হলে ইউজার-ফ্লো থামবে না */ }
  },

  getEvents() {
    return read(CONFIG.STORAGE_KEYS.EVENTS);
  },
};