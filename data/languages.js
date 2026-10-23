// Languages for the header picker (23 Oct 2026, client doc: "Language … full list"): every language the Google Translate
// website tool offers, by its Google code. English and the ten most asked-for languages come first, the rest A–Z.
// Each shows its own name (e.g. "Deutsch") with the English name beside it.
const TOP = ['en', 'fr', 'de', 'es', 'it', 'nl', 'pt', 'ru', 'zh-CN', 'ja', 'ko'];
const ALL = ['af', 'sq', 'am', 'ar', 'hy', 'as', 'ay', 'az', 'bm', 'eu', 'be', 'bn', 'bho', 'bs', 'bg', 'ca', 'ceb', 'ny', 'zh-CN', 'zh-TW',
  'co', 'hr', 'cs', 'da', 'dv', 'doi', 'nl', 'en', 'eo', 'et', 'ee', 'tl', 'fi', 'fr', 'fy', 'gl', 'ka', 'de', 'el', 'gn', 'gu', 'ht', 'ha',
  'haw', 'iw', 'hi', 'hmn', 'hu', 'is', 'ig', 'ilo', 'id', 'ga', 'it', 'ja', 'jw', 'kn', 'kk', 'km', 'rw', 'gom', 'ko', 'kri', 'ku', 'ckb',
  'ky', 'lo', 'la', 'lv', 'ln', 'lt', 'lg', 'lb', 'mk', 'mai', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mni-Mtei', 'lus', 'mn', 'my', 'ne',
  'no', 'or', 'om', 'ps', 'fa', 'pl', 'pt', 'pa', 'qu', 'ro', 'ru', 'sm', 'sa', 'gd', 'nso', 'sr', 'st', 'sn', 'sd', 'si', 'sk', 'sl', 'so',
  'es', 'su', 'sw', 'sv', 'tg', 'ta', 'tt', 'te', 'th', 'ti', 'ts', 'tr', 'tk', 'ak', 'uk', 'ur', 'ug', 'uz', 'vi', 'cy', 'xh', 'yi', 'yo', 'zu'];
// Google's own codes that differ from the standard ones, and names the system may not know
const STD = { iw: 'he', jw: 'jv', 'mni-Mtei': 'mni', gom: 'kok' };
const NAMES = { 'zh-CN': ['中文 (简体)', 'Chinese (Simplified)'], 'zh-TW': ['中文 (繁體)', 'Chinese (Traditional)'], ckb: ['کوردی', 'Kurdish (Sorani)'],
  ku: ['Kurdî', 'Kurdish (Kurmanji)'], hmn: ['Hmoob', 'Hmong'], lus: ['Mizo ṭawng', 'Mizo'], kri: ['Krio', 'Krio'], doi: ['डोगरी', 'Dogri'],
  bho: ['भोजपुरी', 'Bhojpuri'], ilo: ['Ilokano', 'Ilocano'], nso: ['Sepedi', 'Sepedi'], 'mni-Mtei': ['ꯃꯤꯇꯩꯂꯣꯟ', 'Meiteilon (Manipuri)'],
  ny: ['Chichewa', 'Chichewa'], tl: ['Filipino', 'Filipino'] };

const name = code => {
  if (NAMES[code]) return NAMES[code];
  const std = STD[code] || code;
  let own = std, en = std;
  try { own = new Intl.DisplayNames([std], { type: 'language' }).of(std) || std; } catch (e) {}
  try { en = new Intl.DisplayNames(['en'], { type: 'language' }).of(std) || std; } catch (e) {}
  return [own.charAt(0).toLocaleUpperCase(std) + own.slice(1), en];
};
const rest = ALL.filter(c => !TOP.includes(c)).map(c => ({ code: c, names: name(c) })).sort((a, b) => a.names[1].localeCompare(b.names[1]));
module.exports = TOP.map(c => ({ code: c, names: name(c) })).concat(rest)
  .map(l => ({ code: l.code, name: l.names[0], en: l.names[0] === l.names[1] ? '' : l.names[1] }));
