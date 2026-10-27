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
  pages: { dir: 'articles', label: 'Pages', one: 'page', help: 'Text pages: regions, destinations (Delhi, Goa…), the travel guide topics, visa, weather and more.',
    fields: ['heading', 'html', 'guideSection', 'breadcrumb', ...HERO, ...SEO],
    template: 'weather' },
  // (23 Oct 2026) the blog: /blog and /blog/<address>
  posts: { dir: 'posts', label: 'Blog', one: 'post', help: 'Blog posts: travel stories, tips and news. They appear on /blog, newest first.',
    fields: ['heading', 'category', 'date', 'author', 'excerpt', 'photo', 'html', ...SEO],
    template: 'blog-template', urlPrefix: '/blog/' }
};
// single files: settings and the fixed pages. Two sections may share a file (Home page; Header & footer): saving one keeps
// the other's edits. `perm` is what a role needs to change it (see users.js); `page` is the address it edits, if any.
const SINGLES = {
  home: { file: 'home', label: 'Home page', page: '/', perm: 'content', help: 'Every section of the home page, top to bottom: its heading, text, button, cards and photos.',
    fields: ['heroTitle', 'heroSlides', 'stats', 'secPackages', 'offer', 'secPopular', 'secOwnTour', 'secRegions', 'secGuide', 'guideCols', 'secWhy'] },
  // (27 Oct 2026, client) the FAQs have their own page (/faqs); the home page shows the first few of them
  faqs: { file: 'home', label: 'FAQs', page: '/faqs', perm: 'content', help: 'The questions & answers (the first ones also show on the home page) and the “How we work” steps.', fields: ['secFaq', 'faqs', 'steps'] },
  about: { file: 'about', label: 'About us', page: '/aboutus', perm: 'content', help: 'The About us page text.', fields: ['leadName', 'paragraphs', 'mission', 'founder', 'atithi', 'heroSrc'] },
  contact: { file: 'contact', label: 'Contact us', page: '/contactus', perm: 'settings', help: 'Offices, phone numbers and email (shown on the Contact page, in the footer and on WhatsApp).', fields: ['hqBlock', 'offices'] },
  reviews: { file: 'testimonials', label: 'Guest reviews', page: '/testimonials', perm: 'reviews', help: 'The reviews on the Guest Reviews page, the home page and About us.', fields: ['heading', 'intro', 'all', 'closing'] },
  plan: { file: 'enquiry-options', label: 'Enquiry form', page: '/plan-my-trip', perm: 'content', help: 'The Plan My Trip form: the words of each field, which optional fields show, and the choices people pick.',
    fields: ['form', 'titles', 'countries', 'months', 'years', 'days', 'adults', 'children', 'hotelBudget', 'hotelCategory'] },
  guide: { file: 'guide-hub', label: 'India Travel Guide', page: '/guide', perm: 'content', help: 'The India Travel Guide page: topics, essentials at a glance, seasons, regions and travel tips.',
    fields: ['topics', 'glance', 'seasons', 'goodToKnow', 'regions', 'tips'] },
  menus: { file: 'home', label: 'Header & footer', perm: 'menus', help: 'The links in the header menu and the footer columns, and the footer’s popular searches.',
    fields: ['headerMenu', 'footerCols', 'seoLinks'] },
  // (26 Oct 2026, client) the header and the footer as two separate menus, like WordPress
  header: { file: 'home', label: 'Header menu', perm: 'menus', help: 'The links at the top of every page, left to right. Tick pages of the website to add them, or add a custom link.', fields: ['headerMenu'] },
  footer: { file: 'home', label: 'Footer menu', perm: 'menus', help: 'The link columns at the bottom of every page, and the “Popular searches” line.', fields: ['siteLogo', 'footerAbout', 'footerCols', 'popularSearches', 'footerSocial'] },
  social: { file: 'home2', label: 'Social media', perm: 'settings', help: 'Facebook, Instagram, YouTube and X addresses for the footer icons.', fields: ['social'] },
  seo: { file: 'seo-settings', label: 'Google settings', perm: 'settings', help: 'Google Search Console, Google Analytics, the fixed pages’ Google text, and redirects.',
    fields: ['googleVerification', 'googleAnalytics', 'bingVerification', 'defaultShareImage', 'pages', 'redirects'] }
};
// what a new row looks like in a list that starts empty
// what a new line looks like when a list is still empty (paragraphs are lists of {text, bold} pieces)
const PARA = [{ text: '', bold: false }];
const TEMPLATES = { redirects: { from: '/old-address', to: '/new-address' }, intro: PARA, outro: PARA, paras: PARA, closing: PARA };
// fields every page shows in the editor even when the data has no value yet
const DEFAULTS = { photo: '', focusKeyword: '', noindex: false, ogImage: '', category: '', guideSection: '' };

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

// (26 Oct 2026, client) the text pages in plain groups, from where they sit on the website (their breadcrumb):
// destinations (regions, states, cities), the travel guide, the old tour plans, and pages run elsewhere in the panel
const PAGE_GROUPS = { places: 'Destinations', guide: 'Travel guide', tours: 'Old tour plans', hidden: '' };
function pageGroup(id, m) {
  if (id === 'testimonials') return 'hidden';   // its reviews are edited in Guest reviews
  const parents = (m.breadcrumb || []).slice(1, -1).map(b => String(b.label || ''));
  if (parents.some(l => /India Tour Packages/i.test(l))) return 'tours';
  if (/^(north|south|east|west)_india_tour/i.test(id) || parents.some(l => /(North|South|East|West) India Tourism/i.test(l))) return 'places';
  return 'guide';
}

// ---- collections ----
function list(kind) {
  const k = kindOf(kind);
  return fs.readdirSync(path.join(DATA, k.dir)).filter(f => f.endsWith('.js')).map(f => {
    const id = f.slice(0, -3), file = path.join(DATA, k.dir, f), m = fresh(file), o = overridePath(file);
    const edited = fs.existsSync(o);
    return { id, url: m.url, name: plain(m.heading || m.title || id), title: plain(m.title), edited, added: !!m.__cmsNew,
      savedAt: edited ? fs.statSync(o).mtime.toISOString() : '', img: thumb(kind, m), info: kind === 'tours' ? String(m.duration || '').replace(/\s*[·-]\s*/, ' / ') : '',
      seo: seoCheck(m).level, hidden: !!m.noindex, code: codeOf(m.url), published: !m.unpublished,
      hasDraft: fs.existsSync(path.join(CMS, '_drafts', k.dir, id + '.json')), date: m.date || '', group: kind === 'pages' ? pageGroup(id, m) : '',
      crumbs: kind === 'pages' ? (m.breadcrumb || []).slice(1, -1).map(b => String(b.href || '')) : [], guideSection: m.guideSection || '',
      createdAt: m.__cmsNew ? (((readJson(o) || {})._meta || {}).createdAt || fs.statSync(file).birthtime.toISOString()) : '' };
  // (19 Oct 2026) tours and categories in the order of the client's tour codes (GT, GT-1, GT-2 … then those without)
  // (27 Oct 2026, client) what was added in the panel comes first, the newest on top
  }).sort((a, b) => (!!b.createdAt - !!a.createdAt) || (b.createdAt || '').localeCompare(a.createdAt || '') || (!a.code - !b.code) || (a.code && b.code ? codeRank(a.code) - codeRank(b.code) : 0) || a.name.localeCompare(b.name));
}
// ---- drafts and history (23 Oct 2026) ----
// a draft is kept apart (data/cms/_drafts/…), so the website does not show it; publishing writes the live edits and keeps
// a copy of every published version (data/cms/_revisions/…, the latest 25) for the History tab
const readJson = p => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } };
const noMeta = o => Object.fromEntries(Object.entries(o || {}).filter(([k]) => k[0] !== '_'));
const draftFile = (dir, id) => path.join(CMS, '_drafts', dir, id + '.json');
const revDir = (dir, id) => path.join(CMS, '_revisions', dir, id);
const who = user => user ? { by: user.name, byId: user.id } : {};
function snapshot(dir, id, data, user, note) {
  const d = revDir(dir, id); fs.mkdirSync(d, { recursive: true });
  // two versions kept in the same millisecond (the original, then the published one) get different names
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  let name = stamp, n = 1;
  while (fs.existsSync(path.join(d, name + '.json'))) name = stamp + '-' + (n++);
  writeJson(path.join(d, name + '.json'), Object.assign({ _meta: Object.assign({ at: new Date().toISOString(), note: note || 'Published' }, who(user)) }, data));
  const all = fs.readdirSync(d).filter(f => f.endsWith('.json')).sort();
  all.slice(0, Math.max(0, all.length - 25)).forEach(f => fs.unlinkSync(path.join(d, f)));
}
function revisionsOf(dir, id) {
  const d = revDir(dir, id);
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d).filter(f => f.endsWith('.json')).sort().reverse().map(f => { const m = (readJson(path.join(d, f)) || {})._meta || {}; return { rev: f.slice(0, -5), at: m.at || '', by: m.by || '', note: m.note || '' }; });
}
function revisionOf(dir, id, rev) {
  if (!/^[0-9TZ-]+$/.test(String(rev))) throw Object.assign(new Error('Bad version'), { status: 400 });
  const o = readJson(path.join(revDir(dir, id), rev + '.json'));
  if (!o) throw Object.assign(new Error('Version not found'), { status: 404 });
  return noMeta(o);
}
// the first time something is changed, its original (imported) content is kept as the oldest version
function keepOriginal(dir, id, data) { if (!revisionsOf(dir, id).length) snapshot(dir, id, data, null, 'Original'); }

// (27 Oct 2026, client) the photo the tour page picks for each day without its own one (the same rules as the page)
function dayPhotos(m) {
  let P; try { P = require(path.join(DATA, 'photos')); } catch (e) { return []; }
  if (!P.photoChoices || !Array.isArray(m.days)) return [];
  const used = new Set([thumb('tours', m)]);
  m.days.forEach(d => { if (d && d.photo) used.add(d.photo); });
  const one = day => {
    const places = String(day.title || '').replace(/^[^:]*\d(st|nd|rd|th)[^:]*:/i, '').split(/\s*[-–]\s*/).reverse();
    for (const pl of places) { const p = P.photoChoices(pl).find(x => !used.has(x)); if (p) { used.add(p); return p; } }
    for (const para of (day.paras || [])) for (const seg of para) {
      const t = String(seg.text || '').trim();
      if (!seg.bold || t.length < 4 || t.length > 50 || /airport|station|hotel|note/i.test(t)) continue;
      const p = P.photoChoices(t).find(x => !used.has(x)); if (p) { used.add(p); return p; }
    }
    return '';
  };
  return m.days.map(d => d && d.photo ? '' : one(d || {}));
}
// (27 Oct 2026, client) a tour's or category's code (GT-1 …): given in its editor; for a tour, the next free number of
// its first category's code is offered
function codeSuggest(kind, id) {
  const m = fresh(fileOf(kind, id)), TC = require(path.join(DATA, 'tour-codes.js')), all = TC.allCodes();
  if (kind !== 'tours') return '';
  const it = get('tours', id), chosen = it.draft && it.draft.categories;
  const cats = tourCategories(id).filter(c => chosen ? chosen.includes(c.id) : c.checked).map(c => codeOf(c.url)).filter(Boolean);
  const pre = cats[0]; if (!pre) return '';
  const nums = Object.values(all).map(c => (new RegExp('^' + pre + '-(\\d+)$').exec(c) || [])[1]).filter(Boolean).map(Number);
  return pre + '-' + ((nums.length ? Math.max(...nums) : 0) + 1);
}
function setCode(kind, id, code, user) {
  const m = fresh(fileOf(kind, id)), TC = require(path.join(DATA, 'tour-codes.js'));
  code = String(code || '').trim().toUpperCase();
  if (code && !/^[A-Z]{1,4}(-\d{1,3})?$/.test(code)) throw Object.assign(new Error('Use letters, then - and a number, e.g. GT-9'), { status: 400 });
  const key = String(m.url).toLowerCase(), all = TC.allCodes();
  if (code && Object.entries(all).some(([u, c]) => c === code && u !== key)) throw Object.assign(new Error('The code ' + code + ' is already used by another page'), { status: 409 });
  const x = readJson(TC.EXTRA) || {}; x[key] = code; writeJson(TC.EXTRA, x);
  changed();
  return { code };
}
function get(kind, id) {
  const k = kindOf(kind), f = fileOf(kind, id), m = fresh(f);
  const draft = readJson(draftFile(k.dir, id));
  const data = pick(m, k.fields);
  if (draft) Object.assign(data, pick(noMeta(draft), k.fields.filter(x => x in draft)));
  return { kind, id, url: m.url, label: k.one, fields: k.fields, templates: TEMPLATES, data, published: !m.unpublished, isNew: !!m.__cmsNew, thumb: thumb(kind, m), code: codeOf(m.url),
    dayPhotos: kind === 'tours' ? dayPhotos(Object.assign({}, m, data)) : undefined,
    draft: draft ? { at: draft._meta.savedAt, by: draft._meta.by || '', categories: draft._categories || null } : null };
}
// (26 Oct 2026, client) the breadcrumb is not edited by hand any more: its last step is always the page's title, and a
// category page sits under "India Tour Packages"
function autoCrumbs(kind, id, data, m) {
  if (!data || typeof data.heading !== 'string' || !data.heading.trim()) return data;
  const name = plain(data.heading);
  // the breadcrumb is not shown in the editor: start from the page's own one, never from nothing
  let bc = Array.isArray(data.breadcrumb) && data.breadcrumb.length ? clone(data.breadcrumb) : m && Array.isArray(m.breadcrumb) ? clone(m.breadcrumb) : [];
  if (!bc.length) bc = kind === 'lists' && id !== ALL_TOURS ? [{ label: 'Home', href: '/' }, { label: 'India Tour Packages', href: '/itineraries' }, { label: name }] : [{ label: 'Home', href: '/' }, { label: name }];
  // its last step follows the title only when the title is changed (the original wording stays otherwise)
  else if (!m || plain(m.heading) !== name) bc[bc.length - 1] = Object.assign({}, bc[bc.length - 1], { label: name });
  data.breadcrumb = bc;
  return data;
}

// save without publishing: only the admin panel sees it
function saveDraft(kind, id, data, user, categories) {
  if (data && 'heading' in data) autoCrumbs(kind, id, data, fresh(fileOf(kind, id)));
  const k = kindOf(kind); fileOf(kind, id);
  const out = { _meta: Object.assign({ savedAt: new Date().toISOString() }, who(user)) };
  if (Array.isArray(categories)) out._categories = categories;
  for (const key of k.fields) if (data && Object.prototype.hasOwnProperty.call(data, key)) out[key] = clone(data[key]);
  writeJson(draftFile(k.dir, id), out);
  return get(kind, id);
}
// publish: the edits go live, the draft is cleared, and the version is kept in the history
function publish(kind, id, data, user) {
  const k = kindOf(kind), f = fileOf(kind, id), m = fresh(f);
  if (data && 'heading' in data) autoCrumbs(kind, id, data, m);
  keepOriginal(k.dir, id, pick(m, k.fields));
  const out = { _meta: Object.assign({ savedAt: new Date().toISOString() }, who(user)) };
  for (const key of k.fields) if (data && Object.prototype.hasOwnProperty.call(data, key)) out[key] = clone(data[key]);
  if (m.unpublished) out.unpublished = false;
  const prev = readJson(overridePath(f)) || {}; if (prev.url) out.url = prev.url;   // a changed address stays
  writeJson(overridePath(f), out);
  const df = draftFile(k.dir, id); if (fs.existsSync(df)) fs.unlinkSync(df);
  snapshot(k.dir, id, noMeta(out), user, 'Published');
  if (kind === 'tours') syncTourRows(id, user);
  changed();
  return get(kind, id);
}
const save = (kind, id, data, user) => publish(kind, id, data, user);
function discardDraft(kind, id) { const k = kindOf(kind); fileOf(kind, id); const df = draftFile(k.dir, id); if (fs.existsSync(df)) fs.unlinkSync(df); return get(kind, id); }
const revisions = (kind, id) => { const k = kindOf(kind); fileOf(kind, id); return revisionsOf(k.dir, id); };
const revision = (kind, id, rev) => { const k = kindOf(kind); fileOf(kind, id); return pick(revisionOf(k.dir, id, rev), k.fields); };
// take an item off the website without deleting it (it stays in the panel, and can be published again)
function unpublish(kind, id) {
  const k = kindOf(kind), f = fileOf(kind, id), o = overridePath(f);
  const cur = readJson(o) || { _meta: {} };
  cur.unpublished = true; writeJson(o, cur); changed();
  return get(kind, id);
}

// a new item starts as a copy of an existing one (its layout and fields), under a new address, as a draft: it shows on
// the website once it is published
function create(kind, slug, from, name, user, extra) {
  const k = kindOf(kind);
  slug = String(slug || '').trim().replace(/\s+/g, '-').replace(/[^A-Za-z0-9_-]/g, '');
  if (!SLUG.test(slug)) throw Object.assign(new Error('Use letters, numbers, - and _ only'), { status: 400 });
  const target = path.join(DATA, k.dir, slug + '.js');
  if (fs.existsSync(target)) throw Object.assign(new Error('That address is already used'), { status: 409 });
  const url = (k.urlPrefix || '/') + slug;
  const base = from && SLUG.test(from) && fs.existsSync(path.join(DATA, k.dir, from + '.js')) ? from : k.template;
  const stub = '// Added in the admin panel (' + new Date().toISOString().slice(0, 10) + '). Starts from ' + base + '; its content is in data/cms/' + k.dir + '/' + slug + '.json\n' +
    "module.exports = Object.assign({}, require('./" + base + "'), { file: '" + slug + ".html', url: '" + url + "', __cmsNew: true, unpublished: true });\n";
  fs.writeFileSync(target, stub);
  const src = fresh(path.join(DATA, k.dir, base + '.js'));
  const data = pick(src, k.fields);
  data.heading = String(name || '').trim() || 'New ' + k.one; data.title = data.heading + ' — Meruka India Tourism';
  // (27 Oct 2026, client) a new tour starts empty: one empty day, the price and inclusion headings without text, no photo.
  // "Copy" (from a tour of the list) still copies everything.
  if (kind === 'tours' && extra && extra.blank) {
    Object.assign(data, { photo: '', route: '', duration: '', days: [{ day: '01 Day', title: '', eta: '', photo: '', paras: [clone(PARA)] }] });
    if (Array.isArray(data.details)) data.details = data.details.map(b => Object.assign({}, b, { text: '', items: [] }));
    ['description', 'keywords', 'focusKeyword', 'ogImage'].forEach(k => { if (k in data) data[k] = ''; });
  }
  if (kind === 'posts') { data.date = new Date().toISOString().slice(0, 10); data.author = user ? user.name : ''; data.excerpt = ''; data.html = '<p>Write your post here.</p>'; }
  // (26 Oct 2026) a page made inside Destinations or the Travel Guide starts in its place there: under its region or state,
  // or in its guide section
  if (kind === 'pages' && extra) {
    if (extra.guideSection) data.guideSection = String(extra.guideSection).slice(0, 80);
    if (Array.isArray(extra.parents)) data.breadcrumb = [{ label: 'Home', href: '/' }].concat(extra.parents.filter(x => x && x.href).map(x => ({ label: plain(x.label), href: String(x.href) })), [{ label: data.heading }]);
    if (extra.guideSection || extra.parents) data.html = '<p>Write the page here.</p>';
  }
  writeJson(overridePath(target), Object.assign({ _meta: Object.assign({ createdAt: new Date().toISOString(), from: base }, who(user)) }, data));
  // the categories ticked in the "Add" box: kept with the draft, ticked in its Categories tab, applied when it is published
  if (kind === 'tours' && extra && Array.isArray(extra.categories) && extra.categories.length)
    writeJson(draftFile(k.dir, slug), Object.assign({ _meta: Object.assign({ savedAt: new Date().toISOString() }, who(user)), _categories: extra.categories.map(String) }, data));
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
    // (27 Oct 2026, client) each with its name, newest first
    for (const b of fs.readdirSync(d)) { const id = b.split('__')[0], o = readJson(path.join(d, b, id + '.json')) || {};
      out.push({ kind: Object.keys(KINDS).find(x => KINDS[x] === k), id, bin: b, at: b.split('__')[1], name: plain(o.heading || o.title || id) }); }
  }
  return out.sort((a, b) => String(b.at).localeCompare(String(a.at)));
}
// (27 Oct 2026, client) delete for good from Deleted items
function purge(kind, bin) {
  const k = kindOf(kind);
  if (!/^[A-Za-z0-9_-]+__[0-9TZ-]+$/.test(bin)) throw Object.assign(new Error('Bad item'), { status: 400 });
  const d = path.join(CMS, 'trash', k.dir, bin);
  if (!fs.existsSync(d)) throw Object.assign(new Error('Not found'), { status: 404 });
  fs.rmSync(d, { recursive: true, force: true });
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
  // back to the original text; a changed address stays (its redirect points to it)
  const url = (readJson(o) || {}).url;
  if (fs.existsSync(o)) fs.unlinkSync(o);
  if (url) writeJson(o, { url });
  changed();
}

// ---- single files ----
function single(name) { const s = SINGLES[name]; if (!s) throw Object.assign(new Error('Unknown section'), { status: 404 }); return s; }
function getSingle(name) {
  const s = single(name), m = fresh(path.join(DATA, s.file + '.js'));
  const draft = readJson(draftFile('_single', name));
  const data = pick(m, s.fields);
  if (draft) Object.assign(data, pick(noMeta(draft), s.fields.filter(x => x in draft)));
  return { kind: 'single', id: name, label: s.label, fields: s.fields, templates: TEMPLATES, data, url: s.page || '', published: true,
    draft: draft ? { at: draft._meta.savedAt, by: draft._meta.by || '' } : null };
}
// two sections can share a data file: saving one keeps the other's saved edits
function writeSingle(name, data) {
  const s = single(name), f = path.join(DATA, s.file + '.js'), o = overridePath(f);
  const out = Object.assign(readJson(o) || {}, { _meta: { savedAt: new Date().toISOString() } });
  for (const key of s.fields) if (data && Object.prototype.hasOwnProperty.call(data, key)) out[key] = clone(data[key]);
  writeJson(o, out);
}
function saveSingleDraft(name, data, user) {
  const s = single(name);
  const out = { _meta: Object.assign({ savedAt: new Date().toISOString() }, who(user)) };
  for (const key of s.fields) if (data && Object.prototype.hasOwnProperty.call(data, key)) out[key] = clone(data[key]);
  writeJson(draftFile('_single', name), out);
  return getSingle(name);
}
function publishSingle(name, data, user) {
  const s = single(name), m = fresh(path.join(DATA, s.file + '.js'));
  keepOriginal('_single', name, pick(m, s.fields));
  writeSingle(name, data);
  const df = draftFile('_single', name); if (fs.existsSync(df)) fs.unlinkSync(df);
  snapshot('_single', name, pick(data || {}, s.fields.filter(k => data && k in data)), user, 'Published');
  changed();
  return getSingle(name);
}
const saveSingle = (name, data, user) => publishSingle(name, data, user);
function discardSingleDraft(name) { single(name); const df = draftFile('_single', name); if (fs.existsSync(df)) fs.unlinkSync(df); return getSingle(name); }
const singleRevisions = name => { single(name); return revisionsOf('_single', name); };
const singleRevision = (name, rev) => pick(revisionOf('_single', name, rev), single(name).fields);
// back to the imported content: only this section's fields (another section on the same file keeps its edits)
function revertSingle(name) {
  const s = single(name), o = overridePath(path.join(DATA, s.file + '.js')), cur = readJson(o);
  if (cur) { s.fields.forEach(k => delete cur[k]); if (Object.keys(noMeta(cur)).length) writeJson(o, cur); else fs.unlinkSync(o); }
  changed();
}

// ---- a tour's categories (23 Oct 2026): ticked in the tour's editor, written into each category page and into the
// matching group of the All Tour Packages page (/itineraries) ----
const ALL_TOURS = 'itineraries';
const lc = s => String(s || '').toLowerCase();
const hasTour = (groups, href) => (groups || []).some(g => (g.tours || []).some(t => lc(t.href) === lc(href)));
// the seven groups of the website's tour menu (Rajasthan Tours, North India Tours …), to show the categories in groups
const navGroups = () => { try { return require(path.join(DATA, 'tour-nav')).groups; } catch (e) { return []; } };
function tourCategories(tourId) {
  const t = tourId === '_new' ? { url: '' } : fresh(fileOf('tours', tourId));
  return list('lists').filter(l => l.id !== ALL_TOURS).map(l => {
    const m = fresh(path.join(DATA, 'tour-lists', l.id + '.js'));
    const g = navGroups().find(x => x.cats.some(c => lc(c.href) === lc(m.url)));
    return { id: l.id, name: l.name, code: l.code, url: m.url, group: g ? g.title : 'Other categories', published: !m.unpublished, checked: !!t.url && hasTour(m.groups, t.url) };
  });
}
// writes only the categories whose state changes; returns what changed
function setTourCategories(tourId, ids, user) {
  const t = fresh(fileOf('tours', tourId)), want = new Set(ids || []);
  const row = { name: plain(t.heading || t.title), href: t.url, route: t.route || '', duration: String(t.duration || '').replace(/\s*·\s*/, ' - ') };
  const allFile = path.join(DATA, 'tour-lists', ALL_TOURS + '.js');
  const allTours = fs.existsSync(allFile) ? clone(fresh(allFile).groups || []) : null;
  const changedNames = [];
  for (const l of list('lists').filter(x => x.id !== ALL_TOURS)) {
    const f = path.join(DATA, 'tour-lists', l.id + '.js'), m = fresh(f);
    const has = hasTour(m.groups, t.url), on = want.has(l.id);
    if (has === on) continue;
    const groups = clone(m.groups || []);
    if (on) { if (!groups.length) groups.push({ title: '', href: '', tours: [] }); (groups[0].tours = groups[0].tours || []).push(row); }
    else groups.forEach(g => { g.tours = (g.tours || []).filter(x => lc(x.href) !== lc(t.url)); });
    keepOriginal('tour-lists', l.id, pick(m, KINDS.lists.fields));
    const o = overridePath(f);
    writeJson(o, Object.assign(readJson(o) || {}, { _meta: Object.assign({ savedAt: new Date().toISOString() }, who(user)) }, { groups }));
    snapshot('tour-lists', l.id, Object.assign(pick(m, KINDS.lists.fields), { groups }), user, (on ? 'Added ' : 'Removed ') + row.name);
    if (allTours) {
      const g = allTours.find(x => lc(x.href) === lc(m.url));
      if (g) { if (on && !hasTour([g], t.url)) (g.tours = g.tours || []).push(row); if (!on) g.tours = (g.tours || []).filter(x => lc(x.href) !== lc(t.url)); }
    }
    changedNames.push((on ? 'added to ' : 'removed from ') + l.name);
  }
  if (allTours && changedNames.length) {
    const o = overridePath(allFile);
    writeJson(o, Object.assign(readJson(o) || {}, { _meta: Object.assign({ savedAt: new Date().toISOString() }, who(user)) }, { groups: allTours }));
  }
  if (changedNames.length) { syncTourRows(tourId, user); changed(); }
  return changedNames;
}

// a tour's row on each category page (and All Tour Packages) carries its name, route and length: keep them the same as
// the tour after it is published, and point the tour's breadcrumb at a category that really lists it
function syncTourRows(tourId, user) {
  const t = fresh(fileOf('tours', tourId));
  const row = { name: plain(t.heading || t.title), route: t.route || '', duration: String(t.duration || '').replace(/\s*·\s*/, ' - ') };
  const homes = [];
  for (const l of list('lists')) {
    const f = path.join(DATA, 'tour-lists', l.id + '.js'), m = fresh(f);
    if (!hasTour(m.groups, t.url)) continue;
    if (l.id !== ALL_TOURS) homes.push({ label: plain(m.heading), href: m.url });
    let dirty = false;
    const groups = clone(m.groups || []);
    groups.forEach(g => (g.tours || []).forEach(x => { if (lc(x.href) !== lc(t.url)) return; for (const k of ['name', 'route', 'duration']) if (row[k] && x[k] !== row[k]) { x[k] = row[k]; dirty = true; } }));
    if (!dirty) continue;
    const o = overridePath(f);
    writeJson(o, Object.assign(readJson(o) || {}, { groups }));
  }
  const bc = Array.isArray(t.breadcrumb) ? clone(t.breadcrumb) : [];
  const cat = bc.length >= 3 ? bc[bc.length - 2] : null;
  if (homes.length && (!cat || !homes.some(h => lc(h.href) === lc(cat.href)))) {
    const nb = [{ label: 'Home', href: '/' }, { label: 'India Tour Packages', href: '/itineraries' }, homes[0], { label: row.name }];
    const o = overridePath(fileOf('tours', tourId));
    writeJson(o, Object.assign(readJson(o) || {}, { breadcrumb: nb }));
  }
}

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

// (27 Oct 2026, client) a page's web address can be changed. The old address keeps working (a redirect is added), and
// every link the panel keeps to it — category lists, All Tour Packages, breadcrumbs — is moved to the new one.
function changeAddress(kind, id, wanted, user) {
  const k = kindOf(kind), f = fileOf(kind, id), m = fresh(f), old = m.url;
  const slug = String(wanted || '').trim().replace(/^https?:\/\/[^/]+/i, '').replace(/^\/(blog\/)?/, '').replace(/\s+/g, '-').replace(/[^A-Za-z0-9_-]/g, '');
  if (!SLUG.test(slug)) throw Object.assign(new Error('Use letters, numbers, - and _ only'), { status: 400 });
  const url = (k.urlPrefix || '/') + slug;
  if (lc(url) === lc(old)) return get(kind, id);
  for (const kk of Object.keys(KINDS)) if (list(kk).some(it => lc(it.url) === lc(url))) throw Object.assign(new Error('Another page already has that address'), { status: 409 });
  const o = overridePath(f); writeJson(o, Object.assign(readJson(o) || {}, { url }));
  // links kept in other pages
  const fix = (dir, field, edit) => {
    for (const it of fs.readdirSync(path.join(DATA, dir)).filter(x => x.endsWith('.js'))) {
      const file = path.join(DATA, dir, it), d = fresh(file), v = clone(d[field]);
      if (!v || !edit(v)) continue;
      const ov = overridePath(file); writeJson(ov, Object.assign(readJson(ov) || {}, { [field]: v }));
    }
  };
  const swap = arr => { let hit = false; (arr || []).forEach(x => { if (x && lc(x.href) === lc(old)) { x.href = url; hit = true; } }); return hit; };
  fix('tour-lists', 'groups', gs => { let hit = false; gs.forEach(g => { if (lc(g.href) === lc(old)) { g.href = url; hit = true; } if (swap(g.tours)) hit = true; }); return hit; });
  fix('tours', 'breadcrumb', swap); fix('articles', 'breadcrumb', swap);
  // the old address sends visitors and Google to the new one
  const seo = getSingle('seo').data, redirects = (Array.isArray(seo.redirects) ? seo.redirects : []).filter(r => lc(r.from) !== lc(old));
  redirects.forEach(r => { if (lc(r.to) === lc(old)) r.to = url; });
  redirects.push({ from: old, to: url });
  writeSingle('seo', { redirects });
  snapshot(k.dir, id, pick(fresh(f), k.fields), user, 'Address changed from ' + old + ' to ' + url);
  changed();
  return get(kind, id);
}

module.exports = { codeSuggest, setCode, changeAddress, PAGE_GROUPS, events, seoReport, seoCheck, TEMPLATES, KINDS, SINGLES, list, get, save, saveDraft, publish, discardDraft, revisions, revision, unpublish, create, remove, trash,
  restore, purge, revert, getSingle, saveSingle, saveSingleDraft, publishSingle, discardSingleDraft, singleRevisions, singleRevision, revertSingle, singles, tourCategories, setTourCategories };
