/**
 * ফ্লোর প্ল্যান জ্যামিতি (SVG viewBox-এ স্থানাঙ্ক)।
 * base = এই প্ল্যানের ভিত্তি-আয়ত; প্রতিটি কক্ষের ক্ষেত্রফল scale = totalSqft / base দিয়ে বাড়ে।
 */
export const PLANS = {
  A: {
    vw: 720, vh: 540, base: 1650,
    rooms: [
      { x: 24, y: 24, w: 208, h: 176, k: 'master', a: 320, n: { bn: 'মাস্টার বেড', en: 'Master Bed' }, note: { bn: 'দক্ষিণমুখী বড় জানালা, ওয়াক-ইন ওয়ারড্রোব', en: 'Large south window, walk-in wardrobe' } },
      { x: 232, y: 24, w: 96, h: 104, k: 'bath1', a: 42, n: { bn: 'বাথ-১', en: 'Bath 1' }, note: { bn: 'মাস্টারের সংযুক্ত বাথ, হট-ওয়াটার লাইন', en: 'Attached to master, hot-water line' } },
      { x: 232, y: 128, w: 96, h: 72, k: 'store', a: 28, n: { bn: 'স্টোর', en: 'Store' }, note: { bn: 'প্যান্ট্রি ও লিনেন', en: 'Pantry & linen' } },
      { x: 328, y: 24, w: 176, h: 176, k: 'bed2', a: 200, n: { bn: 'বেড-২', en: 'Bed 2' }, note: { bn: 'বারান্দার পাশে, ক্রস-ভেন্টিলেশন', en: 'Beside veranda, cross-ventilated' } },
      { x: 504, y: 24, w: 92, h: 104, k: 'bath2', a: 38, n: { bn: 'বাথ-২', en: 'Bath 2' }, note: { bn: 'কমন বাথ', en: 'Common bath' } },
      { x: 504, y: 128, w: 92, h: 72, k: 'util', a: 26, n: { bn: 'ইউটিলিটি', en: 'Utility' }, note: { bn: 'ওয়াশ জোন', en: 'Wash zone' } },
      { x: 596, y: 24, w: 100, h: 176, k: 'kitchen', a: 120, n: { bn: 'রান্নাঘর', en: 'Kitchen' }, note: { bn: 'পূর্বমুখী জানালা, গ্যাস ও পানির লাইন', en: 'East window, gas & water lines' } },
      { x: 24, y: 200, w: 240, h: 172, k: 'living', a: 340, n: { bn: 'লিভিং', en: 'Living' }, note: { bn: 'ডাবল-হাইট উইন্ডো, বারান্দায় খোলে', en: 'Double-height window, opens to veranda' } },
      { x: 264, y: 200, w: 200, h: 172, k: 'dining', a: 200, n: { bn: 'ডাইনিং', en: 'Dining' }, note: { bn: '৬ জনের ডাইনিং, সার্ভিস লিফটের কাছে', en: 'Seats 6, near service lift' } },
      { x: 464, y: 200, w: 128, h: 172, k: 'bed3', a: 160, n: { bn: 'বেড-৩ / স্টাডি', en: 'Bed 3 / Study' }, note: { bn: 'শিশুর ঘর বা হোম-অফিস', en: 'Kids room or home office' } },
      { x: 592, y: 200, w: 104, h: 84, k: 'bath3', a: 35, n: { bn: 'বাথ-৩', en: 'Bath 3' }, note: { bn: 'গেস্ট বাথ', en: 'Guest bath' } },
      { x: 592, y: 284, w: 104, h: 88, k: 'corr', a: 24, n: { bn: 'করিডর', en: 'Corridor' }, note: { bn: 'ভেতরের পথ', en: 'Inner passage' } },
      { x: 24, y: 372, w: 400, h: 144, k: 'veranda', a: 130, n: { bn: 'বারান্দা', en: 'Veranda' }, note: { bn: 'দক্ষিণমুখী, ঝুলন্ত গাছের স্পেস', en: 'South-facing, planter space' } },
      { x: 424, y: 372, w: 272, h: 144, k: 'fam', a: 95, n: { bn: 'পারিবারিক কোণ', en: 'Family Nook' }, note: { bn: 'টিভি লাউঞ্জ', en: 'TV lounge' } },
    ],
  },
  B: {
    vw: 640, vh: 500, base: 950,
    rooms: [
      { x: 24, y: 24, w: 184, h: 156, k: 'master', a: 190, n: { bn: 'মাস্টার বেড', en: 'Master Bed' }, note: { bn: 'দক্ষিণমুখী জানালা', en: 'South window' } },
      { x: 208, y: 24, w: 84, h: 90, k: 'bath1', a: 30, n: { bn: 'বাথ-১', en: 'Bath 1' }, note: { bn: 'সংযুক্ত বাথ', en: 'Attached bath' } },
      { x: 208, y: 114, w: 84, h: 66, k: 'store', a: 18, n: { bn: 'স্টোর', en: 'Store' }, note: { bn: 'ছোট প্যান্ট্রি', en: 'Small pantry' } },
      { x: 292, y: 24, w: 160, h: 156, k: 'bed2', a: 140, n: { bn: 'বেড-২', en: 'Bed 2' }, note: { bn: 'বারান্দার পাশে', en: 'Beside veranda' } },
      { x: 452, y: 24, w: 84, h: 90, k: 'bath2', a: 28, n: { bn: 'বাথ-২', en: 'Bath 2' }, note: { bn: 'কমন বাথ', en: 'Common bath' } },
      { x: 452, y: 114, w: 84, h: 66, k: 'util', a: 20, n: { bn: 'ইউটিলিটি', en: 'Utility' }, note: { bn: 'ওয়াশ জোন', en: 'Wash zone' } },
      { x: 536, y: 24, w: 80, h: 156, k: 'kitchen', a: 78, n: { bn: 'রান্নাঘর', en: 'Kitchen' }, note: { bn: 'গ্যাস লাইন রেডি', en: 'Gas line ready' } },
      { x: 24, y: 180, w: 232, h: 150, k: 'living', a: 200, n: { bn: 'লিভিং + ডাইনিং', en: 'Living + Dining' }, note: { bn: 'সংযুক্ত ওপেন প্ল্যান', en: 'Open plan combined' } },
      { x: 256, y: 180, w: 152, h: 150, k: 'bed3', a: 118, n: { bn: 'বেড-৩', en: 'Bed 3' }, note: { bn: 'বাচ্চাদের ঘর', en: 'Kids room' } },
      { x: 408, y: 180, w: 208, h: 150, k: 'fam', a: 96, n: { bn: 'স্টাডি / মিডিয়া', en: 'Study / Media' }, note: { bn: 'হোম অফিস কর্নার', en: 'Home office corner' } },
      { x: 24, y: 330, w: 384, h: 126, k: 'veranda', a: 70, n: { bn: 'বারান্দা', en: 'Veranda' }, note: { bn: 'দক্ষিণমুখী', en: 'South-facing' } },
      { x: 408, y: 330, w: 208, h: 126, k: 'bath3', a: 26, n: { bn: 'বাথ-৩', en: 'Bath 3' }, note: { bn: 'গেস্ট বাথ', en: 'Guest bath' } },
    ],
  },
};