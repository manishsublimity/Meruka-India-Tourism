// Shared URL rules plus header / footer data for the inner pages.
//
// Every page of the original india-tourism.net is served here at its file name without the
// extension (aboutus.htm -> /aboutus, golden_triangle_packages.html -> /golden_triangle_packages).
// link() turns any original address into the local one; nothing links to the live site.
const fs = require('fs');
const path = require('path');

// Built-in pages, keyed by their original file name
const PAGES = {
  'index.htm': '/',
  'aboutus.htm': '/aboutus',
  'contactus.htm': '/contactus'
};
// Imported pages: data/tours (itineraries), data/tour-lists (tour lists), data/articles (text pages).
// See scripts/import-*.js.
const IMPORTED = ['tours', 'tour-lists', 'articles'];
for (const dir of IMPORTED) {
  const full = path.join(__dirname, dir);
  if (!fs.existsSync(full)) continue;
  for (const f of fs.readdirSync(full)) {
    if (f.endsWith('.js')) PAGES[f.slice(0, -3) + '.html'] = '/' + f.slice(0, -3);
  }
}

// Lookup by file name without extension, ignoring case: the originals link the same page as
// .htm or .html and with varying capitals.
const baseOf = f => f.replace(/\/+$/, '').replace(/\.(html?|aspx)$/i, '').toLowerCase();
const BY_BASE = {};
for (const [file, url] of Object.entries(PAGES)) BY_BASE[baseOf(file)] = url;

// Addresses that are dead on the original site, pointed at the page they meant.
const ALIASES = {
  'index-htm': 'index.htm',
  'index-2': 'index.htm',
  'testimonial': 'testimonials.htm',                                       // misspelt in some page text
  'india_tour_packages': 'itineraries.htm',                                // named in page text; 404 on the original
  'india_tour_itineraries': 'itineraries.htm',
  'tours/india-yoga-and-meditation-tour': 'itin_yoga_meditation.htm',
  'tours/south-india-panorama-tour': 'itin_south_panorama.htm',
  'tours/vision-of-india-tour': 'itin_vision_tour.htm',
  'atonishing-karnataka-tour': 'Astonishing-Karnataka-Tour.html',          // misspelt link on the original
  'fair_festivals_markar_sakranti_north_india': 'Fairs-Festivals.htm'      // 404 on the original
};

// Local address for an original link (relative file name, /file, or a full india-tourism.net URL).
// Links to other websites, mailto: and tel: are returned unchanged.
const link = p => {
  if (!p) return p;
  p = p.trim();
  if (/^#+$/.test(p)) return '#';                                        // "##" placeholders on the original
  if (/^(mailto:|tel:|#|javascript:)/i.test(p)) return p;
  if (/(^|\/)cdn-cgi\/l\/email-protection/i.test(p)) return 'mailto:info@india-tourism.net';   // Cloudflare-hidden e-mail
  if (/^https?:\/\//i.test(p) && !/^https?:\/\/(www\.)?india-tourism\.net(\/|$)/i.test(p)) return p;
  const rel = p.replace(/^(https?:\/\/)?(www\.)?india-tourism\.net/i, '').replace(/^\/+/, '');
  const [file, hash] = rel.split('#');
  const tail = hash ? '#' + hash : '';
  if (/\.aspx$/i.test(file)) return '/contactus#enquiry';              // the original's enquiry forms
  if (!file) return '/' + tail;
  let key = baseOf(file.split('?')[0]);
  if (ALIASES[key]) key = baseOf(ALIASES[key]);
  if (BY_BASE[key]) return BY_BASE[key] + tail;
  return '/' + file.replace(/\.(html?)$/i, '') + tail;                  // not imported yet: still local
};
const li = arr => arr.map(([label, href]) => ({ label, href: link(href) }));

// Images are served from /images (downloaded by scripts/fetch-images.js).
const IMG = f => '/images/' + f.replace(/^\/?images\//, '');
const localSrc = src => /^https?:/i.test(src) && !/india-tourism\.net/i.test(src) ? src
  : '/images/' + src.replace(/^https?:\/\/(www\.)?india-tourism\.net/i, '').replace(/^\/+/, '').replace(/^images\//, '');

// Rewrite links and image sources inside imported HTML to their local addresses.
// Addresses of the old site written as plain text ("please visit: http://www.india-tourism.net/itineraries.htm")
// keep their wording but become links to the local page.
// Ends at the file extension: some texts run straight on ("…itineraries.htmand to justify…").
const TEXT_URL = /\b(?:https?:\/\/)?(?:www\.)?india-tourism\.net\/[\w\-\/]*?\.(?:html?|aspx)/gi;
const rewriteHtml = html => html
  .replace(/href="([^"]*)"/g, (m, h) => {
    const to = link(h.replace(/&amp;/g, '&'));
    return 'href="' + to.replace(/&/g, '&amp;') + '"' + (/^https?:/i.test(to) ? ' target="_blank" rel="noopener"' : '');
  })
  .replace(/src="([^"]*)"/g, (m, s) => 'src="' + localSrc(s) + '"')
  // plain-text addresses: only in text between tags, and not already inside a link
  .split(/(<a\b[\s\S]*?<\/a>|<[^>]+>)/i)
  .map(part => part.startsWith('<') ? part : part.replace(TEXT_URL, u => '<a href="' + link(u) + '">' + u + '</a>'))
  .join('');

// Local URL for a request to an original address (/aboutus.htm, /Golden-Triangle-Goa-Tour.html, ...)
const localFor = pathname => {
  const key = baseOf(decodeURIComponent(pathname).replace(/^\/+/, ''));
  const target = BY_BASE[ALIASES[key] ? baseOf(ALIASES[key]) : key];
  return target && target !== pathname ? target : null;
};

const NAV = [['Home', 'index.htm'], ['About Us', 'aboutus.htm'], ['India Tours', 'itineraries.htm'], ['Testimonials', 'testimonials.htm'], ['Contact Us', 'contactus.htm']];

module.exports = {
  PAGES,
  link,
  li,
  IMG,
  rewriteHtml,
  localFor,

  // `active` is the highlighted item. When it is the current page (`self`), its link jumps to the top.
  nav: (active, self = true) => NAV.map(([label, file]) => ({ label, href: label === active && self ? '#top' : link(file), active: label === active })),

  footCols: active => [
    { title: 'Quick Links', items: [{ label: 'Home', href: link('index.htm') }, { label: 'About Us', href: active === 'About Us' ? '#top' : link('aboutus.htm') }, { label: 'India Tours', href: link('itineraries.htm') }, { label: 'Contact', href: active === 'Contact Us' ? '#top' : link('contactus.htm') }] },
    { title: 'Tours', items: li([['North India', 'north_india_tour.html'], ['South India', 'south_india_tour.html'], ['East India', 'east_india_tour_tourism.html'], ['West India', 'west_india_tour_tourism.html']]) },
    { title: 'Resources', items: li([['Testimonials', 'testimonials.htm'], ['Important Links', 'important_links.html']]) },
    { title: 'Contact Us', items: [{ label: 'info@india-tourism.net', href: 'mailto:info@india-tourism.net' }].concat(active === 'About Us'
      ? [{ label: 'A-30 Subash Nagar Shopping Center, Jaipur, Rajasthan - 302016', href: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('A-30 Subash Nagar Shopping Center, Jaipur, Rajasthan 302016') }]
      : []) }
  ]
};
