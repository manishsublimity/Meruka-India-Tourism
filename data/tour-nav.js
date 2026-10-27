// Site-wide tour navigation, as on the original site (india-tourism.net): every inner page lets the visitor reach
// every tour category — the sidebar "India Tour Packages" list there, in seven groups — plus the four regions and
// the travel guide. Groups and names are the original's, word for word; links go to the local pages.
const fs = require('fs');
const path = require('path');
const site = require('./site');

const GROUPS = [
  ['Rajasthan Tours', [['Indian Golden Triangle Tours', 'india-golden-triangle-tour.html'], ['Exotic Rajasthan Tours', 'rajasthan-tours.html'], ['Rajasthan Village Tours', 'rajasthan-villages-travel-tours.html'], ['Rajasthan North India Tours', 'rajasthan_north_india_tours.html'], ['Rajasthan Kerala Tours', 'rajasthan_kerala_tours.html'], ['Rajasthan South India Tours', 'rajasthan_south_india_tours.html']]],
  ['North India Tours', [['Himachal Nature Tours', 'rajasthan_himachal_tours_packages.html'], ['Leh and Ladakh Tours', 'leh_ladakh_tours.html'], ['Uttaranchal Tours', 'uttarakhand_wildlife_pilgrimage_tours.html'], ['North India Kerala Tours', 'northindia_rajasthan_kerala_tours.html'], ['North India-Nepal Tours', 'north_india_nepal_tours.html']]],
  ['East India Tours', [['Sikkim India Tours', 'sikkimtours.html'], ['Exotic Sun Temple Tours', 'konark-suntemple_tours.html'], ['Seven Sisters India Tours', 'seven-sisters-india-tours.html'], ['Konark West Bengal Tours', 'orissa_westbengal_sikkim_tours.html']]],
  ['Grand India Tours', [['Incredible India Tours', 'incredible_india_tours.html'], ['South North India Tours', 'south_north_india_tours.html'], ['North and West India Tours', 'north_west_india_tours.html']]],
  ['West India Tours', [['Maharashtra Tours', 'maharashtra_tours.html'], ['Gujarat India Tours', 'gujarat_tours.html'], ['Best of West India Tours', 'maharashtra_gujarat_tours.html']]],
  ['South India-Kerala Tours', [['Kerala Backwaters Tours', 'southindia_kerala_tours.html'], ['Kerala Karnataka Tours', 'kerala_karnataka_tour.html'], ['Karnataka Tours', 'karnataka_tours.html'], ['Tamil Nadu Tours', 'tamilnadu-tours.html'], ['South India Tours', 'south_india_tour.html']]],
  ['Special Interest Tours', [['Yoga and Ayurveda Tours', 'yoga_ayurveda_tours.html'], ['India Wildlife Tours', 'wildlife_tour.html'], ['Buddhist Circuit Tours', 'buddhist_pilgrimage_tour.html'], ['India Island and Beaches Tours', 'island_beaches_tour.html'], ['India Fair and Festival Tours', 'india_fair_festival_travelplan.html']]]
].map(([title, cats]) => ({ title, cats: cats.map(([name, file]) => ({ name, href: site.link(file) })) }));

// the tours of each category page (from data/tour-lists), in the order the category page lists them
const LISTS = {};
for (const f of fs.readdirSync(path.join(__dirname, 'tour-lists')).filter(f => f.endsWith('.js'))) {
  const l = require('./tour-lists/' + f);
  const seen = new Set();
  LISTS[l.url.toLowerCase()] = { title: l.heading, url: l.url, hero: l.heroSrc || '', tours: (l.groups || []).flatMap(g => g.tours || []).filter(t => t.href && !seen.has(t.href.toLowerCase()) && seen.add(t.href.toLowerCase())) };
}
const tourPages = new Set(fs.readdirSync(path.join(__dirname, 'tours')).filter(f => f.endsWith('.js')).map(f => require('./tours/' + f).url.toLowerCase()));

// The category a tour page belongs to (its breadcrumb's list page), with the tours before and after it.
// Only tours that have a page here are offered.
function inCategory(tourUrl, listUrl) {
  const l = LISTS[String(listUrl || '').toLowerCase()];
  if (!l) return null;
  const tours = l.tours.filter(t => tourPages.has(String(t.href).toLowerCase()));
  const i = tours.findIndex(t => t.href.toLowerCase() === String(tourUrl).toLowerCase());
  return { title: l.title, url: l.url, hero: l.hero, tours, index: i, prev: i > 0 ? tours[i - 1] : null, next: i >= 0 && i < tours.length - 1 ? tours[i + 1] : null };
}

module.exports = { groups: GROUPS, inCategory };
