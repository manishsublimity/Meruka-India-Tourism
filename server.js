const path = require('path');
const fs = require('fs');
const express = require('express');

const site = require('./data/site');
const contact = require('./data/contact');
const home = require('./data/home');
const about = require('./data/about');

const app = express();
const PORT = process.env.PORT || 3000;
const ENQUIRY_FILE = path.join(__dirname, 'data', 'enquiries.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.locals.rewriteHtml = site.rewriteHtml;
// SEO / AIO / GEO: every page knows its own absolute origin, for canonical, Open Graph and JSON-LD
const seo = require('./data/seo');
app.locals.seo = seo;
app.use((req, res, next) => { res.locals.base = req.protocol + '://' + req.get('host'); next(); });
Object.assign(app.locals, require('./data/photos'));
// The header's Destinations / Tour Packages dropdowns appear on every page
app.locals.menu = { pkgCols: home.pkgMenuCols, destCols: home.destMenuCols, to: home.to, mostBookedHref: home.mostBookedHref, langs: home.langs };
// ...and so does the one footer (partials/site-footer), with the head office details from the contact page
app.locals.footer = { cols: home.footerCols, seo: home.seoLinks, hq: contact.offices[0], testimonialsHref: home.testimonials.href,
  // WhatsApp chat link: the head office's first number
  social: require('./data/home2').social,
  wa: 'https://wa.me/' + contact.offices[0].phones[0].replace(/[^0-9]/g, ''),
  // links the original inner-page footer had, so no page loses its only way in
  legacy: site.footCols('').flatMap(c => c.items).filter(i => i.href.startsWith('/') && i.href !== '/') };

// Old addresses permanently redirect to the extension-less URL (query string kept): any original
// .htm/.html file name (any capitalisation, .htm or .html), and this site's earlier /about and /contact.
const EARLIER = { '/about': '/aboutus', '/contact': '/contactus' };
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  const to = EARLIER[req.path]
    || (/\.aspx$/i.test(req.path) ? '/contactus#enquiry' : null)          // the original's enquiry forms
    || (/\.(html?)$|\/$/i.test(req.path) && req.path !== '/' ? site.localFor(req.path) : null);
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
const renderHome4 = live => (req, res) => {
  const H2 = require('./data/home2');
  // Client pictures (6 Oct 2026): every picture on the page is used once only
  const REGION_IMG = { 'North India': '/photos/golden-temple-amritsar.jpg', 'South India': '/photos/madurai.webp', 'West India': '/photos/goa-beach-palms.avif', 'East India': '/photos/arunachal-losar.webp' };
  const CAT_IMG = { '/india-golden-triangle-tour': '/photos/red-fort-hd.webp', '/rajasthan-tours': '/photos/gadisar-lake-hd.webp', '/southindia_kerala_tours': '/photos/kerala-houseboat-dusk.webp', '/south_india_tour': '/photos/mysore-palace-lit.jpg', '/south_north_india_tours': '/photos/delhi-lotus-temple.jpg' };
  const POP_IMG = { '/golden_triangle_packages': '/photos/jal-mahal-jaipur.jpg', '/rajasthan_holiday_tour_packages': '/photos/bikaner-junagarh-client.jpg', '/itin_southindia_nature': '/photos/brihadeshwara-temple.webp', '/travel-rajasthan-India-hertiage-widllife-tours': '/photos/bengal-tiger-wide.jpg' };
  const H4 = Object.assign({}, H2, {
    // South in the tall tile (the temple tower fits it), North in the wide one (the Golden Temple is a wide picture)
    regions: ['South India', 'North India', 'West India', 'East India'].map(n => H2.regions.find(r => r.name === n)).filter(Boolean)
      .concat(H2.regions.filter(r => !['South India', 'North India', 'West India', 'East India'].includes(r.name)))
      .map(r => Object.assign({}, r, { img: REGION_IMG[r.name] || r.img })),
    categories: H2.categories.map(c => CAT_IMG[c.url] ? Object.assign({}, c, { img: CAT_IMG[c.url] }) : c),
    popular: H2.popular.map(t => POP_IMG[t.href] ? Object.assign({}, t, { img: POP_IMG[t.href] }) : t),
    guideImgs: ['/photos/globe.avif', '/photos/forts-palaces.jpeg', '/photos/travel-tools-hd.webp']
  });
  res.render('home-4', { title: 'Meruka India Tourism — One Country, Many Worlds' + (live ? '' : ' (copy 3)'), d: home, H2: H4, extraCss: '/css/home-4.css?v=' + Math.round(fs.statSync(path.join(__dirname, 'public/css/home-4.css')).mtimeMs), meta: live ? { description: HOME_DESC, canonical: '/' } : { description: HOME_DESC, canonical: '/', robots: 'noindex' } });
};
app.get('/', renderHome4(true));
// the design copy keeps working for further changes; it is the same page, not indexed
app.get('/home-4', renderHome4(false));
app.get('/aboutus', (req, res) => res.render('about', { ...inner4(), totalTours: require('./data/home2').totalTours, title: 'About us — Meruka India Tourism', d: about, meta: { description: 'Meruka India Tourism has looked after overseas travellers inside India since 2001: private, hand-routed tours with our own ground teams across the country.', canonical: '/aboutus' } }));
app.get('/contactus', (req, res) => res.render('contact', { ...inner4(), title: 'Contact us — Meruka India Tourism', d: contact, meta: { description: 'Contact Meruka India Tourism: head office in Jaipur, phone and WhatsApp +91 99203 63777, email ask@india-tourism.net. A planner replies within one working day.', canonical: '/contactus' } }));
// The Testimonials page has its own layout; its content is still the imported page, word for word.
app.get('/testimonials', (req, res) => {
  const d = require('./data/articles/testimonials');
  res.render('testimonials', { ...inner4(), title: d.title, d, T: home.testimonials, meta: { description: d.description, keywords: d.keywords, canonical: d.url } });
});

// One route per imported page, at the original file name without the extension:
// data/tours → itinerary pages, data/tour-lists → tour lists, data/articles → text pages.
for (const [dir, view] of [['tours', 'tour-detail'], ['tour-lists', 'tour-listing'], ['articles', 'article']]) {
  for (const f of fs.readdirSync(path.join(__dirname, 'data', dir)).filter(f => f.endsWith('.js'))) {
    const page = require('./data/' + dir + '/' + f);
    app.get(page.url, importedPage(view, page));
  }
}

// JSON data endpoints (the same data the pages are rendered from)
app.get('/api/tours', (req, res) => res.json(home.tours));
app.get('/api/offices', (req, res) => res.json(contact.offices));
app.get('/api/guide', (req, res) => res.json(contact.guide));

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
app.post('/api/enquiry', (req, res) => {
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
app.get('/robots.txt', (req, res) => res.type('text/plain').send(seo.robots(res.locals.base)));
app.get('/sitemap.xml', (req, res) => res.type('application/xml').send(seo.sitemap(res.locals.base)));
app.get('/llms.txt', (req, res) => res.type('text/plain').send(seo.llms(res.locals.base)));

app.use((req, res) => res.status(404).redirect('/'));

app.listen(PORT, () => console.log(`Meruka India Tourism running at http://localhost:${PORT}`));
