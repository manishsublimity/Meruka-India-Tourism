// Home page content — taken from "Meruka India Home.html"
const { link } = require('./site');
const A = f => '/assets/' + f;

// Where each Home link goes, keyed by the link's text: an india-tourism.net page
// (local when it is built here, via link()) or a section of this page ('#...').
const TARGETS = {
  // Tour Packages menu
  'Golden Triangle tours': 'india-golden-triangle-tour.html', 'Exotic Rajasthan tours': 'rajasthan-tours.html',
  'Rajasthan & North India': 'rajasthan_north_india_tours.html', 'Kerala backwaters': 'southindia_kerala_tours.html',
  'South & North India': 'south_north_india_tours.html', 'Incredible India': 'incredible_india_tours.html',
  'North India tours': 'north_india_tour.html', 'South India tours': 'south_india_tour.html',
  'East India tours': 'east_india_tour_tourism.html', 'West India tours': 'west_india_tour_tourism.html',
  'Grand India tours': 'incredible_india_tours.html', 'Leh & Ladakh': 'leh_ladakh_tours.html',
  'Religious & pilgrimage': 'golden_triangle_temple_packages.html', 'Yoga & Ayurveda': 'yoga_ayurveda_tours.html',
  'Wildlife tours': 'wildlife_tour.html', 'Buddhist circuit': 'buddhist_pilgrimage_tour.html',
  'Fairs & festivals': 'india_fair_festival_travelplan.html', 'Village tours': 'rajasthan-villages-travel-tours.html',
  // Destinations menu, region cards and footer: each place goes to its own guide page (the state guide
  // when the place has no page of its own — Agra and Varanasi are in the Uttar Pradesh guide, and so on)
  'North India': 'north_india_tour.html', 'Delhi': 'delhi.htm', 'Agra': 'Uttar-Pradesh.htm',
  'Rajasthan': 'rajasthan.htm', 'Jaisalmer': 'rajasthan_jaisalmer.htm', 'Varanasi': 'Uttar-Pradesh.htm', 'Kashmir': 'Jammu-Kashmir.htm',
  'Himachal': 'Himachal-Pradesh.htm',
  'South India': 'south_india_tours_tourism.html', 'Kerala': 'Kerala.htm', 'Tamil Nadu': 'Tamil-Nadu.htm',
  'Karnataka': 'Karnataka.htm', 'Hampi': 'Karnataka.htm', 'Goa': 'Goa.htm',
  'West India': 'west_india_tour_tourism.html', 'Mumbai': 'Maharashtra.htm', 'Gujarat': 'Gujarat.htm',
  'Ajanta & Ellora': 'Maharashtra.htm', 'Rann of Kutch': 'gujarat-rannofkutchtours.html',
  'East India': 'east_india_tour_tourism.html', 'Kolkata': 'West-Bengal.htm', 'Odisha': 'Orissa.htm',
  'Sikkim & Darjeeling': 'Sikkim.htm', 'Seven Sisters': 'seven-sisters-india-tours.html', 'Sundarbans': 'West-Bengal.htm',
  // Travel guide cards
  'Weather & best season': 'weather.htm', 'Fairs and festivals': 'Fairs-Festivals.htm', 'Cuisine': 'cuisine.htm',
  'Shopping': 'shopping.htm', 'Traditions and customs': 'traditions_and_customs.htm', 'History & geography': 'history.htm',
  'Pilgrimage tourism': 'pilgrimage.htm', 'Wildlife tourism': 'wildlife.htm',
  'Beaches & hill stations': 'beaches.htm', 'Tribal & village India': 'rajasthan-villages-travel-tours.html',
  'Visa information': 'visa_information.htm', 'Indian embassies': 'indian_embassies.htm',
  'Health & safety': 'travelers-guidlines-information.htm', 'Money and tipping': 'travelers_guide.htm',
  'Maps & phone codes': 'maps.htm', 'Booking & cancellation': '#faq',
  // the Travel Guide links as the client named them (7 Oct 2026)
  'Weather & Best Season': 'weather.htm', 'Cuisine & Food': 'cuisine.htm', 'Fair & Festivals': 'Fairs-Festivals.htm',
  'Traditions and Customs': 'traditions_and_customs.htm', 'History & Geography': 'history.htm',
  'Yoga Tourism': 'yoga.htm', 'Ayurveda Tourism': 'ayurveda.htm', 'Pilgrimage Tourism': 'pilgrimage.htm', 'Wildlife Tourism': 'wildlife.htm',
  'Buddhist Circuits Tourism': 'buddha.htm', 'Beaches Tourism': 'beaches.htm', 'Tribal & Rural Tourism': 'rajasthan-villages-travel-tours.html',
  'Visa Information': 'visa_information.htm', 'Indian Embassies': 'indian_embassies.htm', 'Health & Safety': 'travelers-guidlines-information.htm',
  'Money and Tipping': 'travelers_guide.htm', 'Maps & Phone codes': 'maps.htm', 'Booking & Cancellation': '#faq',
  'India Tour Itineraries': 'itineraries.htm',
  // the travel guide links exactly as on the original site (client, 18 Oct 2026)
  'Geography': 'geography.htm', 'History': 'history.htm', 'Weather': 'weather.htm', 'Communication': 'communication.htm',
  'Music And Dance': 'music-dance.htm', 'Traditions And Customs': 'traditions_and_customs.htm', 'Art': 'art.htm',
  'Buddha Tourism': 'buddha.htm', 'Hill Stations Tourism': 'Hillstations.htm', 'Adventure Tourism': 'Adventures.htm',
  'Fairs And Festivals': 'Fairs-Festivals.htm', 'Phone Codes': 'phone_codes.htm', 'Maps': 'maps.htm',
  "Traveler's Guide": 'travelers_guide.htm', 'Other Guidelines': 'travelers-guidlines-information.htm',
  // footer (18 Oct 2026)
  'India Tourism': 'index.htm', 'South India Tours': 'south_india_tour.html', 'North India Tours': '/north_india_tour', 'Sitemap': '/sitemap',
  // Footer
  'Golden Triangle': 'india-golden-triangle-tour.html', 'Exotic Rajasthan': 'rajasthan-tours.html',
  'Rajasthan North India': 'rajasthan_north_india_tours.html', 'Group tours (7+)': '/plan-my-trip', 'All Tours': '/itineraries',
  'Best time to visit': 'weather.htm', 'Wildlife & parks': 'wildlife.htm', "Traveller's guide": 'travelers_guide.htm',
  'Why Meruka India': 'aboutus.htm', 'How we work': '#process', 'Guest reviews': '#reviews', 'FAQs': '#faq',
  'Booking policy': '#faq', 'Contact us': 'contactus.htm',
  // Popular searches
  'India tour packages': 'itineraries.htm', 'India travel agency': 'aboutus.htm', 'Indian tour operators': 'aboutus.htm',
  'India holiday packages': 'itineraries.htm', 'Golden Triangle tour': 'india-golden-triangle-tour.html',
  'Rajasthan tour packages': 'rajasthan-tours.html', 'Kerala backwaters tours': 'southindia_kerala_tours.html',
  'Kerala tour operators': 'southindia_kerala_tours.html', 'Private tours India': 'itineraries.htm', 'India tour plan': '/plan-my-trip'
};
// The same text can mean a tour (menus) or a guide topic (travel guide, footer guide column).
const GUIDE = { 'Yoga & Ayurveda': 'yoga.htm', 'Buddhist circuit': 'buddha.htm', 'Fairs & festivals': 'Fairs-Festivals.htm' };
const to = (label, ctx) => {
  const t = (ctx === 'guide' && GUIDE[label]) || TARGETS[label];
  if (!t) return '#top';
  return t.startsWith('#') ? t : link(t);
};

module.exports = {
  to,
  allToursHref: link('itineraries.htm'),
  mostBookedHref: link('golden_triangle_packages.html'),
  // (21 Oct 2026, client: at least 10 foreign languages) shown in the header; the page is translated by Google Translate
  langs: ['English', 'Français', 'Deutsch', 'Español', 'Italiano', 'Nederlands', 'Português', 'Русский', '中文', '日本語', '한국어'],

  pkgMenuCols: [
    { title: 'Most Requested', items: ['Golden Triangle tours', 'Exotic Rajasthan tours', 'Rajasthan & North India', 'Kerala backwaters', 'South & North India', 'Incredible India'] },
    { title: 'By Region', items: ['North India tours', 'South India tours', 'East India tours', 'West India tours', 'Grand India tours', 'Leh & Ladakh'] },
    { title: 'Special Interest', items: ['Religious & pilgrimage', 'Yoga & Ayurveda', 'Wildlife tours', 'Buddhist circuit', 'Fairs & festivals', 'Village tours'] }
  ],
  destMenuCols: [
    { title: 'North India', items: ['Delhi', 'Agra', 'Rajasthan', 'Varanasi', 'Kashmir', 'Himachal'] },
    { title: 'South India', items: ['Kerala', 'Tamil Nadu', 'Karnataka', 'Hampi', 'Goa'] },
    { title: 'West India', items: ['Mumbai', 'Gujarat', 'Ajanta & Ellora', 'Rann of Kutch'] },
    { title: 'East India', items: ['Kolkata', 'Odisha', 'Sikkim & Darjeeling', 'Seven Sisters', 'Sundarbans'] }
  ],
  quickSearch: [
    { label: 'Golden Triangle', query: 'golden' },
    { label: 'Rajasthan', query: 'Rajasthan' },
    { label: 'Kerala', query: 'Kerala' },
    { label: 'Varanasi', query: 'Varanasi' }
  ],
  mobileNav: [['Tour Packages', '#packages'], ['Destinations', '#destinations'], ['How We Work', '#process'], ['Travel Guide', '#guide'], ['Why Meruka', '#why'], ['Guest Reviews', '#reviews'], ['FAQs', '#faq'], ['Plan My Trip', '#plan'], ['About Us', '/aboutus'], ['Contact Us', '/contactus']],

  heroSlides: [
    { src: A('taj-reflection.webp'), alt: 'The Taj Mahal mirrored in the garden canal at Agra', label: 'Agra' },
    { src: A('gadisar-lake.webp'), alt: 'Gadisar Lake pavilions at dusk, Jaisalmer', label: 'Jaisalmer' },
    { src: A('kovalam.webp'), alt: 'Kovalam lighthouse at sunset, Kerala', label: 'Kerala' }
  ],

  filters: {
    where: { label: 'Destination', value: 'Anywhere in India', opts: ['Anywhere in India', 'North India', 'South India', 'West India', 'East India', 'Rajasthan', 'Kerala', 'The Himalaya'] },
    days: { label: 'Duration', value: '10 – 14 nights', opts: ['Under 7 nights', '7 – 9 nights', '10 – 14 nights', '15 – 21 nights', 'Over 21 nights'] },
    interest: { label: 'Travel style', value: 'Culture & heritage', opts: ['Culture & heritage', 'Forts & palaces', 'Religious & spiritual', 'Wildlife & nature', 'Beaches & backwaters', 'Yoga & Ayurveda', 'Village life'] },
    stars: { label: 'Hotels', value: '4-star', opts: ['3-star', '4-star', '5-star', 'Heritage & palace'] }
  },

  trustBar: [
    { big: '25', title: 'Years, inbound only', sub: 'Since 2001 · no domestic tours' },
    { big: '9.75', title: 'Tour success rating', sub: 'Across completed journeys' },
    { big: '60%', title: 'Guests by referral', sub: 'Friends & returning families' },
    { big: '3–5★', title: 'Hotels only', sub: 'No budget or backpacker stays' }
  ],

  cats: ['All tours', 'Golden Triangle', 'Rajasthan', 'South India', 'Religious', 'Wellness'],
  tours: [
    { code: 'IGT-551', href: link('golden_triangle_packages.html'), name: 'Golden Triangle Classic', stops: ['Delhi', 'Agra', 'Jaipur'], nights: '6N / 7D', price: 'USD 545', img: '/photos/taj-mahal-feature.webp', alt: 'The Taj Mahal at sunrise, Agra', cats: ['Golden Triangle'], badge: 'Most booked', blurb: 'Mughal Delhi, the Taj at sunrise, and the forts and bazaars of the pink city.' },
    { code: 'IRJ-218', href: link('rajasthan-tours.html'), name: 'Rajasthan Forts & Palaces', stops: ['Jaipur', 'Jodhpur', 'Udaipur', 'Jaisalmer'], nights: '11N / 12D', price: 'USD 1,190', img: A('gadisar-lake.webp'), alt: 'Sandstone pavilions on Gadisar Lake at dusk, Jaisalmer', cats: ['Rajasthan'], badge: '', blurb: 'Four walled cities, heritage hotels inside the ramparts, and Pushkar Fair in November.' },
    { code: 'ISK-402', href: link('southindia_kerala_tours.html'), name: 'Kerala Backwaters & Beaches', stops: ['Kochi', 'Munnar', 'Alleppey', 'Kovalam'], nights: '9N / 10D', price: 'USD 985', img: A('kovalam.webp'), alt: 'Kovalam lighthouse above the Arabian Sea at sunset', cats: ['South India'], badge: '', blurb: 'Tea estates, a private houseboat night, and the slowest coastline in India to finish on.' },
    { code: 'IGR-309', href: link('golden_triangle_temple_packages.html'), name: 'Golden Triangle & Sacred India', stops: ['Delhi', 'Haridwar', 'Mathura', 'Agra', 'Jaipur'], nights: '11N / 12D', price: 'USD 1,265', img: '/photos/madurai.webp', alt: 'Temple gopurams, South India', placeholder: 'ganga aarti, haridwar', cats: ['Religious', 'Golden Triangle'], badge: 'Custom favourite', blurb: "Ganga Aarti at Har-ki-Pauri, Krishna's Mathura and Vrindavan, then the Golden Triangle." },
    { code: 'ITD-127', href: link('rajasthan-tours.html'), name: 'Thar Desert & the Blue City', stops: ['Jodhpur', 'Osian', 'Jaisalmer', 'Bikaner'], nights: '7N / 8D', price: 'USD 720', img: A('thar-camel.webp'), alt: 'A camel rider on a dune at sunset in the Thar desert', cats: ['Rajasthan'], badge: '', blurb: 'Dunes at sunset, a night under canvas, and the craft villages most tours drive past.' },
    { code: 'IYA-733', href: link('yoga_ayurveda_tours.html'), name: 'Yoga, Ayurveda & the Coast', stops: ['Rishikesh', 'Kochi', 'Kovalam'], nights: '10N / 11D', price: 'USD 1,040', img: A('yoga-beach.webp'), alt: 'Sunrise yoga on a quiet stretch of coast', cats: ['Wellness', 'South India'], badge: '', blurb: 'Morning practice on the Ganges, then a certified Ayurveda centre on the Malabar coast.' }
  ],

  regions: [
    { name: 'North India', kicker: 'Mughals, forts & the Ganges', places: 'Delhi · Agra · Jaipur · Udaipur · Varanasi · Amritsar · Kashmir', count: '24 tours · from USD 545', img: '/photos/red-fort-hd.webp', alt: 'The Red Fort, Delhi, at dusk' },
    { name: 'South India', kicker: 'Backwaters, temples & tea', places: 'Kochi · Munnar · Alleppey · Kovalam · Madurai · Mysore · Hampi', count: '16 tours · from USD 620', img: A('kovalam.webp'), alt: 'Kovalam lighthouse and palms at sunset' },
    { name: 'West India', kicker: 'Desert, caves & salt flats', places: 'Jaisalmer · Kutch · Ajanta & Ellora · Mumbai · Goa', count: '11 tours · from USD 580', img: A('gadisar-lake.webp'), alt: 'Gadisar Lake pavilions, Jaisalmer' },
    { name: 'East India', kicker: 'Tribes, tigers & the hills', places: 'Kolkata · Puri · Sikkim · Darjeeling · Assam', count: '9 tours · from USD 640', img: '/photos/east-india-losar.webp', alt: 'Losar festival, Arunachal Pradesh', placeholder: 'darjeeling / kaziranga' }
  ],

  steps: [
    { n: '01', when: 'DAY 0', title: 'You write to us', body: 'Dates, rough number of days, what you want to see. Two lines is enough to start.' },
    { n: '02', when: '< 24 HRS', title: 'A planner replies', body: 'A named person, asking only the questions that actually change the route.' },
    { n: '03', when: 'WEEK 1', title: 'We draw the tour', body: 'City order, driving hours, break days and excursions worked out by hand for your party.' },
    { n: '04', when: 'WEEK 1–2', title: 'One clear quote', body: 'Hotels by name and room type, car, guides, entry fees, meals — itemised in USD.' },
    { n: '05', when: 'ON TOUR', title: 'We run it', body: 'Met on arrival and handed between our own ground teams in every state, through to departure.' },
    { n: '06', when: 'AFTER', title: 'You tell your friends', body: 'Six in ten of our guests come from a recommendation. It is the only marketing that works for us.' }
  ],

  pillars: [
    { n: '01', title: 'Routed by hand', body: 'Distances, driving hours and city order worked out for your party — never a template.' },
    { n: '02', title: 'Our own ground teams', body: 'English-speaking drivers and licensed guides in every major sector, reachable all trip.' },
    { n: '03', title: 'Hotels contracted direct', body: 'See the hotel name and room category before you pay. No budget properties, ever.' },
    { n: '04', title: 'Transparent to the last line', body: 'We deliver more than we commit to. What is quoted is exactly what arrives.' }
  ],

  guideCols: [
    // client, 18 Oct 2026: every link of the original site's India Travel Guide, in its order; Fairs And Festivals moved
    // from the Travelers Guide to the Attractions, and Adventure Tourism added back
    { title: 'Travelers Guide', count: '9 topics', items: ['Geography', 'History', 'Weather', 'Communication', 'Shopping', 'Music And Dance', 'Traditions And Customs', 'Art', 'Cuisine'] },
    { title: 'Attractions of India', count: '9 themes', items: ['Ayurveda Tourism', 'Yoga Tourism', 'Pilgrimage Tourism', 'Wildlife Tourism', 'Buddha Tourism', 'Beaches Tourism', 'Hill Stations Tourism', 'Adventure Tourism', 'Fairs And Festivals'] },
    { title: 'Travel Tools', count: '6 tools', items: ['Phone Codes', 'Maps', 'Indian Embassies', 'Visa Information', "Traveler's Guide", 'Other Guidelines'] }
  ],

  reviews: [
    { quote: 'The guides were very knowledgeable and went all out helping us look for antiques. Our driver understood we loved nature watching — we ended up on many fun safaris. The accommodation was all perfect.', name: 'Sumita Thiagarajan', initials: 'ST', meta: 'Singapore · South India tour' },
    { quote: 'Everyone is still talking about your company. You all did an amazing job with the tour. I have no hesitation recommending friends and family — many are ready to send their names for the next one.', name: 'Pt. Munelal Maharaj', initials: 'MM', meta: 'Trinidad & Tobago · Group tour' },
    { quote: 'Services met expectations and, for some aspects, came with extras that added value to the base package. We feel confident recommending Meruka to friends asking about a similar tour in India.', name: 'Benvenuti', initials: 'BV', meta: 'Italy · Custom North India tour' }
  ],

  planPoints: ['A named planner, replying within one working day', 'Day-by-day routing with realistic driving times', 'Itemised quote — hotels by name, car, guides, fees', 'Nothing payable until the whole plan is approved'],
  countries: ['United States', 'United Kingdom', 'Canada', 'Australia', 'France', 'Germany', 'Italy', 'Spain', 'Korea', 'Other'],
  paxOpts: ['1 traveller', '2 travellers', '3 – 4 travellers', '5 – 6 travellers', 'Group of 7+'],
  starChips: ['3-star', '4-star', '5-star', 'Heritage / palace'],
  defaultStar: '4-star',

  faqs: [
    { q: 'Do I need a visa, and will you help?', a: 'Nearly every passport needs an e-Visa, applied for online 4 to 30 days before arrival. We send the official link, the exact document list and a completed sample, and check your application before you pay the fee.' },
    { q: 'Is the tour really private?', a: 'Private means private. Your party alone, one dedicated car and driver from airport pickup to departure. We never combine families or nationalities into a shared coach.' },
    { q: 'What does a tour cost, and what is included?', a: 'From USD 150 per day for a couple in 3-star hotels; 4 and 5-star scale from there. Quotes are itemised: hotel by name and room type, car, driver, guides, monument fees and every included meal.' },
    { q: 'Can you change an itinerary on this site?', a: 'Yes — most guests do. Send the tour code, tell us what to add, drop or slow down, and we redraw the routing with realistic driving times. Or give us your interests and days and we design from scratch.' },
    { q: 'Is India comfortable for travellers in their sixties?', a: 'Most of our guests are 45 to 65. You are met at arrival and handed between our own teams at each stage — never left to find transport, tickets or a hotel alone, with one number that always answers.' },
    { q: 'How and when do we pay?', a: 'By international bank transfer, with card payments returning shortly. A deposit confirms hotels; the balance is due before or on arrival — only after you approve the full itinerary and quote.' }
  ],

  // (23 Oct 2026, client) the footer's four columns as before, each pointing to main pages; each item is [label, link]
  footerCols: [
    { title: 'Tour Packages', items: [['All Tour Packages', '/itineraries'], ['Golden Triangle Tours', '/india-golden-triangle-tour'], ['Rajasthan Tours', '/rajasthan-tours'], ['Kerala Tours', '/southindia_kerala_tours'], ['South India Tours', '/south_india_tour'], ['Incredible India Tours', '/incredible_india_tours']] },
    { title: 'Destinations', items: [['North India', '/north_india_tour'], ['South India', '/south_india_tours_tourism'], ['East India', '/east_india_tour_tourism'], ['West India', '/west_india_tour_tourism']] },
    // "Travel Tips" is the Traveller's Guide page (its tips); "Important Links" as in the old site's footer
    { title: 'Travel Guide', items: [['India Travel Guide', '/guide'], ['Travel Tips', '/travelers_guide'], ['Best Time to Visit', '/weather'], ['Fairs & Festivals', '/Fairs-Festivals'], ['Visa Information', '/visa_information'], ['Important Links', '/important_links']] },
    { title: 'Company', items: [['About Us', '/aboutus'], ['Guest Reviews', '/testimonials'], ['FAQs', '/faqs'], ['Contact Us', '/contactus'], ['Plan My Trip', '/plan-my-trip'], ['Sitemap', '/sitemap']] }
  ],
  seoLinks: ['India tour packages', 'India travel agency', 'Indian tour operators', 'India holiday packages', 'Golden Triangle tour', 'Rajasthan tour packages', 'Kerala backwaters tours', 'Kerala tour operators', 'Private tours India', 'India tour plan', 'India Tour Itineraries', 'India Tourism', 'South India Tours', 'North India Tours'],
  socials: ['f', 'in', 'ig', 'yt']
};

// "States to Explore" — each state links to its local guide page, grouped under the four regions above.
// [name, local page, thumbnail]
const I = f => '/images/' + f;
module.exports.stateAllImg = '/assets/taj-reflection.webp';
module.exports.stateGroups = [
  { region: 'North India', img: '/assets/taj-aerial.webp', states: [['Rajasthan', '/rajasthan', I('rajasthan-state.webp')], ['Himachal Pradesh', '/Himachal-Pradesh', I('himchal.webp')], ['Uttarakhand', '/uttaranchal', I('uttaranchal-state.webp')], ['Jammu & Kashmir', '/Jammu-Kashmir', I('jammu-kash.webp')], ['Uttar Pradesh', '/Uttar-Pradesh', I('uttar-pradesh-state.webp')], ['Punjab', '/Punjab', I('punjab-state.webp')], ['Ladakh', '/lehladakh_himalaya_travel', I('lehladakh-inner.webp')]] },
  { region: 'South India', img: '/assets/kovalam.webp', states: [['Kerala', '/Kerala', I('kerala-state.webp')], ['Tamil Nadu', '/Tamil-Nadu', I('tamilnadu.webp')], ['Karnataka', '/Karnataka', I('karnatak-state.webp')], ['Andhra Pradesh', '/Andhra-Pradesh', I('andhra-pradesh.webp')], ['Telangana', '/south_indiatours_telangna', I('telangana.webp')]] },
  { region: 'West India', img: '/assets/gadisar-lake.webp', states: [['Goa', '/Goa', I('goa-state.webp')], ['Gujarat', '/Gujarat', I('gujrat-state.webp')], ['Maharashtra', '/Maharashtra', I('maharashtra-state.webp')], ['Madhya Pradesh', '/Madhya-Pradesh', I('madhya-pradesh-state.webp')]] },
  { region: 'East India', img: I('eastindia-state.webp'), states: [['Sikkim', '/Sikkim', I('sikkim-state.webp')], ['Odisha', '/Orissa', I('orissa-state.webp')], ['Assam', '/Assam', I('assam-state.webp')], ['West Bengal', '/West-Bengal', I('west-bengal-state.webp')], ['Bihar', '/Bihar', I('bihar-state.webp')]] }
];

// Guest testimonials (word for word from the Testimonials page) for the reviews slider.
module.exports.testimonials = require('./testimonials');

// Home tour cards open their category list (e.g. all Golden Triangle tours), not one itinerary.
const CATEGORY_LIST = { 'Golden Triangle': '/india-golden-triangle-tour' };
module.exports.tours.forEach(t => {
  const cat = t.cats.find(c => CATEGORY_LIST[c]);
  t.list = cat ? CATEGORY_LIST[cat] : t.href;
});

// (23 Oct 2026, admin panel) parts of the home page and the header that used to be written into the templates, now data
// so they can be changed in the admin panel (Pages → Home, Header & footer)
module.exports.heroTitle = { line1: 'One Country', line2: 'Many Worlds...' };
// banner photos in the client's order: photo, its description, place, the tour list it opens, focus point, mirrored
module.exports.heroSlides = [
  { src: '/photos/hero-taj-mahal.webp', alt: 'The Taj Mahal at sunset across the Yamuna, Agra', place: 'Taj Mahal, Agra', region: 'Golden Triangle', href: '/india-golden-triangle-tour', pos: '50% 30%', flip: false },
  { src: '/photos/hero-desert-camel.webp', alt: 'Camel safari on the sand dunes, Jaisalmer', place: 'Sand dunes, Jaisalmer', region: 'Desert', href: '/rajasthan-tours', pos: '50% 22%', flip: false },
  { src: '/photos/hero-tigers.webp', alt: 'Two Bengal tigers in the forest', place: 'Tiger safari', region: 'Wildlife', href: '/wildlife_tour', pos: '70% 32%', flip: false },
  { src: '/photos/hero-holi.webp', alt: 'Holi, the festival of colours', place: 'Holi festival', region: 'Fairs & Festivals', href: '/india_fair_festival_travelplan', pos: '50% 18%', flip: false },
  { src: '/photos/hero-ladakh.webp', alt: 'Mountains reflected in a high lake, Ladakh', place: 'Ladakh', region: 'Mountains', href: '/leh_ladakh_tours', pos: '50% 50%', flip: false },
  { src: '/photos/hero-hawa-mahal.webp', alt: 'Hawa Mahal, the Palace of Winds, Jaipur', place: 'Hawa Mahal, Jaipur', region: 'Rajasthan', href: '/rajasthan-tours', pos: '50% 22%', flip: false },
  { src: '/photos/hero-houseboat.webp', alt: 'A houseboat on the Kerala backwaters', place: 'Kerala Backwaters', region: 'Kerala', href: '/southindia_kerala_tours', pos: '50% 28%', flip: false }
];
// the band under the banner; a figure left empty shows the "private tour" shield instead
module.exports.stats = [
  { figure: '22', text: 'Years of Experience' }, { figure: '1150+', text: 'Happy guests' }, { figure: '135+', text: 'Tour packages' },
  { figure: '97.80%', text: 'Success Rate' }, { figure: '', text: 'Private Tours — No Sharing' }
];
module.exports.offer = { show: true, eyebrow: 'Seasonal offer', percent: '10%', text: 'discount on the tour packages booked from April to September!' };
// the header's links, left to right
module.exports.headerMenu = [
  { label: 'Home', href: '/' }, { label: 'About Us', href: '/aboutus' }, { label: 'Tour Packages', href: '/itineraries' },
  { label: 'Guest Reviews', href: '/testimonials' }, { label: 'Contact', href: '/contactus' }
];

// (26 Oct 2026, client) every section of the home page, editable in the admin panel (Pages → Home page): its heading,
// the line under it, its button and its cards. The values are the ones the page showed before, word for word.
// A card's price left empty is the lowest tour price of that category, worked out from the tours.
module.exports.secPackages = {
  title: 'Best Tour Packages', accent: 'in The Industry', sub: 'Offering Various Tour Packages in Each Sector.', button: 'View Tours', buttonLink: '/itineraries',
  cards: [
    { title: 'Golden Triangle', photo: '/photos/red-fort-hd.webp', link: '/india-golden-triangle-tour', price: '' },
    { title: 'Rajasthan Heritage', photo: '/photos/gadisar-lake-hd.webp', link: '/rajasthan-tours', price: '' },
    { title: 'Kerala Backwaters', photo: '/photos/kerala-houseboat-dusk.webp', link: '/southindia_kerala_tours', price: '' },
    { title: 'South India', photo: '/photos/mysore-palace-lit.webp', link: '/south_india_tour', price: '' }
  ],
  note: '*Starting price per person for the whole tour, two people sharing a room in 3-star hotels. All our tours are private: no sharing with other travellers.'
};
module.exports.secPopular = {
  title: 'Most Popular Tours', accent: 'of India', sub: 'From Thar Desert of Rajasthan to Backwaters of Kerala.', button: 'View Tours', buttonLink: '/itineraries',
  note: 'Tour cost is for a minimum of 2 persons travelling together · 3-star hotels, 1 double room on twin sharing with breakfast.'
};
module.exports.secOwnTour = {
  title: 'Chalk Out Your Own', accent: 'Private Tour', sub: 'Your trip, your way.', currency: 'USD', price: '170', priceNote: 'Per Couple Per Day onwards',
  included: ['3-star hotel accommodation with breakfast', 'Private A/C car with an English-speaking driver throughout the tour', 'All pickups, sightseeing, intercity travel, excursions and other services as specified'],
  extras: ['Upgrade to 4-star, 5-star & 5-star deluxe hotels', 'Customize the number of days, destinations and sightseeing', 'Planned to your budget and requirement'],
  button: 'Tell Us Your Plan', buttonLink: '/plan-my-trip'
};
module.exports.secRegions = {
  title: 'Four Regions.', accent: 'Four Different Countries.', sub: 'The Grace of Geography.', statesTitle: 'States of India',
  cards: [
    { name: 'South India', kicker: 'Backwaters, temples & tea', photo: '/photos/region-south-india.webp', link: '/south_india_tours_tourism', cities: [['Kochi', '/Kerala'], ['Munnar', '/Kerala'], ['Alleppey', '/Kerala'], ['Kovalam', '/Kerala'], ['Madurai', '/Tamil-Nadu'], ['Mysore', '/Karnataka'], ['Hampi', '/Karnataka']] },
    { name: 'North India', kicker: 'Mughals, forts & the Ganges', photo: '/photos/golden-temple-amritsar.webp', link: '/north_india_tour', cities: [['Jaipur', '/rajasthan_jaipur'], ['Agra', '/Uttar-Pradesh'], ['Delhi', '/delhi'], ['Jaisalmer', '/rajasthan_jaisalmer'], ['Udaipur', '/rajasthan_udaipur'], ['Varanasi', '/Uttar-Pradesh']] },
    { name: 'West India', kicker: 'Desert, caves & salt flats', photo: '/photos/goa-beach-palms.webp', link: '/west_india_tour_tourism', cities: [['Kutch', '/Gujarat'], ['Ajanta & Ellora', '/Maharashtra'], ['Mumbai', '/Maharashtra'], ['Goa', '/Goa'], ['Khajuraho', '/khajuraho_city_tour_travel']] },
    { name: 'East India', kicker: 'Tribes, tigers & the hills', photo: '/photos/arunachal-losar.webp', link: '/east_india_tour_tourism', cities: [['Kolkata', '/West-Bengal'], ['Puri', '/Orissa'], ['Sikkim', '/Sikkim'], ['Darjeeling', '/West-Bengal'], ['Assam', '/Assam']] }
  ]
};
module.exports.secGuide = {
  title: 'India', accent: 'Travel Guide', sub: 'Travel with peace of mind — everything we are asked before a first trip, answered plainly.', button: 'View Travel Guide', buttonLink: '/guide',
  photo: '/photos/guide-main.webp', tag: 'WHEN TO COME', seasonTitle: 'The Country for All Seasons', seasonText: 'September to March is the best time.'
};
module.exports.secWhy = {
  title: 'Why to', accent: 'Choose Us?', sub: '“Always give people more than what they expect to get.”',
  intro: 'Founded in 2001 to do one thing properly: look after overseas travellers inside India. No domestic groups, no merged coaches — your party, your car, your pace, with our own ground teams in every state you pass through.',
  points: [
    { title: 'Routed by hand', text: 'Distances, driving hours and city order worked out for your party — never a template.' },
    { title: 'Hotels contracted direct', text: 'See the hotel name and room category before you pay.' },
    { title: 'Transparent to the last line', text: 'What is quoted is exactly what arrives.' },
    { title: 'Full inbound specialists', text: '22 years of looking after overseas guests across India.' }
  ],
  photo: '/photos/handshake-deal.webp', quote: 'The guest is the only Boss of our company; this is our prime duty and commitment to always provide the best services.', quoteName: 'Ashok Pareek', quoteRole: 'Founder, Meruka India Tourism Service'
};
module.exports.secFaq = {
  title: 'FAQs', sub: 'Assistance on every step you take.', homeCount: 6, boxTitle: 'Still have a question?', boxText: 'A planner answers, not a bot.',
  howTitle: 'How we work — from your first email to the airport wave-off', howNote: 'No deposit until the whole plan — routing, hotels by name, every cost — is approved by you.'
};

// (26 Oct 2026, client video II) everything in the footer is edited in one place (Footer menu): the short text under the
// logo, the social media addresses (an icon becomes a link once its address is filled in) and the popular searches, each
// with the page it opens
module.exports.footerAbout = 'Inbound travel agency for overseas visitors. Private tours, 3–5 star hotels, a dedicated car and driver from arrival to departure.';
module.exports.footerSocial = [
  { name: 'Facebook', href: '' }, { name: 'Instagram', href: '' }, { name: 'YouTube', href: '' }, { name: 'X', href: '' }
];
module.exports.popularSearches = [
  ['India tour packages','/itineraries'],
  ['India travel agency','/aboutus'],
  ['Indian tour operators','/aboutus'],
  ['India holiday packages','/itineraries'],
  ['Golden Triangle tour','/india-golden-triangle-tour'],
  ['Rajasthan tour packages','/rajasthan-tours'],
  ['Kerala backwaters tours','/southindia_kerala_tours'],
  ['Kerala tour operators','/southindia_kerala_tours'],
  ['Private tours India','/itineraries'],
  ['India tour plan','/plan-my-trip'],
  ['India Tour Itineraries','/itineraries'],
  ['India Tourism','/'],
  ['South India Tours','/south_india_tour'],
  ['North India Tours','/north_india_tour']
];
