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
  'Wildlife tours': 'wildlife_tour.html', 'Buddhist circuit': 'buddhist_pilgirmage_tour.html',
  'Fairs & festivals': 'india_fair_festival_travelplan.html', 'Village tours': 'rajasthan-villages-travel-tours.html',
  // Destinations menu, region cards and footer
  'North India': 'north_india_tour.html', 'Delhi': 'north_india_tour.html', 'Agra': 'india-golden-triangle-tour.html',
  'Rajasthan': 'rajasthan-tours.html', 'Jaisalmer': 'rajasthan-tours.html', 'Varanasi': 'north_india_tour.html', 'Kashmir': 'north_india_tour.html',
  'Himachal': 'rajasthan_himachal_tours_packages.html',
  'South India': 'south_india_tours_tourism.html', 'Kerala': 'southindia_kerala_tours.html', 'Tamil Nadu': 'tamilnadu-tours.html',
  'Karnataka': 'karnataka_tours.html', 'Hampi': 'karnataka_tours.html', 'Goa': 'island_beaches_tour.html',
  'West India': 'west_india_tour_tourism.html', 'Mumbai': 'maharashtra_tours.html', 'Gujarat': 'gujarat_tours.html',
  'Ajanta & Ellora': 'maharashtra_tours.html', 'Rann of Kutch': 'gujarat_tours.html',
  'East India': 'east_india_tour_tourism.html', 'Kolkata': 'east_india_tour_tourism.html', 'Odisha': 'konark-suntemple_tours.html',
  'Sikkim & Darjeeling': 'sikkimtours.html', 'Seven Sisters': 'seven-sisters-india-tours.html', 'Sundarbans': 'golden_triangle_sunderbans_tour.html',
  // Travel guide cards
  'Weather & best season': 'weather.htm', 'Fairs and festivals': 'Fairs-Festivals.htm', 'Cuisine': 'cuisine.htm',
  'Shopping': 'shopping.htm', 'Traditions and customs': 'traditions_and_customs.htm', 'History & geography': 'history.htm',
  'Pilgrimage tourism': 'pilgrimage.htm', 'Wildlife tourism': 'wildlife.htm',
  'Beaches & hill stations': 'beaches.htm', 'Tribal & village India': 'rajasthan-villages-travel-tours.html',
  'Visa information': 'visa_information.htm', 'Indian embassies': 'indian_embassies.htm',
  'Health & safety': 'travelers-guidlines-information.htm', 'Money and tipping': 'travelers_guide.htm',
  'Maps & phone codes': 'maps.htm', 'Booking & cancellation': '#faq',
  // Footer
  'Golden Triangle': 'india-golden-triangle-tour.html', 'Exotic Rajasthan': 'rajasthan-tours.html',
  'Rajasthan North India': 'rajasthan_north_india_tours.html', 'Group tours (7+)': '#plan',
  'Best time to visit': 'weather.htm', 'Wildlife & parks': 'wildlife.htm', "Traveller's guide": 'travelers_guide.htm',
  'Why Meruka India': 'aboutus.htm', 'How we work': '#process', 'Guest reviews': '#reviews', 'FAQs': '#faq',
  'Cancellation policy': '#faq', 'Contact us': 'contactus.htm',
  // Popular searches
  'India tour packages': 'itineraries.htm', 'India travel agency': 'aboutus.htm', 'Indian tour operators': 'aboutus.htm',
  'India holiday packages': 'itineraries.htm', 'Golden Triangle tour': 'india-golden-triangle-tour.html',
  'Rajasthan tour packages': 'rajasthan-tours.html', 'Kerala backwaters tours': 'southindia_kerala_tours.html',
  'Kerala tour operators': 'southindia_kerala_tours.html', 'Private tours India': 'itineraries.htm', 'India tour plan': '#plan'
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
  langs: ['English', 'Français', 'Deutsch', 'Español', 'Italiano', '한국어'],

  pkgMenuCols: [
    { title: 'Most requested', items: ['Golden Triangle tours', 'Exotic Rajasthan tours', 'Rajasthan & North India', 'Kerala backwaters', 'South & North India', 'Incredible India'] },
    { title: 'By region', items: ['North India tours', 'South India tours', 'East India tours', 'West India tours', 'Grand India tours', 'Leh & Ladakh'] },
    { title: 'Special interest', items: ['Religious & pilgrimage', 'Yoga & Ayurveda', 'Wildlife tours', 'Buddhist circuit', 'Fairs & festivals', 'Village tours'] }
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
    { src: A('kovalam.jpg'), alt: 'Kovalam lighthouse at sunset, Kerala', label: 'Kerala' }
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
    { code: 'ISK-402', href: link('southindia_kerala_tours.html'), name: 'Kerala Backwaters & Beaches', stops: ['Kochi', 'Munnar', 'Alleppey', 'Kovalam'], nights: '9N / 10D', price: 'USD 985', img: A('kovalam.jpg'), alt: 'Kovalam lighthouse above the Arabian Sea at sunset', cats: ['South India'], badge: '', blurb: 'Tea estates, a private houseboat night, and the slowest coastline in India to finish on.' },
    { code: 'IGR-309', href: link('golden_triangle_temple_packages.html'), name: 'Golden Triangle & Sacred India', stops: ['Delhi', 'Haridwar', 'Mathura', 'Agra', 'Jaipur'], nights: '11N / 12D', price: 'USD 1,265', img: '/photos/madurai.webp', alt: 'Temple gopurams, South India', placeholder: 'ganga aarti, haridwar', cats: ['Religious', 'Golden Triangle'], badge: 'Custom favourite', blurb: "Ganga Aarti at Har-ki-Pauri, Krishna's Mathura and Vrindavan, then the Golden Triangle." },
    { code: 'ITD-127', href: link('rajasthan-tours.html'), name: 'Thar Desert & the Blue City', stops: ['Jodhpur', 'Osian', 'Jaisalmer', 'Bikaner'], nights: '7N / 8D', price: 'USD 720', img: A('thar-camel.jpg'), alt: 'A camel rider on a dune at sunset in the Thar desert', cats: ['Rajasthan'], badge: '', blurb: 'Dunes at sunset, a night under canvas, and the craft villages most tours drive past.' },
    { code: 'IYA-733', href: link('yoga_ayurveda_tours.html'), name: 'Yoga, Ayurveda & the Coast', stops: ['Rishikesh', 'Kochi', 'Kovalam'], nights: '10N / 11D', price: 'USD 1,040', img: A('yoga-beach.avif'), alt: 'Sunrise yoga on a quiet stretch of coast', cats: ['Wellness', 'South India'], badge: '', blurb: 'Morning practice on the Ganges, then a certified Ayurveda centre on the Malabar coast.' }
  ],

  regions: [
    { name: 'North India', kicker: 'Mughals, forts & the Ganges', places: 'Delhi · Agra · Jaipur · Udaipur · Varanasi · Amritsar · Kashmir', count: '24 tours · from USD 545', img: '/photos/red-fort-hd.webp', alt: 'The Red Fort, Delhi, at dusk' },
    { name: 'South India', kicker: 'Backwaters, temples & tea', places: 'Kochi · Munnar · Alleppey · Kovalam · Madurai · Mysore · Hampi', count: '16 tours · from USD 620', img: A('kovalam.jpg'), alt: 'Kovalam lighthouse and palms at sunset' },
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
    { title: 'Tourism guide', count: '9 topics', items: ['Weather & best season', 'Fairs and festivals', 'Cuisine', 'Shopping', 'Traditions and customs', 'History & geography'] },
    { title: 'Attractions', count: '9 themes', items: ['Yoga & Ayurveda', 'Pilgrimage tourism', 'Wildlife tourism', 'Buddhist circuit', 'Beaches & hill stations', 'Tribal & village India'] },
    { title: 'Travel tools', count: '9 tools', items: ['Visa information', 'Indian embassies', 'Health & safety', 'Money and tipping', 'Maps & phone codes', 'Booking & cancellation'] }
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

  footerCols: [
    { title: 'Tour packages', items: ['Golden Triangle', 'Exotic Rajasthan', 'Rajasthan North India', 'Kerala backwaters', 'South India', 'Group tours (7+)'] },
    { title: 'Destinations', items: ['North India', 'South India', 'East India', 'West India', 'Rajasthan', 'Leh & Ladakh'] },
    { title: 'Travel guide', items: ['Best time to visit', 'Fairs & festivals', 'Cuisine', 'Visa information', 'Wildlife & parks', "Traveller's guide"] },
    { title: 'Company', items: ['Why Meruka India', 'How we work', 'Guest reviews', 'FAQs', 'Cancellation policy', 'Contact us'] }
  ],
  seoLinks: ['India tour packages', 'India travel agency', 'Indian tour operators', 'India holiday packages', 'Golden Triangle tour', 'Rajasthan tour packages', 'Kerala backwaters tours', 'Kerala tour operators', 'Private tours India', 'India tour plan'],
  socials: ['f', 'in', 'ig', 'yt']
};

// "States to Explore" — each state links to its local guide page, grouped under the four regions above.
// [name, local page, thumbnail]
const I = f => '/images/' + f;
module.exports.stateAllImg = '/assets/taj-reflection.webp';
module.exports.stateGroups = [
  { region: 'North India', img: '/assets/taj-aerial.jpg', states: [['Rajasthan', '/rajasthan', I('rajasthan-state.jpg')], ['Himachal Pradesh', '/Himachal-Pradesh', I('himchal.jpg')], ['Uttarakhand', '/uttaranchal', I('uttaranchal-state.jpg')], ['Jammu & Kashmir', '/Jammu-Kashmir', I('jammu-kash.jpg')], ['Uttar Pradesh', '/Uttar-Pradesh', I('uttar-pradesh-state.jpg')], ['Punjab', '/Punjab', I('punjab-state.jpg')], ['Ladakh', '/lehladakh_himalaya_travel', I('lehladakh-inner.jpg')]] },
  { region: 'South India', img: '/assets/kovalam.jpg', states: [['Kerala', '/Kerala', I('kerala-state.jpg')], ['Tamil Nadu', '/Tamil-Nadu', I('tamilnadu.jpg')], ['Karnataka', '/Karnataka', I('karnatak-state.jpg')], ['Andhra Pradesh', '/Andhra-Pradesh', I('andhra-pradesh.jpg')], ['Telangana', '/south_indiatours_telangna', I('telangana.jpg')]] },
  { region: 'West India', img: '/assets/gadisar-lake.webp', states: [['Goa', '/Goa', I('goa-state.jpg')], ['Gujarat', '/Gujarat', I('gujrat-state.jpg')], ['Maharashtra', '/Maharashtra', I('maharashtra-state.jpg')], ['Madhya Pradesh', '/Madhya-Pradesh', I('madhya-pradesh-state.jpg')]] },
  { region: 'East India', img: I('eastindia-state.jpg'), states: [['Sikkim', '/Sikkim', I('sikkim-state.jpg')], ['Odisha', '/Orissa', I('orissa-state.jpg')], ['Assam', '/Assam', I('assam-state.jpg')], ['West Bengal', '/West-Bengal', I('west-bengal-state.jpg')], ['Bihar', '/Bihar', I('bihar-state.jpg')]] }
];

// Guest testimonials (word for word from the Testimonials page) for the reviews slider.
module.exports.testimonials = require('./testimonials');

// Home tour cards open their category list (e.g. all Golden Triangle tours), not one itinerary.
const CATEGORY_LIST = { 'Golden Triangle': '/india-golden-triangle-tour' };
module.exports.tours.forEach(t => {
  const cat = t.cats.find(c => CATEGORY_LIST[c]);
  t.list = cat ? CATEGORY_LIST[cat] : t.href;
});
