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
const CAT_IMG = { '/wildlife_tour': '/photos/tiger-pair.webp', '/india_fair_festival_travelplan': '/photos/holi-festival.webp', '/island_beaches_tour': '/photos/goa-beach-loungers.webp', '/buddhist_pilgrimage_tour': '/photos/varanasi-ghats.webp', '/leh_ladakh_tours': '/photos/ladakh-nubra.webp', '/konark-suntemple_tours': '/photos/madurai.webp', '/rajasthan-tours': '/photos/jaipur-hawa-mahal.webp' };
const TOUR_IMG = { 'Heart of Himalayas Tour': '/photos/ladakh.webp', 'North India Rajasthan Wildlife Tour': '/photos/bengal-tiger.webp', 'Exotic Rajasthan Fair and Festival Tour': '/photos/pushkar-fair.webp', 'Kerala Ayurveda & Backwaters Tour': '/photos/yoga-ayurveda.webp', 'Golden Traingle & Scenic Kerala Tours': '/photos/kerala-houseboat.webp', 'Golden Triangle Tour': '/photos/taj-mahal-feature.webp' };

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
  ['/buddhist_pilgrimage_tour', 'Buddhist Circuit', 'Bodhgaya, Sarnath and Kushinagar'],
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
const byInterest = [['Wildlife', '/wildlife_tour'], ['Spiritual', '/buddhist_pilgrimage_tour'], ['Adventure', '/leh_ladakh_tours'], ['Heritage', '/rajasthan-tours'],
  ['Wellness', '/yoga_ayurveda_tours'], ['Beaches', '/island_beaches_tour'], ['Villages', '/rajasthan-villages-travel-tours'], ['Festivals', '/india_fair_festival_travelplan']]
  .filter(([, u]) => lists[u]).map(([label, href]) => ({ label, href }));

// Social media: add the profile URLs here; an icon only becomes a link once its URL is filled in
const social = [
  { name: 'Facebook', href: '' },
  { name: 'Instagram', href: '' },
  { name: 'YouTube', href: '' },
  { name: 'X', href: '' }
];

// Four regions: each city name on the picture links to its own page (or its state page where the
// original site has no separate city page)
const regions = [
  { name: 'North India', href: '/north_india_tour', img: '/assets/taj-aerial.webp', kicker: 'Mughals, forts & the Ganges',
    cities: [['Jaipur', '/rajasthan_jaipur'], ['Agra', '/Uttar-Pradesh'], ['Delhi', '/delhi'], ['Jaisalmer', '/rajasthan_jaisalmer'], ['Udaipur', '/rajasthan_udaipur'], ['Varanasi', '/Uttar-Pradesh']] },
  { name: 'South India', href: '/south_india_tours_tourism', img: '/assets/kovalam.webp', kicker: 'Backwaters, temples & tea',
    cities: [['Kochi', '/Kerala'], ['Munnar', '/Kerala'], ['Alleppey', '/Kerala'], ['Kovalam', '/Kerala'], ['Madurai', '/Tamil-Nadu'], ['Mysore', '/Karnataka'], ['Hampi', '/Karnataka']] },
  { name: 'West India', href: '/west_india_tour_tourism', img: '/assets/gadisar-lake.webp', kicker: 'Desert, caves & salt flats',
    cities: [['Kutch', '/Gujarat'], ['Ajanta & Ellora', '/Maharashtra'], ['Mumbai', '/Maharashtra'], ['Goa', '/Goa'], ['Khajuraho', '/khajuraho_city_tour_travel']] },
  { name: 'East India', href: '/east_india_tour_tourism', img: '/images/east-india.webp', kicker: 'Tribes, tigers & the hills',
    cities: [['Kolkata', '/West-Bengal'], ['Puri', '/Orissa'], ['Sikkim', '/Sikkim'], ['Darjeeling', '/West-Bengal'], ['Assam', '/Assam']] }
];
const guideImgs = ['/photos/hawa-mahal-dusk.webp', '/photos/varanasi-ghats.webp', '/photos/jaisalmer-fort-night.webp'];

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

// Tour-list pages (12 Oct 2026 layout): each group as a card with a photo, a line, the lowest
// "starts from" price and the tags the page's filters use (price, region, interest, nights).
const REGION_RE = {
  north: /delhi|agra|jaipur|rajasthan|himachal|shimla|manali|ladakh|\bleh\b|uttar|varanasi|golden triangle|kashmir|punjab|amritsar|nepal|haridwar|rishikesh|nainital|corbett|khajuraho|jodhpur|udaipur|jaisalmer|bikaner|pushkar|ranthamb/i,
  south: /kerala|karnataka|tamil|south india|mysore|chennai|madras|cochin|kochi|madurai|hyderabad|telangana|andhra|bangalore|bengaluru|munnar|alleppey|kovalam|hampi|ooty|pondicherry|lakshadweep|andaman/i,
  east: /kolkata|calcutta|orissa|odisha|konark|puri|bhubaneswar|sikkim|darjeeling|gangtok|bengal|assam|seven sisters|north east|meghalaya|arunachal|nagaland|manipur|kaziranga|bodhgaya|bodh gaya|bihar|sunderban/i,
  west: /mumbai|bombay|maharashtra|gujarat|ajanta|ellora|ahmedabad|kutch|\bgoa\b|aurangabad|sasan gir|\bgir\b|dwarka/i
};
const INTEREST_RE = {
  Heritage: /fort|palace|heritage|rajasthan|golden triangle|mughal|medieval|historic|ajanta|ellora|hampi|khajuraho/i,
  Wildlife: /wildlife|widllife|tiger|safari|ranthamb|corbett|kanha|bandhavgarh|kaziranga|\bgir\b|national park|sariska|periyar|nagarhole/i,
  Religious: /temple|pilgrim|pilgirm|buddh|religious|spiritual|haridwar|rishikesh|varanasi|bodhgaya|sacred|devotional|amritsar/i,
  Beaches: /beach|island|\bgoa\b|andaman|lakshadweep|kovalam|backwater/i,
  Wellness: /yoga|ayurveda|ayurved|wellness|meditation/i,
  Festivals: /fair|festival|holi|diwali|pushkar|dussehra|onam|pongal/i,
  Adventure: /ladakh|\bleh\b|himalaya|trek|adventure|sikkim|darjeeling|manali/i,
  Villages: /village|tribal|rural/i
};
const tagsOf = (text, re) => Object.keys(re).filter(k => re[k].test(text));
// a line for the groups that have no home-page category line
const GROUP_LINE = {
  'Rajasthan Village Tours': 'Village life, crafts and desert camps of Rajasthan',
  'Rajasthan - North India Tours': 'Rajasthan’s forts with Agra, Delhi and Varanasi',
  'Rajasthan - Kerala Tours': 'Desert palaces in the north, backwaters in the south',
  'Rajasthan South India Tours': 'Rajasthan’s royal cities and South India’s temples',
  'North India - Rajasthan and Himachal Tours': 'Rajasthan’s forts and the hill towns of Himachal',
  'Uttarakhand Tours': 'Himalayan hill stations, holy towns and Corbett',
  'North India-Kerala Tours': 'The Golden Triangle with Kerala’s backwaters',
  'North India - Nepal Tours': 'Northern India with Kathmandu and the Himalaya',
  'Sikkim India Tours': 'Monasteries, tea gardens and Himalayan views',
  'Konark, West Bengal and Sikkim Tours': 'The Sun Temple, Kolkata and the eastern hills',
  'Incredible India Tours': 'Long journeys across many regions of India',
  'North and West India Tours': 'Rajasthan and Gujarat with Mumbai and the caves',
  'Maharashtra Tours': 'Mumbai with the Ajanta and Ellora caves',
  'Gujarat India Tours': 'The Rann of Kutch, Gir lions and old step-wells',
  'Best of West India Tours': 'Mumbai, Gujarat and the western coast',
  'Karnataka & Kerala Tours': 'Mysore, Hampi and Kerala’s backwaters',
  'Karnataka Tours': 'Hampi, Mysore and the Western Ghats',
  'Tamil Nadu Tours': 'Temple towns, Chettinad and the coast'
};
// a complete description per category (three to four lines on the tour-list cards)
const GROUP_DESC = {
  'Indian Golden Triangle Tours': 'Delhi, Agra and Jaipur — India’s classic first journey. See the Taj Mahal at sunrise, the Mughal forts of Agra and Delhi, and the palaces and bazaars of Jaipur, the Pink City.',
  'Exotic Rajasthan Tours': 'Forts, palaces, desert camps and lake cities across Rajasthan, the land of kings. Ride camels in the Thar, stay in heritage hotels and see Jaipur, Jodhpur, Jaisalmer and Udaipur.',
  'Rajasthan Village Tours': 'The true colours of rural Rajasthan, away from the crowds. Stay in village homes and desert camps, meet local craftsmen and see the daily life that has changed little in centuries.',
  'Rajasthan - North India Tours': 'Rajasthan’s royal cities joined with the best of North India — the Taj Mahal, Delhi’s monuments and the sacred ghats of Varanasi on the River Ganges.',
  'Rajasthan - Kerala Tours': 'Two very different Indias in one trip: the desert palaces and forts of Rajasthan in the north, then the calm backwaters, tea hills and beaches of Kerala in the south.',
  'Rajasthan South India Tours': 'Rajasthan’s forts and palaces paired with South India’s great temple towns, spice hills and green coast — the royal north and the ancient south together.',
  'North India - Rajasthan and Himachal Tours': 'Rajasthan’s heritage cities with the cool hill towns and mountain valleys of Himachal Pradesh, such as Shimla and Manali, on the way to the Himalaya.',
  'Leh and Ladakh Tours': 'High mountain passes, old Buddhist monasteries and blue lakes in Ladakh, North India’s land of adventure. Best from June to September, when the roads are open.',
  'Uttarakhand Tours': 'Snow-capped Himalayan views, quiet hill stations, the holy river towns of Haridwar and Rishikesh, and tigers in Corbett National Park, all in Uttarakhand.',
  'North India-Kerala Tours': 'The forts, palaces and the Taj Mahal of North India, followed by Kerala’s houseboats, tea gardens and beaches — the best of the north and the south in one journey.',
  'North India - Nepal Tours': 'North India’s great sights with a crossing into Nepal: the temples and old squares of Kathmandu and wide views of the Himalaya.',
  'Sikkim India Tours': 'Sikkim, a small Himalayan paradise in the northeast. Visit Buddhist monasteries, tea gardens and mountain villages, with views of Kanchenjunga, the world’s third-highest peak.',
  'Exotic Sun Temple Tours': 'The Sun Temple at Konark, the temples of Puri and Bhubaneswar, and the crafts, villages and living culture of Odisha on India’s eastern coast.',
  'Seven Sisters India Tours': 'Northeast India, the “paradise unexplored” — green mountains, tribal cultures and festivals, tea gardens and the one-horned rhinos of Kaziranga National Park.',
  'Konark, West Bengal and Sikkim Tours': 'The Sun Temple of Konark, the colonial city of Kolkata and the Himalayan hills of Sikkim and Darjeeling — the treasures of East India in one trip.',
  'Incredible India Tours': 'Long journeys across many regions of India — a continent of its own. From the Himalaya and the deserts of Rajasthan to the temples and backwaters of the south.',
  'South - North India Tours': 'The forts and monuments of North India with the temples, spice hills and backwaters of the south — see the glorious contrast of two Indias in one journey.',
  'North and West India Tours': 'Rajasthan’s heritage cities with Gujarat’s temples and step-wells, the city of Mumbai and the rock-cut caves of Ajanta and Ellora in Maharashtra.',
  'Maharashtra Tours': 'Mumbai, the Ajanta and Ellora caves, old hill forts and the long Arabian Sea coast of Maharashtra — a state of 550 forts and a rich history.',
  'Gujarat India Tours': 'Gujarat’s carved temples and step-wells, the white salt desert of the Rann of Kutch, colourful craft villages and the Asiatic lions of Gir National Park.',
  'Best of West India Tours': 'The best of Gujarat and Maharashtra — heritage cities, cave temples, wildlife, craft villages and the beaches of the western coast.',
  'Kerala Backwaters Tours': 'Kerala, between the Arabian Sea and the Western Ghats — houseboats on quiet backwaters, tea and spice hills, Ayurveda and palm-lined beaches.',
  'Karnataka & Kerala Tours': 'Two jewels of South India: Mysore’s palaces, the ruins of Hampi and Karnataka’s coffee hills, then Kerala’s backwaters, tea gardens and beaches.',
  'Karnataka Tours': 'The ruins of Hampi, the palaces of Mysore, carved temples at Belur and Halebid, coffee hills of Coorg and a coastline of 350 km in Karnataka.',
  'Tamil Nadu Tours': 'Great temple towns such as Madurai and Thanjavur, the Chettinad mansions, the shore temples of Mahabalipuram and the hill stations of Tamil Nadu.',
  'South India Tours': 'A land of many dynasties — temples, palaces, spice hills, backwaters and beaches across Tamil Nadu, Kerala and Karnataka, each with its own culture.',
  'Yoga and Ayurveda Tours': 'Yoga, meditation and Ayurveda treatments in peaceful retreats, mostly in Kerala, with time to rest and enjoy the simple joy of being close to nature.',
  'India Wildlife Tours': 'Tiger reserves and national parks across India — from the Himalayan foothills and the grasslands of the north to the dense forests of central India.',
  'Buddhist Circuit Tours': 'Follow the path of the Buddha to Bodhgaya, Sarnath, Kushinagar and Lumbini in Nepal — the places where he was born, found enlightenment and taught.',
  'India Island and Beaches Tours': 'Quiet islands and beaches — the Andamans, Lakshadweep and the Kerala coast — for calm, clear water and rest, a rare peace away from busy India.',
  'India Fair and Festival Tours': 'India’s colourful fairs and festivals all through the year — Pushkar, Holi, Diwali and many more — with tours planned around the festival dates.'
};
const { photoCandidates } = require('./photos');
// hand-picked where the keyword match is weak
const GROUP_IMG = {
  'Indian Golden Triangle Tours': '/photos/taj-mahal-wide.webp',
  'Tamil Nadu Tours': '/photos/brihadeshwara-temple.webp',
  'Incredible India Tours': '/photos/india-main.webp'
};
module.exports.listingFor = list => {
  const cat = url => CATS.find(c => c[0] === url);
  const used = new Set();
  // one picture per card on the page: the category's own photo first, then any photo its words point to
  const pick = (first, text) => { const c = [first].concat(photoCandidates(text)).filter(Boolean).find(x => !used.has(x)); if (c) used.add(c); return c || first; };
  // a list page with no tours of its own (Gujarat) shows its category from the full India Tours list
  const own = list.groups.length ? list.groups : lists['/itineraries'].groups.filter(g => g.href === list.url);
  return own.map(g => {
    const href = g.href || list.url;
    const rows = g.tours.map(t => {
      const n = nights(t.duration), perDay = fromPrice(tours[(t.href || '').toLowerCase()]);
      const text = [g.title, list.heading, t.name, t.route].join(' ');
      return {
        name: t.name, href: t.href || '', route: t.route || '', duration: t.duration || '', nights: n,
        price: perDay && n ? perDay * n : null,
        regions: tagsOf(text, REGION_RE), interests: tagsOf(text, INTEREST_RE),
        img: t.img || TOUR_IMG[t.name] || photoForCard(t.name, t.route, g.title || list.heading)
      };
    });
    const prices = rows.map(r => r.price).filter(Boolean), ns = rows.map(r => r.nights).filter(Boolean);
    const c = cat(href);
    const target = lists[href] && lists[href] !== list ? lists[href] : null;
    return {
      title: g.title || list.heading, href: target ? href : '',
      line: c ? c[2] : (GROUP_LINE[g.title] || ''),
      desc: GROUP_DESC[g.title || list.heading] || GROUP_DESC[(lists['/itineraries'].groups.find(x => x.href === href) || {}).title] || '',
      img: pick(GROUP_IMG[g.title] || CAT_IMG[href] || (c && categories.find(x => x.url === href) || {}).img, [g.title || list.heading].concat(g.tours.map(t => t.name + ' ' + t.route)).join(' | ')),
      from: prices.length ? Math.min(...prices) : null,
      nights: ns.length ? [Math.min(...ns), Math.max(...ns)] : null,
      rows
    };
  });
};
