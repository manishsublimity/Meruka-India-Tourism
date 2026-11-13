// (13 Nov 2026, client) Exchange rates for the currency picker in the header. The prices on the website are in US dollars;
// a visitor can see them in another currency at today's rate, for guidance (the booking stays in USD).
//
// Source: ExchangeRate-API's free open endpoint (no key, updated once a day; its terms ask for the "Rates By Exchange
// Rate API" link, shown under the picker). Fetched at most every 12 hours by the server — never by each visitor — and
// kept in the database (settings "rates"), so a restart or a day without the service still has the last rates.
const db = require('./db');

const URL = 'https://open.er-api.com/v6/latest/USD';
const EVERY = 12 * 60 * 60 * 1000;
// the currencies offered (the picker shows these, in this order)
const CURRENCIES = [
  ['USD', 'US Dollar'], ['EUR', 'Euro'], ['GBP', 'British Pound'], ['AED', 'UAE Dirham'], ['INR', 'Indian Rupee'],
  ['AUD', 'Australian Dollar'], ['CAD', 'Canadian Dollar'], ['NZD', 'New Zealand Dollar'], ['SGD', 'Singapore Dollar'],
  ['CHF', 'Swiss Franc'], ['JPY', 'Japanese Yen'], ['CNY', 'Chinese Yuan'], ['HKD', 'Hong Kong Dollar'], ['SAR', 'Saudi Riyal'],
  ['QAR', 'Qatari Riyal'], ['MYR', 'Malaysian Ringgit'], ['THB', 'Thai Baht'], ['KRW', 'South Korean Won'], ['ZAR', 'South African Rand'],
  ['SEK', 'Swedish Krona'], ['NOK', 'Norwegian Krone'], ['DKK', 'Danish Krone'], ['PLN', 'Polish Zloty'], ['RUB', 'Russian Ruble'],
  ['TRY', 'Turkish Lira'], ['ILS', 'Israeli Shekel'], ['BRL', 'Brazilian Real'], ['MXN', 'Mexican Peso']
];
const CODES = CURRENCIES.map(c => c[0]);

let cur = null, loading = null;
const pick = all => Object.fromEntries(CODES.filter(c => typeof all[c] === 'number').map(c => [c, all[c]]));

async function refresh() {
  const res = await fetch(URL, { headers: { 'User-Agent': 'MerukaIndiaTourism/1.0 (+website currency picker)' }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error('rates service answered ' + res.status);
  const j = await res.json();
  if (j.result !== 'success' || !j.rates || j.rates.USD !== 1) throw new Error('rates service gave no rates');
  cur = { base: 'USD', updated: new Date((j.time_last_update_unix || Date.now() / 1000) * 1000).toISOString(), fetched: Date.now(), rates: pick(j.rates) };
  try { db.setting.set('rates', cur); } catch (e) { /* the database is not ready: kept in memory */ }
  return cur;
}

// today's rates (the saved ones at once; fresh ones fetched in the background when they are older than 12 hours)
async function rates() {
  if (!cur) { try { cur = db.setting.get('rates'); } catch (e) { cur = null; } }
  const old = !cur || Date.now() - (cur.fetched || 0) > EVERY;
  if (old && !loading) loading = refresh().catch(e => { console.warn('[rates] could not update the exchange rates:', e.message); return cur; }).finally(() => { loading = null; });
  if (!cur && loading) await loading;   // the very first time: wait for them
  return cur || { base: 'USD', updated: null, rates: { USD: 1 } };
}

// (13 Nov 2026, client) the admin panel's Currency settings (Site settings → Currency): the picker on or off, and the
// currencies it offers (US dollars always, first). Saved in the database (settings "currency"), so they travel with the content.
function settings() {
  let v = null; try { v = db.setting.get('currency'); } catch (e) { /* the database is not ready */ }
  const codes = v && Array.isArray(v.codes) ? v.codes.filter(c => CODES.includes(c)) : CODES;
  return { on: !(v && v.on === false), codes: ['USD'].concat(codes.filter(c => c !== 'USD')) };
}
function saveSettings(v) {
  const codes = Array.isArray(v && v.codes) ? v.codes.map(String).filter(c => CODES.includes(c)) : CODES;
  const out = { on: !(v && v.on === false), codes: ['USD'].concat(codes.filter(c => c !== 'USD')) };
  db.setting.set('currency', out);
  return out;
}
// the currencies the website's header offers now (none when the picker is turned off)
function offered() { const s = settings(); return s.on ? CURRENCIES.filter(c => s.codes.includes(c[0])) : []; }
// "Update the rates now" in the panel
async function updateNow() { const r = await refresh(); return r; }

module.exports = { rates, CURRENCIES, settings, saveSettings, offered, updateNow };
