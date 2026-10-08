// Search (SEO), answer-engine (AIO) and generative-engine (GEO) helpers:
// schema.org JSON-LD for every page, plus the robots.txt, sitemap.xml and llms.txt bodies.
const fs = require('fs');
const path = require('path');
const contact = require('./contact');
const home = require('./home');

const NAME = 'Meruka India Tourism';
const hq = contact.offices[0];
const plain = s => String(s || '').replace(/\s+/g, ' ').trim();

// The company, on every page: who we are, where, how to reach us
const organization = base => ({
  '@type': 'TravelAgency',
  '@id': base + '/#organization',
  name: NAME,
  alternateName: hq.name,
  url: base + '/',
  logo: base + '/assets/meruka-logo-leaflet.png',
  image: base + '/photos/taj-mahal-feature.webp',
  description: 'Inbound travel agency for overseas visitors since 2001: private tours of India with 3–5 star hotels and a dedicated car and driver from arrival to departure.',
  foundingDate: '2001',
  email: hq.email,
  telephone: hq.phones[0],
  address: { '@type': 'PostalAddress', streetAddress: 'A-30, Shopping Centre, Subhash Nagar, Vasudev Marg', addressLocality: 'Jaipur', addressRegion: 'Rajasthan', postalCode: '302016', addressCountry: 'IN' },
  areaServed: { '@type': 'Country', name: 'India' },
  knowsAbout: ['Golden Triangle tours', 'Rajasthan tours', 'Kerala backwaters', 'South India tours', 'Wildlife safaris', 'Ladakh tours', 'Buddhist circuit', 'Private tours of India'],
  priceRange: 'From USD 65 per person per day'
});

const website = base => ({
  '@type': 'WebSite', '@id': base + '/#website', url: base + '/', name: NAME, publisher: { '@id': base + '/#organization' },
  potentialAction: { '@type': 'SearchAction', target: base + '/itineraries?q={search_term_string}', 'query-input': 'required name=search_term_string' }
});

const faqPage = faqs => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({ '@type': 'Question', name: plain(f.q), acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } }))
});

const breadcrumbs = (base, crumbs) => crumbs && crumbs.length > 1 ? ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => Object.assign({ '@type': 'ListItem', position: i + 1, name: plain(c.label) }, c.href ? { item: base + c.href } : {}))
}) : null;

// lowest "$NN" in a tour's pricing block
const fromPrice = t => {
  const block = (t.details || []).find(b => /pric|cost/i.test(b.title));
  if (!block) return null;
  let min = Infinity;
  block.items.forEach(it => { const m = it.map(x => x.text).join('').match(/(?:\$|USD)\s*(\d[\d,]*)/); if (m) min = Math.min(min, +m[1].replace(/,/g, '')); });
  return min === Infinity ? null : min;
};

const touristTrip = (base, t) => {
  const stops = String(t.route || '').split(/\s+[-–]\s+/).map(plain).filter((x, i, a) => x && a.indexOf(x) === i);
  const price = fromPrice(t);
  return Object.assign({
    '@type': 'TouristTrip',
    name: plain(t.heading || t.title),
    description: plain(t.description),
    url: base + t.url,
    touristType: 'Overseas travellers',
    provider: { '@id': base + '/#organization' },
    itinerary: { '@type': 'ItemList', numberOfItems: stops.length, itemListElement: stops.map((s, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Place', name: s } })) }
  }, price ? { offers: { '@type': 'Offer', price: price, priceCurrency: 'USD', description: 'Per person per day, from (minimum 2 persons, 3-star hotels)', url: base + t.url } } : {});
};

// Everything for one page, as one @graph
function graph(base, page) {
  const items = [organization(base), website(base)];
  if (page.faqs) items.push(faqPage(page.faqs));
  if (page.trip) items.push(touristTrip(base, page.trip));
  const bc = breadcrumbs(base, page.breadcrumb);
  if (bc) items.push(bc);
  return { '@context': 'https://schema.org', '@graph': items };
}

// All indexable URLs (the home-2 design copy is left out on purpose)
function urls() {
  const list = ['/', '/aboutus', '/contactus', '/testimonials'];
  for (const dir of ['tour-lists', 'tours', 'articles']) {
    fs.readdirSync(path.join(__dirname, dir)).filter(f => f.endsWith('.js')).forEach(f => {
      const u = require('./' + dir + '/' + f).url;
      if (u && !list.includes(u)) list.push(u);
    });
  }
  return list;
}

const sitemap = base => '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls().map(u => `  <url><loc>${base}${encodeURI(u)}</loc><changefreq>${u === '/' ? 'weekly' : 'monthly'}</changefreq><priority>${u === '/' ? '1.0' : '0.7'}</priority></url>`).join('\n') +
  '\n</urlset>\n';

const robots = base => `User-agent: *\nAllow: /\nDisallow: /home-2\nDisallow: /home-3\nDisallow: /home-4\nDisallow: /api/\n\n# AI answer engines are welcome to read and cite this site\nUser-agent: GPTBot\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;

// llms.txt: a short, plain summary that AI assistants can quote accurately
function llms(base) {
  const lists = fs.readdirSync(path.join(__dirname, 'tour-lists')).filter(f => f.endsWith('.js')).map(f => require('./tour-lists/' + f));
  return `# ${NAME}\n\n> Inbound travel agency for overseas visitors to India since 2001. Private tours only (no group sharing), 3–5 star hotels, a dedicated private A/C car and driver from arrival to departure. Tours start from USD 65 per person per day (minimum 2 persons, 3-star hotels); a custom private tour starts at USD 170 per couple per day.\n\n` +
    `- Head office: ${hq.lines.join(' ')}\n- Phone / WhatsApp: ${hq.phones.join(', ')}\n- Email: ${hq.email}\n\n## Key pages\n\n` +
    `- [Home](${base}/): tour categories, popular tours, regions, travel guide, FAQs\n- [All tour packages](${base}/itineraries)\n- [About us](${base}/aboutus)\n- [Guest testimonials](${base}/testimonials)\n- [Contact and enquiry](${base}/contactus)\n- [Traveller's guide](${base}/travelers_guide)\n\n## Tour categories\n\n` +
    lists.map(l => `- [${plain(l.heading || l.title)}](${base}${l.url})`).join('\n') +
    `\n\n## Frequently asked questions\n\n` + home.faqs.map(f => `### ${plain(f.q)}\n${plain(f.a)}`).join('\n\n') + '\n';
}

module.exports = { graph, sitemap, robots, llms, NAME };
