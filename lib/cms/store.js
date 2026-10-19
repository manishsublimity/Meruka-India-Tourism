// The CMS content store (16 Oct 2026): what the admin panel can list, read, save, create and delete.
// Saving writes only the editable fields of an item to data/cms/<path>.json (see hook.js); the imported data file is
// never changed. A new item gets a small data file of its own (a "stub") so the site finds it like any other page;
// deleting moves the data file and its edits to data/cms/trash/, from where it can be put back.
const fs = require('fs');
const path = require('path');
const { DATA, CMS, overridePath, reload } = require('./hook');
const events = new (require('events'))();
// every change: forget the cached data, then tell the site to rebuild its pages
const changed = () => { reload(); events.emit('change'); };

// Google: the page's own title, description and keywords, plus the panel's extras (focus phrase for the checks,
// "hide from Google", a picture for sharing)
const SEO = ['title', 'description', 'keywords', 'focusKeyword', 'noindex', 'ogImage'];
const HERO = ['heroSrc', 'heroAlt'];

// collections: one data file per item
const KINDS = {
  tours: { dir: 'tours', label: 'Tours', one: 'tour', help: 'Every tour page: its days, prices, photos and Google text.',
    fields: ['heading', 'photo', 'route', 'duration', 'days', 'details', 'breadcrumb', ...HERO, ...SEO],
    template: 'golden_triangle_packages' },
  lists: { dir: 'tour-lists', label: 'Tour categories', one: 'category', help: 'Pages that list several tours (Rajasthan Tours, Kerala Tours…): their text and which tours they show.',
    fields: ['heading', 'intro', 'groups', 'outro', 'breadcrumb', ...HERO, ...SEO],
    template: 'india-golden-triangle-tour' },
  pages: { dir: 'articles', label: 'Pages & travel guide', one: 'page', help: 'Text pages: destinations (Delhi, Goa…), the travel guide, visa, weather and more.',
    fields: ['heading', 'html', 'breadcrumb', ...HERO, ...SEO],
    template: 'weather' }
};
// single files: settings and the fixed pages
const SINGLES = {
  // only what the pages actually show (some older home-page data is no longer used anywhere)
  home: { file: 'home', label: 'Home page & footer', help: 'Questions & answers, How it works, the travel guide links, and the footer links.',
    fields: ['faqs', 'steps', 'guideCols', 'stateGroups', 'footerCols', 'seoLinks'] },
  reviews: { file: 'testimonials', label: 'Guest reviews', help: 'The reviews on the Guest Reviews page and the home page.', fields: ['heading', 'intro', 'all', 'closing'] },
  about: { file: 'about', label: 'About us', help: 'The About us page text.', fields: ['leadName', 'paragraphs', 'mission', 'founder', 'atithi', 'heroSrc'] },
  contact: { file: 'contact', label: 'Contact details', help: 'Offices, phone numbers and email (shown on the Contact page, in the footer and on WhatsApp).', fields: ['hqBlock', 'offices', 'heroSrc'] },
  social: { file: 'home2', label: 'Social media', help: 'Facebook, Instagram, YouTube and X addresses for the footer icons.', fields: ['social'] },
  seo: { file: 'seo-settings', label: 'Google settings', help: 'Google Search Console, Google Analytics, the fixed pages\' Google text, and redirects.',
    fields: ['googleVerification', 'googleAnalytics', 'bingVerification', 'defaultShareImage', 'pages', 'redirects'] }
};
// what a new row looks like in a list that starts empty
const TEMPLATES = { redirects: { from: '/old-address', to: '/new-address' } };
// fields every page shows in the editor even when the data has no value yet
const DEFAULTS = { photo: '', focusKeyword: '', noindex: false, ogImage: '' };

const SLUG = /^[A-Za-z0-9][A-Za-z0-9_-]{0,80}$/;
const clone = v => JSON.parse(JSON.stringify(v === undefined ? null : v));
const writeJson = (p, v) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n'); };

function kindOf(kind) { const k = KINDS[kind]; if (!k) throw Object.assign(new Error('Unknown section'), { status: 404 }); return k; }
function fileOf(kind, id) {
  const k = kindOf(kind);
  if (!SLUG.test(id)) throw Object.assign(new Error('Bad name'), { status: 400 });
  const f = path.join(DATA, k.dir, id + '.js');
  if (!fs.existsSync(f)) throw Object.assign(new Error('Not found'), { status: 404 });
  return f;
}
const fresh = f => { delete require.cache[f]; return require(f); };
const pick = (obj, fields) => Object.fromEntries(fields.map(k => [k, clone(obj[k] === undefined ? (k in DEFAULTS ? DEFAULTS[k] : null) : obj[k])]).filter(([, v]) => v !== null));
const plain = s => String(s || '').replace(/<[^>]+>/g, '').trim();

// a small picture for the lists
function thumb(kind, m) {
  if (m.photo) return m.photo;
  if (kind === 'tours') { try { return require(path.join(DATA, 'photos')).photoFor([m.heading, m.url, m.route]); } catch (e) { return ''; } }
  return m.heroSrc || '';
}
// Google checks for one page: what is good, what to fix (the same rules as the editor's Google tab)
function seoCheck(m) {
  const t = plain(m.title), d = plain(m.description), fk = plain(m.focusKeyword).toLowerCase();
  const issues = [];
  if (!t) issues.push('No Google title');
  else if (t.length < 30) issues.push('Google title is short (' + t.length + ' characters; aim for 30–60)');
  else if (t.length > 65) issues.push('Google title is long (' + t.length + ' characters; Google shows about 60)');
  if (!d) issues.push('No Google description');
  else if (d.length < 70) issues.push('Google description is short (' + d.length + ' characters; aim for 120–160)');
  else if (d.length > 170) issues.push('Google description is long (' + d.length + ' characters; Google shows about 160)');
  if (m.heroSrc !== undefined && !plain(m.heroAlt)) issues.push('Banner photo has no description');
  if (fk && !t.toLowerCase().includes(fk)) issues.push('Focus phrase is not in the Google title');
  if (m.noindex) issues.push('Hidden from Google');
  return { level: !issues.length ? 'good' : issues.some(i => /^No |Hidden/.test(i)) ? 'bad' : 'ok', issues, title: t, description: d };
}

// the client's tour codes (data/tour-codes.js)
const codeOf = url => { try { return require(path.join(DATA, 'tour-codes.js')).codeFor(url); } catch (e) { return ''; } };
// sort key in the order of the client's list (GT, ER, RV … then the number)
const codeRank = code => {
  try {
    const cats = [...new Set(Object.values(require(path.join(DATA, 'tour-codes.js')).CODES).map(c => c.split(/[-\s]/)[0]))];
    const [c, n] = String(code).split('-'); const i = cats.indexOf(c);
    return (i < 0 ? 999 : i) * 1000 + (parseInt(n, 10) || 0);
  } catch (e) { return 999999; }
};

// ---- collections ----
function list(kind) {
  const k = kindOf(kind);
  return fs.readdirSync(path.join(DATA, k.dir)).filter(f => f.endsWith('.js')).map(f => {
    const id = f.slice(0, -3), file = path.join(DATA, k.dir, f), m = fresh(file), o = overridePath(file);
    const edited = fs.existsSync(o);
    return { id, url: m.url, name: plain(m.heading || m.title || id), title: plain(m.title), edited, added: !!m.__cmsNew,
      savedAt: edited ? fs.statSync(o).mtime.toISOString() : '', img: thumb(kind, m), info: kind === 'tours' ? String(m.duration || '').replace(/\s*[·-]\s*/, ' / ') : '',
      seo: seoCheck(m).level, hidden: !!m.noindex, code: codeOf(m.url) };
  // (19 Oct 2026) tours and categories in the order of the client's tour codes (GT, GT-1, GT-2 … then those without)
  }).sort((a, b) => (!a.code - !b.code) || (a.code && b.code ? codeRank(a.code) - codeRank(b.code) : 0) || a.name.localeCompare(b.name));
}
function get(kind, id) {
  const k = kindOf(kind), f = fileOf(kind, id), m = fresh(f);
  return { kind, id, url: m.url, label: k.one, fields: k.fields, templates: TEMPLATES, data: pick(m, k.fields) };
}
function save(kind, id, data) {
  const k = kindOf(kind), f = fileOf(kind, id);
  const out = { _meta: { savedAt: new Date().toISOString() } };
  for (const key of k.fields) if (data && Object.prototype.hasOwnProperty.call(data, key)) out[key] = clone(data[key]);
  writeJson(overridePath(f), out);
  changed();
  return get(kind, id);
}
// a new item starts as a copy of an existing one (its layout and fields), under a new address
function create(kind, slug, from, name) {
  const k = kindOf(kind);
  slug = String(slug || '').trim().replace(/\s+/g, '-').replace(/[^A-Za-z0-9_-]/g, '');
  if (!SLUG.test(slug)) throw Object.assign(new Error('Use letters, numbers, - and _ only'), { status: 400 });
  const target = path.join(DATA, k.dir, slug + '.js');
  if (fs.existsSync(target)) throw Object.assign(new Error('That address is already used'), { status: 409 });
  const base = from && SLUG.test(from) && fs.existsSync(path.join(DATA, k.dir, from + '.js')) ? from : k.template;
  const stub = '// Added in the admin panel (' + new Date().toISOString().slice(0, 10) + '). Starts from ' + base + '; its content is in data/cms/' + k.dir + '/' + slug + '.json\n' +
    "module.exports = Object.assign({}, require('./" + base + "'), { file: '" + slug + ".html', url: '/" + slug + "', __cmsNew: true });\n";
  fs.writeFileSync(target, stub);
  const src = fresh(path.join(DATA, k.dir, base + '.js'));
  const data = pick(src, k.fields);
  data.heading = String(name || '').trim() || 'New ' + k.one; data.title = data.heading + ' — Meruka India Tourism';
  writeJson(overridePath(target), Object.assign({ _meta: { createdAt: new Date().toISOString(), from: base } }, data));
  changed();
  return get(kind, slug);
}
function remove(kind, id) {
  const k = kindOf(kind), f = fileOf(kind, id), o = overridePath(f);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const bin = path.join(CMS, 'trash', k.dir, id + '__' + stamp);
  fs.mkdirSync(bin, { recursive: true });
  fs.renameSync(f, path.join(bin, id + '.js'));
  if (fs.existsSync(o)) fs.renameSync(o, path.join(bin, id + '.json'));
  changed();
}
function trash() {
  const out = [];
  for (const k of Object.values(KINDS)) {
    const d = path.join(CMS, 'trash', k.dir);
    if (!fs.existsSync(d)) continue;
    for (const b of fs.readdirSync(d)) out.push({ kind: Object.keys(KINDS).find(x => KINDS[x] === k), id: b.split('__')[0], bin: b, at: b.split('__')[1] });
  }
  return out;
}
function restore(kind, bin) {
  const k = kindOf(kind);
  if (!/^[A-Za-z0-9_-]+__[0-9TZ-]+$/.test(bin)) throw Object.assign(new Error('Bad item'), { status: 400 });
  const d = path.join(CMS, 'trash', k.dir, bin), id = bin.split('__')[0];
  const target = path.join(DATA, k.dir, id + '.js');
  if (fs.existsSync(target)) throw Object.assign(new Error('An item with that address exists again'), { status: 409 });
  fs.renameSync(path.join(d, id + '.js'), target);
  if (fs.existsSync(path.join(d, id + '.json'))) { fs.mkdirSync(path.dirname(overridePath(target)), { recursive: true }); fs.renameSync(path.join(d, id + '.json'), overridePath(target)); }
  fs.rmSync(d, { recursive: true, force: true });
  changed();
}
// put an item back to its imported content (drops the saved edits)
function revert(kind, id) {
  const f = fileOf(kind, id), o = overridePath(f);
  if (fresh(f).__cmsNew) throw Object.assign(new Error('An added item has no imported version'), { status: 400 });
  if (fs.existsSync(o)) fs.unlinkSync(o);
  changed();
}

// ---- single files ----
function single(name) { const s = SINGLES[name]; if (!s) throw Object.assign(new Error('Unknown section'), { status: 404 }); return s; }
function getSingle(name) {
  const s = single(name), m = fresh(path.join(DATA, s.file + '.js'));
  return { kind: 'single', id: name, label: s.label, fields: s.fields, templates: TEMPLATES, data: pick(m, s.fields) };
}
function saveSingle(name, data) {
  const s = single(name), f = path.join(DATA, s.file + '.js');
  const out = { _meta: { savedAt: new Date().toISOString() } };
  for (const key of s.fields) if (data && Object.prototype.hasOwnProperty.call(data, key)) out[key] = clone(data[key]);
  writeJson(overridePath(f), out);
  changed();
  return getSingle(name);
}
function revertSingle(name) { const o = overridePath(path.join(DATA, single(name).file + '.js')); if (fs.existsSync(o)) fs.unlinkSync(o); changed(); }
// every page with its Google check, for the "Google & SEO" overview
function seoReport() {
  const out = [];
  for (const [kind, k] of Object.entries(KINDS)) {
    for (const f of fs.readdirSync(path.join(DATA, k.dir)).filter(f => f.endsWith('.js'))) {
      const m = fresh(path.join(DATA, k.dir, f)), c = seoCheck(m);
      out.push({ kind, section: k.label, id: f.slice(0, -3), url: m.url, name: plain(m.heading || m.title), title: c.title, description: c.description, level: c.level, issues: c.issues, edit: '/admin/' + kind + '/' + f.slice(0, -3) + '#google' });
    }
  }
  const s = fresh(path.join(DATA, 'seo-settings.js'));
  const FIXED = { '/': 'Home page', '/aboutus': 'About us', '/contactus': 'Contact us', '/testimonials': 'Guest Reviews', '/plan-my-trip': 'Plan My Trip' };
  for (const [u, n] of Object.entries(FIXED)) {
    const p = (s.pages || {})[u] || {};
    const c = seoCheck({ title: p.title, description: p.description });
    const builtIn = !p.title && !p.description;
    out.push({ kind: 'fixed', section: 'Main pages', id: u, url: u, name: n, title: c.title || '(built-in title)', description: c.description || '(built-in description)', level: builtIn ? 'good' : c.level, issues: builtIn ? [] : c.issues, edit: '/admin/settings/seo#pages' });
  }
  // the same Google title on two pages
  const seen = {};
  out.forEach(r => { if (r.title && !/^\(/.test(r.title)) (seen[r.title.toLowerCase()] = seen[r.title.toLowerCase()] || []).push(r); });
  Object.values(seen).filter(g => g.length > 1).forEach(g => g.forEach(r => { r.issues.push('Same Google title as ' + (g.length - 1) + ' other page' + (g.length > 2 ? 's' : '')); if (r.level === 'good') r.level = 'ok'; }));
  return out;
}
const singles = () => Object.entries(SINGLES).map(([id, s]) => ({ id, name: s.label, edited: fs.existsSync(overridePath(path.join(DATA, s.file + '.js'))) }));

module.exports = { events, seoReport, seoCheck, TEMPLATES, KINDS, SINGLES, list, get, save, create, remove, trash, restore, revert, getSingle, saveSingle, revertSingle, singles };
