// The admin panel at /admin (16 Oct 2026; 23 Oct 2026: users and roles, drafts, publish, history, previews, the blog, the
// tour ↔ category link, enquiry status). Each person logs in with their own email; their role (users.js) decides what
// they may open and change — checked here for every page and every API call, not only hidden in the menu.
const fs = require('fs');
const path = require('path');
const express = require('express');
const auth = require('./auth');
const store = require('./store');
const users = require('./users');
const activity = require('./activity');
const { ROOT, DATA } = require('./hook');

const UPLOADS = path.join(ROOT, 'public', 'uploads');
const ENQUIRY_FILE = path.join(DATA, 'enquiries.json');
const IMG_DIRS = [['uploads', 'Uploaded'], ['photos', 'Site photos'], ['images', 'Page banners'], ['assets', 'Home assets']];
const IMG_RE = /\.(webp|jpe?g|png|gif|avif)$/i;
// image types the library accepts, recognised by their first bytes (not by the name the browser sends)
const MAGIC = [['webp', b => b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP'], ['jpg', b => b[0] === 0xff && b[1] === 0xd8],
  ['png', b => b.slice(1, 4).toString() === 'PNG'], ['gif', b => b.slice(0, 3).toString() === 'GIF'], ['avif', b => b.slice(4, 12).toString().includes('ftypavif')]];
const ENQ_STATUS = ['New', 'Replied', 'Quote sent', 'Booked', 'Closed'];

const router = express.Router();
router.use(express.urlencoded({ extended: false, limit: '64kb' }));
router.use('/api', express.json({ limit: '15mb' }));
router.use(auth.sameOrigin);
router.use((req, res, next) => { res.setHeader('X-Robots-Tag', 'noindex, nofollow'); res.setHeader('Cache-Control', 'no-store'); next(); });

const can = (req, perm) => users.can(req.admin, perm);
// (27 Oct 2026, client video) the look of the panel each role starts with (an Owner sets it on the Look page); a person's
// own choice in their browser still wins
const ROLE_LOOKS = path.join(DATA, 'cms', 'role-looks.json');
const readRoleLooks = () => { try { return JSON.parse(fs.readFileSync(ROLE_LOOKS, 'utf8')); } catch (e) { return {}; } };
const view = (res, name, locals) => res.render('admin/' + name, Object.assign({ page: name, admin: res.req.admin, kinds: store.KINDS, singles: store.SINGLES,
  roles: users.ROLES, can: p => users.can(res.req.admin, p), unreadEnquiries: unread(), notes: notesFor(res.req), q: res.req.query || {},
  roleLook: res.req.admin ? readRoleLooks()[res.req.admin.role] || null : null }, locals));
// (26 Oct 2026, client) the bell in the top bar: new enquiries, and changes waiting to be published
function notesFor(req) {
  const out = [];
  try {
    if (req.admin && can(req, 'enquiries')) readEnquiries().filter(e => statusOf(e) === 'New').slice(0, 6)
      .forEach(e => out.push({ icon: '✉', title: 'New enquiry from ' + (e.name || 'a visitor'), sub: [e.country, String(e.receivedAt || '').slice(0, 10)].filter(Boolean).join(' · '), href: '/admin/enquiries' }));
    if (req.admin && can(req, 'publish')) {
      const waiting = Object.keys(store.KINDS).reduce((n, k) => n + store.list(k).filter(it => it.hasDraft).length, 0);
      if (waiting) out.push({ icon: '✎', title: waiting + ' change' + (waiting === 1 ? '' : 's') + ' waiting to be published', sub: 'Drafts saved by your team', href: '/admin#waiting' });
    }
  } catch (e) { /* the bell is never worth breaking a page */ }
  return out;
}
const fail = (res, e) => res.status(e.status || 500).json({ ok: false, error: e.status ? e.message : 'Something went wrong: ' + e.message });
const api = fn => (req, res) => { try { const out = fn(req, res); if (!res.headersSent) res.json(Object.assign({ ok: true }, out || {})); } catch (e) { fail(res, e); } };
const deny = msg => Object.assign(new Error(msg || 'Your role does not allow this. Ask an Owner.'), { status: 403 });
const need = (req, perm) => { if (!can(req, perm)) throw deny(); };
const kindOk = k => !!store.KINDS[k];
const editLink = (kind, id) => kind === 'single' ? '/admin/settings/' + id : '/admin/' + kind + '/' + id;
const nameOf = (kind, id, data) => kind === 'single' ? store.SINGLES[id].label : String((data && data.heading) || id).replace(/<[^>]+>/g, '');
// may this person edit / publish a section (Home page, Header & footer, Contact …)?
const singleCan = (req, name, action) => {
  const s = store.SINGLES[name]; if (!s) return false;
  if (!can(req, s.perm)) return false;
  return action === 'publish' && s.perm === 'content' ? can(req, 'publish') : true;
};

// a line of the activity log is shown only to someone who may open what it is about (users and enquiries stay private)
const seesActivity = (req, a) => {
  const l = a.link || '';
  if (!l || l.startsWith('/admin/users') || l.startsWith('/admin/activity')) return can(req, 'users');
  if (l.startsWith('/admin/enquiries')) return can(req, 'enquiries');
  if (l.startsWith('/admin/trash')) return can(req, 'delete');
  const m = l.match(/^\/admin\/settings\/([a-z]+)/); if (m) return singleCan(req, m[1], 'edit');
  return can(req, 'content');
};

// ---------- login ----------
router.get('/login', (req, res) => {
  if (!auth.enabled()) return view(res, 'login', { error: 'The admin panel is not set up yet: add ADMIN_USER, ADMIN_PASSWORD and SESSION_SECRET to the .env file and restart the site.', closed: true, next: '' });
  if (auth.userOf(req)) return res.redirect('/admin');
  view(res, 'login', { error: '', closed: false, next: String(req.query.next || '') });
});
router.post('/login', (req, res) => {
  if (!auth.enabled()) return res.redirect('/admin/login');
  const r = auth.check(req.ip, String(req.body.user || ''), String(req.body.password || ''));
  const next = /^\/admin(\/|$)/.test(String(req.body.next || '')) ? req.body.next : '/admin';
  if (!r.ok) return res.status(401).render('admin/login', { page: 'login', error: r.error, closed: false, next, admin: null });
  auth.setSession(res, req, r.user);
  activity.log(r.user, 'Logged in', '', '');
  res.redirect(next);
});
router.get('/logout', (req, res) => { auth.clearSession(res); res.redirect('/admin/login'); });

router.use(auth.requireAdmin);

// ---------- enquiries file ----------
const readEnquiries = () => { try { return JSON.parse(fs.readFileSync(ENQUIRY_FILE, 'utf8')); } catch (e) { return []; } };
const writeEnquiries = list => fs.writeFileSync(ENQUIRY_FILE, JSON.stringify(list, null, 2));
const statusOf = e => e._status || (e._read ? 'Replied' : 'New');
function unread() { try { return readEnquiries().filter(e => statusOf(e) === 'New').length; } catch (e) { return 0; } }

// ---------- pages ----------
router.get('/', (req, res) => {
  const enq = can(req, 'enquiries') ? readEnquiries() : [];
  const rep = can(req, 'content') ? store.seoReport() : [];
  const drafts = can(req, 'content') ? Object.keys(store.KINDS).flatMap(k => store.list(k).filter(it => it.hasDraft || (!it.published && it.id !== 'blog-template')).map(it => ({ kind: k, one: store.KINDS[k].one, id: it.id, name: it.name, published: it.published, hasDraft: it.hasDraft })))
    .concat(Object.keys(store.SINGLES).filter(n => singleCan(req, n, 'edit') && store.getSingle(n).draft).map(n => ({ kind: 'single', one: 'section', id: n, name: store.SINGLES[n].label, published: true, hasDraft: true }))) : [];
  view(res, 'dashboard', {
    seoStats: { good: rep.filter(r => r.level === 'good').length, ok: rep.filter(r => r.level === 'ok').length, bad: rep.filter(r => r.level === 'bad').length, total: rep.length },
    counts: Object.fromEntries(Object.keys(store.KINDS).map(k => [k, store.list(k).filter(it => it.id !== 'blog-template').length])),
    newEnquiries: enq.filter(e => statusOf(e) === 'New').length,
    latest: enq.map((e, i) => Object.assign({ _i: i, _st: statusOf(e) }, e)).slice(-12).reverse(),
    drafts, recent: activity.recent(8, a => a.action !== 'Logged in' && seesActivity(req, a))
  });
});
router.get('/media', auth.allow('content'), (req, res) => view(res, 'media', {}));
router.get('/seo', auth.allow('content'), (req, res) => view(res, 'seo', { rows: store.seoReport() }));
router.get('/enquiries', auth.allow('enquiries'), (req, res) => view(res, 'enquiries', {
  items: readEnquiries().map((e, i) => Object.assign({ _i: i, _st: statusOf(e) }, e)).reverse(), statuses: ENQ_STATUS,
  team: users.all().filter(u => u.active && users.can(u, 'enquiries')).map(u => ({ id: u.id, name: u.name }))
}));
router.get('/trash', auth.allow('delete'), (req, res) => view(res, 'trash', { items: store.trash() }));
router.get('/users', auth.allow('users'), (req, res) => view(res, 'users', { people: users.all(), perms: users.PERMS,
  permShort: { content: 'Tours & pages', publish: 'Publish', delete: 'Delete', menus: 'Menus', reviews: 'Reviews', enquiries: 'Enquiries', settings: 'Settings', users: 'Users' } }));
router.get('/activity', auth.allow('users'), (req, res) => view(res, 'activity', { items: activity.recent(500) }));
router.get('/account', (req, res) => view(res, 'account', {}));
// every page of the website in one list: the main pages (sections) and the text pages
// ---------- (26 Oct 2026, client video II) Pages, Destinations, Travel Guide, text tour pages ----------
// Pages: only the website's main pages
router.get('/pages', auth.allow('content'), (req, res) => {
  const main = [
    ['home', 'Home page', '/', 'Banner and every section of the home page', '/admin/settings/home'],
    ['about', 'About us', '/aboutus', 'The About us text and photo', '/admin/settings/about'],
    ['contact', 'Contact us', '/contactus', 'Offices, phone numbers and email', '/admin/settings/contact'],
    ['reviews', 'Guest reviews', '/testimonials', 'The reviews and the page text', '/admin/reviews'],
    ['plan', 'Plan My Trip', '/plan-my-trip', 'The enquiry form and its choices', '/admin/settings/plan'],
    ['faqs', 'FAQs', '/faqs', 'The questions & answers (the first ones also on the home page)', '/admin/settings/faqs'],
    ['guide', 'India Travel Guide', '/guide', 'The travel guide page; its topics are in Travel Guide', '/admin/settings/guide']
  ].map(([id, name, url, what, edit]) => ({ id, name, url, what, edit, editable: !id || singleCan(req, id, 'edit'), draft: id && store.SINGLES[id] ? !!store.getSingle(id).draft : false,
    savedAt: id && store.SINGLES[id] ? store.singles().find(x => x.id === id).edited : false }));
  view(res, 'pages-main', { main });
});

const lcu = u => String(u || '').toLowerCase();
const pageRow = p => ({ id: p.id, name: p.name, url: p.url, published: p.published, hasDraft: p.hasDraft, savedAt: p.savedAt, img: p.img, kids: [] });
// Destinations: the four regions, their states, the states' cities (from where each page sits on the website)
function destinationTree() {
  const pages = store.list('pages').filter(p => p.group === 'places'), byUrl = new Map(pages.map(p => [lcu(p.url), p]));
  const REGIONS = [['North India', '/north_india_tour'], ['South India', '/south_india_tours_tourism'], ['East India', '/east_india_tour_tourism'], ['West India', '/west_india_tour_tourism']];
  const used = new Set();
  const sections = REGIONS.map(([title, url]) => {
    const head = byUrl.get(lcu(url)); if (head) used.add(head.id);
    const rows = pages.filter(p => !used.has(p.id) && p.crumbs.length === 1 && lcu(p.crumbs[0]) === lcu(url)).map(p => { used.add(p.id); return pageRow(p); });
    rows.forEach(r => { r.kids = pages.filter(p => !used.has(p.id) && p.crumbs.length >= 2 && lcu(p.crumbs[p.crumbs.length - 1]) === lcu(r.url)).map(p => { used.add(p.id); return pageRow(p); }); });
    return { title, head: head ? pageRow(head) : null, parents: [{ label: head ? head.name : title, href: url }], rows: rows.sort((a, b) => a.name.localeCompare(b.name)) };
  });
  const rest = pages.filter(p => !used.has(p.id)).map(pageRow);
  if (rest.length) sections.push({ title: 'Other places', rows: rest, parents: [] });
  return sections;
}
// Travel Guide: the guide's three sections as on the website, each topic with its own pages under it
function guideTree() {
  const hub = require(path.join(DATA, 'guide-hub'));
  const pages = store.list('pages').filter(p => p.group === 'guide'), byUrl = new Map(pages.map(p => [lcu(p.url), p])), used = new Set();
  const kidsOf = r => pages.filter(p => !used.has(p.id) && p.crumbs.length && lcu(p.crumbs[p.crumbs.length - 1]) === lcu(r.url)).map(p => { used.add(p.id); const k = pageRow(p); k.kids = kidsOf(k); return k; });
  const sections = hub.topics.map(t => {
    const rows = t.items.map(it => byUrl.get(lcu(it.href))).filter(Boolean).concat(pages.filter(p => p.guideSection === t.title))
      .filter(p => !used.has(p.id) && used.add(p.id)).map(pageRow);
    rows.forEach(r => { r.kids = kidsOf(r); });
    return { title: t.title, rows, guideSection: t.title };
  });
  // the Important Links pages belong with the Travel Tools
  const tools = sections.find(x => /tools/i.test(x.title));
  pages.filter(p => !used.has(p.id) && !p.crumbs.length).forEach(p => { used.add(p.id); const r = pageRow(p); r.kids = kidsOf(r); (tools || sections[0]).rows.push(r); });
  const rest = pages.filter(p => !used.has(p.id)).map(pageRow);
  if (rest.length) sections.push({ title: 'More guide pages', rows: rest });
  return sections;
}
router.get('/destinations', auth.allow('content'), (req, res) => view(res, 'tree', { page: 'destinations', title: 'Destinations',
  lead: 'Every region, state and city page, as they sit on the website: a region, its states, and each state’s cities.', one: 'destination page', mode: 'places', sections: destinationTree() }));
// (26 Oct 2026, client) each section of the travel guide on its own page: Travelers Guide, Attractions of India, Travel Tools
router.get('/travel-guide', auth.allow('content'), (req, res) => {
  const KEYS = ['travelers', 'attractions', 'tools'], all = guideTree();
  const k = KEYS.includes(req.query.section) ? req.query.section : 'travelers', i = KEYS.indexOf(k);
  const sct = all[i]; if (!sct) return res.redirect('/admin');
  if (i === 2 && all[3]) sct.rows = sct.rows.concat(all[3].rows);   // the few other guide pages sit with the tools
  view(res, 'tree', { page: 'travel-guide', title: sct.title, lead: 'The pages in “' + sct.title + '” of the India Travel Guide, as on the website. A page added here shows there by itself.',
    one: 'page', mode: 'guide', sections: [sct] });
});

router.get('/tour-pages', auth.allow('content'), (req, res) => view(res, 'tree', { page: 'tour-pages', title: 'Tours',
  lead: 'Tour plans that the old website had as text pages. They are tours, so they are kept here with the tours.', one: 'tour page', mode: 'tours',
  sections: [{ title: 'Tour plans written as text', rows: store.list('pages').filter(p => p.group === 'tours').map(pageRow) }] }));
router.get('/settings', auth.allow('settings'), (req, res) => view(res, 'settings-hub', {}));
router.get('/look', (req, res) => view(res, 'look', { roleLooks: readRoleLooks() }));
router.post('/api/role-look', api(req => {
  need(req, 'users');
  const b = req.body || {}, all = readRoleLooks();
  if (!users.ROLES[b.role]) throw Object.assign(new Error('Unknown role'), { status: 400 });
  const look = { mode: ['light', 'dark', 'auto'].includes(b.mode) ? b.mode : 'light', accent: ['blue', 'teal', 'indigo', 'green', 'maroon', 'slate'].includes(b.accent) ? b.accent : 'blue' };
  all[b.role] = look; fs.mkdirSync(path.dirname(ROLE_LOOKS), { recursive: true }); fs.writeFileSync(ROLE_LOOKS, JSON.stringify(all, null, 2));
  activity.log(req.admin, 'Set the panel look of', users.ROLES[b.role].label + ' (' + look.mode + ', ' + look.accent + ')', '/admin/look');
  return { ok: true, roleLooks: all };
}));
router.get('/settings/:name', (req, res, next) => {
  const s = store.SINGLES[req.params.name]; if (!s) return next();
  if (!singleCan(req, req.params.name, 'edit')) return auth.allow('__none')(req, res, next);
  view(res, 'edit', { mode: 'single', kind: 'single', id: req.params.name, title: s.label, url: s.page || '', canPublish: singleCan(req, req.params.name, 'publish'), canDelete: false });
});
router.get('/menus', (req, res) => res.redirect('/admin/settings/header'));
router.get('/reviews', (req, res, next) => singleCan(req, 'reviews', 'edit') ? view(res, 'reviews', { canPublish: singleCan(req, 'reviews', 'publish') }) : auth.allow('__none')(req, res, next));
router.get('/:kind', (req, res, next) => {
  if (!kindOk(req.params.kind)) return next();
  if (!can(req, 'content')) return auth.allow('content')(req, res, next);
  if (req.params.kind === 'pages') return res.redirect('/admin/pages');
  let items = store.list(req.params.kind);
  // (26 Oct 2026, client) the old site's tour plans written as text pages are tours: they are listed with the tours
  if (req.params.kind === 'tours') items = items.concat(store.list('pages').filter(p => p.group === 'tours').map(p => Object.assign({}, p, { editKind: 'pages', textTour: true, info: '' })));
  // filter by category: the categories with a code (GT …), for the tours list
  const cats = req.params.kind === 'tours' ? store.list('lists').filter(l => l.code && !l.code.includes('-')).map(l => ({ code: l.code, name: l.name })) : [];
  view(res, 'list', { kind: req.params.kind, k: store.KINDS[req.params.kind], items, cats });
});
router.get('/:kind/:id', (req, res, next) => {
  if (!kindOk(req.params.kind)) return next();
  if (!can(req, 'content')) return auth.allow('content')(req, res, next);
  try {
    const it = store.get(req.params.kind, req.params.id);
    const pl = req.params.kind === 'pages' ? (store.list('pages').find(p => p.id === req.params.id) || {}) : {}, pg = pl.group || '';
    // which region or guide section the page is in, for the menu
    let ps = '';
    if (pg === 'places') { const RK = { '/north_india_tour': 'north', '/south_india_tours_tourism': 'south', '/east_india_tour_tourism': 'east', '/west_india_tour_tourism': 'west' }; ps = RK[lcu(pl.crumbs[0] || pl.url)] || Object.entries(RK).find(([u]) => lcu(u) === lcu(pl.url) || lcu(u) === lcu(pl.crumbs[0]))?.[1] || ''; }
    if (pg === 'guide') { const t = guideTree().findIndex(sct => JSON.stringify(sct).includes('"id":"' + req.params.id + '"')); ps = ['travelers', 'attractions', 'tools', 'tools'][t] || ''; }
    view(res, 'edit', { mode: 'item', kind: req.params.kind, id: req.params.id, title: it.data.heading || it.id, url: it.url, canPublish: can(req, 'publish'), canDelete: can(req, 'delete'), pageGroup: pg || '', pageSection: ps });
  } catch (e) { res.status(e.status || 500); view(res, 'error', { message: e.message }); }
});
// the page drawn from its draft (or its saved content), as the website would show it
router.get('/preview/:kind/:id', auth.allow('content'), (req, res) => {
  try {
    const { kind, id } = req.params;
    if (!kindOk(kind)) throw Object.assign(new Error('Unknown section'), { status: 404 });
    const it = store.get(kind, id);
    const base = require(path.join(DATA, store.KINDS[kind].dir, id + '.js'));
    res.locals.cmsBar = { name: req.admin.name, edit: editLink(kind, id), preview: true };
    req.app.get('cmsPreview')(kind, Object.assign({}, base, it.data), res);
  } catch (e) { res.status(e.status || 500); view(res, 'error', { message: e.message }); }
});

// ---------- API: content ----------
router.get('/api/item/:kind/:id', api(req => { need(req, 'content'); return store.get(req.params.kind, req.params.id); }));
// save: { data, publish: true|false, categories: [ids] (tours) }
router.put('/api/item/:kind/:id', api(req => {
  const { kind, id } = req.params, b = req.body || {};
  need(req, 'content');
  if (b.publish) {
    need(req, 'publish');
    const out = store.publish(kind, id, b.data, req.admin);
    let cats = [];
    if (kind === 'tours' && Array.isArray(b.categories)) cats = store.setTourCategories(id, b.categories, req.admin);
    activity.log(req.admin, 'Published', nameOf(kind, id, out.data) + (cats.length ? ' (' + cats.join(', ') + ')' : ''), editLink(kind, id));
    return Object.assign(out, { categoriesChanged: cats });
  }
  const out = store.saveDraft(kind, id, b.data, req.admin, kind === 'tours' ? b.categories : undefined);
  activity.log(req.admin, 'Saved a draft of', nameOf(kind, id, out.data), editLink(kind, id));
  return out;
}));
router.post('/api/item/:kind', api(req => {
  need(req, 'content');
  const out = store.create(req.params.kind, req.body.slug, req.body.from, req.body.name, req.admin, { guideSection: req.body.guideSection, parents: req.body.parents, blank: !!req.body.blank, categories: req.body.categories });
  activity.log(req.admin, 'Added', nameOf(req.params.kind, out.id, out.data) + ' (draft)', editLink(req.params.kind, out.id));
  return out;
}));
router.delete('/api/item/:kind/:id', api(req => {
  need(req, 'delete');
  const it = store.get(req.params.kind, req.params.id);
  store.remove(req.params.kind, req.params.id);
  activity.log(req.admin, 'Deleted', nameOf(req.params.kind, req.params.id, it.data), '/admin/trash');
}));
router.post('/api/item/:kind/:id/discard', api(req => { need(req, 'content'); return store.discardDraft(req.params.kind, req.params.id); }));
// (27 Oct 2026) a new web address; the old one is redirected to it
router.post('/api/item/:kind/:id/address', api(req => {
  need(req, 'publish');
  const before = store.get(req.params.kind, req.params.id).url;
  const out = store.changeAddress(req.params.kind, req.params.id, (req.body || {}).url, req.admin);
  if (out.url !== before) activity.log(req.admin, 'Changed the address of', nameOf(req.params.kind, req.params.id, out.data) + ' (' + before + ' → ' + out.url + ')', editLink(req.params.kind, req.params.id));
  return out;
}));
// (27 Oct 2026, client) a tour's or category's code
router.get('/api/item/:kind/:id/code', api(req => { need(req, 'content'); return { code: store.get(req.params.kind, req.params.id).code, suggest: store.codeSuggest(req.params.kind, req.params.id) }; }));
router.post('/api/item/:kind/:id/code', api(req => {
  need(req, 'publish');
  const out = store.setCode(req.params.kind, req.params.id, (req.body || {}).code, req.admin);
  activity.log(req.admin, 'Set the code of', nameOf(req.params.kind, req.params.id, store.get(req.params.kind, req.params.id).data) + ' (' + (out.code || 'none') + ')', editLink(req.params.kind, req.params.id));
  return out;
}));
router.post('/api/item/:kind/:id/unpublish', api(req => {
  need(req, 'publish');
  const out = store.unpublish(req.params.kind, req.params.id);
  activity.log(req.admin, 'Took off the website', nameOf(req.params.kind, req.params.id, out.data), editLink(req.params.kind, req.params.id));
  return out;
}));
router.post('/api/item/:kind/:id/revert', api(req => {
  need(req, 'publish');
  store.revert(req.params.kind, req.params.id);
  const out = store.get(req.params.kind, req.params.id);
  activity.log(req.admin, 'Brought back the original of', nameOf(req.params.kind, req.params.id, out.data), editLink(req.params.kind, req.params.id));
  return out;
}));
router.get('/api/item/:kind/:id/revisions', api(req => { need(req, 'content'); return { items: store.revisions(req.params.kind, req.params.id) }; }));
router.get('/api/item/:kind/:id/revisions/:rev', api(req => { need(req, 'content'); return { data: store.revision(req.params.kind, req.params.id, req.params.rev) }; }));
// a tour's categories (ticked in its editor); a draft keeps the person's choice until it is published
router.get('/api/tour-categories/:id', api(req => {
  need(req, 'content');
  if (req.params.id === '_new') return { items: store.tourCategories('_new') };   // the "Add a tour" box
  const it = store.get('tours', req.params.id), list = store.tourCategories(req.params.id);
  const chosen = it.draft && it.draft.categories;
  if (chosen) list.forEach(c => { c.checked = chosen.includes(c.id); });
  return { items: list };
}));

router.get('/api/single/:name', api(req => { if (!singleCan(req, req.params.name, 'edit')) throw deny(); return store.getSingle(req.params.name); }));
router.put('/api/single/:name', api(req => {
  const n = req.params.name, b = req.body || {};
  if (!singleCan(req, n, 'edit')) throw deny();
  if (b.publish) {
    if (!singleCan(req, n, 'publish')) throw deny('Your role can save drafts here. An Owner or Editor publishes them.');
    const out = store.publishSingle(n, b.data, req.admin);
    activity.log(req.admin, 'Published', store.SINGLES[n].label, editLink('single', n));
    return out;
  }
  const out = store.saveSingleDraft(n, b.data, req.admin);
  activity.log(req.admin, 'Saved a draft of', store.SINGLES[n].label, editLink('single', n));
  return out;
}));
router.post('/api/single/:name/discard', api(req => { if (!singleCan(req, req.params.name, 'edit')) throw deny(); return store.discardSingleDraft(req.params.name); }));
router.post('/api/single/:name/revert', api(req => {
  if (!singleCan(req, req.params.name, 'publish')) throw deny();
  store.revertSingle(req.params.name);
  activity.log(req.admin, 'Brought back the original of', store.SINGLES[req.params.name].label, editLink('single', req.params.name));
  return store.getSingle(req.params.name);
}));
router.get('/api/single/:name/revisions', api(req => { if (!singleCan(req, req.params.name, 'edit')) throw deny(); return { items: store.singleRevisions(req.params.name) }; }));
router.get('/api/single/:name/revisions/:rev', api(req => { if (!singleCan(req, req.params.name, 'edit')) throw deny(); return { data: store.singleRevision(req.params.name, req.params.rev) }; }));
router.post('/api/restore', api(req => {
  need(req, 'delete');
  store.restore(req.body.kind, req.body.bin);
  activity.log(req.admin, 'Put back', String(req.body.bin || '').split('__')[0], '/admin/' + req.body.kind);
}));
router.post('/api/purge', api(req => {
  need(req, 'delete');
  store.purge(req.body.kind, req.body.bin);
  activity.log(req.admin, 'Deleted for good', String(req.body.bin || '').split('__')[0], '/admin/trash');
}));
// every tour, for picking tours into a category
router.get('/api/tours-index', api(req => { need(req, 'content'); return { items: store.list('tours').filter(t => t.published).map(t => {
  const d = store.get('tours', t.id).data;
  return { name: t.name, href: t.url, route: d.route || '', duration: String(d.duration || '').replace(/\s*·\s*/, ' - ') };
}) }; }));

// the blog's categories in use (for the Category box of a post)
router.get('/api/blog-categories', api(req => { need(req, 'content'); return { items: [...new Set(store.list('posts').map(p => store.get('posts', p.id).data.category).filter(Boolean))].sort().concat(['Travel tips', 'Destinations', 'Festivals', 'News']).filter((x, i, a) => a.indexOf(x) === i) }; }));

// every page of the website (name and address), offered when choosing where a link goes
router.get('/api/link-index', api(req => {
  need(req, 'content');
  const items = [['Home page', '/'], ['About us', '/aboutus'], ['Contact us', '/contactus'], ['Guest Reviews', '/testimonials'], ['Plan My Trip', '/plan-my-trip'], ['India Travel Guide', '/guide'], ['All Tour Packages', '/itineraries'], ['Blog', '/blog'], ['Sitemap', '/sitemap']].map(([name, url]) => ({ name, url }));
  const seen = new Set(items.map(i => i.url));
  for (const [kind, what] of [['lists', 'Category'], ['tours', 'Tour'], ['pages', 'Page'], ['posts', 'Blog']]) {
    for (const t of store.list(kind)) if (t.published && t.url && !seen.has(t.url)) { seen.add(t.url); items.push({ name: what + ': ' + t.name, url: t.url }); }
  }
  return { items };
}));

// (27 Oct 2026, client) the tour categories for the home page's "Best Tour Packages" cards: name, photo, lowest price
router.get('/api/category-cards', api(req => {
  need(req, 'content');
  const H2 = require(path.join(DATA, 'home2'));
  return { items: store.list('lists').filter(l => l.published && l.id !== 'itineraries').map(l => {
    const c = (H2.categories || []).find(x => String(x.url).toLowerCase() === String(l.url).toLowerCase()) || {};
    const lst = (() => { try { return require(path.join(DATA, 'tour-lists', l.id)); } catch (e) { return null; } })();
    const prices = lst && H2.listingFor ? H2.listingFor(lst).map(g => g.from).filter(Boolean) : [];
    return { url: l.url, name: c.title || l.name, code: l.code, img: c.img || l.img, from: prices.length ? Math.min(...prices) : 0 };
  }) };
}));

// ---------- API: users (Owners) and my account ----------
router.post('/api/users', api(req => { need(req, 'users'); const u = users.create(req.body || {}); activity.log(req.admin, 'Added user', u.name + ' (' + users.ROLES[u.role].label + ')', '/admin/users'); return { user: u }; }));
router.patch('/api/users/:id', api(req => { need(req, 'users'); const u = users.update(req.params.id, req.body || {}, req.admin); activity.log(req.admin, 'Changed user', u.name, '/admin/users'); return { user: u }; }));
router.delete('/api/users/:id', api(req => { need(req, 'users'); const u = users.remove(req.params.id, req.admin); activity.log(req.admin, 'Deleted user', u.name, '/admin/users'); }));
router.post('/api/account/name', api(req => { const u = users.setOwnName(req.admin.id, (req.body || {}).name); activity.log(req.admin, 'Changed their name to', u.name, ''); return { user: u }; }));
router.post('/api/account/password', api(req => { users.changeOwnPassword(req.admin.id, (req.body || {}).current, (req.body || {}).next); activity.log(req.admin, 'Changed their password', '', ''); }));

// ---------- API: numbers for the Dashboard charts ----------
router.get('/dashboard', (req, res) => view(res, 'insights', {}));
router.get('/api/stats', api(req => {
  const band = n => !n ? 'Not said' : n <= 7 ? 'Up to 7 nights' : n <= 10 ? '8–10 nights' : n <= 14 ? '11–14 nights' : n <= 20 ? '15–20 nights' : '21+ nights';
  const nightsOf = s => { const m = String(s || '').match(/(\d+)/); return m ? +m[1] : 0; };
  // enquiries: only the fields the charts use (no names or emails leave the server here)
  const enquiries = readEnquiries().map(e => {
    const hotel = (String(e.hotel || '').match(/([345])\s*-?\s*star/i) || [])[1];
    // the Plan My Trip form already offers ranges ("10 – 14 nights"); the Contact form asks for a number of days
    const length = e.duration ? String(e.duration).replace(/\s*[–-]\s*/, '–') : band(e.days ? Math.max(1, nightsOf(e.days) - 1) : 0);
    return { at: e.receivedAt, read: statusOf(e) !== 'New', status: statusOf(e),
      source: { home: 'Home page form', 'plan-my-trip': 'Plan My Trip page', contact: 'Contact page form' }[e.source] || 'Other form',
      country: String(e.country || '').trim() || 'Not said',
      length, hotel: hotel ? hotel + '-star hotels' : 'Not said' };
  });
  // tours: length and starting price, from the category pages' rows (the same numbers the site shows)
  const H2 = require(path.join(DATA, 'home2'));
  const lists = store.list('lists').map(l => require(path.join(DATA, 'tour-lists', l.id)));
  const rows = new Map();
  lists.forEach(l => H2.listingFor(l).forEach(g => g.rows.forEach(r => { if (r.href && !rows.has(r.href.toLowerCase())) rows.set(r.href.toLowerCase(), r); })));
  const tourRows = [...rows.values()];
  const priceBand = p => !p ? 'On request' : p < 1000 ? 'Under USD 1,000' : p < 2000 ? 'USD 1,000–1,999' : p < 3000 ? 'USD 2,000–2,999' : 'USD 3,000+';
  const count = (arr, key, order) => { const m = {}; arr.forEach(x => { m[key(x)] = (m[key(x)] || 0) + 1; }); return (order || Object.keys(m)).filter(k => m[k] || order).map(k => ({ label: k, value: m[k] || 0 })); };
  // tours per region group (the menu's seven groups)
  const nav = require(path.join(DATA, 'tour-nav'));
  const byUrl = Object.fromEntries(lists.map(l => [String(l.url).toLowerCase(), l]));
  const groups = nav.groups.map(g => {
    const set = new Set();
    g.cats.forEach(c => { const l = byUrl[String(c.href).toLowerCase()]; if (l) (l.groups || []).forEach(gr => (gr.tours || []).forEach(t => t.href && set.add(t.href.toLowerCase()))); });
    return { label: g.title, value: set.size };
  });
  // Google health per section
  const rep = store.seoReport();
  const seo = [...new Set(rep.map(r => r.section))].map(s => { const rs = rep.filter(r => r.section === s); return { label: s, good: rs.filter(r => r.level === 'good').length, ok: rs.filter(r => r.level === 'ok').length, bad: rs.filter(r => r.level === 'bad').length }; });
  // what was changed lately in the panel (the activity log)
  const recentRows = activity.recent(8, a => a.action !== 'Logged in' && seesActivity(req, a)).map(a => ({ name: a.what, what: a.action + (a.by ? ' · ' + a.by : ''), at: a.at, edit: a.link }));
  const photos = IMG_DIRS.reduce((n, [d]) => { const f = path.join(ROOT, 'public', d); return n + (fs.existsSync(f) ? fs.readdirSync(f).filter(x => IMG_RE.test(x)).length : 0); }, 0);
  return {
    enquiries,
    totals: { tours: store.list('tours').length, lists: lists.length, pages: store.list('pages').length, photos, reviews: (require(path.join(DATA, 'testimonials')).all || []).length },
    toursByLength: count(tourRows, r => band(r.nights), ['Up to 7 nights', '8–10 nights', '11–14 nights', '15–20 nights', '21+ nights']),
    toursByPrice: count(tourRows, r => priceBand(r.price), ['Under USD 1,000', 'USD 1,000–1,999', 'USD 2,000–2,999', 'USD 3,000+', 'On request']),
    toursByGroup: groups.sort((a, b) => b.value - a.value),
    seo, recent: recentRows
  };
}));

// ---------- API: media ----------
router.get('/api/media', api(req => { need(req, 'content'); return { groups: IMG_DIRS.map(([dir, label]) => {
  const full = path.join(ROOT, 'public', dir);
  const files = fs.existsSync(full) ? fs.readdirSync(full).filter(f => IMG_RE.test(f)).map(f => ({ src: '/' + dir + '/' + f, name: f, mtime: fs.statSync(path.join(full, f)).mtimeMs })) : [];
  return { dir, label, files: files.sort((a, b) => b.mtime - a.mtime) };
}) }; }));
router.post('/api/media', api(req => {
  need(req, 'content');
  const m = String((req.body && req.body.data) || '').match(/^data:[^;]+;base64,(.+)$/);
  if (!m) throw Object.assign(new Error('No image received'), { status: 400 });
  const buf = Buffer.from(m[1], 'base64');
  if (buf.length > 10 * 1024 * 1024) throw Object.assign(new Error('Images up to 10 MB'), { status: 413 });
  const type = (MAGIC.find(([, t]) => t(buf)) || [])[0];
  if (!type) throw Object.assign(new Error('Only WebP, JPG, PNG, GIF or AVIF images'), { status: 415 });
  const stem = String(req.body.name || 'image').replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'image';
  fs.mkdirSync(UPLOADS, { recursive: true });
  let name = stem + '.' + type, n = 1;
  while (fs.existsSync(path.join(UPLOADS, name))) name = stem + '-' + (++n) + '.' + type;
  fs.writeFileSync(path.join(UPLOADS, name), buf);
  activity.log(req.admin, 'Uploaded a photo', name, '');
  return { src: '/uploads/' + name };
}));
router.delete('/api/media/:name', api(req => {
  need(req, 'delete');
  const name = path.basename(req.params.name);
  if (!IMG_RE.test(name)) throw Object.assign(new Error('Bad file'), { status: 400 });
  const f = path.join(UPLOADS, name);
  if (!fs.existsSync(f)) throw Object.assign(new Error('Only uploaded images can be deleted'), { status: 404 });
  fs.unlinkSync(f);
  activity.log(req.admin, 'Deleted a photo', name, '');
}));

// ---------- API: enquiries ----------
const enquiryAt = (list, i) => { i = +i; if (!Number.isInteger(i) || !list[i]) throw Object.assign(new Error('Enquiry not found'), { status: 404 }); return i; };
// status, a note for the team, and who handles it
router.patch('/api/enquiries/:i', api(req => {
  need(req, 'enquiries');
  const l = readEnquiries(), i = enquiryAt(l, req.params.i), b = req.body || {}, e = l[i];
  if (b.read !== undefined) e._status = b.read ? (statusOf(e) === 'New' ? 'Replied' : statusOf(e)) : 'New';
  if (b.status !== undefined) { if (!ENQ_STATUS.includes(b.status)) throw Object.assign(new Error('Unknown status'), { status: 400 }); e._status = b.status; }
  if (b.note !== undefined) e._note = String(b.note).slice(0, 2000);
  if (b.assignee !== undefined) { const u = b.assignee ? users.byId(b.assignee) : null; e._assignee = u ? u.id : ''; e._assigneeName = u ? u.name : ''; }
  e._read = statusOf(e) !== 'New';
  writeEnquiries(l);
  activity.log(req.admin, 'Updated enquiry', (e.name || '') + ' — ' + statusOf(e), '/admin/enquiries');
  return { status: statusOf(e) };
}));
router.delete('/api/enquiries/:i', api(req => { need(req, 'delete'); const l = readEnquiries(), i = enquiryAt(l, req.params.i); const [e] = l.splice(i, 1); writeEnquiries(l); activity.log(req.admin, 'Deleted enquiry', e.name || '', '/admin/enquiries'); }));
router.get('/enquiries.csv', auth.allow('enquiries'), (req, res) => {
  const l = readEnquiries().map(e => Object.assign({}, e, { status: statusOf(e), note: e._note || '', handledBy: e._assigneeName || '' }));
  const keys = [...new Set(['receivedAt', 'name', 'email', 'status', 'handledBy', 'note'].concat(...l.map(e => Object.keys(e))))].filter(k => k[0] !== '_');
  // a value starting with = + - @ would run as a formula in Excel: a leading ' keeps it plain text (23 Oct 2026)
  const cell = v => '"' + String(Array.isArray(v) ? v.join(', ') : v == null ? '' : v).replace(/^[=+\-@\t\r]/, "'$&").replace(/"/g, '""') + '"';
  res.type('text/csv').attachment('enquiries.csv').send([keys.join(',')].concat(l.map(e => keys.map(k => cell(e[k])).join(','))).join('\n'));
});

router.use((req, res) => { res.status(404); view(res, 'error', { message: 'Page not found.' }); });

module.exports = router;
