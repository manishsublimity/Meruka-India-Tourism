const path = require('path');
const fs = require('fs');
const express = require('express');

// CMS (16 Oct 2026): what is edited in the admin panel (/admin) is laid over the data files as they load — see
// lib/cms/hook.js. The data is read inside buildSite(), which runs again after every save in the admin panel.
const cmsHook = require('./lib/cms/hook');
cmsHook.install();
let site, contact, home, about, seo;

const app = express();
const PORT = process.env.PORT || 3000;
const ENQUIRY_FILE = path.join(__dirname, 'data', 'enquiries.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
// SEO / AIO / GEO: every page knows its own absolute origin, for canonical, Open Graph and JSON-LD
app.use((req, res, next) => { res.locals.base = req.protocol + '://' + req.get('host'); next(); });
// the admin panel (before the JSON body parser: it reads larger bodies itself, e.g. photo uploads)
app.use('/admin', require('./lib/cms/admin'));
app.use(express.json());

// Everything the public pages need — data, shared template helpers and routes — built from the data files.
// The admin panel rebuilds it after each change, so edits show at once without restarting the site.
function buildSite() {
  site = require('./data/site');
  contact = require('./data/contact');
  home = require('./data/home');
  about = require('./data/about');
  seo = require('./data/seo');
  // Google settings from the admin panel: verification, Analytics, share picture, fixed pages' Google text, redirects
  const seoSettings = require('./data/seo-settings');
  app.locals.seoSettings = seoSettings;
  app.locals.rewriteHtml = site.rewriteHtml;
  app.locals.seo = seo;
  Object.assign(app.locals, require('./data/photos'));
  const router = express.Router();

  // Every tour on the tour-list pages (one entry per itinerary), and the tours that take in a place —
  // used by the destination guides ("Tours that include Delhi"). A tour named after the place comes
  // first, then tours that stop there on the way (not only start or end there), shortest first.
  const ALL_TOURS = (() => {
    const seen = new Map();
    for (const f of fs.readdirSync(path.join(__dirname, 'data', 'tour-lists')).filter(f => f.endsWith('.js'))) {
      require('./data/tour-lists/' + f).groups.forEach(g => g.tours.forEach(t => { if (t.href && !seen.has(t.href)) seen.set(t.href, t); }));
    }
    return [...seen.values()];
  })();
  const nightsOf = t => +((String(t.duration || '').match(/(\d+)\s*Nights?/i) || [])[1] || 99);
  app.locals.toursFor = (place, n = 4) => {
    const word = String(place || '').replace(/\s*(Tourism|Tours?|Travel)$/i, '').trim();
    if (word.length < 3) return [];
    const re = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    const score = t => {
      const stops = String(t.route || '').split(/\s+[-–]\s+/);
      if (re.test(t.name)) return 0;
      return stops.slice(1, -1).some(s => re.test(s)) ? 1 : (re.test(t.route || '') ? 2 : 9);
    };
    return ALL_TOURS.map(t => ({ t, s: score(t) })).filter(x => x.s < 9)
      .sort((a, b) => a.s - b.s || nightsOf(a.t) - nightsOf(b.t)).slice(0, n).map(x => x.t);
  };
  // Every inner page ends with the same "explore" block as the original site (partials/explore-india): the four
  // regions, every tour category in its group, and the travel guide — the home page's designs, the home page's data
  app.locals.tourNav = require('./data/tour-nav');
  // (19 Oct 2026, client) tour codes (GT, GT-1 …) and the "Private Tour – No Sharing" badge shown with every tour name and price
  app.locals.tourCode = require('./data/tour-codes').codeFor;
  const PVT_ICON = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 1.5 3 4.3v4.9c0 4.3 3 8 7 9.3 4-1.3 7-5 7-9.3V4.3L10 1.5zm3.4 6.2a.9.9 0 0 0-1.3-1.2L9 9.6 7.9 8.5a.9.9 0 1 0-1.3 1.3l1.8 1.8a.9.9 0 0 0 1.3 0l3.7-3.9z" clip-rule="evenodd"/></svg>';
  app.locals.pvtIcon = '<span class="pvt-ic" title="Private tour – no sharing" role="img" aria-label="Private tour, no sharing">' + PVT_ICON + '</span>';
  app.locals.pvt = (cls = '') => '<span class="pvt' + (cls ? ' ' + cls : '') + '">' + PVT_ICON + '<span>Private Tour <i aria-hidden="true">–</i> No Sharing</span></span>';
  // A tour's own main photo (the first picture on its page), for the rows of the category pages (16 Oct 2026)
  const TOUR_PAGES = {};
  fs.readdirSync(path.join(__dirname, 'data', 'tours')).filter(f => f.endsWith('.js')).forEach(f => { const t = require('./data/tours/' + f); TOUR_PAGES[t.url.toLowerCase()] = t; });
  app.locals.tourPhoto = url => { const t = TOUR_PAGES[String(url || '').toLowerCase()]; return t ? (t.photo || app.locals.photoFor([t.heading, t.url, t.route])) : ''; };
  app.locals.explore = (() => {
    const H2 = require('./data/home2');
    const REGION_IMG = { 'North India': '/photos/golden-temple-amritsar.webp', 'South India': '/photos/region-south-india.webp', 'West India': '/photos/goa-beach-palms.webp', 'East India': '/photos/arunachal-losar.webp' };
    return {
      regions: ['North India', 'South India', 'East India', 'West India'].map(n => H2.regions.find(r => r.name === n)).filter(Boolean)
        .map(r => Object.assign({}, r, { img: REGION_IMG[r.name] || r.img })),
      guideCols: home.guideCols,
      guideImgs: ['/photos/guide-travelers.webp', '/photos/guide-attractions.webp', '/photos/travel-tools-hd.webp'],
      // (18 Oct 2026) the number of tours in each category and in each sector, for "India Tour Packages"
      tourCounts: (() => {
        const lists = {};
        fs.readdirSync(path.join(__dirname, 'data', 'tour-lists')).filter(f => f.endsWith('.js')).forEach(f => { const l = require('./data/tour-lists/' + f); lists[String(l.url).toLowerCase()] = l; });
        // the tours each category page actually lists (some lists keep their tours outside `groups`)
        const toursOf = href => { const l = lists[String(href).toLowerCase()]; const s = new Set(); if (l) H2.listingFor(l).forEach(g => g.rows.forEach(t => t.href && s.add(t.href.toLowerCase()))); return s; };
        const cat = {}, sector = {};
        require('./data/tour-nav').groups.forEach(g => { const all = new Set(); g.cats.forEach(c => { const s = toursOf(c.href); cat[c.href] = s.size; s.forEach(x => all.add(x)); }); sector[g.title] = all.size; });
        return { cat, sector };
      })()
    };
  })();
  // The header's Destinations / Tour Packages dropdowns appear on every page
  app.locals.menu = { pkgCols: home.pkgMenuCols, destCols: home.destMenuCols, to: home.to, mostBookedHref: home.mostBookedHref, langs: home.langs };
  // ...and so does the one footer (partials/site-footer), with the head office details from the contact page
  app.locals.footer = { cols: home.footerCols, seo: home.seoLinks, hq: contact.offices[0], testimonialsHref: home.testimonials.href,
    // WhatsApp chat link: the head office's first number
    social: require('./data/home2').social,
    wa: 'https://wa.me/' + contact.offices[0].phones[0].replace(/[^0-9]/g, ''),
    // links the original inner-page footer had, so no page loses its only way in
    legacy: site.footCols('').flatMap(c => c.items).filter(i => i.href.startsWith('/') && i.href !== '/') };

  // Redirects added in the admin panel (Google settings): old address → new address, permanent (301)
  const norm = p => String(p || '').trim().replace(/^https?:\/\/[^/]+/i, '').replace(/\/+$/, '').toLowerCase() || '/';
  const REDIRECTS = new Map((seoSettings.redirects || []).filter(r => r && r.from && r.to && norm(r.from) !== norm(r.to)).map(r => [norm(r.from), String(r.to).trim()]));
  router.use((req, res, next) => {
    const to = req.method === 'GET' && REDIRECTS.get(norm(req.path));
    if (!to) return next();
    res.redirect(301, to + (to.includes('?') ? '' : req.url.slice(req.path.length)));
  });
  // the fixed pages' Google title and description, when set in the admin panel
  router.use((req, res, next) => {
    const p = (seoSettings.pages || {})[req.path];
    if (p && (p.title || p.description)) {
      const render = res.render.bind(res);
      res.render = (view, locals, cb) => {
        if (locals) {
          if (p.title) locals.title = p.title;
          if (p.description) locals.meta = Object.assign({}, locals.meta, { description: p.description });
        }
        return render(view, locals, cb);
      };
    }
    next();
  });

  // Old addresses permanently redirect to the extension-less URL (query string kept): any original
  // .htm/.html file name (any capitalisation, .htm or .html), and this site's earlier /about and /contact.
  const EARLIER = { '/about': '/aboutus', '/contact': '/contactus' };
  router.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    const to = EARLIER[req.path]
      || (/\.aspx$/i.test(req.path) ? '/contactus#enquiry' : null)          // the original's enquiry forms
      || (/\.(html?)$|\/$/i.test(req.path) && req.path !== '/' ? site.localFor(req.path) : null)
      || (!/\.[a-z0-9]+$/i.test(req.path) ? site.renamedFor(req.path) : null);   // misspelt addresses renamed (19 Oct 2026)
    if (!to) return next();
    res.redirect(301, to + req.url.slice(req.path.length));
  });

  // Imported pages carry the original page's title, description and keywords.
  const HOME_DESC = 'Private tours of India for overseas travellers since 2001 — Golden Triangle, Rajasthan, Kerala, Ladakh, wildlife and more. 3–5 star hotels, your own car and driver, from USD 65 per person per day.';

  // Inner pages wear the home-4 design: its classes on #mk-frame, home-4.css, then inner-4.css for the inner-page sections
  const cssV = f => '/css/' + f + '?v=' + Math.round(fs.statSync(path.join(__dirname, 'public/css', f)).mtimeMs);
  const inner4 = () => ({ frameClass: 'ux v3 h4 in4', extraCss: [cssV('home-4.css'), cssV('inner-4.css')] });

  const importedPage = (view, d) => (req, res) => res.render(view, Object.assign({
    title: d.title, d, meta: { description: d.description, keywords: d.keywords, canonical: d.url }
  }, inner4()));

  // The home page is the home-4 design (7 Oct 2026). The earlier copies (/home-1, /home-2, /home-3)
  // were retired on 8 Oct 2026.
  // home-4: the 4 Oct 2026 review — new region and guide photos (no picture repeated), a different Taj shot for the package grid
  // Most Popular Tours, with the client's pictures (home page and About page)
  const POP_IMG = { '/golden_triangle_packages': '/photos/jal-mahal-jaipur.webp', '/rajasthan_holiday_tour_packages': '/photos/bikaner-junagarh-client.webp', '/itin_southindia_nature': '/photos/brihadeshwara-temple.webp', '/travel-rajasthan-India-heritage-wildlife-tours': '/photos/bengal-tiger-wide.webp' };
  const popularTours = () => require('./data/home2').popular.map(t => POP_IMG[t.href] ? Object.assign({}, t, { img: POP_IMG[t.href] }) : t);
  app.locals.popularTours = popularTours;
  // Similar tours for a tour page: the other tours of its category list (cards with photo, route, price)
  const TOUR_LISTS = {};
  fs.readdirSync(path.join(__dirname, 'data', 'tour-lists')).filter(f => f.endsWith('.js')).forEach(f => { const l = require('./data/tour-lists/' + f); TOUR_LISTS[l.url] = l; });
  app.locals.similarTours = (tourUrl, listUrl, n = 3) => {
    const l = TOUR_LISTS[listUrl]; if (!l) return [];
    return require('./data/home2').listingFor(l).flatMap(g => g.rows).filter(r => r.href && r.href.toLowerCase() !== String(tourUrl).toLowerCase()).slice(0, n);
  };
  const renderHome4 = live => (req, res) => {
    const H2 = require('./data/home2');
    // Client pictures (6 Oct 2026): every picture on the page is used once only
    const REGION_IMG = { 'North India': '/photos/golden-temple-amritsar.webp', 'South India': '/photos/region-south-india.webp', 'West India': '/photos/goa-beach-palms.webp', 'East India': '/photos/arunachal-losar.webp' };
    const CAT_IMG = { '/india-golden-triangle-tour': '/photos/red-fort-hd.webp', '/rajasthan-tours': '/photos/gadisar-lake-hd.webp', '/southindia_kerala_tours': '/photos/kerala-houseboat-dusk.webp', '/south_india_tour': '/photos/mysore-palace-lit.webp', '/south_north_india_tours': '/photos/delhi-lotus-temple.webp' };
    const H4 = Object.assign({}, H2, {
      // South in the tall tile (the temple tower fits it), North in the wide one (the Golden Temple is a wide picture)
      regions: ['South India', 'North India', 'West India', 'East India'].map(n => H2.regions.find(r => r.name === n)).filter(Boolean)
        .concat(H2.regions.filter(r => !['South India', 'North India', 'West India', 'East India'].includes(r.name)))
        .map(r => Object.assign({}, r, { img: REGION_IMG[r.name] || r.img })),
      // (18 Oct 2026) each category also carries its lowest whole-tour price per person, as on the tour packages page
      categories: H2.categories.map(c => {
        const l = TOUR_LISTS[c.url], prices = l ? H2.listingFor(l).map(g => g.from).filter(Boolean) : [];
        return Object.assign({}, c, CAT_IMG[c.url] ? { img: CAT_IMG[c.url] } : {}, { fromTotal: prices.length ? Math.min(...prices) : 0 });
      }),
      popular: popularTours(),
      guideImgs: ['/photos/guide-travelers.webp', '/photos/guide-attractions.webp', '/photos/travel-tools-hd.webp']
    });
    res.render('home-4', { title: 'Meruka India Tourism — One Country, Many Worlds' + (live ? '' : ' (copy 3)'), d: home, H2: H4, extraCss: '/css/home-4.css?v=' + Math.round(fs.statSync(path.join(__dirname, 'public/css/home-4.css')).mtimeMs), meta: live ? { description: HOME_DESC, canonical: '/' } : { description: HOME_DESC, canonical: '/', robots: 'noindex' } });
  };
  router.get('/', renderHome4(true));
  // the design copy keeps working for further changes; it is the same page, not indexed
  router.get('/home-4', renderHome4(false));
  router.get('/aboutus', (req, res) => res.render('about', { ...inner4(), totalTours: require('./data/home2').totalTours, T: home.testimonials, title: 'About us — Meruka India Tourism', d: about, meta: { description: 'Meruka India Tourism has looked after overseas travellers inside India since 2001: private, hand-routed tours with our own ground teams across the country.', canonical: '/aboutus' } }));
  // Plan My Trip (15 Oct 2026): every "Plan My Trip" button opens this page; ?tour=<name> fills in the message
  // Sitemap (18 Oct 2026, footer → Company): every page of the website, for visitors
  router.get('/sitemap', (req, res) => {
    const read = dir => fs.readdirSync(path.join(__dirname, 'data', dir)).filter(f => f.endsWith('.js')).map(f => require('./data/' + dir + '/' + f)).filter(m => m.url && !m.noindex);
    const plain = s => String(s || '').replace(/<[^>]+>/g, '').trim();
    const byName = (a, b) => a.name.localeCompare(b.name);
    const tours = read('tours').map(m => ({ name: plain(m.heading || m.title), href: m.url })).sort(byName);
    const pages = read('articles').map(m => ({ name: plain(m.heading || m.title), href: m.url })).sort(byName);
    res.render('sitemap', { ...inner4(), title: 'Sitemap — Meruka India Tourism', tours, pages, d: { nav: site.nav('', false), footCols: site.footCols() },
      meta: { description: 'Every page of the Meruka India Tourism website: tour packages by region, all tour itineraries, and the India travel guide.', canonical: '/sitemap' } });
  });
  router.get('/plan-my-trip', (req, res) => res.render('plan', { ...inner4(), title: 'Plan My Trip — Meruka India Tourism', H: home, q: req.query,
    d: { nav: site.nav('', false), footCols: site.footCols() },
    meta: { description: 'Plan a private tour of India with Meruka India Tourism: tell us your places, dates and hotels, and a planner replies within one working day with a route and a price.', canonical: '/plan-my-trip' } }));
  router.get('/contactus',(req, res) => res.render('contact', { ...inner4(), title: 'Contact us — Meruka India Tourism', d: contact, H: home, meta: { description: 'Contact Meruka India Tourism: head office in Jaipur, phone and WhatsApp +91 99203 63777, email ask@india-tourism.net. A planner replies within one working day.', canonical: '/contactus' } }));
  // The Testimonials page has its own layout; its content is still the imported page, word for word.
  router.get('/testimonials', (req, res) => {
    const d = require('./data/articles/testimonials');
    res.render('testimonials', { ...inner4(), title: d.title, d, T: home.testimonials, meta: { description: d.description, keywords: d.keywords, canonical: d.url } });
  });

  // One route per imported page, at the original file name without the extension:
  // data/tours → itinerary pages, data/tour-lists → tour lists, data/articles → text pages.
  for (const [dir, view] of [['tours', 'tour-detail'], ['tour-lists', 'tour-listing'], ['articles', 'article']]) {
    for (const f of fs.readdirSync(path.join(__dirname, 'data', dir)).filter(f => f.endsWith('.js'))) {
      const page = require('./data/' + dir + '/' + f);
      // tour lists also get their groups as cards (photo, line, price, filter tags)
      // every tour page uses the new layout (13 Oct 2026, from the Enthralling Rajasthan Tour page)
      if (view === 'tour-detail') { router.get(page.url, importedPage('tour-detail-v2', page)); continue; }
      router.get(page.url, view === 'tour-listing'
        ? (req, res) => res.render(view, Object.assign({ title: page.title, d: page, G: require('./data/home2').listingFor(page),
            meta: { description: page.description, keywords: page.keywords, canonical: page.url } }, inner4()))
        : importedPage(view, page));
    }
  }

  // JSON data endpoints (the same data the pages are rendered from)
  router.get('/api/tours', (req, res) => res.json(home.tours));
  router.get('/api/offices', (req, res) => res.json(contact.offices));
  router.get('/api/guide', (req, res) => res.json(contact.guide));

  const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  router.post('/api/enquiry', (req, res) => {
    const b = req.body || {};
    const name = String(b.name || '').trim();
    const email = String(b.email || '').trim();
    if (!name || !EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, error: 'Please enter your name and a valid email address.' });
    }
    let list = [];
    try { list = JSON.parse(fs.readFileSync(ENQUIRY_FILE, 'utf8')); } catch (e) {}
    list.push(Object.assign({}, b, { name, email, receivedAt: new Date().toISOString() }));
    fs.writeFileSync(ENQUIRY_FILE, JSON.stringify(list, null, 2));
    res.json({ ok: true, firstName: name.split(' ')[0] });
  });

  // Crawlers and AI assistants
  router.get('/robots.txt', (req, res) => res.type('text/plain').send(seo.robots(res.locals.base)));
  router.get('/sitemap.xml', (req, res) => res.type('application/xml').send(seo.sitemap(res.locals.base)));
  router.get('/llms.txt', (req, res) => res.type('text/plain').send(seo.llms(res.locals.base)));

  return router;
}

let siteRouter = buildSite();
require('./lib/cms/store').events.on('change', () => {
  try { siteRouter = buildSite(); } catch (e) { console.error('[cms] could not rebuild the site after a change:', e); }
});
app.use((req, res, next) => siteRouter(req, res, next));

app.use((req, res) => res.status(404).redirect('/'));

app.listen(PORT, () => console.log(`Meruka India Tourism running at http://localhost:${PORT}`));
