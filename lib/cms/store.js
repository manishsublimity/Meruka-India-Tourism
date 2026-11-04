// The CMS content store (16 Oct 2026): what the admin panel can list, read, save, create and delete.
// Saving writes only the editable fields of an item to data/cms/<path>.json (see hook.js); the imported data file is
// never changed. A new item gets a small data file of its own (a "stub") so the site finds it like any other page;
// deleting moves the data file and its edits to data/cms/trash/, from where it can be put back.
const fs = require('fs');
const path = require('path');
const { DATA, CMS, overridePath, reload } = require('./hook');
const events = new (require('events'))();
// every change: forget the cached data, then tell the site to rebuild its pages
// (2 Nov 2026) a change to many items at once (prices of many tours) rebuilds the site once, at the end
let hold = 0;
const changed = () => { if (hold) return; reload(); events.emit('change'); };

// Google: the page's own title, description and keywords, plus the panel's extras (focus phrase for the checks,
// "hide from Google", a picture for sharing)
// (28 Oct 2026, client) and, as in the SEO plugins: the social media text and picture (Facebook / WhatsApp, X), the
// canonical address and "do not follow the links"
const SEO = ['title', 'description', 'keywords', 'focusKeyword', 'noindex', 'ogImage', 'nofollow', 'canonical', 'ogTitle', 'ogDescription', 'twTitle', 'twDescription', 'twImage'];
const HERO = ['heroSrc', 'heroAlt'];

// collections: one data file per item
const KINDS = {
  tours: { dir: 'tours', label: 'Tours', one: 'tour', help: 'Every tour page: its days, prices, photos and Google text.',
    fields: ['heading', 'photo', 'route', 'duration', 'summary', 'days', 'details', 'priceLine', 'priceIncludes', 'breadcrumb', ...HERO, ...SEO],
    template: 'golden_triangle_packages' },
  lists: { dir: 'tour-lists', label: 'Tour categories', one: 'category', help: 'Pages that list several tours (Rajasthan Tours, Kerala Tours…): their text and which tours they show.',
    fields: ['heading', 'navGroup', 'tourType', 'intro', 'groups', 'outro', 'breadcrumb', ...HERO, ...SEO],
    template: 'india-golden-triangle-tour' },
  pages: { dir: 'articles', label: 'Pages', one: 'page', help: 'Text pages: regions, destinations (Delhi, Goa…), the travel guide topics, visa, weather and more.',
    fields: ['heading', 'html', 'guideSection', 'tours', 'listPhoto', 'breadcrumb', ...HERO, ...SEO],
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
const DEFAULTS = { listPhoto: '', tourType: '', summary: '', priceLine: '', priceIncludes: [], tours: [], navGroup: '', photo: '', focusKeyword: '', noindex: false, ogImage: '', category: '', guideSection: '', nofollow: false, canonical: '', ogTitle: '', ogDescription: '', twTitle: '', twDescription: '', twImage: '' };

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
  if (kind === 'tours') { try { return require(path.join(DATA, 'home2')).tourPhoto(m.url, plain(m.heading), m.route); } catch (e) { return ''; } }
  // (3 Nov 2026, client) a category without a banner of its own shows the photo its page shows
  if ((kind === 'lists' || kind === 'pages') && (!m.heroSrc || /india-tours-main/.test(m.heroSrc))) { try { return require(path.join(DATA, 'photos')).photoFor([m.heading, m.url]); } catch (e) { return m.heroSrc || ''; } }
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
      savedAt: edited ? fs.statSync(o).mtime.toISOString() : '', img: thumb(kind, m), banner: m.heroSrc || '', info: kind === 'tours' ? String(m.duration || '').replace(/\s*[·-]\s*/, ' / ') : '',
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
  // (3 Nov 2026, client) the price box's "Price includes" points and the line beside "Starts from": the website's own
  // words open in the editor, ready to change (the same words the tour page shows when they are empty)
  if (kind === 'tours' && !(data.priceIncludes || []).some(x => String(x).trim())) data.priceIncludes = ['Hotel accommodation on twin sharing basis', 'Air-conditioned car with driver throughout sightseeing', 'Transport service from arrival until final departure'];
  if (kind === 'tours' && !String(data.priceLine || '').trim()) data.priceLine = 'The price quote includes a private tour with {hotel} hotels, a private car with driver, and other services as mentioned below.';
  // (2 Nov 2026, client) the description the tour page shows now (made from the route) opens in the editor, ready to change
  if (kind === 'tours' && !String(data.summary || '').trim() && String(data.route || m.route || '').split(/\s+[-–]\s+/).filter(Boolean).length > 1) { try { data.summary = '<p>' + require(path.join(DATA, 'tour-desc.js'))(Object.assign({}, m, data)).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</p>'; } catch (e) { data.summary = ''; } }
  // (2 Nov 2026, client) every day of a tour can have a note (e.g. "The Taj Mahal is closed on Fridays."): the box shows on each day
  if (kind === 'tours' && Array.isArray(data.days)) data.days = daysForEditor(data.days.map(d => d && typeof d === 'object' && !('note' in d) ? Object.assign({}, d, { note: '' }) : d));
  // (2 Nov 2026, client) a category's group in the tour menu: the original categories have a fixed place there
  const navInfo = kind === 'lists' ? { navGroups: navGroups().map(g => g.title), navFixed: m.navGroup ? '' : ((navGroups().find(g => g.cats.some(c => lc(c.href) === lc(m.url))) || {}).title || '') } : {};
  // (3 Nov 2026, client) a destination page: its group, and the pages under it (a region's states, a state's cities),
  // which the website lists on it by themselves
  if (kind === 'pages') {
    navInfo.group = pageGroup(id, m);
    navInfo.children = list('pages').filter(p => p.id !== id && p.crumbs.length && lc(p.crumbs[p.crumbs.length - 1]) === lc(m.url))
      .map(p => ({ id: p.id, name: p.name, url: p.url, img: p.img, published: p.published }));
    // (4 Nov 2026, client) the photo of its card on the page above it (its region or state), as the website shows it now
    try {
      const up = ((m.breadcrumb || [])[(m.breadcrumb || []).length - 2] || {}).href, parent = up && list('pages').find(p => lc(p.url) === lc(up));
      const base = h => String(h || '').replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+/, '').replace(/\.(html?|aspx)$/i, '').toLowerCase();
      const li = parent ? [...String(fresh(fileOf('pages', parent.id)).html || '').matchAll(/<li\b[\s\S]*?<\/li>/gi)].map(x => x[0]).find(b => [...b.matchAll(/href="([^"]*)"/g)].some(x => base(x[1]) === base(m.url)) && /<img/i.test(b)) : '';
      // (4 Nov 2026, client) what the website shows: the banner (a photo of the place when the imported banner is still
      // there), and on the list the page's own list photo, else that banner, else the photo its card had
      const ph = require(path.join(DATA, 'photos.js')), live = Object.assign({}, m, data);
      navInfo.bannerAuto = ph.bannerFor(live.heroSrc, live.heading, m.url);
      const cardImg = ((li || '').match(/<img\b[^>]*\bsrc="([^"]*)"/i) || [])[1] || '';
      navInfo.listImg = (ph.isGenericBanner(navInfo.bannerAuto) ? '' : navInfo.bannerAuto) || (cardImg ? '/' + cardImg.replace(/^(https?:\/\/[^/]+)?\/*/i, '') : '');
      navInfo.parentName = parent ? parent.name : '';
    } catch (e) { navInfo.listImg = ''; }
  }
  return Object.assign(navInfo, { kind, id, url: m.url, label: k.one, fields: k.fields, templates: TEMPLATES, data, published: !m.unpublished, isNew: !!m.__cmsNew, thumb: thumb(kind, m), code: codeOf(m.url),
    dayPhotos: kind === 'tours' ? dayPhotos(Object.assign({}, m, data)) : undefined,
    draft: draft ? { at: draft._meta.savedAt, by: draft._meta.by || '', categories: draft._categories || null } : null });
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
// (3 Nov 2026, client) a tour day's text in the same full text editor as the pages: kept as html, and as the old
// paragraphs ([{ text, bold, italic, underline, href }]) that the rest of the site reads (highlights, description)
const escH = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const segsHtml = segs => (segs || []).map(x => { let h = escH(x.text || ''); if (x.italic) h = '<i>' + h + '</i>'; if (x.underline) h = '<u>' + h + '</u>'; if (x.bold) h = '<b>' + h + '</b>'; if (x.href) h = '<a href="' + escH(x.href) + '">' + h + '</a>'; return h; }).join('');
const unH = s => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
function htmlParas(html) {
  return String(html || '').split(/<\/(?:p|li|h[1-6]|div|blockquote|tr)>|<br\s*\/?>/i).map(block => {
    const segs = []; let b = 0, i = 0, u = 0; const href = [];
    block.split(/(<[^>]+>)/).forEach(part => {
      const t = /^<(\/?)([a-z0-9]+)([^>]*)>$/i.exec(part);
      if (t) { const close = !!t[1], n = t[2].toLowerCase();
        if (n === 'b' || n === 'strong') b += close ? -1 : 1; else if (n === 'i' || n === 'em') i += close ? -1 : 1; else if (n === 'u') u += close ? -1 : 1;
        else if (n === 'a') { if (close) href.pop(); else href.push((/href="([^"]*)"/i.exec(t[3]) || [])[1] || ''); }
        return; }
      const text = unH(part); if (!text) return;
      const x = { text, bold: b > 0 }; if (i > 0) x.italic = true; if (u > 0) x.underline = true; if (href.length && href[href.length - 1]) x.href = unH(href[href.length - 1]);
      const last = segs[segs.length - 1];
      if (last && last.bold === x.bold && !!last.italic === !!x.italic && !!last.underline === !!x.underline && (last.href || '') === (x.href || '')) last.text += text; else segs.push(x);
    });
    if (segs.length) { segs[0].text = segs[0].text.replace(/^\s+/, ''); segs[segs.length - 1].text = segs[segs.length - 1].text.replace(/\s+$/, ''); }
    return segs.filter(x => x.text);
  }).filter(s => s.length);
}
// the paragraphs the tour page leaves out (a later "Label:" line) stay out of the editor too
const dayHtml = (d, last) => (d.paras || []).filter((p, k) => Array.isArray(p) && !(k > 0 && p[0] && p[0].bold && /:\s*$/.test(p[0].text))).map(p => '<p>' + segsHtml(p) + '</p>').join('');
const daysForEditor = days => days.map((d, i) => { if (!d || typeof d !== 'object') return d; const o = {}; Object.keys(d).forEach(k => { if (k === 'paras' || k === 'body') { if (!('html' in o)) o.html = typeof d.html === 'string' ? d.html : dayHtml(d, i === days.length - 1); } else if (k !== 'html') o[k] = d[k]; }); if (!('html' in o)) o.html = d.html || ''; return o; });
const daysFromEditor = days => Array.isArray(days) ? days.map(d => d && typeof d === 'object' && typeof d.html === 'string' ? Object.assign({}, d, { paras: htmlParas(d.html) }) : d) : days;
function saveDraft(kind, id, data, user, categories) {
  if (kind === 'tours' && data && data.days) data = Object.assign({}, data, { days: daysFromEditor(data.days) });
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
  if (kind === 'tours' && data && data.days) data = Object.assign({}, data, { days: daysFromEditor(data.days) });
  const k = kindOf(kind), f = fileOf(kind, id), m = fresh(f);
  if (data && 'heading' in data) autoCrumbs(kind, id, data, m);
  keepOriginal(k.dir, id, pick(m, k.fields));
  const out = { _meta: Object.assign({ savedAt: new Date().toISOString() }, who(user)) };
  for (const key of k.fields) if (data && Object.prototype.hasOwnProperty.call(data, key)) out[key] = clone(data[key]);
  // a page added in the panel is a draft (its file says so) until it is published: every publish keeps it live
  // (3 Nov 2026: publishing it a second time used to make it a draft again)
  if (m.unpublished || m.__cmsNew) out.unpublished = false;
  // (4 Nov 2026, client) a tour's prices that change are written in the price log (Prices & notes → Price log)
  if (kind === 'tours' && out.details) logPrices(id, m, out.details, user);
  const prev = readJson(overridePath(f)) || {}; if (prev.url) out.url = prev.url;   // a changed address stays
  // (2 Nov 2026) what the editor does not show (a category's tours, set from each tour) stays as it was
  for (const key of k.fields) if (!(key in out) && key in prev) out[key] = prev[key];
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
  // (2 Nov 2026, client) a new category takes only the page frame (menus, footer) from its base: no text, tours or banner
  const own = kind === 'lists' && extra && extra.blank ? ", groups: [], intro: [], outro: [], tourType: '', heroSrc: '', heroAlt: '', description: '', keywords: ''" : '';
  const stub = '// Added in the admin panel (' + new Date().toISOString().slice(0, 10) + '). Starts from ' + base + '; its content is in data/cms/' + k.dir + '/' + slug + '.json\n' +
    "module.exports = Object.assign({}, require('./" + base + "'), { file: '" + slug + ".html', url: '" + url + "', __cmsNew: true, unpublished: true" + own + " });\n";
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
  // (2 Nov 2026, client) a new category starts empty too: only its name and its group in the tour menu; its tours are the
  // tours that tick it (each tour's Categories tab). "Copy" still copies a category as it is.
  if (kind === 'lists' && extra && extra.blank) {
    Object.assign(data, { intro: [], outro: [], tourType: '', heroSrc: '', heroAlt: '', groups: [{ title: '', href: '', tours: [] }],
      breadcrumb: [{ label: 'Home', href: '/' }, { label: 'India Tour Packages', href: '/itineraries' }, { label: data.heading }] });
    ['description', 'keywords', 'focusKeyword', 'ogImage'].forEach(k => { if (k in data) data[k] = ''; });
  }
  if (kind === 'lists' && extra && typeof extra.navGroup === 'string') data.navGroup = extra.navGroup.slice(0, 80);
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
// (28 Oct 2026, client) every fixed page (Home, About, Contact …) has its own SEO: title, description, keywords, search
// words, hide from Google and share picture. They are kept with the Google settings (data/seo-settings → pages, by address)
const SEO_BLANK = { title: '', description: '', keywords: '', focusKeyword: '', noindex: false, ogImage: '', nofollow: false, canonical: '', ogTitle: '', ogDescription: '', twTitle: '', twDescription: '', twImage: '' };
const hasSeo = (name, s) => !!s.page && name !== 'seo';
const seoPages = () => { try { return clone(fresh(path.join(DATA, 'seo-settings.js')).pages || {}); } catch (e) { return {}; } };
function getSingle(name) {
  const s = single(name), m = fresh(path.join(DATA, s.file + '.js'));
  const draft = readJson(draftFile('_single', name));
  const data = pick(m, s.fields);
  if (draft) Object.assign(data, pick(noMeta(draft), s.fields.filter(x => x in draft)));
  if (hasSeo(name, s)) data.seo = Object.assign({}, SEO_BLANK, seoPages()[s.page] || {}, draft && draft.seo ? draft.seo : {});
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
  if (hasSeo(name, s) && data && data.seo) out.seo = clone(data.seo);
  writeJson(draftFile('_single', name), out);
  return getSingle(name);
}
function publishSingle(name, data, user) {
  const s = single(name), m = fresh(path.join(DATA, s.file + '.js'));
  keepOriginal('_single', name, pick(m, s.fields));
  writeSingle(name, data);
  if (hasSeo(name, s) && data && data.seo && typeof data.seo === 'object') {
    const pages = seoPages(), sv = data.seo;
    pages[s.page] = Object.fromEntries(Object.keys(SEO_BLANK).map(k => [k, typeof SEO_BLANK[k] === 'boolean' ? !!sv[k] : String(sv[k] || '')]));
    writeSingle('seo', { pages });
  }
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
    return { id: l.id, name: l.name, code: l.code, url: m.url, group: g ? g.title : 'New categories', published: !m.unpublished, checked: !!t.url && hasTour(m.groups, t.url) };
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

// ---- (4 Nov 2026, client) a text page moved to another place: under another region, state, city or guide page, or to
// the top of its part. Its breadcrumb changes, and so do the breadcrumbs of the pages under it, so the website and
// the panel show them all in their new place. It goes live at once (the place of a page, not its text).
function movePage(id, parents, user, guideSection) {
  const k = kindOf('pages'), f = fileOf('pages', id), m = fresh(f);
  if (!Array.isArray(parents)) throw Object.assign(new Error('Bad data'), { status: 400 });
  const chain = parents.filter(p => p && p.href).map(p => ({ label: plain(p.label), href: String(p.href) }));
  const all = list('pages');
  const under = p => p.crumbs.some(c => lc(c) === lc(m.url));
  if (chain.some(c => lc(c.href) === lc(m.url) || all.some(p => under(p) && lc(p.url) === lc(c.href))))
    throw Object.assign(new Error('A page cannot go under itself or under one of its own pages.'), { status: 400 });
  const write = (pid, bc, extra) => {
    const pf = fileOf('pages', pid), pm = fresh(pf), o = overridePath(pf);
    keepOriginal(k.dir, pid, pick(pm, k.fields));
    writeJson(o, Object.assign(readJson(o) || {}, { _meta: Object.assign({ savedAt: new Date().toISOString() }, who(user)) }, { breadcrumb: bc }, extra || {}));
    const df = draftFile(k.dir, pid), d = readJson(df); if (d) { d.breadcrumb = bc; Object.assign(d, extra || {}); writeJson(df, d); }
    snapshot(k.dir, pid, Object.assign(pick(pm, k.fields), { breadcrumb: bc }, extra || {}), user, 'Moved');
  };
  // the page it leaves: its card or its city part (a heading, a few lines, Read More) for this page comes out of its
  // text, so the page shows only in its new place (the new place lists it by itself)
  const baseOf = h => String(h || '').replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+/, '').replace(/\.(html?|aspx)$/i, '').toLowerCase();
  const me = baseOf(m.url), links = blk => [...blk.matchAll(/href="([^"]*)"/g)].some(x => baseOf(x[1]) === me);
  const unlist = html => String(html || '').replace(/<li\b[\s\S]*?<\/li>\s*/gi, b => links(b) && /<img/i.test(b) ? '' : b)
    .replace(/<h[2-4][^>]*>[^<]*<\/h[2-4]>\s*<p[^>]*>[\s\S]*?<\/p>\s*/gi, b => links(b) && /read more/i.test(b) ? '' : b);
  const oldBc = m.breadcrumb || [], oldParent = (oldBc[oldBc.length - 2] || {}).href;
  const from = oldParent && !chain.some((c, i) => i === chain.length - 1 && lc(c.href) === lc(oldParent)) ? all.find(p => lc(p.url) === lc(oldParent)) : null;
  hold++;
  try {
    if (from) {
      const pf = fileOf('pages', from.id), pm = fresh(pf), o = overridePath(pf), html = unlist(pm.html);
      if (html !== pm.html) {
        keepOriginal(k.dir, from.id, pick(pm, k.fields));
        writeJson(o, Object.assign(readJson(o) || {}, { _meta: Object.assign({ savedAt: new Date().toISOString() }, who(user)) }, { html }));
        const df = draftFile(k.dir, from.id), d = readJson(df); if (d && typeof d.html === 'string') { d.html = unlist(d.html); writeJson(df, d); }
        snapshot(k.dir, from.id, Object.assign(pick(pm, k.fields), { html }), user, 'Moved out: ' + plain(m.heading));
      }
    }
    const own = [{ label: 'Home', href: '/' }].concat(chain, [{ label: plain(m.heading) }]);
    write(id, own, typeof guideSection === 'string' ? { guideSection: guideSection.slice(0, 80) } : null);
    // the pages under it keep their place under it, with the new path above
    all.filter(under).forEach(p => {
      const pm = fresh(fileOf('pages', p.id)), bc = clone(pm.breadcrumb || []);
      const at = bc.findIndex(b => lc(b.href) === lc(m.url)); if (at < 0) return;
      write(p.id, [{ label: 'Home', href: '/' }].concat(chain, [{ label: plain(m.heading), href: m.url }], bc.slice(at + 1)));
    });
  } finally { hold--; changed(); }
  return get('pages', id);
}

// ---- (2 Nov 2026, client) Prices & notes: every tour's price lines, includes, excludes and notes in one place ----
// A price line is "3-Star: $95 - $110 per person per day" (or USD 90-100, $85–$100, … $250+): the first range of dollar
// amounts in it is the price per person per day; the website multiplies it by the nights.
const PRICE_RE = /((?:US\$|\$|USD)\s*)(\d[\d,]*)(\s*(?:-|–|to)\s*(?:US\$\s*|\$\s*|USD\s*)?)(\d[\d,]*)/i;
const PRICE_ONE = /((?:US\$|\$|USD)\s*)(\d[\d,]*)/i;
const isPriceBlock = b => b && /pric|cost/i.test(b.title || '');
const segsText = it => (Array.isArray(it) ? it : []).map(x => x.text || '').join('');
function priceTier(it) {
  const whole = segsText(it).trim(), boldLabel = ((it.find(x => x.bold) || {}).text || '').trim();
  const label = (boldLabel || (whole.match(/^[^:$]+:/) || [''])[0]).replace(/:\s*$/, '').trim();
  const rest = boldLabel ? it.filter(x => !x.bold).map(x => x.text).join('').trim() : whole.replace(/^[^:$]+:/, '').trim();
  const m = PRICE_RE.exec(rest), one = !m && PRICE_ONE.exec(rest);
  return { label, rest, lo: m ? +m[2].replace(/,/g, '') : one ? +one[2].replace(/,/g, '') : null, hi: m ? +m[4].replace(/,/g, '') : null };
}
// a price line written back with new amounts, its own wording kept
function priceLine(it, lo, hi) {
  const t = priceTier(it); let rest = t.rest;
  if (PRICE_RE.test(rest)) rest = rest.replace(PRICE_RE, (all, a, x, mid, y) => a + lo + mid + (hi == null ? y : hi));
  else if (PRICE_ONE.test(rest)) rest = rest.replace(PRICE_ONE, (all, a) => a + lo);
  return [{ text: t.label + ':', bold: true }, { text: ' ' + rest, bold: false }];
}
const nightsOfTour = m => +((String(m.duration || '').match(/(\d+)\s*Nights?/i) || [])[1] || 0) || Math.max(0, (m.days || []).length - 1);
function pricingList() {
  return list('tours').map(it => {
    const m = fresh(path.join(DATA, 'tours', it.id + '.js')), blocks = m.details || [], pb = blocks.find(isPriceBlock);
    return { id: it.id, name: it.name, code: it.code, url: it.url, published: it.published, hasDraft: it.hasDraft, nights: nightsOfTour(m),
      tiers: pb ? pb.items.map(priceTier).filter(t => t.label || t.rest) : [],
      lists: blocks.filter(b => !isPriceBlock(b)).map(b => ({ title: b.title, n: (b.items || []).length })) };
  });
}
function pricingOf(id) {
  const m = fresh(fileOf('tours', id));
  return { id, name: plain(m.heading), url: m.url, code: codeOf(m.url), nights: nightsOfTour(m), details: clone(m.details || []), hasDraft: fs.existsSync(draftFile('tours', id)) };
}
// the live tour changes (and a draft waiting for it gets the same change, so publishing it later keeps the new prices)
function changeTourDetails(id, fn, user) {
  const k = kindOf('tours'), f = fileOf('tours', id), m = fresh(f), df = draftFile(k.dir, id), draft = readJson(df);
  const live = pick(m, k.fields);
  live.details = fn(clone(live.details || []));
  publish('tours', id, live, user);
  if (draft) { if (Array.isArray(draft.details)) draft.details = fn(clone(draft.details)); writeJson(df, draft); }
}
// ---- (4 Nov 2026, client) the price log: every change of a tour's prices — the tour, each hotel class from → to, who,
// when, and how (on the Prices & notes page, by a bulk change, or in the tour's own editor). Newest first, last 2000.
const PRICE_LOG = path.join(CMS, '_price-log.json');
let priceHow = '';
const tierKey = t => t.lo == null ? (t.rest || '') : t.hi == null || t.hi === t.lo ? '$' + t.lo : '$' + t.lo + ' - $' + t.hi;
function logPrices(id, before, details, user) {
  try {
    const tiersOf = ds => { const b = (ds || []).find(isPriceBlock); return b ? b.items.map(priceTier).filter(t => t.label || t.rest) : []; };
    const a = tiersOf(before.details), b = tiersOf(details), labels = [...new Set(a.concat(b).map(t => t.label))];
    const changes = labels.map(l => { const x = a.find(t => t.label === l), y = b.find(t => t.label === l); return { label: l || 'Price', from: x ? tierKey(x) : '', to: y ? tierKey(y) : '',
      fromLo: x && x.lo != null ? x.lo : null, fromHi: x && x.lo != null ? (x.hi == null ? x.lo : x.hi) : null, toLo: y && y.lo != null ? y.lo : null, toHi: y && y.lo != null ? (y.hi == null ? y.lo : y.hi) : null }; }).filter(c => c.from !== c.to);
    if (!changes.length) return;
    const log = readJson(PRICE_LOG) || [];
    log.unshift({ at: new Date().toISOString(), id, name: plain(before.heading), code: codeOf(before.url), url: before.url, nights: nightsOfTour(before), how: priceHow || 'In the tour’s editor', by: user ? user.name : '', changes });
    writeJson(PRICE_LOG, log.slice(0, 2000));
  } catch (e) { /* the log never stops a save */ }
}
const priceLog = () => readJson(PRICE_LOG) || [];
// one tour: its price lines, includes, excludes and notes as edited on the Prices & notes page
function setPricing(id, details, user) {
  if (!Array.isArray(details) || !details.every(b => b && typeof b.title === 'string' && Array.isArray(b.items))) throw Object.assign(new Error('Bad data'), { status: 400 });
  priceHow = 'On Prices & notes';
  try { changeTourDetails(id, () => clone(details), user); } finally { priceHow = ''; }
  return pricingOf(id);
}
// many tours: their prices up or down by a percentage or by an amount (in dollars), rounded to whole dollars
function bulkPrice(ids, mode, value, user) {
  const v = Number(value);
  if (!Array.isArray(ids) || !ids.length || !['pct', 'amt'].includes(mode) || !isFinite(v) || !v) throw Object.assign(new Error('Choose the tours and the change'), { status: 400 });
  const adj = n => n == null ? n : Math.max(1, Math.round(mode === 'pct' ? n * (1 + v / 100) : n + v));
  const done = [];
  hold++;
  priceHow = 'Bulk change: ' + (v > 0 ? '+' : '−') + (mode === 'pct' ? Math.abs(v) + '%' : 'USD ' + Math.abs(v)) + ' (' + ids.length + ' tour' + (ids.length === 1 ? '' : 's') + ')';
  try {
    ids.forEach(id => {
      changeTourDetails(id, blocks => blocks.map(b => isPriceBlock(b) ? Object.assign({}, b, { items: b.items.map(it => { const t = priceTier(it); return t.lo == null ? it : priceLine(it, adj(t.lo), adj(t.hi)); }) }) : b), user);
      done.push(id);
    });
  } finally { hold--; priceHow = ''; changed(); }
  return { done };
}

module.exports = { movePage, priceLog, pricingList, pricingOf, setPricing, bulkPrice, codeSuggest, setCode, changeAddress, PAGE_GROUPS, events, seoReport, seoCheck, TEMPLATES, KINDS, SINGLES, list, get, save, saveDraft, publish, discardDraft, revisions, revision, unpublish, create, remove, trash,
  restore, purge, revert, getSingle, saveSingle, saveSingleDraft, publishSingle, discardSingleDraft, singleRevisions, singleRevision, revertSingle, singles, tourCategories, setTourCategories };
