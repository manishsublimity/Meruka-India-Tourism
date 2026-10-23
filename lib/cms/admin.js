// The admin panel at /admin (16 Oct 2026): log in, then edit tours, tour categories, pages, the home page and footer,
// guest reviews, About and Contact; upload photos; read the enquiries sent from the website; restore deleted items.
const fs = require('fs');
const path = require('path');
const express = require('express');
const auth = require('./auth');
const store = require('./store');
const { ROOT, DATA } = require('./hook');

const UPLOADS = path.join(ROOT, 'public', 'uploads');
const ENQUIRY_FILE = path.join(DATA, 'enquiries.json');
const IMG_DIRS = [['uploads', 'Uploaded'], ['photos', 'Site photos'], ['images', 'Page banners'], ['assets', 'Home assets']];
const IMG_RE = /\.(webp|jpe?g|png|gif|avif)$/i;
// image types the library accepts, recognised by their first bytes (not by the name the browser sends)
const MAGIC = [['webp', b => b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP'], ['jpg', b => b[0] === 0xff && b[1] === 0xd8],
  ['png', b => b.slice(1, 4).toString() === 'PNG'], ['gif', b => b.slice(0, 3).toString() === 'GIF'], ['avif', b => b.slice(4, 12).toString().includes('ftypavif')]];

const router = express.Router();
router.use(express.urlencoded({ extended: false, limit: '64kb' }));
router.use('/api', express.json({ limit: '15mb' }));
router.use(auth.sameOrigin);
router.use((req, res, next) => { res.setHeader('X-Robots-Tag', 'noindex, nofollow'); res.setHeader('Cache-Control', 'no-store'); next(); });

const view = (res, name, locals) => res.render('admin/' + name, Object.assign({ page: name, admin: res.req.admin, kinds: store.KINDS, singles: store.SINGLES }, locals));
const fail = (res, e) => res.status(e.status || 500).json({ ok: false, error: e.status ? e.message : 'Something went wrong: ' + e.message });
const api = fn => (req, res) => { try { const out = fn(req, res); if (!res.headersSent) res.json(Object.assign({ ok: true }, out || {})); } catch (e) { fail(res, e); } };

// ---------- login ----------
router.get('/login', (req, res) => {
  if (!auth.enabled()) return view(res, 'login', { error: 'The admin panel is not set up yet: add ADMIN_USER, ADMIN_PASSWORD and SESSION_SECRET to the .env file and restart the site.', closed: true, next: '' });
  if (auth.session(req)) return res.redirect('/admin');
  view(res, 'login', { error: '', closed: false, next: String(req.query.next || '') });
});
router.post('/login', (req, res) => {
  if (!auth.enabled()) return res.redirect('/admin/login');
  const r = auth.check(req.ip, String(req.body.user || ''), String(req.body.password || ''));
  const next = /^\/admin(\/|$)/.test(String(req.body.next || '')) ? req.body.next : '/admin';
  if (!r.ok) return res.status(401).render('admin/login', { page: 'login', error: r.error, closed: false, next, admin: null });
  auth.setSession(res, req, process.env.ADMIN_USER || 'admin');
  res.redirect(next);
});
router.get('/logout', (req, res) => { auth.clearSession(res); res.redirect('/admin/login'); });

router.use(auth.requireAdmin);

// ---------- pages ----------
const readEnquiries = () => { try { return JSON.parse(fs.readFileSync(ENQUIRY_FILE, 'utf8')); } catch (e) { return []; } };
router.get('/', (req, res) => {
  const enq = readEnquiries();
  const rep = store.seoReport();
  view(res, 'dashboard', {
    seoStats: { good: rep.filter(r => r.level === 'good').length, ok: rep.filter(r => r.level === 'ok').length, bad: rep.filter(r => r.level === 'bad').length, total: rep.length },
    counts: Object.fromEntries(Object.keys(store.KINDS).map(k => [k, store.list(k).length])),
    unread: enq.filter(e => !e._read).length, latest: enq.slice(-5).reverse(), singlesList: store.singles()
  });
});
router.get('/media', (req, res) => view(res, 'media', {}));
router.get('/seo', (req, res) => view(res, 'seo', { rows: store.seoReport() }));
router.get('/enquiries', (req, res) => view(res, 'enquiries', { items: readEnquiries().map((e, i) => Object.assign({ _i: i }, e)).reverse() }));
router.get('/trash', (req, res) => view(res, 'trash', { items: store.trash() }));
router.get('/settings/:name', (req, res, next) => { if (!store.SINGLES[req.params.name]) return next(); view(res, 'edit', { mode: 'single', kind: 'single', id: req.params.name, title: store.SINGLES[req.params.name].label, url: '' }); });
router.get('/:kind', (req, res, next) => { if (!store.KINDS[req.params.kind]) return next(); const items = store.list(req.params.kind);
  // filter by category: the categories with a code (GT …), for the tours list
  const cats = req.params.kind === 'tours' ? store.list('lists').filter(l => l.code && !l.code.includes('-')).map(l => ({ code: l.code, name: l.name })) : [];
  view(res, 'list', { kind: req.params.kind, k: store.KINDS[req.params.kind], items, cats }); });
router.get('/:kind/:id', (req, res, next) => {
  if (!store.KINDS[req.params.kind]) return next();
  try { const it = store.get(req.params.kind, req.params.id); view(res, 'edit', { mode: 'item', kind: req.params.kind, id: req.params.id, title: it.data.heading || it.id, url: it.url }); }
  catch (e) { res.status(e.status || 500); view(res, 'error', { message: e.message }); }
});

// ---------- API: content ----------
router.get('/api/item/:kind/:id', api(req => store.get(req.params.kind, req.params.id)));
router.put('/api/item/:kind/:id', api(req => store.save(req.params.kind, req.params.id, req.body && req.body.data)));
router.post('/api/item/:kind', api(req => store.create(req.params.kind, req.body.slug, req.body.from, req.body.name)));
router.delete('/api/item/:kind/:id', api(req => { store.remove(req.params.kind, req.params.id); }));
router.post('/api/item/:kind/:id/revert', api(req => { store.revert(req.params.kind, req.params.id); return store.get(req.params.kind, req.params.id); }));
router.get('/api/single/:name', api(req => store.getSingle(req.params.name)));
router.put('/api/single/:name', api(req => store.saveSingle(req.params.name, req.body && req.body.data)));
router.post('/api/single/:name/revert', api(req => { store.revertSingle(req.params.name); return store.getSingle(req.params.name); }));
router.post('/api/restore', api(req => { store.restore(req.body.kind, req.body.bin); }));
// every tour, for picking tours into a category
router.get('/api/tours-index', api(() => ({ items: store.list('tours').map(t => {
  const d = store.get('tours', t.id).data;
  return { name: t.name, href: t.url, route: d.route || '', duration: String(d.duration || '').replace(/\s*·\s*/, ' - ') };
}) })));

// ---------- API: numbers for the Dashboard charts ----------
router.get('/dashboard', (req, res) => view(res, 'insights', {}));
router.get('/api/stats', api(() => {
  const band = n => !n ? 'Not said' : n <= 7 ? 'Up to 7 nights' : n <= 10 ? '8–10 nights' : n <= 14 ? '11–14 nights' : n <= 20 ? '15–20 nights' : '21+ nights';
  const nightsOf = s => { const m = String(s || '').match(/(\d+)/); return m ? +m[1] : 0; };
  // enquiries: only the fields the charts use (no names or emails leave the server here)
  const enquiries = readEnquiries().map(e => {
    const hotel = (String(e.hotel || '').match(/([345])\s*-?\s*star/i) || [])[1];
    // the Plan My Trip form already offers ranges ("10 – 14 nights"); the Contact form asks for a number of days
    const length = e.duration ? String(e.duration).replace(/\s*[–-]\s*/, '–') : band(e.days ? Math.max(1, nightsOf(e.days) - 1) : 0);
    return { at: e.receivedAt, read: !!e._read,
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
  // what was changed lately in the panel
  const recent = [];
  const walk = (dir, rel) => { if (!fs.existsSync(dir)) return; for (const f of fs.readdirSync(dir)) { const p = path.join(dir, f); if (f === 'trash') continue; if (fs.statSync(p).isDirectory()) walk(p, rel + f + '/'); else if (f.endsWith('.json')) recent.push({ rel: rel + f.slice(0, -5), at: fs.statSync(p).mtime.toISOString() }); } };
  walk(path.join(DATA, 'cms'), '');
  const SECT = { tours: ['tours', 'Tour'], 'tour-lists': ['lists', 'Category'], articles: ['pages', 'Page'] };
  const singleOf = Object.fromEntries(Object.entries(store.SINGLES).map(([k, s]) => [s.file, [k, s.label]]));
  const recentRows = recent.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8).map(r => {
    const [dir, id] = r.rel.includes('/') ? r.rel.split('/') : [null, r.rel];
    if (dir && SECT[dir]) { let name = id; try { name = String(require(path.join(DATA, dir, id)).heading || id).replace(/<[^>]+>/g, ''); } catch (e) {} return { name, what: SECT[dir][1], at: r.at, edit: '/admin/' + SECT[dir][0] + '/' + id }; }
    const s = singleOf[id]; return s ? { name: s[1], what: 'Section', at: r.at, edit: '/admin/settings/' + s[0] } : null;
  }).filter(Boolean);
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
router.get('/api/media', api(() => ({ groups: IMG_DIRS.map(([dir, label]) => {
  const full = path.join(ROOT, 'public', dir);
  const files = fs.existsSync(full) ? fs.readdirSync(full).filter(f => IMG_RE.test(f)).map(f => ({ src: '/' + dir + '/' + f, name: f, mtime: fs.statSync(path.join(full, f)).mtimeMs })) : [];
  return { dir, label, files: files.sort((a, b) => b.mtime - a.mtime) };
}) })));
router.post('/api/media', api(req => {
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
  return { src: '/uploads/' + name };
}));
router.delete('/api/media/:name', api(req => {
  const name = path.basename(req.params.name);
  if (!IMG_RE.test(name)) throw Object.assign(new Error('Bad file'), { status: 400 });
  const f = path.join(UPLOADS, name);
  if (!fs.existsSync(f)) throw Object.assign(new Error('Only uploaded images can be deleted'), { status: 404 });
  fs.unlinkSync(f);
}));

// ---------- API: enquiries ----------
const writeEnquiries = list => fs.writeFileSync(ENQUIRY_FILE, JSON.stringify(list, null, 2));
const enquiryAt = (list, i) => { i = +i; if (!Number.isInteger(i) || !list[i]) throw Object.assign(new Error('Enquiry not found'), { status: 404 }); return i; };
router.patch('/api/enquiries/:i', api(req => { const l = readEnquiries(), i = enquiryAt(l, req.params.i); l[i]._read = !!req.body.read; writeEnquiries(l); }));
router.delete('/api/enquiries/:i', api(req => { const l = readEnquiries(), i = enquiryAt(l, req.params.i); l.splice(i, 1); writeEnquiries(l); }));
router.get('/enquiries.csv', (req, res) => {
  const l = readEnquiries();
  const keys = [...new Set(['receivedAt', 'name', 'email'].concat(...l.map(e => Object.keys(e))))].filter(k => k[0] !== '_');
  // a value starting with = + - @ would run as a formula in Excel: a leading ' keeps it plain text (23 Oct 2026)
  const cell = v => '"' + String(Array.isArray(v) ? v.join(', ') : v == null ? '' : v).replace(/^[=+\-@\t\r]/, "'$&").replace(/"/g, '""') + '"';
  res.type('text/csv').attachment('enquiries.csv').send([keys.join(',')].concat(l.map(e => keys.map(k => cell(e[k])).join(','))).join('\n'));
});

router.use((req, res) => { res.status(404); view(res, 'error', { message: 'Page not found.' }); });

module.exports = router;
