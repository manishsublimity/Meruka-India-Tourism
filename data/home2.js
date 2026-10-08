// Extra data for the home-2 page (Anshuman's structure brief): tour categories, popular tours,
// "by number of days" and "by interest" links. Everything is read from the imported pages.
const fs = require('fs');
const path = require('path');
const { photoFor } = require('./photos');

const read = dir => fs.readdirSync(path.join(__dirname, dir)).filter(f => f.endsWith('.js')).map(f => require('./' + dir + '/' + f));
const tours = {};
read('tours').forEach(t => { tours[t.url.toLowerCase()] = t; });
const lists = {};
read('tour-lists').forEach(l => { lists[l.url] = l; });

// lowest "$NN" in a tour's pricing block, e.g. "3-Star: $85 - $100 per person per day" → 85
const fromPrice = t => {
  const block = t && t.details.find(b => /pric|cost/i.test(b.title));
  if (!block) return null;
  let min = Infinity;
  block.items.forEach(it => {
    const text = it.map(x => x.text).join('');
    const m = text.match(/(?:\$|USD)\s*(\d[\d,]*)/);
    if (m) min = Math.min(min, +m[1].replace(/,/g, ''));
  });
  return min === Infinity ? null : min;
};
const nights = s => { const m = String(s || '').match(/(\d+)\s*Nights?/i); return m ? +m[1] : null; };
const listTours = l => l.groups.flatMap(g => g.tours);

// photos chosen by hand where the keyword match isn't the best fit
const CAT_IMG = { '/wildlife_tour': '/photos/tiger-pair.webp', '/india_fair_festival_travelplan': '/photos/holi-festival.jpg', '/island_beaches_tour': '/photos/goa-beach-loungers.jpg', '/buddhist_pilgirmage_tour': '/photos/varanasi-ghats.jpg', '/leh_ladakh_tours': '/photos/ladakh-nubra.avif', '/konark-suntemple_tours': '/photos/madurai.webp', '/rajasthan-tours': '/photos/jaipur-hawa-mahal.webp' };
const TOUR_IMG = { 'Heart of Himalayas Tour': '/photos/ladakh.jpg', 'North India Rajasthan Wildlife Tour': '/photos/bengal-tiger.jpg', 'Exotic Rajasthan Fair and Festival Tour': '/photos/pushkar-fair.jpg', 'Kerala Ayurveda & Backwaters Tour': '/photos/yoga-ayurveda.jpg', 'Golden Traingle & Scenic Kerala Tours': '/photos/kerala-houseboat.webp', 'Golden Triangle Tour': '/photos/taj-mahal-feature.webp' };

// 1) Tour categories (the tour-list pages), most useful first
const CATS = [
  ['/india-golden-triangle-tour', 'Golden Triangle', 'Delhi, Agra and Jaipur — the classic first journey'],
  ['/rajasthan-tours', 'Rajasthan Heritage', 'Forts, palaces and the Thar Desert'],
  ['/southindia_kerala_tours', 'Kerala Backwaters', 'Houseboats, hills and beaches'],
  ['/south_india_tour', 'South India', 'Temple towns, spice hills and the coast'],
  ['/south_north_india_tours', 'North & South India', 'Two Indias in one journey'],
  ['/wildlife_tour', 'Wildlife', 'Tigers, rhinos and national parks'],
  ['/india_fair_festival_travelplan', 'Fairs & Festivals', 'Pushkar, Diwali, Holi and more'],
  ['/leh_ladakh_tours', 'Leh & Ladakh', 'High passes and Himalayan monasteries'],
  ['/yoga_ayurveda_tours', 'Yoga & Ayurveda', 'Wellness retreats in Kerala'],
  ['/buddhist_pilgirmage_tour', 'Buddhist Circuit', 'Bodhgaya, Sarnath and Kushinagar'],
  ['/konark-suntemple_tours', 'India Temple Tours', 'Sun temples and sacred sites'],
  ['/seven-sisters-india-tours', 'North East India', 'The Seven Sisters and Kaziranga'],
  ['/island_beaches_tour', 'Beaches & Islands', 'Lakshadweep, the Andamans and Kerala']
];
const categories = CATS.filter(([url]) => lists[url]).map(([url, title, line]) => {
  const all = listTours(lists[url]);
  const ns = all.map(t => nights(t.duration)).filter(Boolean);
  const prices = all.map(t => fromPrice(tours[(t.href || '').toLowerCase()])).filter(Boolean);
  return {
    url, title, line,
    count: all.length,
    first: all[0] ? { name: all[0].name, duration: all[0].duration, href: all[0].href } : null,
    top: all.slice(0, 3).map(t => ({ name: t.name, duration: t.duration, href: t.href })),
    nights: ns.length ? [Math.min(...ns), Math.max(...ns)] : null,
    from: prices.length ? Math.min(...prices) : null,
    img: CAT_IMG[url] || photoFor([lists[url].heading, url])
  };
});

// 2) Most popular tours: the first tour of the main categories
const POPULAR_FROM = ['/india-golden-triangle-tour', '/rajasthan-tours', '/southindia_kerala_tours', '/south_india_tour',
  '/leh_ladakh_tours', '/wildlife_tour', '/yoga_ayurveda_tours', '/india_fair_festival_travelplan', '/north_west_india_tours', '/rajasthan_kerala_tours'];
const popular = POPULAR_FROM.filter(u => lists[u]).map(u => {
  const t = listTours(lists[u])[0];
  const detail = tours[(t.href || '').toLowerCase()];
  return {
    name: t.name, href: t.href, route: t.route, duration: t.duration,
    category: lists[u].heading, categoryHref: u,
    tag: (CATS.find(c => c[0] === u) || [])[1] || lists[u].heading,
    line: (CATS.find(c => c[0] === u) || [])[2] || '',
    from: fromPrice(detail),
    img: TOUR_IMG[t.name] || photoFor([t.name, t.route], t.name)
  };
});

// Tour packages by number of days (links to the full list, filtered)
const byDays = [['Up to 7 nights', '0-7'], ['8 – 10 nights', '8-10'], ['11 – 14 nights', '11-14'], ['15 – 20 nights', '15-20'], ['21 nights +', '21-99']]
  .map(([label, range]) => ({ label, href: '/itineraries?nights=' + range, count: listTours(lists['/itineraries']).filter(t => { const n = nights(t.duration), [a, b] = range.split('-').map(Number); return n !== null && n >= a && n <= b; }).length }));

// Tour packages by sector, and by special interest
const bySector = ['/india-golden-triangle-tour', '/rajasthan-tours', '/south_north_india_tours', '/rajasthan_north_india_tours', '/north_west_india_tours',
  '/rajasthan_kerala_tours', '/south_india_tour', '/konark-suntemple_tours', '/maharashtra_tours', '/seven-sisters-india-tours']
  .filter(u => lists[u]).map(u => ({ label: lists[u].heading, href: u, count: listTours(lists[u]).length }));
const byInterest = [['Wildlife', '/wildlife_tour'], ['Spiritual', '/buddhist_pilgirmage_tour'], ['Adventure', '/leh_ladakh_tours'], ['Heritage', '/rajasthan-tours'],
  ['Wellness', '/yoga_ayurveda_tours'], ['Beaches', '/island_beaches_tour'], ['Villages', '/rajasthan-villages-travel-tours'], ['Festivals', '/india_fair_festival_travelplan']]
  .filter(([, u]) => lists[u]).map(([label, href]) => ({ label, href }));

// Social media: add the profile URLs here; an icon only becomes a link once its URL is filled in
const social = [
  { name: 'Facebook', href: '' },
  { name: 'Instagram', href: '' },
  { name: 'YouTube', href: '' },
  { name: 'X', href: '' },
  { name: 'LinkedIn', href: '' }
];

// Four regions: each city name on the picture links to its own page (or its state page where the
// original site has no separate city page)
const regions = [
  { name: 'North India', href: '/north_india_tour', img: '/assets/taj-aerial.jpg', kicker: 'Mughals, forts & the Ganges',
    cities: [['Jaipur', '/rajasthan_jaipur'], ['Agra', '/Uttar-Pradesh'], ['Delhi', '/delhi'], ['Jaisalmer', '/rajasthan_jaisalmer'], ['Udaipur', '/rajasthan_udaipur'], ['Varanasi', '/Uttar-Pradesh']] },
  { name: 'South India', href: '/south_india_tours_tourism', img: '/assets/kovalam.jpg', kicker: 'Backwaters, temples & tea',
    cities: [['Kochi', '/Kerala'], ['Munnar', '/Kerala'], ['Alleppey', '/Kerala'], ['Kovalam', '/Kerala'], ['Madurai', '/Tamil-Nadu'], ['Mysore', '/Karnataka'], ['Hampi', '/Karnataka']] },
  { name: 'West India', href: '/west_india_tour_tourism', img: '/assets/gadisar-lake.webp', kicker: 'Desert, caves & salt flats',
    cities: [['Kutch', '/Gujarat'], ['Ajanta & Ellora', '/Maharashtra'], ['Mumbai', '/Maharashtra'], ['Goa', '/Goa'], ['Khajuraho', '/khajuraho_city_tour_travel']] },
  { name: 'East India', href: '/east_india_tour_tourism', img: '/images/east-india.jpg', kicker: 'Tribes, tigers & the hills',
    cities: [['Kolkata', '/West-Bengal'], ['Puri', '/Orissa'], ['Sikkim', '/Sikkim'], ['Darjeeling', '/West-Bengal'], ['Assam', '/Assam']] }
];
const guideImgs = ['/photos/hawa-mahal-dusk.jpg', '/photos/varanasi-ghats.jpg', '/photos/jaisalmer-fort-night.jpg'];

module.exports = { regions, guideImgs, categories, popular, byDays, bySector, byInterest, social, totalTours: listTours(lists['/itineraries']).length };

// Tour finder (Most Popular Tours section): India Tours → tour category → its packages
const { photoForCard } = require('./photos');
module.exports.finder = lists['/itineraries'].groups.filter(g => g.title).map(g => ({
  title: g.title,
  href: g.href || '/itineraries',
  tours: g.tours.map(t => ({
    name: t.name, href: t.href || '', route: t.route || '', duration: t.duration || '',
    from: fromPrice(tours[(t.href || '').toLowerCase()]),
    img: t.img || TOUR_IMG[t.name] || photoForCard(t.name, t.route, g.title)
  }))
}));
