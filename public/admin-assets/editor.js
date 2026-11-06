// Meruka admin: the editor (16 Oct 2026, v2 — made for the client: tabs, plain-language help, a bold button, a live
// Google preview with checks). It builds the form from the data itself, so every page type and setting uses it.
(function () {
  const A = window.ADMIN, E = window.EDIT;
  const root = document.querySelector('[data-form]'), tabsEl = document.querySelector('[data-tabs]');
  const saveBtn = document.querySelector('[data-save]'), draftBtn = document.querySelector('[data-draft]'), state = document.querySelector('[data-state]');
  const statusEl = document.querySelector('[data-status]'), draftNote = document.querySelector('[data-draft-note]');
  const apiUrl = E.mode === 'single' ? '/admin/api/single/' + E.id : '/admin/api/item/' + E.kind + '/' + E.id;
  let comps = {}, getters = {}, dirty = false, templates = {}, refreshGoogle = () => {}, current = null, catState = null, dayAuto = [], singleSeo = false;

  // ---------- plain-language names and help ----------
  const LABELS = {
    heading: 'Page title', photo: 'Tour photo', photo_posts: 'Post photo', heading_posts: 'Title of the post', route: 'Route', duration: 'Length of the tour',
    days: 'Days', day: 'Day number', title: 'Title', eta: 'Distance / drive time', paras: 'What happens this day', note: 'Note for this day',
    details: 'Price box (right side of the tour page)', text: 'Text', items: 'Points', breadcrumb: 'Breadcrumb', label: 'Text', href: 'Link to',
    listPhoto: 'Photo in the list (its card on the region or state page)', heroSrc: 'Banner photo (top of the page)', heroSrc_tours: 'Banner photo (optional)', heroAlt: 'Describe the banner photo in a few words', description: 'Description', keywords: 'Keywords',
    focusKeyword: 'Main search words (optional)', noindex: 'Hide this page from Google', ogImage: 'Picture when shared on WhatsApp / Facebook',
    intro: 'Introduction text', groups: 'Tours on this page', tours: 'Tours', outro: 'Closing text', name: 'Name', html: 'Page text',
    steps: 'How it works (steps)', faqs: 'Questions & answers', q: 'Question', a: 'Answer', guideCols: 'Travel guide links', stateGroups: 'Destinations by state',
    footerCols: 'Footer link columns', seoLinks: 'Footer "Popular searches" links', social: 'Social media', all: 'Reviews', quote: 'What the guest wrote', tour: 'Tour they took', country: 'Country',
    closing: 'Closing line', leadName: 'Company name (in bold at the start)', paragraphs: 'Text', mission: 'Mission', founder: 'Founder', atithi: 'Atithi Devo Bhava',
    offices: 'Other offices (and the head office for the footer)', hqBlock: 'Head office', cell: 'Mobile', landline: 'Landline', gmail: 'Second email', website: 'Website', infoList: 'What we ask for (list on the Contact page)', interests: 'Interests (buttons in the enquiry form)', tourNames: 'Tours in the enquiry form',
    guide: 'Travel guide (Contact page)', city: 'City', area: 'Area', phones: 'Phone numbers', email: 'Email', lines: 'Address lines', kind: 'Type', img: 'Photo',
    initials: 'Initials (shown in the circle)', details_: 'Details', googleVerification: 'Google Search Console code', googleAnalytics: 'Google Analytics ID',
    bingVerification: 'Bing Webmaster code (optional)', defaultShareImage: 'Default share picture', pages: 'Main pages in Google', redirects: 'Redirects',
    from: 'Old address', to: 'New address',
    heroTitle: 'Banner title', line1: 'Title — first line', line2: 'Title — second line (accent colour)', heroSlides: 'Banner photos', src: 'Photo', alt: 'Describe the photo in a few words',
    place: 'Place (shown with the photo)', region: 'Region / theme', pos: 'Focus point of the photo', flip: 'Show the photo mirrored', stats: 'Figures', figure: 'Figure (e.g. 22 or 97.80%)',
    offer: 'Seasonal offer', show: 'Show the offer on the home page', eyebrow: 'Small line above', percent: 'Big figure (e.g. 10%)', headerMenu: 'Header menu links', popularSearches: 'Popular searches', footerSocial: 'Social media', footerAbout: 'Text under the footer logo',
    date: 'Date', author: 'Written by', siteNoindex: 'Keep every page out of Google for now (noindex)', siteNofollow: 'Google does not follow the links (nofollow)', siteNosnippet: 'Show no text under the pages in Google (nosnippet)', siteNoimageindex: 'Show no photos in Google Images (noimageindex)', siteNoarchive: 'No saved copies in search engines (noarchive)', siteNoAi: 'Keep AI tools out (ChatGPT, Claude, Perplexity, Gemini …)', siteNoShare: 'No preview when a page is shared (WhatsApp, Facebook, email)', siteLogo: 'Logo', logoHeader: 'Top of every page (header)', logoFooter: 'Footer', siteName: 'Name at the top', footerName: 'Name in the footer', photoAlt: 'Name of the photo (what it shows, for Google and screen readers)', category: 'Category', guideSection: 'Show in the India Travel Guide', excerpt: 'Short summary (shown in the list of posts)', topics: 'Topic groups', glance: 'Useful information at a glance', seasons: 'Seasons',
    goodToKnow: 'Good to know', tips: 'Travel tips', titles: 'Titles (Mr., Mrs. …)', countries: 'Countries', months: 'Months', years: 'Years', adults: 'Adults', children: 'Children',
    photo_single: 'Photo', note_single: 'Small text under the cards',
    photo_pages: 'Photo', href_pages: 'Opens the page', text_pages: 'Short text', navGroup: 'Group in the tour menu', heading_lists: 'Category title', tourType: 'Tour type', heroSrc_lists: 'Banner image', heroAlt_lists: 'Describe the banner image in a few words', summary: 'Package description (under the tour name)', html_tours: 'What happens this day', priceLine: 'Line beside “Starts from” (under the days)', priceIncludes: '“Price includes” points (in the price box)', intro_lists: 'Short description (shown above the tours)', outro_lists: 'Closing text (under the list of tours, optional)',
    secPackages: 'Best Tour Packages', secPopular: 'Most Popular Tours', secOwnTour: 'Chalk out your own tour', secRegions: 'Four Regions', secGuide: 'Travel Guide section', secWhy: 'Why Choose Us', secFaq: 'FAQs section',
    accent: 'Title — second part (accent colour)', sub: 'Paragraph under the title', button: 'Button text', buttonLink: 'Button link', cards: 'Cards', link: 'Opens (page)', price: 'Price (USD, per couple per day)',
    currency: 'Currency', priceNote: 'Text after the price', included: 'What is included (one per line)', extras: 'You can also (one per line)', kicker: 'Small line under the name', cities: 'Popular cities', statesTitle: 'Title above the states',
    tag: 'Small label on the photo', seasonTitle: 'Photo title', seasonText: 'Photo line', points: 'Points', quoteName: 'Name under the quote', quoteRole: 'Their role', boxTitle: 'Box title', boxText: 'Box line',
    homeCount: 'How many questions the home page shows (the rest are on the FAQs page, /faqs)', howTitle: '“How we work” title', howNote: '“How we work” note', n: 'Step number (01, 02 …)', when: 'When (e.g. DAY 0, WEEK 1)', body: 'Text',
    form: 'Form', period: 'Travel period — words', showPeriod: 'Show “Travel period”', people: 'Number of people — words', showPeople: 'Show “Number of people”',
    showDays: 'Show “Number of days”', showHotelBudget: 'Show “Hotel budget”', showHotelCategory: 'Show “Hotel category”', message: 'Message box — words', messageHint: 'Message box — example text',
    hotelBudget: 'Hotel budget choices', hotelCategory: 'Hotel category choices', '/': 'Home page', '/aboutus': 'About us page', '/contactus': 'Contact us page', '/testimonials': 'Guest Reviews page', '/plan-my-trip': 'Plan My Trip page'
  };
  const HELP = {
    heroSrc_lists: 'The wide photo at the top of the category page, also its photo on India Tour Packages.',
    summary: 'Starts with the text the tour page shows now.',
    priceLine: '{hotel} becomes the hotel class the visitor picks (3-Star, 4-Star …).',
    listPhoto: 'The photo of this page’s card on the page above it (its region or state). Leave it to keep the photo shown now; the banner above stays as it is.',
    priceIncludes: 'One point per line.',
    href_pages: 'Click to pick a page of this website.',
    route: 'The places in order, with " - " between them. Example: Delhi - Agra - Jaipur - Delhi',
    duration: 'Example: 06 Nights · 07 Days',
    photo: 'Shown for this tour in tour lists and "Most Popular Tours". Leave empty to use a matching photo automatically.',
    heroSrc: 'The wide photo at the very top of the page.',
    guideSection: 'Choose a section and this page is listed there by itself: on the home page’s Travel Guide cards and on the India Travel Guide page (/guide). The pages already listed there stay as they are.',
    heroSrc_tours: 'Leave it empty to show the banner of the tour’s category. Choose a photo only if this tour needs its own.',
    heroAlt: 'For Google and for people who cannot see the photo. Example: Taj Mahal at sunrise',
    days: 'Click a day to open it. Drag it by its dots to change the order; the bin removes it.',
    paras: 'Write it like in Word: Enter starts a new paragraph. Select words and use the toolbar for bold, italic, underline or a link.',
    details: '',
    items: 'One point per line (press Enter for the next point).',
    groups: 'The tours this page lists. Open a group to add, remove or reorder its tours. The first tour of a main category is the one shown in "Most Popular Tours".',
    href: 'A page on this website starts with / (example: /golden_triangle_packages). Another website starts with https://',
    breadcrumb: 'The small path above the page title. Usually no need to change it.',
    faqs: 'Shown on the home page, and given to Google as questions & answers.',
    offices: 'The first office is the head office: its first phone number is used for WhatsApp and in the footer.',
    social: 'Paste the full address of each profile (https://…). An icon appears in the footer once an address is filled in.',
    googleVerification: 'In Google Search Console choose "HTML tag" and copy only the code inside content="…".',
    googleAnalytics: 'From Google Analytics 4 → Admin → Data streams. It starts with G-',
    defaultShareImage: 'Used when a page without its own photo is shared on WhatsApp, Facebook or LinkedIn.',
    pages: 'Leave empty to keep the built-in text.',
    redirects: 'When a page gets a new address, send visitors and Google from the old address to the new one. Example: /old-tour → /new-tour',
    all: 'Each review: what the guest wrote, their name and country, and the tour they took.',
    heroSlides: 'The photos turn every few seconds, in this order. The first one shows first.',
    pos: 'Which part of the photo stays in view: left-right then top-bottom, e.g. 50% 30%.',
    stats: 'Leave a figure empty to show the "private tour" shield instead.',
    headerMenu: 'The links in the header, left to right. A page on this website starts with / (example: /itineraries).',
    footerCols: 'Each column: its title and its links (name and address).',
    excerpt: 'Two or three lines. Shown on /blog under the title.',
    photo: 'Used in the tour lists and cards.', photo_posts: 'The big photo at the top of the post, also on its card in the blog.',
    outro: 'Shown under the list of tours on the category page. Leave it empty if the page needs no closing text.',
    cards: 'Drag a card by its dots to change the order; the bin removes it.',
    cities: 'Each city: its name and the page it opens.',
    siteLogo: 'The logo of the website. Now: the Meruka logo. Choose a picture to use another logo in the header and the footer; remove it to go back to the Meruka logo.',
    logoHeader: 'What the top of every page shows.', logoFooter: 'What the footer shows.', siteName: 'The name beside the logo at the top.', footerName: 'The name beside the logo in the footer.'
  };
    const label = k => LABELS[k + '_' + E.kind] || LABELS[k] || String(k).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/^./, c => c.toUpperCase());

  // ---------- tabs for each kind of page ----------
  const GOOGLE = ['title', 'description', 'keywords', 'focusKeyword', 'noindex', 'ogImage', 'nofollow', 'canonical', 'ogTitle', 'ogDescription', 'twTitle', 'twDescription', 'twImage', 'nosnippet', 'noimageindex', 'noarchive', 'noshare'];
  // (28 Oct 2026, client) every page has its SEO tab again: tours, categories, pages, posts and the fixed pages
  const SEO_TAB = 'SEO';
  const TABS = {
    // (26 Oct 2026, client) the banner sits in Basic info; the breadcrumb is made automatically, so it has no tab
    // (26 Oct 2026, client video II) one photo per tour; the banner is its category's; route and length come from the days
    // (27 Oct 2026, client) no Google tab for now; the prices (the box beside the days) apart from the includes and notes
    // (2 Nov 2026, client) the tour's description under its title, the line under the prices and the price box's "Price includes"
    tours: [['Basic info', ['heading', 'photo', 'route', 'duration', 'summary'], ''], ['Day by day', ['days'], ''],
      ['Prices', ['details', 'priceIncludes', 'priceLine'], ''], [SEO_TAB, GOOGLE, '']],
    // a category's tours are chosen in each tour (its Categories tab), so the category only needs its text and banner
    // (2 Nov 2026, client) a category: its title, tour type, short description and banner; no closing text, no menu group
    lists: [['Basic info', ['heading', 'intro', 'heroSrc', 'heroAlt'], ''], [SEO_TAB, GOOGLE, '']],
    // (4 Nov 2026, client) a destination page has two photos: the banner on top of its own page, and the photo of its card
    // in the list on its region / state page
    pages: [['Text', ['heading', 'html', 'guideSection', 'heroSrc', 'listPhoto', 'heroAlt'], ''],
      ['Tours', ['tours'], 'The four tour cards under the page text (“Tours that include …”). Leave it empty and the website picks four tours that pass through this place by itself. Choose up to four tours here to show those instead, in this order.'], [SEO_TAB, GOOGLE, '']],
    // (5 Nov 2026, client) a post: its first lines in "Introduction", then its sections (text, highlight box or tip) in "Sections"
    posts: [['Post', ['heading', 'category', 'date', 'author', 'photo', 'photoAlt', 'excerpt'], 'The title, date and summary shown in the list of posts.'], ['Introduction', ['html'], 'The first lines of the post, before its sections. The parts with a heading are in the “Sections” tab.'], [SEO_TAB, GOOGLE, '']],
    // (26 Oct 2026, client) the home page section by section, in the order the website shows them
    home: [['Banner', ['heroTitle', 'heroSlides'], 'The big title and the photos at the top of the home page.'], ['Figures', ['stats'], 'The band under the banner.'],
      ['Best Tour Packages', ['secPackages'], 'The first row of cards. Each card is a tour category: choose the category and its name, photo and lowest price come by themselves.'],
      ['Seasonal offer', ['offer'], 'The yellow offer band under the first row of cards (e.g. 10% off for bookings from April to September). Untick “Show” to hide it.'],
      ['Most Popular Tours', ['secPopular'], 'The heading and notes. The tour cards are the first tour of each main category, so they change by themselves.'],
      ['Chalk out your own tour', ['secOwnTour'], 'The “Chalk Out Your Own Private Tour” band: the price per couple per day and what is included.'],
      ['Four Regions', ['secRegions'], 'The four region cards and their popular cities. The line of states under them comes from the Destinations menu by itself.'],
      ['Travel Guide', ['secGuide', 'guideCols'], 'The heading, the big photo with its season note, and the three cards. The links in each card are the pages of Travelers Guide, Attractions of India and Travel Tools: add or change pages there and they show here by themselves.'],
      ['Why Choose Us', ['secWhy'], 'Also shown on the About us page.']],
    // (27 Oct 2026, client) the FAQs page: its questions (the first ones show on the home page too) and the steps
    faqs: [['Questions & answers', ['secFaq', 'faqs'], 'The heading of the FAQs and every question with its answer. The home page shows the first ones.'],
      ['How we work', ['steps'], 'The steps from the first email to the airport, shown beside the FAQs.']],
    // (27 Oct 2026, client) the About and Contact pages as one page each, top to bottom
    about: [['About us page', ['heroSrc', 'leadName', 'paragraphs', 'mission', 'founder', 'atithi'], 'The page from top to bottom: the banner photo, the opening text, the mission, the founder and Atithi Devo Bhava. “Why choose us” on this page is edited in Home page → Why Choose Us.']],
    contact: [['Contact page', ['hqBlock'], 'The address box on the Contact page.'], ['Offices', ['offices'], 'Every office. The first one is the head office: its first phone number is used for WhatsApp and in the footer.']],
    menus: [['Header', ['headerMenu'], 'The menu at the top of every page.'], ['Footer', ['footerCols', 'seoLinks'], 'The link columns and the popular searches at the bottom of every page.']],
    // (26 Oct 2026, client) the reviews as a list with a search, like the tours; the page's own text apart
    // the reviews themselves are edited in the Guest reviews table (/admin/reviews); this is the page's own text
    reviews: [['Page text', ['heading', 'intro', 'closing'], 'The title and the text above and below the reviews on the Guest Reviews page. The reviews are changed in Guest reviews.']],
    plan: [['Form fields', ['form'], 'The words above each field of the Plan My Trip form, and which optional fields show. Name, email, country and the message are always asked.'],
      ['Choices', ['titles', 'countries', 'months', 'years', 'days', 'adults', 'children', 'hotelBudget', 'hotelCategory'], 'The choices in the drop-down lists, one per line.']],
    header: [['Header menu', ['headerMenu'], 'The links at the top of every page, left to right. “+ Add pages from the website” lets you tick pages; “+ Add a custom link” is for anything else.']],
    footer: [['Logo & about', ['siteLogo', 'logoHeader', 'siteName', 'logoFooter', 'footerName', 'footerAbout'], 'The logo at the top of every page and in the footer, and the short text under the footer logo.'],
      ['Link columns', ['footerCols'], 'Each column has a title and its links. Open a column to change its links: “+ Add pages from the website” to tick pages, “+ Add a custom link” for anything else.'],
      ['Popular searches', ['popularSearches'], 'The line of search words at the very bottom of every page: each word and the page it opens.'],
      ['Social media', ['footerSocial'], 'Paste the address of each profile. Its icon shows in the footer once the address is filled in.']],
    // (6 Nov 2026, client) first: rules for the whole website (keep it out of Google for now, and the rest)
    seo: [['Search engines', ['siteNoindex', 'siteNofollow', 'siteNosnippet', 'siteNoimageindex', 'siteNoarchive', 'siteNoAi', 'siteNoShare'], 'Rules for the whole website, on top of each page’s own (a page’s SEO panel → Rules for search engines). While the website is being made, tick “Keep every page out of Google for now”; untick it when the website goes live.'],
      ['Search Console & Analytics', ['googleVerification', 'googleAnalytics', 'bingVerification'], 'Connect the website to Google’s free tools to see how people find you.'],
      ['Main pages in Google', ['pages'], 'The Google title and description of the Home, About, Contact, Guest Reviews and Plan My Trip pages.'],
      ['Share picture', ['defaultShareImage'], ''], ['Redirects', ['redirects'], '']]
  };

  // ---------- recognising the data's shapes ----------
  const isSeg = v => v && typeof v === 'object' && !Array.isArray(v) && typeof v.text === 'string' && Object.keys(v).every(k => ['text', 'bold', 'italic', 'underline', 'href'].includes(k));
  const isSegs = v => Array.isArray(v) && v.length > 0 && v.every(isSeg);
  // a link written as a pair [text, link] (footer columns) or [name, link, photo] (destinations by state)
  const isLinkRow = v => Array.isArray(v) && v.length >= 2 && v.length <= 3 && v.every(x => typeof x === 'string') && (v[1] === '' || /^(\/|https?:|#|mailto:|tel:)/.test(v[1]));
  // a link as an object: { label, href } (header menu) or { name, href } (social media)
  const isLinkObj = v => v && typeof v === 'object' && !Array.isArray(v) && 'href' in v && Object.keys(v).every(k => ['label', 'name', 'href', 'line'].includes(k));
  const isParas = v => Array.isArray(v) && v.length > 0 && v.every(p => Array.isArray(p) && p.every(isSeg));
  const IMG_KEY = /^(img|image|photo|heroSrc|src|logo|icon|thumb|ogImage|twImage|defaultShareImage)$|(Img|Src|Photo|Logo)$/;
  const isImg = (k, v) => typeof v === 'string' && (IMG_KEY.test(k) || /^\/.*\.(webp|jpe?g|png|gif|avif)$/i.test(v));
  const LONG = /^(description|intro|text|quote|a|note|closing|mission|html|line|lead|summary|body|desc|sub)$/i;
  const segText = segs => segs.map(s => s.bold && s.text.trim() ? '**' + s.text + '**' : s.text).join('');
  const textSeg = str => String(str).split(/(\*\*[^*]+\*\*)/).filter(x => x !== '').map(x => /^\*\*[^*]+\*\*$/.test(x) ? { text: x.slice(2, -2), bold: true } : { text: x, bold: false });
  const blank = v => Array.isArray(v) ? (isSegs(v) ? [{ text: '', bold: false }] : v.length && v.every(x => typeof x === 'string') && !isLinkRow(v) ? v.map(() => '') : v.length && isLinkRow(v[0]) ? [v[0].map(() => '')] : isLinkRow(v) ? v.map(() => '') : []) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)])) : typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : '';
  const summary = v => {
    if (v == null) return '';
    if (typeof v !== 'object') return String(v);
    if (isSegs(v)) return segText(v).replace(/\*\*/g, '');
    if (isLinkRow(v)) return v[0] + '  →  ' + v[1];
    if (Array.isArray(v)) return v.length ? (v.every(x => typeof x === 'string') ? v.filter(Boolean).slice(0, 3).join(', ') + (v.length > 3 ? ' …' : '') : v.length + ' items') : '';
    const pick = ['day', 'title', 'name', 'label', 'heading', 'q', 'place', 'region', 'city', 'from', 'to', 'tour', 'text', 'quote', 'alt'].filter(k => typeof v[k] === 'string' && v[k].trim());
    return pick.slice(0, 2).map(k => v[k]).join(' — ').replace(/<[^>]+>/g, '');
  };
  const touch = () => { if (!dirty) { dirty = true; state.textContent = '● Unsaved changes'; state.classList.add('dirty'); } refreshGoogle(); };

  // (3 Nov 2026) the text editor (toolbar, links, photos, tables) lives in rte.js, shared with the other pages of the panel
  const { rte, toolbar, tbState, keyCmd, askLink, linkAt, loadLinks, LK, lkKind, lkName } = window.MKRTE;
  window.MKRTE.setTouch(() => touch());
  // ---------- field builders: each returns { el, get } ----------
  function field(key, value, depth, inList) {
    if (key === 'html' && typeof value === 'string') return rte(value);
    if (key === 'tours' && E.kind === 'pages') return tourPicker(value || []);
    // (3 Nov 2026, client) every text box with formatting uses the same full editor
    if (key === 'intro' && E.kind === 'lists') return rte(typeof value === 'string' ? value : (value || []).map(p => '<p>' + window.MKRTE.segHtml(p) + '</p>').join(''), { min: 110 });
    if (key === 'note' && E.kind === 'tours' && depth > 0) return rte(typeof value === 'string' ? (/</.test(value) ? value : value ? '<p>' + A.esc(value.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')) + '</p>' : '') : (value || []).length ? '<p>' + window.MKRTE.segHtml(value) + '</p>' : '', { min: 70 });
    if (key === 'tourType' && E.kind === 'lists') { const c = input(value || '', 'text', x => x.trim()); c.el.placeholder = 'e.g. Private Tour'; c.el.setAttribute('list', 'mk-tourtypes'); if (!document.getElementById('mk-tourtypes')) document.body.insertAdjacentHTML('beforeend', '<datalist id="mk-tourtypes"><option value="Private Tour"><option value="Private Tours · No Sharing"><option value="Group Tour"><option value="Self-drive Tour"></datalist>'); return c; }
    // (2 Nov 2026, client) a category's group in the tour menu (and its place on /itineraries)
    if (key === 'navGroup' && E.kind === 'lists') {
      const el = document.createElement('select'); el.className = 'in'; el.onchange = touch;
      const fixed = current && current.navFixed, opts = (current && current.navGroups) || [];
      el.innerHTML = fixed ? '<option>' + A.esc(fixed) + '</option>' : opts.map(o => '<option' + (o === value ? ' selected' : '') + '>' + A.esc(o) + '</option>').join('') + '<option value=""' + (!value ? ' selected' : '') + '>Not in the menu: only its own page</option>';
      if (fixed) { el.disabled = true; el.title = 'The categories of the original website keep their place in the menu'; }
      return { el, get: () => fixed ? (value || '') : el.value };
    }
    // (27 Oct 2026, client) a list of words (choices, phone numbers, address lines, paragraphs): one box, one per line
    if (!inList && Array.isArray(value) && value.length && value.every(x => typeof x === 'string') && !isLinkRow(value)) return linesBox(key, value);
    // a short row of words inside a list (e.g. “Visa | e-Visa … | link”): its boxes side by side
    if (inList && Array.isArray(value) && value.length >= 2 && value.length <= 4 && value.every(x => typeof x === 'string') && !isLinkRow(value)) return tupleRow(value);
    if (key === 'noindex') return toggle(value);
    if (key === 'date' && typeof value === 'string') return input(value, 'date', x => x);
    // (4 Nov 2026, client) a tour's route is always one line, the same box on every tour (a long route scrolls in it)
    // (4 Nov 2026, client) …written in a text area: as wide as every box, one line high, taller by itself when the route
    // runs onto a second line (Enter does not break it: a route is one line of places)
    if (key === 'route' && E.kind === 'tours' && typeof value === 'string') {
      const t = textBox(value, x => x.replace(/\s*\n\s*/g, ' ').trim(), 1), ta = t.input;
      ta.classList.add('ta-auto');
      const fit = () => { if (!ta.offsetParent) return; ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 2 + 'px'; };
      ta.addEventListener('input', fit);
      ta.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
      if ('IntersectionObserver' in window) new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) fit(); }).observe(ta);
      window.addEventListener('resize', fit);
      return t;
    }
    // a tour's banner: empty means "use its category's banner" (the old shared banner counts as empty)
    // (27 Oct 2026, client) a tour without its own photo shows the one the website picks for it
    if (key === 'photo' && depth === 0 && (E.kind === 'tours' || E.kind === 'lists') && current && current.thumb && !current.isNew) return image(value, () => current.thumb);
    if (key === 'heroSrc' && E.kind === 'tours') return image(value === '/images/india-tours-main.webp' ? '' : value);
    if (key === 'listPhoto' && E.kind === 'pages') return image(value || '', () => (current && current.listImg) || (getters.heroSrc ? getters.heroSrc() : '') || (current && current.bannerAuto) || '');
    // (4 Nov 2026, client) a page's banner shows as the website shows it: the imported same-everywhere banner counts as
    // "not chosen", and the photo of the place shows in its place
    if (key === 'heroSrc' && E.kind === 'pages' && current && current.group === 'places') return image(/india-tours-main/.test(value || '') ? '' : value || '', () => current.bannerAuto || '');
    // (27 Oct 2026, client) a few lines, one per line ("What is included", "You can also")
    if (/^(included|extras|priceIncludes)$/.test(key) && Array.isArray(value) && value.every(x => typeof x === 'string')) {
      const t = textBox(value.join('\n'), x => x.split('\n').map(l => l.trim()).filter(Boolean), Math.max(3, value.length)); t.input.placeholder = key === 'priceIncludes' ? PRICE_INC.join('\n') : 'One point per line'; return t;
    }
    // the tour's own wording, or (grey) what the website writes by itself
    if (key === 'summary' && E.kind === 'tours') return rte(value || '');
    // (4 Nov 2026, client) the line beside "Starts from": the full text editor, like the page text; {hotel} still becomes
    // the hotel class the visitor picks
    if (key === 'priceLine' && E.kind === 'tours') { const v = String(value || '').trim() || PRICE_LINE; return rte(/</.test(v) ? v : '<p>' + A.esc(v) + '</p>', { min: 70 }); }
    // (6 Nov 2026, client) the logo box shows the Meruka logo the website uses while no picture is chosen
    if (key === 'siteLogo') { const c = image(value, () => '/assets/logo_meruka.webp', ['Logo now on the website', 'The Meruka logo — click it to choose another picture']); c.el.classList.add('img-logo'); return c; }
    // (6 Nov 2026, client) the header / the footer: logo and name, only the logo, or only the name
    if (key === 'logoHeader' || key === 'logoFooter') {
      const el = document.createElement('div'); el.className = 'seg'; el.setAttribute('role', 'radiogroup');
      let v = ['both', 'logo', 'name'].includes(value) ? value : 'both';
      const OPTS = [['both', 'Logo and name'], ['logo', 'Only the logo'], ['name', 'Only the name']];
      const draw = () => { el.innerHTML = OPTS.map(([k, n]) => '<button type="button" role="radio" aria-checked="' + (k === v) + '" class="' + (k === v ? 'on' : '') + '" data-v="' + k + '">' + n + '</button>').join(''); };
      el.onclick = e => { const b = e.target.closest('[data-v]'); if (!b || b.dataset.v === v) return; v = b.dataset.v; draw(); touch(); };
      draw(); return { el, get: () => v };
    }
    if (isImg(key, value)) return image(value);
    if (key === 'details' && Array.isArray(value) && value.length && value.every(b => b && typeof b === 'object' && Array.isArray(b.items))) return detailsEditor(value);
    if (isParas(value)) return richText(value, false);
    if (isSegs(value)) return richText([value], true);
    if (isLinkRow(value)) return linkRow(value);
    if (/^(items|intro|outro|paras)$/.test(key) && Array.isArray(value) && value.length === 0) return richText([], false);
    if (Array.isArray(value)) return list(key, value, depth);
    if (value && typeof value === 'object') return group(value, depth);
    if (typeof value === 'number') return input(value, 'number', v => v === '' ? 0 : +v);
    if (typeof value === 'boolean') return check(value);
    const s = value == null ? '' : String(value);
    if (/^(href|to|link|list|buttonLink)$/.test(key) && !s.includes('\n')) { const c = input(s, 'text', x => x); pageLink(c.el); return c; }
    if (key === 'sub' && s.length < 70 && !s.includes('\n')) return input(s, 'text', x => x);
    // a page can sit in a section of the India Travel Guide: it then shows there by itself
    if (key === 'guideSection') {
      const el = document.createElement('select'); el.className = 'in'; el.onchange = touch;
      const opts = ['', 'Travelers Guide', 'Attractions of India', 'Travel Tools'];
      if (s && !opts.includes(s)) opts.push(s);
      el.innerHTML = opts.map(o => '<option value="' + A.esc(o) + '"' + (o === s ? ' selected' : '') + '>' + (o ? A.esc(o) : 'Not in the India Travel Guide') + '</option>').join('');
      return { el, get: () => el.value };
    }
    // (6 Nov 2026, client) a post's category: choose one of the blog's categories, or "+ New category…" makes one here
    if (key === 'category' && E.kind === 'posts') {
      const el = document.createElement('select'); el.className = 'in';
      let cats = s ? [s] : [];
      const NEW = '__new_category__';
      const draw = v => {
        el.innerHTML = '<option value="">Choose a category…</option>' + cats.map(c => '<option value="' + A.esc(c) + '"' + (c === v ? ' selected' : '') + '>' + A.esc(c) + '</option>').join('') + '<option value="' + NEW + '">+ New category…</option>';
        el.dataset.was = v || '';
      };
      draw(s);
      A.api('GET', '/admin/api/blog-categories').then(r => { cats = [...new Set((r.items || []).concat(s ? [s] : []))].sort((a, b) => a.localeCompare(b)); draw(el.dataset.was); }).catch(() => {});
      el.onchange = async () => {
        if (el.value !== NEW) { el.dataset.was = el.value; touch(); return; }
        const box = await A.dialog({ title: 'New blog category', ok: 'Add category', html: '<label class="lb">Name of the category</label><input class="in" data-c placeholder="e.g. Wildlife, Food, Travel tips">',
          onOpen: b => setTimeout(() => b.querySelector('[data-c]').focus(), 50),
          validate: b => b.querySelector('[data-c]').value.trim() ? '' : 'Please type a name.' });
        if (!box) { draw(el.dataset.was); return; }
        const name = box.querySelector('[data-c]').value.trim().replace(/\s+/g, ' ').slice(0, 60);
        const same = cats.find(c => c.toLowerCase() === name.toLowerCase());
        if (!same) cats = cats.concat(name).sort((a, b) => a.localeCompare(b));
        draw(same || name); touch();
        A.toast(same ? '“' + same + '” is already a category: chosen' : 'Category “' + name + '” added. It shows on the blog once this post is published.');
      };
      return { el, get: () => el.value === NEW ? el.dataset.was : el.value };
    }
    return LONG.test(key) || s.length > 90 || s.includes('\n') ? textBox(s, x => x, s.length > 400 ? 8 : key === 'sub' || s.length < 60 ? 2 : 3) : input(s, 'text', x => x);
  }
  function linesBox(key, arr) {   // returns isLines, so two of them can share a row
    const long = arr.some(x => x.length > 120), sep = long ? '\n\n' : '\n';
    const t = textBox(arr.join(sep), x => x.split(long ? /\n\s*\n/ : /\n/).map(l => l.trim()).filter(Boolean), long ? Math.min(14, arr.length * 4) : Math.min(10, Math.max(3, arr.length)));
    t.input.placeholder = long ? 'Leave an empty line between two paragraphs' : 'One per line';
    t.el.insertAdjacentHTML('beforeend', '<p class="fhelp lines-n">' + (long ? arr.length + ' paragraphs — leave an empty line between two paragraphs' : arr.length + ' lines — one per line') + '</p>');
    t.input.addEventListener('input', () => { const n = t.get().length; t.el.querySelector('.lines-n').textContent = n + (long ? ' paragraphs — leave an empty line between two paragraphs' : ' lines — one per line'); });
    t.isLines = !long; return t;
  }
  function tupleRow(v) {
    const el = document.createElement('div'); el.className = 'tp-row'; el.style.setProperty('--n', v.length);
    const parts = v.map(x => { const c = /^(https?:|\/)/.test(x) ? (y => { pageLink(y.el); return y; })(input(x, 'text', y => y.trim())) : x.length > 60 ? textBox(x, y => y, 2) : input(x, 'text', y => y); el.appendChild(c.el); return c; });
    return { el, get: () => parts.map(c => c.get()) };
  }
  function input(v, type, read) {
    const el = document.createElement('input'); el.className = 'in'; el.type = type; el.value = v; el.oninput = touch;
    return { el, get: () => read(el.value) };
  }
  // text with bold, italic, underlined and linked words: what you see is what the website shows.
  // Paragraphs come back as lists of { text, bold, italic?, underline?, href? } pieces; one=true gives one paragraph.
  function richText(paras, one) {
    const wrap = document.createElement('div'); wrap.className = 'rt';
    const bar = toolbar([['bold', 'italic', 'underline'], ['link', 'unlink'], ['undo', 'redo', 'clear']]);
    const ed = document.createElement('div'); ed.className = 'in rich-p' + (one ? ' one' : ''); ed.contentEditable = 'true'; ed.spellcheck = true;
    const segHtml = x => { let h = A.esc(x.text); if (x.italic) h = '<i>' + h + '</i>'; if (x.underline) h = '<u>' + h + '</u>'; if (x.bold) h = '<b>' + h + '</b>'; if (x.href) h = '<a href="' + A.esc(x.href) + '">' + h + '</a>'; return h; };
    ed.innerHTML = paras.map(p => '<p>' + (p.map(segHtml).join('') || '<br>') + '</p>').join('') || '<p><br></p>';
    const picked = () => { const r = getSelection(); return r.rangeCount && !r.isCollapsed && ed.contains(r.anchorNode); };
    bar.onclick = async e => {
      const b = e.target.closest('button'); if (!b) return;
      const c = b.dataset.c; ed.focus();
      if (c === 'link') {
        const a = linkAt(ed);
        if (a) { const url = await askLink(a.getAttribute('href') || '', a.textContent); if (url) a.setAttribute('href', url); ed.focus(); }
        else {
          if (!picked()) return A.toast('First select the words to turn into a link');
          const r = getSelection().getRangeAt(0).cloneRange(), url = await askLink('', r.toString());
          if (url) { ed.focus(); const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand('createLink', false, url); }
        }
      } else if (c === 'clear') { if (!picked()) return A.toast('First select the words'); document.execCommand('removeFormat'); document.execCommand('unlink'); }
      else document.execCommand(c);
      touch();
    };
    const st = tbState(bar, ed);
    ed.oninput = touch;
    ed.onpaste = e => { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain')); };
    ed.onkeydown = e => {
      if (one && e.key === 'Enter') e.preventDefault();
      const c = keyCmd(e); if (!c || !bar.querySelector('[data-c="' + c + '"]')) return;
      e.preventDefault(); bar.querySelector('[data-c="' + c + '"]').click(); setTimeout(st, 0);
    };
    const styleOf = (n, block) => {
      const st = { bold: false, italic: false, underline: false, href: '' };
      for (let el = n.parentNode; el && el !== block; el = el.parentNode) {
        const nm = el.nodeName, fs = el.style || {};
        if (/^(B|STRONG)$/.test(nm) || fs.fontWeight === 'bold' || +fs.fontWeight >= 600) st.bold = true;
        if (/^(I|EM)$/.test(nm) || fs.fontStyle === 'italic') st.italic = true;
        if (nm === 'U' || /underline/.test(fs.textDecoration || '')) st.underline = true;
        if (nm === 'A' && !st.href) st.href = el.getAttribute('href') || '';
      }
      return st;
    };
    const same = (a, b) => a.bold === b.bold && !!a.italic === !!b.italic && !!a.underline === !!b.underline && (a.href || '') === (b.href || '');
    const piece = (text, st) => { const o = { text, bold: st.bold }; if (st.italic) o.italic = true; if (st.underline) o.underline = true; if (st.href) o.href = st.href; return o; };
    const get = () => {
      const blocks = []; let loose = null;
      ed.childNodes.forEach(n => {
        if (/^(P|DIV|H\d|LI|UL|OL|BLOCKQUOTE)$/.test(n.nodeName)) { loose = null; blocks.push(n); }
        else { if (!loose) { loose = document.createElement('p'); blocks.push(loose); } loose.appendChild(n.cloneNode(true)); }
      });
      const out = blocks.map(block => {
        const segs = [];
        const add = (text, st) => { const last = segs[segs.length - 1]; if (last && same(last, st)) last.text += text; else if (text) segs.push(piece(text, st)); };
        const walk = n => n.childNodes.forEach(ch => {
          if (ch.nodeType === 3) add(ch.nodeValue.replace(/ /g, ' '), styleOf(ch, block));
          else if (ch.nodeName === 'BR') add(' ', { bold: false });
          else walk(ch);
        });
        walk(block);
        return segs.map(x => Object.assign({}, x, { text: x.text.replace(/\s+/g, ' ') }));
      }).filter(p => p.some(x => x.text.trim()));
      out.forEach(p => { p[0].text = p[0].text.replace(/^\s+/, ''); p[p.length - 1].text = p[p.length - 1].text.replace(/\s+$/, ''); });
      const clean = p => p.filter(x => x.text);
      if (one) return out.length ? clean(out.reduce((a, p) => a.concat(a.length ? [{ text: ' ', bold: false }] : [], p), [])) : [{ text: '', bold: false }];
      return out.map(clean);
    };
    wrap.appendChild(bar); wrap.appendChild(ed);
    return { el: wrap, input: ed, get };
  }
  // (26 Oct 2026, client) a tour's prices as a small form — hotel class from a list, prices in boxes — and what the tour
  // includes, excludes and the notes as lists written like in Word. A price line that is not changed is kept word for word.
  const PRICE_RE = /^\s*(.+?):\s*(USD|US\$|\$)?\s*([\d,]+)\s*(?:[-–]\s*(?:USD|US\$|\$)?\s*([\d,]+))?\s*(\+?)\s*(.*)$/i;
  const HOTEL_CLASSES = ['3-Star', '4-Star', '5-Star', '5-Star Deluxe', 'Heritage', 'Standard', 'Superior', 'Deluxe', 'Premium', 'Luxury'];
  // (27 Oct 2026, client) one plain table for the prices (no box in a box): hotel class from a list, From and To in USD,
  // "+" after the price, and what the price is for. The includes, excludes and notes are given apart (their own tab).
  function detailsEditor(blocks) {
    const el = document.createElement('div'); el.className = 'px';
    const isPrice = b => /pric|cost/i.test(b.title || '');
    const pb = blocks.find(isPrice) || { title: 'Tour Pricing Details', text: '', items: [] };
    el.innerHTML = '<div class="f"><label class="lb lb-s">Paragraph at the top of the price box</label></div><p class="lb lb-s px-cap">Hotels and prices <span>per person per day — the website multiplies them by the nights</span></p>' +
      '<div class="px-t"><div class="px-hd"><span>Hotel class</span><span>From (USD)</span><span>To (USD)</span><span title="Shows the price as $250+">Add “+”</span><span>The price is</span><span></span></div><div data-rows></div></div>' +
      '<div class="chips"><button type="button" class="btn btn-s" data-add>+ Add a hotel class</button></div>';
    const intro = rte(pb.text || '', { min: 70 });
    el.querySelector('.f').appendChild(intro.el);
    const rowsEl = el.querySelector('[data-rows]'), rows = [];
    const num = v => String(v || '').replace(/[^\d]/g, '');
    const addRow = (segs, open) => {
      const text = (segs || []).map(x => x.text).join(''), m = PRICE_RE.exec(text);
      const r = document.createElement('div'); r.className = 'px-row';
      if (segs && !m) {   // a line in another form: kept as it is, editable as text
        const t = richText([segs], true); r.appendChild(t.el); r.classList.add('px-free');
        rows.push({ r, get: () => t.get() });
      } else {
        const v = m ? { cls: m[1].trim(), cur: m[2] || '$', from: num(m[3]), to: num(m[4]), plus: !!m[5], per: m[6].trim() || 'per person per day' } : { cls: '', cur: '$', from: '', to: '', plus: false, per: 'per person per day' };
        const classes = HOTEL_CLASSES.concat(v.cls && !HOTEL_CLASSES.includes(v.cls) ? [v.cls] : []);
        r.innerHTML = '<select class="in" data-cls aria-label="Hotel class"><option value="">Choose…</option>' + classes.map(h => '<option>' + A.esc(h) + '</option>').join('') + '</select>' +
          '<input class="in" inputmode="numeric" data-from placeholder="85" aria-label="From (USD)">' +
          '<input class="in" inputmode="numeric" data-to placeholder="optional" aria-label="To (USD)">' +
          '<label class="px-plus" title="Shows the price as $250+"><input type="checkbox" data-plus><span>+</span></label>' +
          '<select class="in" data-per aria-label="The price is"><option>per person per day</option><option>per person per night</option><option>per person</option></select>';
        const q = s => r.querySelector(s);
        q('[data-cls]').value = v.cls; q('[data-from]').value = v.from; q('[data-to]').value = v.to; q('[data-plus]').checked = v.plus;
        if (![...q('[data-per]').options].some(o => o.value === v.per)) q('[data-per]').insertAdjacentHTML('beforeend', '<option>' + A.esc(v.per) + '</option>');
        q('[data-per]').value = v.per;
        const pack = () => { const from = num(q('[data-from]').value), to = num(q('[data-to]').value), cur = v.cur === 'USD' ? 'USD ' : v.cur;
          return [{ text: q('[data-cls]').value.trim() + ':', bold: true }, { text: ' ' + cur + from + (to ? ' - ' + cur + to : '') + (q('[data-plus]').checked ? '+' : '') + ' ' + q('[data-per]').value, bold: false }]; };
        const same = () => segs && q('[data-cls]').value.trim() === v.cls && num(q('[data-from]').value) === v.from && num(q('[data-to]').value) === v.to && q('[data-plus]').checked === v.plus && q('[data-per]').value === v.per;
        r.addEventListener('input', touch); r.addEventListener('change', touch);
        rows.push({ r, get: () => same() ? segs : pack(), empty: () => !q('[data-cls]').value.trim() && !num(q('[data-from]').value) });
      }
      const x = document.createElement('button'); x.type = 'button'; x.className = 'px-x'; x.title = 'Remove this hotel class';
      x.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
      x.onclick = () => { rows.splice(rows.findIndex(o => o.r === r), 1); r.remove(); touch(); };
      r.appendChild(x); rowsEl.appendChild(r);
      if (open) r.querySelector('select,input').focus();
    };
    (pb.items || []).forEach(s => addRow(s));
    if (!(pb.items || []).length) addRow(null);
    el.querySelector('[data-add]').onclick = () => { addRow(null, true); touch(); };
    // includes, excludes, notes (and any other block): each a heading and its points, in a tab of their own
    const more = document.createElement('div'); more.className = 'px-more';
    const others = blocks.filter(b => b !== pb).map(b => {
      const sec = document.createElement('div'); sec.className = 'px-sec';
      sec.innerHTML = '<h3>' + A.esc(b.title || '') + '</h3>';
      let tx = null;
      if (b.text) { tx = textBox(b.text, x => x, 2); const f = document.createElement('div'); f.className = 'f'; f.innerHTML = '<label class="lb">Text above the points</label>'; f.appendChild(tx.el); sec.appendChild(f); }
      // (3 Nov 2026, client) the same full editor as everywhere, as a list of points (Enter starts the next point)
      const t = rte('<ul>' + (b.items || []).map(it => '<li>' + window.MKRTE.segHtml(it) + '</li>').join('') + '</ul>', { list: true, min: 120 }); sec.appendChild(t.el);
      more.appendChild(sec);
      return { b, get: () => Object.assign({}, b, { text: tx ? tx.get() : b.text, items: t.get().map(window.MKRTE.segs) }) };
    });
    const priceOut = () => Object.assign({}, pb, { text: intro.get(), items: rows.filter(o => !(o.empty && o.empty())).map(o => o.get()) });
    return { el, more: others.length ? more : null, get: () => blocks.map(b => b === pb ? priceOut() : others.find(o => o.b === b).get()).concat(blocks.includes(pb) ? [] : [priceOut()]) };
  }
  // (2 Nov 2026, client) a region page's place cards (Delhi, Haryana … each with a photo, its name, a short text and its
  // page) sit in the page text as a list; they get a tab of their own, as cards with a photo you can change, and the text
  // keeps only a marker where they show. On saving, the cards go back into the text in the website's own shape.
  // Imported thumbnails show the large photo the website uses for them (article.js), so what you see is what shows.
  const BIG_PHOTO = { 'delhi': '/photos/delhi-red-fort.webp', 'himachal pradesh': '/photos/manali-balloon.webp', 'jammu & kashmir': '/photos/ladakh-pangong.webp',
    'punjab': '/photos/golden-temple-amritsar.webp', 'rajasthan': '/photos/hawa-mahal-dusk.webp', 'uttar pradesh': '/photos/taj-mahal-wide.webp',
    'lakshadweep': '/photos/lakshadweep-hd.webp', 'karnataka': '/photos/mysore-palace.webp', 'kerala': '/photos/kerala-backwaters.webp', 'tamil nadu': '/photos/brihadeshwara-temple.webp',
    'arunachal pradesh': '/photos/arunachal-losar.webp', 'nagaland': '/photos/nagaland-festival.webp', 'west bengal': '/photos/darjeeling.webp',
    'gujarat': '/photos/gujarat.webp', 'goa': '/photos/goa-beach-palms.webp', 'madhya pradesh': '/photos/bengal-tiger.webp' };
  const cardItems = ul => { const lis = [...ul.children].filter(x => x.tagName === 'LI'); return lis.length >= 2 && lis.length === ul.children.length && lis.every(li => li.querySelector(':scope > a > img') && li.querySelector(':scope > p')) ? lis : null; };
  const absSrc = x => /^(https?:|\/|data:)/i.test(x) ? x : '/' + x.replace(/^\.?\//, '');
  // (3 Nov 2026, client) a page's link to the pages under it: by address ("delhi.htm", "/delhi" and "Delhi" all match)
  const baseOf = h => String(h || '').replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+/, '').replace(/\.(html?|aspx)$/i, '').toLowerCase();
  const kidOf = href => ((current && current.children) || []).find(c => baseOf(c.url) === baseOf(href));
  const kidRow = (x, tag) => '<div class="pc-row"><span class="pc-ph">' + (x.photo ? '<img src="' + A.esc(x.photo) + '" alt="" loading="lazy">' : '') + '</span><span class="pc-t"><b>' + A.esc(x.name) + '</b><small>' + A.esc(x.url || '') + (tag ? ' · <i>' + tag + '</i>' : '') + '</small></span>' +
    (x.id ? '<a class="btn btn-s" href="/admin/pages/' + encodeURIComponent(x.id) + '">Edit its page</a>' : '') + '</div>';
  // a region page's place cards (Delhi, Haryana …): made by the website from the region's state pages, so here only a
  // list of them; a state page added under the region shows there by itself
  function cardsTab(panesAdd) {
    const ed = comps.html && comps.html.el.querySelector('.rte'); if (!ed) return;
    const ul = [...ed.querySelectorAll('ul')].find(cardItems); if (!ul) return;
    const keep = ul.outerHTML;
    const cards = cardItems(ul).map(li => {
      const as = li.querySelectorAll(':scope > a'), img = li.querySelector(':scope > a > img'), name = ((as[1] || as[0]).textContent || '').trim(), src = img.getAttribute('src') || '', href = as[0].getAttribute('href') || '', k = kidOf(href);
      return { photo: (/^\/?images\//.test(src) && BIG_PHOTO[name.toLowerCase()]) || absSrc(src), name, url: k ? k.url : href, id: k ? k.id : '' };
    });
    const shown = new Set(cards.map(x => baseOf(x.url)));
    const extra = ((current && current.children) || []).filter(c => !shown.has(baseOf(c.url)) && c.published !== false);
    const mark = document.createElement('div'); mark.className = 'rte-cards'; mark.contentEditable = 'false'; mark.innerHTML = '<b>cards</b><span></span>';
    ul.replaceWith(mark);
    const card = document.createElement('section'); card.className = 'card'; card.hidden = true;
    card.innerHTML = '<p class="tab-intro">The places of this region, as the website shows them under “Places to explore”. They come from the state pages of this region: to change a card, edit its page. A state page added under this region shows here by itself.</p>' +
      '<div class="pc-list">' + cards.map(x => kidRow(x, '')).join('') + extra.map(c => kidRow({ name: c.name, url: c.url, id: c.id, photo: c.img }, 'added by itself')).join('') + '</div>';
    const get = comps.html.get;
    comps.html.get = getters.html = () => { const t = get(), m = /<div class="rte-cards"[^>]*>[\s\S]*?<\/span><\/div>/.exec(t); return m ? t.replace(m[0], keep) : t + '\n' + keep; };
    panesAdd('Places to explore', card);
  }
  // (3 Nov 2026, client) a state page's parts after its first text: each heading ("Places of Interest", "Reach",
  // "How to plan your tours" …) a section of its own — points (a name and its words, 1 / 2 / 3 in a row) or a text —
  // in order, each with "+ Add a section below"; the city parts (a heading, a few lines, Read More) come from the city
  // pages under the page, so here they are only listed
  const LAYOUTS = [['text', '', 'Text', 'A normal text'], ['points', '1', 'List · 1 in a row', 'Wide rows'], ['points', '2', 'List · 2 in a row', 'Two boxes side by side'], ['points', '3', 'List · 3 in a row', 'Three small boxes'], ['points', '', 'List · automatic', 'As many as fit']];
  const layoutPic = (kind, cols) => {
    const box = (x, y, w, h) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2"/>';
    let g = '';
    if (kind === 'text') g = '<path d="M6 9h36M6 15h36M6 21h28M6 27h32"/>';
    else { const n = +cols || 2, w = (36 - (n - 1) * 3) / n; for (let r = 0; r < 2; r++) for (let c = 0; c < n; c++) g += box(6 + c * (w + 3), 7 + r * 12, w, 9); }
    return '<svg viewBox="0 0 48 34" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' + g + '</svg>';
  };
  const layoutName = (kind, cols) => (LAYOUTS.find(l => l[0] === kind && l[1] === (cols || '')) || LAYOUTS[0])[2];
  // the layouts as tiles to pick from; resolves with [kind, cols] or null
  const pickLayout = async (title, now, withHeading) => {
    let pick = now || ['points', '2'];
    const box = await A.dialog({ title, ok: withHeading ? 'Add the part' : 'Use this layout',
      html: (withHeading ? '<label class="lb">Heading of the part</label><input class="in" data-h placeholder="e.g. Shopping, Food to try, Festivals"><label class="lb" style="margin-top:14px">How it looks on the website</label>' : '') +
        '<div class="lay-grid">' + LAYOUTS.filter(l => !now || l[0] === now[0] || withHeading).map(([k, c, n, d]) => '<button type="button" class="lay-tile" data-k="' + k + '" data-c="' + c + '">' + layoutPic(k, c) + '<b>' + n + '</b><small>' + d + '</small></button>').join('') + '</div>',
      onOpen: b => { const mark = () => b.querySelectorAll('.lay-tile').forEach(t => t.classList.toggle('on', t.dataset.k === pick[0] && t.dataset.c === pick[1])); b.querySelectorAll('.lay-tile').forEach(t => { t.onclick = () => { pick = [t.dataset.k, t.dataset.c]; mark(); }; }); mark(); b.closest('.modal-box').classList.add('lay-modal'); },
      validate: b => withHeading && !b.querySelector('[data-h]').value.trim() ? 'Write a heading for the part.' : '' });
    return box ? { kind: pick[0], cols: pick[1], heading: withHeading ? box.querySelector('[data-h]').value.trim() : '' } : null;
  };
  function sectionsTab(panesAdd) {
    const ed = comps.html && comps.html.el.querySelector('.rte'); if (!ed) return;
    const kids = [...ed.children], first = kids.findIndex(n => /^H[2-4]$/.test(n.nodeName));
    if (first < 0) return;
    const parts = [];
    let cur = null;
    kids.slice(first).forEach(n => {
      if (/^H[2-4]$/.test(n.nodeName)) { cur = { tag: n.nodeName.toLowerCase(), heading: n.textContent.trim(), cols: n.getAttribute('data-cols') || '', nodes: [] }; parts.push(cur); return; }
      if (cur && (n.textContent.trim() || n.querySelector('img'))) cur.nodes.push(n);
    });
    kids.slice(first).forEach(n => n.remove());
    const cityOf = pt => pt.nodes.length === 1 && pt.nodes[0].nodeName === 'P' && [...pt.nodes[0].querySelectorAll('a')].some(a => /read more/i.test(a.textContent));
    const pointsOf = pt => pt.nodes.length && pt.nodes.every(n => factOf(n) || (n.nodeName === 'P' && /^(STRONG|B)$/.test((n.firstElementChild || {}).nodeName || '') && /:\s*$/.test(n.firstElementChild.textContent)));
    const rowOf = n => { const st = n.firstElementChild; return { label: st.textContent.replace(/:\s*$/, '').trim(), value: n.textContent.slice(st.textContent.length).replace(/\s+/g, ' ').trim() }; };
    const card = document.createElement('section'); card.className = 'card'; card.hidden = true;
    card.innerHTML = '<p class="tab-intro">The parts of the page after its text, in order. A list part has rows (a name and its words) and a choice of how many boxes in a row; a text part is a normal text. Drag a part by its dots to move it.</p><div class="sx-list"></div>';
    const listEl = card.querySelector('.sx-list');
    const GRIP = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>';
    const secs = [];
    const addRowTo = (rows, r, focus) => {
      const el = document.createElement('div'); el.className = 'sx-row';
      el.innerHTML = '<input class="in" data-l placeholder="e.g. Moghul Monuments"><input class="in" data-v placeholder="e.g. Red Fort, Qutub Minar, Humayun’s Tomb"><button type="button" class="gl-x" title="Remove this row" aria-label="Remove this row">✕</button>';
      el.querySelector('[data-l]').value = r.label; el.querySelector('[data-v]').value = r.value;
      el.querySelectorAll('input').forEach(i => { i.oninput = touch; });
      el.querySelector('.gl-x').onclick = () => { el.remove(); touch(); };
      rows.appendChild(el); if (focus) el.querySelector('[data-l]').focus();
    };
    const makeSec = (pt, after) => {
      const box = document.createElement('div'); box.className = 'sx-sec sx-' + pt.kind; box.draggable = true;
      const sec = { box, pt };
      if (pt.kind === 'cities') {
        box.innerHTML = '<div class="sx-h"><span class="sx-grip" title="Drag to move">' + GRIP + '</span><b class="sx-title">Places on this page</b><span class="sx-kind sx-k-auto">From their own pages</span></div><p class="hint" style="margin:0 0 8px">Each place shows with its heading, a few lines and “Read More”. To change one, edit its page; a page added under this page shows here by itself.</p><div class="pc-list"></div>';
        const items = pt.items.map(x => { const k = kidOf(x.href); return { name: x.name, url: k ? k.url : x.href, id: k ? k.id : '', photo: k ? k.img : '' }; });
        const seen = new Set(items.map(x => baseOf(x.url)));
        const extra = ((current && current.children) || []).filter(c => !seen.has(baseOf(c.url)) && c.published !== false);
        box.querySelector('.pc-list').innerHTML = items.map(x => kidRow(x, '')).join('') + extra.map(c => kidRow({ name: c.name, url: c.url, id: c.id, photo: c.img }, 'added by itself')).join('');
        sec.get = () => pt.html;
      } else {
        box.innerHTML = '<div class="sx-h"><span class="sx-grip" title="Drag to move">' + GRIP + '</span><input class="in sx-title" placeholder="Heading of this part, e.g. Places of Interest">' +
          '<button type="button" class="sx-lay" title="' + (pt.kind === 'points' ? 'Change how the list looks' : 'A text part') + '"' + (pt.kind === 'points' ? '' : ' disabled') + '></button>' +
          '<span class="sx-more"><button type="button" class="sx-more-b" title="More" aria-label="More">⋯</button><span class="sx-menu" hidden><button type="button" data-m="up">Move up</button><button type="button" data-m="down">Move down</button><button type="button" data-m="below">Add a part below</button><button type="button" data-m="rm" class="x">Remove this part</button></span></span></div><div class="sx-b"></div><button type="button" class="sx-add-below">+ Add a part below</button>';
        const title = box.querySelector('.sx-title'); title.value = pt.heading; title.oninput = touch;
        title.addEventListener('mousedown', () => { box.draggable = false; }); title.addEventListener('blur', () => { box.draggable = true; });
        const b = box.querySelector('.sx-b');
        const lay = box.querySelector('.sx-lay');
        if (pt.kind === 'points') {
          let cols = pt.cols || '';
          const mark = () => { lay.innerHTML = layoutPic('points', cols) + '<span>' + layoutName('points', cols) + '</span>'; };
          lay.onclick = async () => { const r = await pickLayout('How “' + (title.value.trim() || 'this list') + '” looks', ['points', cols]); if (r) { cols = r.cols; mark(); touch(); } }; mark();
          b.innerHTML = '<div class="gl-head sx-gh"><span>Name</span><span>Its words</span></div><div class="sx-rows"></div><button type="button" class="btn btn-s" data-addrow>+ Add a row</button>';
          const rows = b.querySelector('.sx-rows');
          rows.addEventListener('mousedown', () => { box.draggable = false; }); rows.addEventListener('mouseup', () => { box.draggable = true; });
          pt.rows.forEach(r => addRowTo(rows, r));
          b.querySelector('[data-addrow]').onclick = () => { addRowTo(rows, { label: '', value: '' }, true); touch(); };
          sec.get = () => { const h = title.value.trim(); const rs = [...rows.children].map(r => ({ l: r.querySelector('[data-l]').value.trim(), v: r.querySelector('[data-v]').value.trim() })).filter(x => x.l || x.v);
            return h || rs.length ? '<' + pt.tag + ' data-type="points"' + (cols ? ' data-cols="' + cols + '"' : '') + '>' + A.esc(h) + '</' + pt.tag + '>\n' + rs.map(x => '<p>' + (x.l ? '<strong>' + A.esc(x.l) + ':</strong> ' : '') + A.esc(x.v) + '</p>').join('\n') : ''; };
        } else {
          lay.innerHTML = layoutPic('text') + '<span>Text</span>';
          const t = rte(pt.html || '', { min: 90 }); b.appendChild(t.el);
          b.addEventListener('mousedown', () => { box.draggable = false; }); b.addEventListener('mouseup', () => { box.draggable = true; });
          sec.get = () => { const h = title.value.trim(), x = t.html(); return h || x.replace(/<[^>]+>|&nbsp;/g, '').trim() ? '<' + pt.tag + (pt.typed ? ' data-type="text"' : '') + '>' + A.esc(h) + '</' + pt.tag + '>\n' + x : ''; };
        }
        const menu = box.querySelector('.sx-menu');
        box.querySelector('.sx-more-b').onclick = e => { e.stopPropagation(); document.querySelectorAll('.sx-menu').forEach(m => { if (m !== menu) m.hidden = true; }); menu.hidden = !menu.hidden; };
        menu.onclick = async e => {
          const m = (e.target.closest('[data-m]') || {}).dataset; if (!m || !m.m) return; menu.hidden = true;
          const i = secs.indexOf(sec);
          if (m.m === 'up' && i > 0) { secs[i - 1].box.before(box); secs.splice(i, 1); secs.splice(i - 1, 0, sec); touch(); }
          else if (m.m === 'down' && i < secs.length - 1) { secs[i + 1].box.after(box); secs.splice(i, 1); secs.splice(i + 1, 0, sec); touch(); }
          else if (m.m === 'below') addNew(sec);
          else if (m.m === 'rm') { if (!(await A.confirm('Remove “' + (title.value.trim() || 'this part') + '”?', 'This part goes away from the page when you save.', 'Remove', true))) return; box.remove(); secs.splice(i, 1); touch(); }
        };
        box.querySelector('.sx-add-below').onclick = () => addNew(sec);
      }
      if (after) after.box.after(box); else listEl.appendChild(box);
      if (after) secs.splice(secs.indexOf(after) + 1, 0, sec); else secs.push(sec);
      return sec;
    };
    const addNew = async after => {
      const r = await pickLayout('Add a part', null, true);
      if (!r) return;
      const sec = makeSec({ kind: r.kind, tag: 'h4', heading: r.heading, cols: r.kind === 'points' ? r.cols : '', rows: [{ label: '', value: '' }], html: '', typed: true }, after);
      touch(); sec.box.scrollIntoView({ block: 'center', behavior: 'smooth' });
      const f = sec.box.querySelector('[data-l], .rte'); if (f) setTimeout(() => f.focus(), 300);
    };
    // the parts as they are: the city parts in a row together become one list
    let cityRun = null;
    parts.forEach(pt => {
      const html = pt.nodes.map(n => n.outerHTML).join('\n'), headHtml = '<' + pt.tag + (pt.cols ? ' data-cols="' + pt.cols + '"' : '') + '>' + A.esc(pt.heading) + '</' + pt.tag + '>';
      if (cityOf(pt)) {
        const a = [...pt.nodes[0].querySelectorAll('a')].find(x => /read more/i.test(x.textContent));
        if (!cityRun) { cityRun = { kind: 'cities', items: [], html: '' }; makeSec(cityRun); }
        cityRun.items.push({ name: pt.heading, href: a.getAttribute('href') || '' }); cityRun.html += (cityRun.html ? '\n' : '') + headHtml + '\n' + html;
        return;
      }
      cityRun = null;
      if (pointsOf(pt)) makeSec({ kind: 'points', tag: pt.tag, heading: pt.heading, cols: pt.cols, rows: pt.nodes.map(rowOf) });
      else makeSec({ kind: 'text', tag: pt.tag, heading: pt.heading, html });
    });
    const tail = document.createElement('button'); tail.type = 'button'; tail.className = 'sx-add'; tail.innerHTML = '<b>+ Add a part</b><small>A heading with a text, or a list shown as boxes</small>';
    document.addEventListener('click', e => { if (!e.target.closest('.sx-more')) card.querySelectorAll('.sx-menu').forEach(m => { m.hidden = true; }); });
    tail.onclick = () => addNew(secs[secs.length - 1]); card.appendChild(tail);
    let drag = null;
    listEl.ondragstart = e => { drag = e.target.closest('.sx-sec'); if (drag) drag.classList.add('dragging'); };
    listEl.ondragend = () => { if (!drag) return; drag.classList.remove('dragging'); const order = [...listEl.children]; secs.sort((x, y) => order.indexOf(x.box) - order.indexOf(y.box)); drag = null; touch(); };
    listEl.ondragover = e => { if (!drag) return; e.preventDefault(); const after = [...listEl.children].find(c => c !== drag && e.clientY < c.getBoundingClientRect().top + c.offsetHeight / 2); listEl.insertBefore(drag, after || null); };
    const get = comps.html.get;
    comps.html.get = getters.html = () => get() + '\n' + secs.map(x => x.get()).filter(Boolean).join('\n');
    panesAdd('Sections', card);
  }
  // (5 Nov 2026, client) a blog post's sections: each a heading and its text, shown in one of three ways — a normal text
  // (lists as simple bullet points), a blue highlight box (lists with ticks) or a gold tip box. In the post's text a
  // normal section is <h2>…</h2> and what follows it; a box is <div class="bp-sec bp-sec-box|tip"><h2>…</h2>…</div>.
  const POST_STYLES = [['text', 'Text', 'Heading and text. Lists show as simple bullet points.'], ['box', 'Highlight box', 'A light blue box. Lists show with blue ticks.'], ['tip', 'Tip box', 'A gold box for a tip or a note.']];
  const postStylePic = s => '<svg viewBox="0 0 48 34" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
    (s === 'text' ? '<path d="M6 8h22" stroke-width="2.5"/><path d="M6 15h36M6 21h36M6 27h26"/>'
      : '<rect x="3" y="3" width="42" height="28" rx="3" fill="' + (s === 'box' ? '#E6EEF8' : '#FFF3D6') + '" stroke="' + (s === 'box' ? '#336699' : '#E0A800') + '"/><path d="M9 10h20" stroke-width="2.5"/><path d="M9 17h30M9 23h24"/>') + '</svg>';
  function postSectionsTab(root, tabsEl, panes) {
    const ed = comps.html && comps.html.el.querySelector('.rte'); if (!ed) return;
    const isSec = n => n.nodeName === 'H2' || (n.nodeName === 'DIV' && n.classList.contains('bp-sec'));
    const kids = [...ed.children], first = kids.findIndex(isSec);
    const parts = [];
    if (first >= 0) {
      let cur = null;
      kids.slice(first).forEach(n => {
        if (n.nodeName === 'DIV' && n.classList.contains('bp-sec')) {
          const h = n.querySelector(':scope > h2'), style = n.classList.contains('bp-sec-tip') ? 'tip' : 'box';
          if (h) h.remove();
          parts.push({ style, heading: h ? h.textContent.trim() : '', html: n.innerHTML.trim() }); cur = null; return;
        }
        if (n.nodeName === 'H2') { cur = { style: 'text', heading: n.textContent.trim(), html: '' }; parts.push(cur); return; }
        if (cur) cur.html += n.outerHTML + '\n';
      });
      kids.slice(first).forEach(n => n.remove());
    }
    const card = document.createElement('section'); card.className = 'card'; card.hidden = true;
    card.innerHTML = '<p class="tab-intro">The parts of the post, in order. Each has a heading, its text and how it looks: <b>Text</b>, <b>Highlight box</b> or <b>Tip box</b>. Drag a part by its dots to move it.</p><div class="sx-list bs-list"></div>';
    const listEl = card.querySelector('.bs-list');
    const GRIP = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>';
    const secs = [];
    const makeSec = (pt, after) => {
      const box = document.createElement('div'); box.className = 'sx-sec bs-sec'; box.draggable = true;
      const sec = { box, style: pt.style || 'text' };
      box.innerHTML = '<div class="sx-h"><span class="sx-grip" title="Drag to move">' + GRIP + '</span><span class="bs-n"></span><input class="in sx-title" placeholder="Heading of this part, e.g. Winter: October to March">' +
        '<span class="sx-more"><button type="button" class="sx-more-b" title="More" aria-label="More">⋯</button><span class="sx-menu" hidden><button type="button" data-m="up">Move up</button><button type="button" data-m="down">Move down</button><button type="button" data-m="below">Add a part below</button><button type="button" data-m="rm" class="x">Remove this part</button></span></span></div>' +
        '<div class="bs-styles" role="radiogroup" aria-label="How this part looks">' + POST_STYLES.map(([k, n, d]) => '<button type="button" role="radio" data-s="' + k + '" title="' + A.esc(d) + '">' + postStylePic(k) + '<span><b>' + n + '</b><small>' + A.esc(d) + '</small></span></button>').join('') + '</div>' +
        '<div class="sx-b"></div><button type="button" class="sx-add-below">+ Add a part below</button>';
      const title = box.querySelector('.sx-title'); title.value = pt.heading || ''; title.oninput = touch;
      const t = rte(pt.html || '', { min: 110 }); box.querySelector('.sx-b').appendChild(t.el);
      // typing or selecting in a box must not start a drag of the part
      box.querySelectorAll('.sx-title, .sx-b').forEach(x => { x.addEventListener('mousedown', () => { box.draggable = false; }); x.addEventListener('mouseup', () => { box.draggable = true; }); x.addEventListener('focusout', () => { box.draggable = true; }); });
      const markStyle = () => { box.dataset.style = sec.style; box.querySelectorAll('.bs-styles button').forEach(b => { const on = b.dataset.s === sec.style; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); }); };
      box.querySelectorAll('.bs-styles button').forEach(b => { b.onclick = () => { if (sec.style !== b.dataset.s) { sec.style = b.dataset.s; markStyle(); touch(); } }; });
      markStyle();
      sec.get = () => {
        const h = title.value.trim(), x = t.html(), has = x.replace(/<[^>]+>|&nbsp;/g, '').trim() || /<img/i.test(x);
        if (!h && !has) return '';
        const head = h ? '<h2>' + A.esc(h) + '</h2>\n' : '';
        return sec.style === 'text' ? head + x : '<div class="bp-sec bp-sec-' + sec.style + '">' + head + x + '</div>';
      };
      const menu = box.querySelector('.sx-menu');
      box.querySelector('.sx-more-b').onclick = e => { e.stopPropagation(); document.querySelectorAll('.sx-menu').forEach(m => { if (m !== menu) m.hidden = true; }); menu.hidden = !menu.hidden; };
      menu.onclick = async e => {
        const m = (e.target.closest('[data-m]') || {}).dataset; if (!m || !m.m) return; menu.hidden = true;
        const i = secs.indexOf(sec);
        if (m.m === 'up' && i > 0) { secs[i - 1].box.before(box); secs.splice(i, 1); secs.splice(i - 1, 0, sec); }
        else if (m.m === 'down' && i < secs.length - 1) { secs[i + 1].box.after(box); secs.splice(i, 1); secs.splice(i + 1, 0, sec); }
        else if (m.m === 'below') return addNew(sec);
        else if (m.m === 'rm') { if (!(await A.confirm('Remove “' + (title.value.trim() || 'this part') + '”?', 'This part goes away from the post when you save.', 'Remove', true))) return; box.remove(); secs.splice(i, 1); }
        number(); touch();
      };
      box.querySelector('.sx-add-below').onclick = () => addNew(sec);
      if (after) { after.box.after(box); secs.splice(secs.indexOf(after) + 1, 0, sec); } else { listEl.appendChild(box); secs.push(sec); }
      number();
      return sec;
    };
    const number = () => secs.forEach((s, i) => { s.box.querySelector('.bs-n').textContent = i + 1; });
    const addNew = async after => {
      let pick = 'text';
      const dlg = await A.dialog({ title: 'Add a part', ok: 'Add the part',
        html: '<label class="lb">Heading of the part</label><input class="in" data-h placeholder="e.g. Where to stay, Our tip, How many days?"><label class="lb" style="margin-top:14px">How it looks on the website</label>' +
          '<div class="lay-grid">' + POST_STYLES.map(([k, n, d]) => '<button type="button" class="lay-tile" data-s="' + k + '">' + postStylePic(k) + '<b>' + n + '</b><small>' + A.esc(d) + '</small></button>').join('') + '</div>',
        onOpen: b => { const mark = () => b.querySelectorAll('.lay-tile').forEach(x => x.classList.toggle('on', x.dataset.s === pick)); b.querySelectorAll('.lay-tile').forEach(x => { x.onclick = () => { pick = x.dataset.s; mark(); }; }); mark(); b.closest('.modal-box').classList.add('lay-modal'); setTimeout(() => b.querySelector('[data-h]').focus(), 50); },
        validate: b => b.querySelector('[data-h]').value.trim() ? '' : 'Write a heading for the part.' });
      if (!dlg) return;
      const sec = makeSec({ style: pick, heading: dlg.querySelector('[data-h]').value.trim(), html: '' }, after || secs[secs.length - 1]);
      touch(); sec.box.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setTimeout(() => { const r = sec.box.querySelector('.rte'); if (r) r.focus(); }, 300);
    };
    parts.forEach(pt => makeSec(pt));
    const tail = document.createElement('button'); tail.type = 'button'; tail.className = 'sx-add'; tail.innerHTML = '<b>+ Add a part</b><small>A heading with its text, a highlight box or a tip</small>';
    tail.onclick = () => addNew(null); card.appendChild(tail);
    document.addEventListener('click', e => { if (!e.target.closest('.sx-more')) card.querySelectorAll('.sx-menu').forEach(m => { m.hidden = true; }); });
    let drag = null;
    listEl.ondragstart = e => { drag = e.target.closest('.bs-sec'); if (drag) drag.classList.add('dragging'); };
    listEl.ondragend = () => { if (!drag) return; drag.classList.remove('dragging'); const order = [...listEl.children]; secs.sort((x, y) => order.indexOf(x.box) - order.indexOf(y.box)); drag = null; number(); touch(); };
    listEl.ondragover = e => { if (!drag) return; e.preventDefault(); const after = [...listEl.children].find(c => c !== drag && e.clientY < c.getBoundingClientRect().top + c.offsetHeight / 2); listEl.insertBefore(drag, after || null); };
    const get = comps.html.get;
    comps.html.get = getters.html = () => { const a = get(), b = secs.map(x => x.get()).filter(Boolean).join('\n'); return a + (a && b ? '\n' : '') + b; };
    // the tab sits right after "Introduction" (Google & SEO stays last)
    const intro = panes.find(p => p.keys.includes('html'));
    const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Sections (' + secs.length + ')';
    const recount = () => { b.textContent = 'Sections (' + secs.length + ')'; };
    new MutationObserver(recount).observe(listEl, { childList: true });
    b.onclick = () => { panes.forEach(p => { p.card.hidden = p.b !== b; p.b.classList.toggle('on', p.b === b); }); history.replaceState(null, '', '#sections'); };
    tabsEl.insertBefore(b, intro ? intro.b.nextSibling : null); root.insertBefore(card, intro ? intro.card.nextSibling : null);
    panes.splice(intro ? panes.indexOf(intro) + 1 : panes.length, 0, { b, card, slug: 'sections', keys: [] });
    if (location.hash === '#sections') b.click();
  }
  // (3 Nov 2026, client) "At a glance": the short "Label: value" lines of a page (a region's Location, Major Cities,
  // Holy Destinations …; a state's Area, Altitude, Climate …) in a tab of their own, one row each; the text keeps a
  // marker where they sit and gets them back, in the website's own shape, when it is saved
  const GLANCE_IC = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>';
  const factOf = p => {
    if (p.nodeName !== 'P') return null;
    const st = p.firstElementChild, first = [...p.childNodes].find(n => n.nodeType !== 3 || n.textContent.trim());
    if (!st || st !== first || !/^(STRONG|B)$/.test(st.nodeName) || !/:\s*$/.test(st.textContent) || p.querySelector('a,img')) return null;
    const label = st.textContent.replace(/:\s*$/, '').trim(), value = p.textContent.slice(st.textContent.length).replace(/\s+/g, ' ').trim();
    return label && label.length <= 40 && value && value.length <= 300 ? { label, value } : null;
  };
  function glanceTab(panesAdd) {
    const ed = comps.html && comps.html.el.querySelector('.rte'); if (!ed) return;
    // the first run of two or more fact lines before the page's first heading
    let run = [], best = null;
    for (const n of [...ed.children]) {
      if (/^H[1-6]$/.test(n.nodeName)) break;
      if (factOf(n)) { run.push(n); continue; }
      if (n.nodeName === 'P' && !n.textContent.trim()) continue;
      if (run.length >= 2) { best = run; break; }
      run = [];
    }
    if (!best && run.length >= 2) best = run;
    if (!best) return;
    const facts = best.map(factOf);
    const mark = document.createElement('div'); mark.className = 'rte-glance'; mark.contentEditable = 'false';
    best[0].before(mark); best.forEach(n => n.remove());
    const card = document.createElement('section'); card.className = 'card'; card.hidden = true;
    card.innerHTML = '<p class="tab-intro">The short facts in the “At a glance” box of the page: a name on the left, its words on the right. Drag a row by its dots to change the order.</p><div class="gl-head"><span>Name</span><span>Shows as</span></div><div class="gl-rows"></div><button type="button" class="btn btn-s" data-gl-add>+ Add a fact</button>';
    const rows = card.querySelector('.gl-rows'); let drag = null;
    const count = () => { const n = rows.children.length; mark.innerHTML = '<b>At a glance · ' + n + (n === 1 ? ' fact' : ' facts') + '</b><span>Change them in the “At a glance” tab</span>'; };
    const add = (f, focus) => {
      const r = document.createElement('div'); r.className = 'gl-row'; r.draggable = true;
      r.innerHTML = '<span class="gl-grip" title="Drag to change the order">' + GLANCE_IC + '</span><input class="in" data-l placeholder="e.g. Major Cities"><input class="in" data-v placeholder="e.g. Delhi, Jaipur, Lucknow, Shimla"><button type="button" class="gl-x" title="Remove this fact" aria-label="Remove this fact">✕</button>';
      r.querySelector('[data-l]').value = f.label; r.querySelector('[data-v]').value = f.value;
      r.querySelectorAll('input').forEach(i => { i.oninput = touch; i.addEventListener('mousedown', () => { r.draggable = false; }); i.addEventListener('blur', () => { r.draggable = true; }); });
      r.querySelector('.gl-x').onclick = () => { r.remove(); count(); touch(); };
      rows.appendChild(r); count(); if (focus) r.querySelector('[data-l]').focus();
    };
    rows.ondragstart = e => { drag = e.target.closest('.gl-row'); if (drag) drag.classList.add('dragging'); };
    rows.ondragend = () => { if (drag) { drag.classList.remove('dragging'); drag = null; touch(); } };
    rows.ondragover = e => { if (!drag) return; e.preventDefault(); const after = [...rows.children].find(c => c !== drag && e.clientY < c.getBoundingClientRect().top + c.offsetHeight / 2); rows.insertBefore(drag, after || null); };
    card.querySelector('[data-gl-add]').onclick = () => { add({ label: '', value: '' }, true); touch(); };
    facts.forEach(f => add(f));
    mark.onclick = () => { const t = [...document.querySelectorAll('.etabs button')].find(x => x.textContent === 'At a glance'); if (t) t.click(); };
    const get = comps.html.get;
    comps.html.get = getters.html = () => {
      const html = [...rows.children].map(r => ({ l: r.querySelector('[data-l]').value.trim(), v: r.querySelector('[data-v]').value.trim() })).filter(x => x.l && x.v).map(x => '<p><strong>' + A.esc(x.l) + ':</strong> ' + A.esc(x.v) + '</p>').join('\n');
      const t = get(), m = /<div class="rte-glance"[^>]*>[\s\S]*?<\/span><\/div>/.exec(t);
      return m ? t.replace(m[0], html) : (html ? html + '\n' + t : t);
    };
    panesAdd('At a glance', card);
  }
  // a link the client fills in as "Text" and "Link to" (the link box suggests the website's own pages)
  function linkRow(v) {
    const el = document.createElement('div'), parts = [];
    [['Text', v[0]], ['Link to', v[1]], ['Photo', v[2]]].slice(0, v.length).forEach(([name, val], i) => {
      const c = i === 2 ? image(val) : input(val, 'text', x => x);
      if (i === 1) pageLink(c.el);
      const f = document.createElement('div'); f.className = 'f'; f.innerHTML = '<label class="lb">' + name + '</label>' + (i === 1 ? '<p class="fhelp">Start typing to pick a page of this website, or paste an address (https://…).</p>' : '');
      f.appendChild(c.el); el.appendChild(f); parts.push(c.get);
    });
    return { el, get: () => parts.map(g => g()) };
  }
  // the website's pages, offered in every "Link to" box (like WordPress menus: pick a page instead of typing it)
  // (26 Oct 2026, client) a "Link to" box opens the same page picker as "+ Add pages from the website": a search, the
  // kinds of pages as tabs, and the pages as a list — click one to use it. Typing an address by hand still works.
  let lkPop = null;
  function pageLink(inp) {
    inp.placeholder = inp.placeholder || 'Click to choose a page, or paste https://…';
    inp.autocomplete = 'off'; inp.classList.add('lk-in');
    // (27 Oct 2026, client) under a link box: the name of the page it opens
    setTimeout(() => {
      if (!inp.isConnected || inp.closest('.ln-row,.tp-row,.addr-row,.lk-pop') || inp.closest('dialog')) return;
      const hint = document.createElement('p'); hint.className = 'lk-name'; inp.insertAdjacentElement('afterend', hint);
      const upd = () => loadLinks().then(items => { const v = inp.value.trim(), it = items.find(x => x.url === v); hint.innerHTML = !v ? '' : it ? 'Opens: <b>' + A.esc(lkName(it)) + '</b>' : /^https?:/.test(v) ? 'Opens another website' : 'Opens: ' + A.esc(v); });
      inp.addEventListener('input', upd); inp.addEventListener('ph', upd); upd();
    }, 0);
    const open = async () => {
      const items = await loadLinks();
      if (lkPop) lkPop.remove();
      const pop = lkPop = document.createElement('div'); pop.className = 'lk-pop';
      pop.innerHTML = '<input class="in lk-q" type="search" placeholder="Search a page, e.g. Rajasthan" aria-label="Search a page"><div class="subtabs lk-tabs">' + LK.map(([k, l], i) => '<button type="button" data-k="' + k + '"' + (i ? '' : ' class="on"') + '>' + l + '</button>').join('') + '</div><div class="lk-list"></div><p class="lk-foot">Click a page to link to it. Or type an address, e.g. https://…</p>';
      document.body.appendChild(pop);
      const r = inp.getBoundingClientRect();
      pop.style.left = Math.max(8, Math.min(r.left + scrollX, scrollX + innerWidth - 440)) + 'px'; pop.style.top = (r.bottom + scrollY + 4) + 'px'; pop.style.width = Math.max(r.width, 420) + 'px';
      let k = '';
      const draw = () => {
        const v = pop.querySelector('.lk-q').value.trim().toLowerCase(), list = pop.querySelector('.lk-list');
        const hit = items.filter(it => (!k || lkKind(it) === k) && (!v || (it.name + ' ' + it.url).toLowerCase().includes(v))).slice(0, 150);
        list.innerHTML = hit.map(it => '<button type="button" data-u="' + A.esc(it.url) + '" data-n="' + A.esc(lkName(it)) + '"' + (it.url === inp.value.trim() ? ' class="on"' : '') + '><b>' + A.esc(lkName(it)) + '</b><small>' + A.esc(it.url) + '</small></button>').join('') || '<p class="hint" style="padding:10px">No page found. You can type the address yourself.</p>';
      };
      pop.querySelectorAll('[data-k]').forEach(b => b.onmousedown = e => { e.preventDefault(); k = b.dataset.k; pop.querySelectorAll('[data-k]').forEach(x => x.classList.toggle('on', x === b)); draw(); });
      pop.querySelector('.lk-list').onmousedown = e => {
        const b = e.target.closest('[data-u]'); if (!b) return; e.preventDefault();
        inp.value = b.dataset.u;
        // a link's text box beside it, still empty, gets the page's name
        const row = inp.closest('.ln-row'), txt = row && row.querySelector('input');
        if (txt && txt !== inp && !txt.value.trim()) txt.value = b.dataset.n;
        inp.dispatchEvent(new Event('input', { bubbles: true })); touch(); close();
      };
      pop.querySelector('.lk-q').oninput = draw;
      pop.querySelector('.lk-q').onkeydown = e => { if (e.key === 'Escape') { close(); inp.focus(); } if (e.key === 'Enter') { e.preventDefault(); const f = pop.querySelector('[data-u]'); if (f) f.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); } };
      inp.oninput = touch;
      draw();
    };
    const close = () => { if (lkPop) { lkPop.remove(); lkPop = null; } };
    inp.addEventListener('focus', open);
    inp.addEventListener('click', () => { if (!lkPop) open(); });   // also when the box already had the cursor
    // it stays open while you search in it; a click anywhere else closes it
    inp.addEventListener('blur', () => setTimeout(() => { if (lkPop && !lkPop.contains(document.activeElement)) close(); }, 150));
    document.addEventListener('mousedown', e => { if (lkPop && e.target !== inp && !lkPop.contains(e.target)) close(); });
    inp.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }
  function check(v) {
    const el = document.createElement('input'); el.type = 'checkbox'; el.checked = !!v; el.onchange = touch;
    return { el, get: () => el.checked };
  }
  function toggle(v) {
    const el = document.createElement('label'); el.className = 'switch';
    el.innerHTML = '<input type="checkbox"><span>No — Google may show this page</span>';
    const c = el.querySelector('input'), t = el.querySelector('span');
    const show = () => { t.textContent = c.checked ? 'Yes — hidden from Google (not in search results, not in the sitemap)' : 'No — Google may show this page'; };
    c.checked = !!v; show(); c.onchange = () => { show(); touch(); };
    return { el, get: () => c.checked };
  }
  // a text box; with bold=true it gets a "B Bold" button that wraps the selected words in **…**
  function textBox(v, read, rows, bold) {
    const wrap = document.createElement('div');
    const el = document.createElement('textarea'); el.className = 'in'; el.value = v; el.rows = rows || 3; el.oninput = touch;
    if (bold) {
      const bar = document.createElement('div'); bar.className = 'txtbar';
      bar.innerHTML = '<button type="button" title="Make the selected words bold"><b>B</b> Bold</button><button type="button" title="Remove bold from the selected words">Remove bold</button>';
      const [b, nb] = bar.querySelectorAll('button');
      b.onclick = () => { const s = el.selectionStart, e = el.selectionEnd; if (s === e) return A.toast('First select the words to make bold'); const t = el.value.slice(s, e).replace(/\*\*/g, ''); el.setRangeText('**' + t + '**', s, e, 'select'); el.focus(); touch(); };
      nb.onclick = () => { const s = el.selectionStart, e = el.selectionEnd; const t = el.value.slice(s, e); if (s === e) { el.value = el.value.replace(/\*\*/g, ''); } else el.setRangeText(t.replace(/\*\*/g, ''), s, e, 'select'); el.focus(); touch(); };
      wrap.appendChild(bar);
    }
    wrap.appendChild(el);
    return { el: wrap, input: el, get: () => read(el.value) };
  }
  // (27 Oct 2026, client) the photo box: the photo itself (click it to choose one), its file name, Change and Remove.
  // auto() gives the photo the website uses when none is chosen; it shows with the label "Chosen by itself".
  function image(v, auto, words) {
    const el = document.createElement('div'); el.className = 'img-f';
    el.innerHTML = '<button type="button" class="pv" title="Choose a photo"><span class="pv-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 8"/></svg>Choose a photo</span></button>' +
      '<span class="img-acts"><button type="button" class="img-ic" data-ch title="Choose another photo" aria-label="Choose another photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 16v3h3l10-10-3-3L4 16z"/><path d="m13 7 3 3"/></svg></button><button type="button" class="img-ic img-ic-d" data-rm title="Remove the photo" aria-label="Remove the photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button></span>' +
      '<span class="img-name"></span><input type="hidden">';
    const pv = el.querySelector('.pv'), inp = el.querySelector('input'), name = el.querySelector('.img-name'), ch = el.querySelector('[data-ch]'), rm = el.querySelector('[data-rm]');
    const show = () => {
      const own = inp.value.trim(), a = !own && auto ? auto() || '' : '', src = own || a;
      pv.style.backgroundImage = src ? 'url("' + src.replace(/"/g, '') + '")' : 'none'; pv.classList.toggle('has', !!src);
      if (a) pv.dataset.auto = (words && words[0]) || 'Chosen by itself'; else delete pv.dataset.auto;
      name.textContent = own ? own.split('/').pop() : a ? (words && words[1]) || 'Chosen by the website — click the photo to use your own' : '';
      ch.hidden = !src; rm.hidden = !own;
    };
    const pick = async () => { const src = await A.pickImage(); if (src) { inp.value = src; show(); touch(); } };
    pv.onclick = pick; ch.onclick = pick; rm.onclick = () => { inp.value = ''; show(); touch(); };
    inp.value = v || ''; show();
    return { el, input: inp, get: () => inp.value.trim(), refresh: show };
  }
  function fieldBox(k, c, top) {
    if (c.el.matches && c.el.matches('input[type=checkbox]')) {   // (27 Oct 2026, client) a tick box with its words beside it
      const f = document.createElement('label'); f.className = 'f f-chk'; f.dataset.k = k; f.appendChild(c.el); f.insertAdjacentHTML('beforeend', '<span>' + A.esc(label(k)) + '</span>'); return f;
    }
    const f = document.createElement('div'); f.className = 'f' + (c.isLines || (c.el.matches && c.el.matches('input.in:not([type=checkbox]), select.in')) ? ' half' : '') + (top && c.isGroup ? ' f-grp' : ''); f.dataset.k = k;
    f.innerHTML = '<label class="lb">' + A.esc(label(k)) + '</label>' + ((HELP[k + '_' + E.kind] || HELP[k]) && (top || /^(href|paras|items|price|cards|cities|link)$/.test(k)) ? '<p class="fhelp">' + A.esc(HELP[k + '_' + E.kind] || HELP[k]) + '</p>' : '');
    f.appendChild(c.el);
    return f;
  }
  const FORM_LABELS = { button: 'Send button', heading: 'Title of the form', name: 'Name — words', email: 'Email — words', country: 'Country — words', days: 'Number of days — words', hotelBudget: 'Hotel budget — words', hotelCategory: 'Hotel category — words' };
  // short fields sit two to a row; one left without a partner takes the full row
  const pairHalves = box => { let run = []; const flush = () => { if (run.length % 2) run[run.length - 1].classList.remove('half'); run = []; };
    [...box.children].forEach(ch => { if (ch.classList && ch.classList.contains('half')) run.push(ch); else flush(); }); flush(); };
  function group(obj, depth) {
    const el = document.createElement('div'), gets = {};
    const isDay = ('paras' in obj || ('html' in obj && 'day' in obj)) && 'title' in obj;
    const isForm = 'showPeriod' in obj;   // the enquiry form's words
    // (26 Oct 2026, client) what the website never shows is not asked for (it is kept as it is)
    const hide = 'src' in obj && 'pos' in obj ? ['alt', 'place', 'region', 'href', 'pos', 'flip'] : [];
    // (27 Oct 2026, client) the currency is always USD; a package card's price is the category's lowest one, by itself
    if ('currency' in obj && 'priceNote' in obj) hide.push('currency');
    if ('count' in obj && 'items' in obj && 'title' in obj && E.id === 'home') hide.push('count', 'items');
    if (E.id === 'home' && 'link' in obj && 'photo' in obj && 'price' in obj && 'title' in obj) return pkgCard(obj);
    el.className = 'fg';
    // (27 Oct 2026, client video) a button's words and the page it opens are one thing: one row
    if ('button' in obj && 'buttonLink' in obj && typeof obj.button === 'string') hide.push('buttonLink');
    Object.entries(obj).forEach(([k, v]) => { if (hide.includes(k) && !(k === 'buttonLink' && 'button' in obj)) { gets[k] = () => v; return; }
      if (k === 'buttonLink') return;
      if (k === 'button' && 'buttonLink' in obj) {
        const row = document.createElement('div'); row.className = 'ln-row btn-row';
        const t = input(v, 'text', x => x), h = input(obj.buttonLink || '', 'text', x => x.trim());
        t.el.placeholder = 'Words on the button'; h.el.placeholder = 'Click to choose the page it opens'; pageLink(h.el);
        row.append(t.el, h.el);
        const fb = document.createElement('div'); fb.className = 'f'; fb.dataset.k = 'button'; fb.innerHTML = '<label class="lb">Button — its words and the page it opens</label>'; fb.appendChild(row);
        el.appendChild(fb); gets.button = t.get; gets.buttonLink = h.get; return;
      }
      const c = isDay && k === 'photo' ? (a => image(v, () => a))(dayAuto.length ? dayAuto.shift() : '') : field(k, v, depth + 1); const fb = fieldBox(k, c, false); el.appendChild(fb); gets[k] = c.get;
      if (isForm && FORM_LABELS[k]) fb.querySelector('.lb').textContent = FORM_LABELS[k];
      if (k === 'items' && Array.isArray(v) && v.some(isLinkRow)) { fb.querySelector('.lb').textContent = 'Links'; const h = fb.querySelector('.fhelp'); if (h) h.remove(); }
      if (isDay && k === 'photo') fb.querySelector('.lb').textContent = 'Photo for this day (optional)';
      // (27 Oct 2026, client) an empty day shows examples, not someone else's text
      const ph = isDay && { day: 'e.g. 01 Day', title: 'e.g. Delhi - Agra', eta: 'e.g. 210 km · about 4 hours', note: 'e.g. The Taj Mahal is closed on Fridays.' }[k], inp = ph && fb.querySelector('input.in, textarea.in');
      if (inp) inp.placeholder = ph;
      if (isDay && k === 'paras' && c.input) c.input.dataset.ph = 'What happens this day: the sights, the drive, the overnight stay';
      if (/^(included|extras)$/.test(k)) fb.classList.add('half');
      if (Object.keys(obj).filter(x => !hide.includes(x)).length === 1) fb.classList.add('f-solo'); if ((k === 'title' || k === 'description') && Object.keys(obj).every(x => x === 'title' || x === 'description')) counter(k, c); });   // the main pages' Google text
    pairHalves(el);
    // (27 Oct 2026, client video) a card with a photo: the photo on the left, its fields beside it (no empty space)
    const ph = [...el.children].filter(f => f.querySelector(':scope > .img-f'));
    if (ph.length === 1 && el.children.length >= 3 && !obj.paras && !isDay) { el.classList.add('fg-media'); ph[0].classList.add('f-photo'); ph[0].classList.remove('half'); }
    [...el.children].forEach(f => { const n = f.nextElementSibling; if (f.querySelector(':scope > .img-f') && n && n.querySelector(':scope > div > textarea.in') && !f.classList.contains('half') && !n.classList.contains('half')) { f.classList.add('half', 'f-img'); n.classList.add('half'); } });
    return { el, isGroup: true, get: () => Object.fromEntries(Object.entries(gets).map(([k, g]) => [k, g()])) };
  }
  // (27 Oct 2026, client) a "Best Tour Packages" card: choose a tour category; its name and photo fill in by themselves
  // (both can be changed), and the website shows the category's lowest price
  let catCards = null;
  const loadCatCards = () => catCards || (catCards = A.api('GET', '/admin/api/category-cards').then(r => r.items || []).catch(() => []));
  function pkgCard(obj) {
    const el = document.createElement('div'); el.className = 'pk';
    el.innerHTML = '<div class="f f-photo"><label class="lb">Photo</label></div><div class="f"><label class="lb">Tour category</label><select class="in" data-cat><option value="">Choose a category…</option></select></div>' +
      '<div class="f"><label class="lb">Name on the card</label><input class="in" data-t></div><p class="pk-price" data-p></p>';
    const sel = el.querySelector('[data-cat]'), t = el.querySelector('[data-t]'), pr = el.querySelector('[data-p]');
    let cats = [];
    const catNow = () => cats.find(x => x.url === sel.value);
    const img = image(obj.photo, () => (catNow() || {}).img || '');
    el.children[0].appendChild(img.el);
    t.value = obj.title || ''; t.oninput = touch;
    const price = () => { const c = catNow(); pr.innerHTML = c && c.from ? 'Price on the card: <b>from USD ' + c.from.toLocaleString('en-US') + '</b> per person, the lowest tour price of this category' : c ? 'No tour price in this category yet' : ''; };
    if (obj.link) sel.insertAdjacentHTML('beforeend', '<option value="' + A.esc(obj.link) + '" selected>' + A.esc(obj.link) + '</option>');
    loadCatCards().then(list => {
      cats = list;
      sel.innerHTML = '<option value="">Choose a category…</option>' + list.map(c => '<option value="' + A.esc(c.url) + '">' + A.esc(c.name) + (c.code ? ' (' + A.esc(c.code) + ')' : '') + '</option>').join('') +
        (obj.link && !list.some(c => c.url === obj.link) ? '<option value="' + A.esc(obj.link) + '">' + A.esc(obj.link) + '</option>' : '');
      sel.value = obj.link || ''; img.refresh(); price();
    });
    sel.onchange = () => {
      const c = catNow(), was = cats.some(x => x.name === t.value.trim());
      if (c && (!t.value.trim() || was)) t.value = c.name;
      img.refresh(); price(); touch(); t.dispatchEvent(new Event('input', { bubbles: true }));
    };
    return { el, get: () => Object.assign({}, obj, { title: t.value.trim(), link: sel.value, photo: img.get() || (catNow() || {}).img || obj.photo || '' }) };
  }
  function list(key, arr, depth) {
    const el = document.createElement('div'); el.className = 'arr';
    const box = document.createElement('div'); box.className = 'arr'; el.appendChild(box);
    const tmpl = arr.length ? blank(arr[0]) : (templates[key] !== undefined ? templates[key] : '');
    const rows = [];
    // (26 Oct 2026, client video II) a list of links shows as rows of "Text | Link" (like WordPress menus), not as boxes to open
    const linkList = (arr.length ? arr : [tmpl]).every(x => (isLinkRow(x) && x.length === 2) || isLinkObj(x));
    const isTuple = x => Array.isArray(x) && x.length >= 2 && x.length <= 4 && x.every(y => typeof y === 'string') && !isLinkRow(x);
    const tupleList = arr.length ? arr.every(isTuple) : isTuple(tmpl);
    const simple = linkList || tupleList || (arr.length ? arr.every(x => typeof x !== 'object' || x === null) : typeof tmpl !== 'object');
    const renum = () => rows.forEach((r, i) => { r.n.textContent = key === 'days' ? '' : i + 1; });
    // (27 Oct 2026, client) small things side by side, all open: figures, banner photos, cards, points, steps
    const gridCols = !simple && { stats: 5, heroSlides: 4, cards: key === 'cards' && E.id === 'home' && arr[0] ? ('price' in arr[0] ? 4 : 'cities' in arr[0] ? 2 : 0) : 0, points: arr.length === 4 ? 4 : 3, steps: 4, seasons: 3, glance: 3, guideCols: 3, footerCols: 2, offices: 2, tips: 3, placeCards: 3 }[key];
    if (gridCols) { box.classList.add('arr-grid'); box.style.setProperty('--cols', gridCols); }
    // (27 Oct 2026, client video) no up / down arrows: each item has a grip to drag it where it should go; a bin removes it
    const ICO = { down: '<path d="m6 9 6 6 6-6"/>', x: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', grip: '<circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/>' };
    const ico = n => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[n] + '</svg>';
    let dragging = null;
    box.addEventListener('dragover', e => {
      if (!dragging || dragging.parentNode !== box) return; e.preventDefault();
      const after = [...box.children].filter(c => c !== dragging).find(c => { const rc = c.getBoundingClientRect(); return gridCols ? (e.clientY < rc.bottom && e.clientX < rc.left + rc.width / 2) || e.clientY < rc.top : e.clientY < rc.top + rc.height / 2; });
      if (after) box.insertBefore(dragging, after); else box.appendChild(dragging);
    });
    const add = (v, open) => {
      const it = document.createElement('div'); it.className = 'it' + (open || simple || gridCols ? '' : ' closed');
      it.innerHTML = '<div class="it-h">' + (simple || gridCols ? '' : '<i class="it-c" aria-hidden="true">' + ico('down') + '</i>') + '<span class="n"></span><b></b><span class="it-acts"><button type="button" class="x" title="Remove">' + ico('x') + '</button></span></div><div class="it-b"></div>';
      const grip = document.createElement('span'); grip.className = 'it-grip'; grip.title = 'Drag to move'; grip.innerHTML = ico('grip').replace('fill="none"', 'fill="currentColor"');
      grip.addEventListener('mousedown', () => { it.draggable = true; }); grip.addEventListener('mouseup', () => { it.draggable = false; }); grip.addEventListener('touchstart', () => { it.draggable = true; }, { passive: true });
      it.addEventListener('dragstart', e => { if (!it.draggable) return e.preventDefault(); dragging = it; it.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', ''); } catch (er) {} });
      it.addEventListener('dragend', () => { it.draggable = false; it.classList.remove('dragging'); dragging = null; const order = [...box.children]; rows.sort((a, b2) => order.indexOf(a.it) - order.indexOf(b2.it)); renum(); touch(); });
      const c = key === 'footerSocial' && isLinkObj(v) ? socialRow(v) : linkList ? linkInline(v, true) : field(key === 'items' ? 'item' : key, v, depth + 1, true), b = it.querySelector('b');
      it.querySelector('.it-b').appendChild(c.el);
      const r = { it, get: c.get, n: it.querySelector('.n') };
      const setSum = () => { if (!gridCols) b.textContent = summary(c.get()) || '(empty — click to fill in)'; };
      setSum(); it.addEventListener('input', setSum);
      if (simple) { b.style.display = 'none'; it.classList.remove('closed'); it.style.display = 'grid'; it.style.gridTemplateColumns = 'auto minmax(0,1fr) auto'; it.querySelector('.it-b').style.padding = '6px'; it.insertBefore(it.querySelector('.it-b'), it.firstChild); Object.assign(it.querySelector('.it-h').style, { borderBottom: '0', background: 'none', cursor: 'default' }); r.n.style.display = 'none'; }
      const [x] = it.querySelectorAll('.it-h .it-acts button');
      if (simple) it.insertBefore(grip, it.firstChild); else it.querySelector('.it-h').insertBefore(grip, it.querySelector('.it-h').firstChild);
      it.querySelector('.it-h').onclick = e => { if (!e.target.closest('button') && !simple && !gridCols) it.classList.toggle('closed'); };
      x.onclick = async () => { if (!(await A.confirm('Remove this?', '"' + (summary(c.get()) || 'This item') + '" will be removed when you save.', 'Remove', true))) return; rows.splice(rows.indexOf(r), 1); it.remove(); renum(); touch(); };
      rows.push(r); box.appendChild(it); renum();
      if (open && !simple) it.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (gridCols) b.textContent = { stats: 'Figure', heroSlides: 'Photo', cards: 'Card', points: 'Point', steps: 'Step', guideCols: 'Card', placeCards: 'Card', footerCols: 'Column', offices: 'Office', topics: 'Topic', tips: 'Group', seasons: 'Season', glance: 'Box' }[key] || 'Item';
    };
    arr.forEach(v => add(v, false));
    // a long list gets a search box (the reviews, the days of a long tour, the footer links …)
    if (arr.length > 12 && !simple) {
      const q = document.createElement('input'); q.className = 'in arr-q'; q.type = 'search'; q.placeholder = 'Search in these ' + arr.length + ' …';
      q.oninput = () => { const v = q.value.trim().toLowerCase(); rows.forEach(r => { r.it.hidden = !!v && !JSON.stringify(r.get()).toLowerCase().includes(v); }); };
      el.insertBefore(q, box);
    }
    const btns = document.createElement('div'); btns.className = 'chips';
    const addBtn = document.createElement('button'); addBtn.type = 'button'; addBtn.className = 'btn btn-s add';
    addBtn.textContent = '+ Add ' + ({ days: 'a day', faqs: 'a question', all: 'a review', offices: 'an office', redirects: 'a redirect', tours: 'a tour by hand', groups: 'a group', cards: 'a card', points: 'a point', heroSlides: 'a banner photo', stats: 'a figure', steps: 'a step' }[key] || (simple ? 'a line' : 'one more'));
    addBtn.onclick = () => { add(JSON.parse(JSON.stringify(tmpl)), true); touch(); };
    // a category's tours: pick an existing tour instead of typing it in
    if (key === 'tours' && (arr.length ? arr.every(t => t && typeof t === 'object' && 'href' in t) : true)) {
      const pickBtn = document.createElement('button'); pickBtn.type = 'button'; pickBtn.className = 'btn btn-s btn-g'; pickBtn.textContent = '+ Add one of your tours';
      pickBtn.onclick = () => pickTour(t => { add(t, false); touch(); A.toast('Added: ' + t.name); });
      btns.appendChild(pickBtn);
    }
    // (26 Oct 2026, client) a list of links (menus, footer columns, cities): tick pages of the website to add them, as in
    // WordPress menus — no need to know or type an address
    const linkish = isLinkRow(tmpl) || (tmpl && typeof tmpl === 'object' && !Array.isArray(tmpl) && 'href' in tmpl && ('label' in tmpl || 'name' in tmpl));
    if (linkish && !tupleList && key !== 'tours' && key !== 'footerSocial') {
      const pagesBtn = document.createElement('button'); pagesBtn.type = 'button'; pagesBtn.className = 'btn btn-s btn-g'; pagesBtn.textContent = '+ Add pages from the website';
      pagesBtn.onclick = () => pickPages(list => {
        list.forEach(p => {
          const v = isLinkRow(tmpl) ? [p.name].concat([p.url], tmpl.length > 2 ? [''] : []) : Object.assign(JSON.parse(JSON.stringify(tmpl)), 'label' in tmpl ? { label: p.name } : { name: p.name }, { href: p.url });
          add(v, false);
        });
        if (list.length) { touch(); A.toast(list.length === 1 ? 'Added: ' + list[0].name : list.length + ' links added — drag them by their dots to put them in order'); }
      });
      btns.appendChild(pagesBtn);
      addBtn.textContent = '+ Add a custom link';
    }
    btns.appendChild(addBtn);
    el.appendChild(btns);
    if (linkList || tupleList) el.classList.add('arr-links');
    // empty link rows are left out when saving
    return { el, get: () => rows.map(r => r.get()).filter(v => !linkList || (Array.isArray(v) ? v.some(Boolean) : (v.label || v.name || v.href))) };
  }
  // (27 Oct 2026, client) a social network: its icon and name, then the address of the profile
  const SOC = {
    Facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v6h4v-6h3l1-4h-4V8z"/>', Instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
    YouTube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>', X: '<path d="M4 4l16 16M20 4 4 20"/>', LinkedIn: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
    Pinterest: '<circle cx="12" cy="12" r="9"/><path d="m11 8-2 12M10 14c4 1 6-1 6-4a4 4 0 0 0-8 0"/>', TripAdvisor: '<circle cx="7" cy="13" r="3"/><circle cx="17" cy="13" r="3"/><path d="M2 9h20M12 9c-2-2-6-2-8 0M12 9c2-2 6-2 8 0"/>'
  };
  function socialRow(v) {
    const el = document.createElement('div'); el.className = 'so-row';
    const known = Object.keys(SOC);
    el.innerHTML = '<span class="so-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"></svg></span>' +
      '<select class="in so-n" aria-label="Network">' + known.concat(known.includes(v.name) || !v.name ? [] : [v.name]).map(n => '<option>' + A.esc(n) + '</option>').join('') + '</select><input class="in" placeholder="https://… (the address of your page)" aria-label="Address">';
    const sel = el.querySelector('select'), inp = el.querySelector('input'), svg = el.querySelector('svg');
    sel.value = v.name || 'Facebook'; inp.value = v.href || '';
    const ic = () => { svg.innerHTML = SOC[sel.value] || '<circle cx="12" cy="12" r="9"/>'; el.classList.toggle('so-off', !inp.value.trim()); };
    sel.onchange = () => { ic(); touch(); }; inp.oninput = () => { ic(); touch(); }; ic();
    return { el, get: () => Object.assign({}, v, { name: sel.value, href: inp.value.trim() }) };
  }
  // one link on one line: its text and where it goes (the link box suggests the website's pages)
  function linkInline(v, pages) {
    const el = document.createElement('div'); el.className = 'ln-row';
    const isArr = Array.isArray(v), tk = isArr ? 0 : ('label' in v ? 'label' : 'name');
    const t = input(isArr ? v[0] : v[tk], 'text', x => x), h = input(isArr ? v[1] : v.href, 'text', x => x.trim());
    t.el.placeholder = isArr || tk === 'label' ? 'Text shown' : 'Name'; h.el.placeholder = pages ? 'Click to choose a page' : 'https://…';
    if (pages) pageLink(h.el);
    el.append(t.el, h.el);
    const ln = !isArr && 'line' in v ? input(v.line || '', 'text', x => x) : null;
    if (ln) { ln.el.placeholder = 'Short line under it'; el.appendChild(ln.el); el.classList.add('ln-3'); }
    return { el, get: () => isArr ? [t.get(), h.get()] : Object.assign({}, v, { [tk]: t.get(), href: h.get() }, ln ? { line: ln.get() } : {}) };
  }
  // the website's pages with tick boxes and a search (Pages, Tour categories, Tours, Blog), for the lists of links
  async function pickPages(done) {
    let items = [];
    try { items = (await A.api('GET', '/admin/api/link-index')).items || []; } catch (e) { return A.toast(e.message, true); }
    const kinds = [['', 'All'], ['main', 'Main pages'], ['Category', 'Tour categories'], ['Tour', 'Tours'], ['Page', 'Pages'], ['Blog', 'Blog']];
    const kindOf = it => (/^(Category|Tour|Page|Blog): /.exec(it.name) || [, 'main'])[1];
    const nameOf = it => it.name.replace(/^(Category|Tour|Page|Blog): /, '');
    let k = '';
    const box = await A.dialog({
      title: 'Add pages', ok: 'Add to the list',
      html: '<div class="subtabs" data-pk>' + kinds.map(([v, l]) => '<button type="button" data-k="' + v + '"' + (v ? '' : ' class="on"') + '>' + l + '</button>').join('') + '</div>' +
        '<input class="in" data-ps placeholder="Search a page, e.g. Rajasthan" style="margin-bottom:10px"><div class="pick-list pick-ticks" data-pl></div><p class="hint" data-pn>Tick one or more pages.</p>',
      onOpen: b => {
        const pl = b.querySelector('[data-pl]'), ps = b.querySelector('[data-ps]'), picked = new Set();
        const draw = () => {
          const v = ps.value.trim().toLowerCase();
          pl.innerHTML = items.map((it, i) => [it, i]).filter(([it]) => (!k || kindOf(it) === k) && (!v || (it.name + ' ' + it.url).toLowerCase().includes(v))).slice(0, 200)
            .map(([it, i]) => '<label class="perm"><input type="checkbox" data-i="' + i + '"' + (picked.has(i) ? ' checked' : '') + '><span><b>' + A.esc(nameOf(it)) + '</b><small class="muted"> ' + A.esc(it.url) + '</small></span></label>').join('') || '<p class="hint">Nothing found.</p>';
        };
        pl.onchange = e => { const x = e.target.closest('[data-i]'); if (!x) return; x.checked ? picked.add(+x.dataset.i) : picked.delete(+x.dataset.i); b.querySelector('[data-pn]').textContent = picked.size ? picked.size + ' ticked' : 'Tick one or more pages.'; };
        b.querySelectorAll('[data-pk] [data-k]').forEach(x => x.onclick = () => { k = x.dataset.k; b.querySelectorAll('[data-pk] [data-k]').forEach(y => y.classList.toggle('on', y === x)); draw(); });
        ps.oninput = draw; draw();
        b._picked = picked;
      }
    });
    if (!box) return;
    done([...box._picked].sort((a, b) => a - b).map(i => ({ name: nameOf(items[i]), url: items[i].url })));
  }
  let tourIndex = null;
  async function pickTour(cb) {
    if (!tourIndex) tourIndex = (await A.api('GET', '/admin/api/tours-index')).items;
    await A.dialog({
      title: 'Add one of your tours', ok: 'Done', cancel: false,
      html: '<input class="in" placeholder="Type to search, e.g. Kerala" data-s><div class="pick-list" data-l></div>',
      onOpen: (box, close) => {
        const s = box.querySelector('[data-s]'), l = box.querySelector('[data-l]');
        const draw = () => { const v = s.value.trim().toLowerCase(); const hits = tourIndex.filter(t => !v || (t.name + ' ' + t.route).toLowerCase().includes(v)).slice(0, 60);
          l.innerHTML = hits.map((t, i) => '<button type="button" data-i="' + tourIndex.indexOf(t) + '"><b>' + A.esc(t.name) + '</b><small>' + A.esc(t.duration + ' · ' + t.route) + '</small></button>').join('') || '<p class="hint" style="padding:10px">No tour found.</p>'; };
        s.oninput = draw; draw();
        l.onclick = e => { const b = e.target.closest('[data-i]'); if (!b) return; const t = tourIndex[+b.dataset.i]; cb({ name: t.name, href: t.href, route: t.route, duration: t.duration }); b.disabled = true; b.style.opacity = .5; };
      }
    });
  }
  // the website's own wording when a tour leaves these empty (views/tour-detail-v2.ejs)
  const PRICE_LINE = 'The price quote includes a private tour with {hotel} hotels, a private car with driver, and other services as mentioned below.';
  const PRICE_INC = ['Hotel accommodation on twin sharing basis', 'Air-conditioned car with driver throughout sightseeing', 'Transport service from arrival until final departure'];
  // (2 Nov 2026, client) a destination page's own choice of tours; (4 Nov 2026, client) shown as the website shows them:
  // four cards (photo, name, nights, price). Nothing chosen: the four the website picks now, with "Choose these tours"
  // to make them your own and change them. Chosen: ✕ to take one out, drag to change the order, "+ Add a tour".
  function tourPicker(urls) {
    const MAX = 4;
    const el = document.createElement('div'); el.className = 'tp-pick';
    el.innerHTML = '<div class="tpc-note" data-note></div><div class="tpc-grid" data-grid></div><div class="tpc-acts"><button type="button" class="btn btn-p" data-add>+ Add a tour</button><button type="button" class="btn" data-own hidden>Change these tours</button><button type="button" class="btn btn-link" data-auto hidden>Let the website choose again</button></div>';
    const grid = el.querySelector('[data-grid]'), note = el.querySelector('[data-note]'), addB = el.querySelector('[data-add]'), ownB = el.querySelector('[data-own]'), autoB = el.querySelector('[data-auto]');
    let chosen = urls.slice(0, MAX), auto = [], cards = {}, all = [], dragging = null;
    const card = (c, i, own) => '<div class="tpc' + (own ? '' : ' tpc-ro') + '"' + (own ? ' draggable="true" data-i="' + i + '"' : '') + '>' +
      '<span class="tpc-img"' + (c.img ? ' style="background-image:url(&quot;' + A.esc(c.img) + '&quot;)"' : '') + '></span>' +
      '<span class="tpc-b"><b>' + A.esc(c.name || c.href) + '</b>' + (c.code ? '<span class="code">' + A.esc(c.code) + '</span>' : '') +
      '<small>' + A.esc(c.nights || '') + '</small><em>' + (c.price ? 'From USD ' + Number(c.price).toLocaleString('en-US') : 'Price on request') + '</em></span>' +
      (own ? '<button type="button" class="tpc-x" data-x="' + i + '" title="Take this tour off the page" aria-label="Take this tour off the page">✕</button><span class="tpc-grip" title="Drag to change the order">⋮⋮</span>' : '') + '</div>';
    const need = async list => { const miss = list.filter(u => !cards[u.toLowerCase()]); if (!miss.length) return; try { (await A.api('GET', '/admin/api/tour-cards?urls=' + encodeURIComponent(miss.join(',')))).items.forEach(c => { cards[String(c.href).toLowerCase()] = c; }); } catch (e) {} };
    const draw = async () => {
      if (chosen.length) {
        await need(chosen);
        note.innerHTML = '<b>Your choice</b> — these ' + chosen.length + ' tour' + (chosen.length === 1 ? '' : 's') + ' show under the page text, in this order. Drag a card to move it; ✕ takes it off.';
        grid.innerHTML = chosen.map((u, i) => card(cards[u.toLowerCase()] || { href: u, name: u }, i, true)).join('');
      } else {
        note.innerHTML = '<b>Picked by the website</b> — the tours that pass through this place. To change them, press “Change these tours”.';
        grid.innerHTML = auto.length ? auto.map((c, i) => card(c, i, false)).join('') : '<p class="hint">This page shows no tours now. Add up to ' + MAX + ' tours to show them.</p>';
      }
      addB.hidden = chosen.length >= MAX || (!chosen.length && auto.length > 0);
      addB.textContent = chosen.length ? '+ Add a tour (' + (MAX - chosen.length) + ' more)' : '+ Add tours (up to ' + MAX + ')';
      ownB.hidden = chosen.length > 0 || !auto.length; autoB.hidden = !chosen.length;
    };
    // the four the website shows now (read from the page itself, so it is exactly what visitors see)
    if (E.url) fetch(E.url).then(r => r.text()).then(h => {
      const d = new DOMParser().parseFromString(h, 'text/html');
      auto = [...d.querySelectorAll('.dx-pq .pq-card')].map(c => { const a = c.querySelector('.pq-name a'); return { href: a ? a.getAttribute('href') : '', name: a ? a.textContent.trim() : '', img: (c.querySelector('.pq-img img') || {}).getAttribute ? c.querySelector('.pq-img img').getAttribute('src') : '', nights: ((c.querySelector('.pq-nd') || {}).textContent || '').trim(), price: +(((c.querySelector('.pq-price b') || {}).textContent || '').replace(/[^\d]/g, '')) || 0 }; });
      auto.forEach(c => { cards[String(c.href).toLowerCase()] = cards[String(c.href).toLowerCase()] || c; });
      draw();
    }).catch(() => draw());
    grid.onclick = e => { const x = e.target.closest('[data-x]'); if (x) { chosen.splice(+x.dataset.x, 1); draw(); touch(); } };
    grid.ondragstart = e => { dragging = e.target.closest('.tpc[draggable]'); if (dragging) dragging.classList.add('dragging'); };
    grid.ondragend = () => { if (!dragging) return; dragging.classList.remove('dragging'); chosen = [...grid.children].map(r => chosen[+r.dataset.i]); dragging = null; draw(); touch(); };
    grid.ondragover = e => { if (!dragging) return; e.preventDefault(); const after = [...grid.children].find(c => c !== dragging && e.clientX < c.getBoundingClientRect().left + c.offsetWidth / 2 && e.clientY < c.getBoundingClientRect().bottom); grid.insertBefore(dragging, after || null); };
    ownB.onclick = () => { chosen = auto.map(c => c.href).filter(Boolean).slice(0, MAX); draw(); touch(); };
    autoB.onclick = async () => { if (await A.confirm('Let the website choose?', 'Your choice is cleared; the page shows the tours that pass through this place.', 'Yes, clear my choice', false)) { chosen = []; draw(); touch(); } };
    addB.onclick = async () => {
      if (!all.length) all = await loadLinks();
      const tours = all.filter(it => lkKind(it) === 'Tour');
      const box = await A.dialog({ title: 'Add tours', ok: 'Add the ticked tours', wide: true,
        html: '<p class="hint" style="margin:0 0 8px">Up to ' + MAX + ' tours show on the page (' + (MAX - chosen.length) + ' more can be added).</p><input class="in" type="search" data-q placeholder="Search a tour, e.g. Golden Triangle, Kerala"><div class="tp-opts">' + tours.map(it => '<label class="tp-opt" data-s="' + A.esc((lkName(it) + ' ' + it.url).toLowerCase()) + '"><input type="checkbox" value="' + A.esc(it.url) + '"' + (chosen.some(u => u.toLowerCase() === it.url.toLowerCase()) ? ' checked disabled' : '') + '><span><b>' + A.esc(lkName(it)) + '</b><small>' + A.esc(it.url) + '</small></span></label>').join('') + '</div>',
        onOpen: b => { const q = b.querySelector('[data-q]'); q.oninput = () => { const v = q.value.trim().toLowerCase(); b.querySelectorAll('.tp-opt').forEach(o => { o.hidden = !!v && !o.dataset.s.includes(v); }); }; } });
      if (!box) return;
      const picked = [...box.querySelectorAll('.tp-opt input:checked:not(:disabled)')].map(c => c.value), room = MAX - chosen.length;
      if (picked.length > room) A.toast('Only ' + MAX + ' tours show on the page: the first ' + room + ' ticked are added.', true);
      picked.slice(0, room).forEach(u => chosen.push(u));
      draw(); touch();
    };
    draw();
    return { el, get: () => chosen.slice() };
  }
  // ---------- Google: counters, preview, checks ----------
  const LIMITS = { title: [30, 60, 65], description: [120, 160, 170] };
  function counter(k, c) {
    const inp = c.input || (c.el.matches('input,textarea') ? c.el : c.el.querySelector('input,textarea')); if (!inp) return;
    const d = document.createElement('div'); d.className = 'count'; d.innerHTML = '<span class="bar"><i></i></span><span></span>';
    const upd = () => {
      const own = inp.value.trim(), [lo, hi, max] = LIMITS[k];
      // an empty box with the website's text in grey: that text is what Google gets
      if (!own && inp.placeholder && E.mode === 'single') { d.className = 'count ok'; d.querySelector('i').style.width = Math.min(100, 100 * inp.placeholder.length / max) + '%'; d.lastChild.textContent = 'Empty — the website’s own text is used (' + inp.placeholder.length + ' characters)'; return; }
      const n = own.length;
      const lv = !n ? 'bad' : n < (k === 'title' ? lo : 70) || n > max ? 'bad' : n < lo || n > hi ? 'ok' : 'good';
      d.className = 'count ' + lv;
      d.querySelector('i').style.width = Math.min(100, 100 * n / max) + '%';
      d.lastChild.textContent = n + ' characters — ' + (!n ? 'empty' : n < lo ? 'a little short (aim for ' + lo + '–' + hi + ')' : n > hi ? 'Google may cut it off (aim for ' + lo + '–' + hi + ')' : 'good length');
    };
    inp.addEventListener('input', upd); inp.addEventListener('ph', upd); upd();
    setTimeout(() => inp.closest('.f') && inp.closest('.f').appendChild(d));
  }
  function googlePanel(card, data) {
    const pv = document.createElement('div');
    pv.innerHTML = '<p class="tab-intro">This is how the page can look in Google. Write the title and description for a traveller who is searching — say what the page offers and why to click.</p>' +
      '<div class="gprev"><div class="gu"><i>M</i><div>Meruka India Tourism<small>' + A.esc(location.host + (E.url || '')) + '</small></div></div><div class="gt"></div><div class="gd"></div></div>' +
      '<ul class="checks checks-s"></ul><hr style="border:0;border-top:1px solid var(--line);margin:18px 0">';
    card.prepend(pv);
    // (26 Oct 2026, client) keep it simple: the title and description show; the rest folds away under "More Google settings"
    const more = document.createElement('details'); more.className = 'g-more';
    more.innerHTML = '<summary>More Google settings <small>keywords, search words, hide from Google, share picture</small></summary>';
    [...card.querySelectorAll(':scope > .f')].forEach(f => { const k = f.dataset.k; if (k && !/^(title|description)$/.test(k)) more.appendChild(f); });
    if (more.children.length > 1) card.appendChild(more);
    const v = k => { const g = getters[k]; return g ? String(g() || '') : ''; };
    refreshGoogle = () => {
      // an empty box keeps the website's own text (its grey placeholder): the preview and the checks use that
      const ph = k => { const i = card.querySelector('.f[data-k="' + k + '"] input, .f[data-k="' + k + '"] textarea'); return i ? i.placeholder || '' : ''; };
      const t = v('title').trim() || ph('title').trim(), d = v('description').trim() || ph('description').trim(), fk = v('focusKeyword').trim().toLowerCase();
      const head = (getters.heading ? v('heading') : '').toLowerCase();
      pv.querySelector('.gt').textContent = t || '(no Google title yet)';
      pv.querySelector('.gd').textContent = d || '(no description yet — Google will pick some text from the page)';
      const L = [];
      L.push([t.length >= 30 && t.length <= 60 ? '' : t ? 'warn' : 'no', 'Google title ' + (t ? 'is ' + t.length + ' characters (best 30–60)' : 'is empty')]);
      L.push([d.length >= 120 && d.length <= 160 ? '' : d ? 'warn' : 'no', 'Description ' + (d ? 'is ' + d.length + ' characters (best 120–160)' : 'is empty')]);
      if (fk) {
        L.push([t.toLowerCase().includes(fk) ? '' : 'warn', 'The search words "' + fk + '" ' + (t.toLowerCase().includes(fk) ? 'is' : 'is not') + ' in the Google title']);
        L.push([d.toLowerCase().includes(fk) ? '' : 'warn', 'The search words ' + (d.toLowerCase().includes(fk) ? 'is' : 'is not') + ' in the description']);
        if (getters.heading) L.push([head.includes(fk) ? '' : 'warn', 'The search words ' + (head.includes(fk) ? 'is' : 'is not') + ' in the page title']);
      }
      if (getters.noindex && getters.noindex()) L.push(['no', 'This page is hidden from Google']);
      pv.querySelector('.checks').innerHTML = L.map(([c, txt]) => '<li class="' + c + '">' + A.esc(txt) + '</li>').join('');
    };
    refreshGoogle();
  }
  // ---------- (28 Oct 2026, client) SEO in a panel beside the page, as in the SEO plugins: Google (preview, checks,
  // title, description, focus keyword), Social media (Facebook / WhatsApp and X, each with its preview) and Advanced
  // (keywords, canonical address, noindex, nofollow). Empty social boxes use the Google text (shown in grey). ----------
  const sideEl = document.querySelector('[data-side]');
  const SEO_LABEL = { title: 'SEO title', description: 'Meta description', focusKeyword: 'Focus keyword', keywords: 'Keywords', noindex: 'Hide this page from Google (noindex)',
    nofollow: 'Do not follow the links on this page (nofollow)', canonical: 'Canonical address', ogTitle: 'Title', ogDescription: 'Description', ogImage: 'Picture',
    twTitle: 'Title', twDescription: 'Description', twImage: 'Picture', nosnippet: 'Show no text of this page in the results (nosnippet)', noimageindex: 'Show no photos of this page in Google Images (noimageindex)',
    noarchive: 'No saved copy in search engines (noarchive)', noshare: 'No preview when this page is shared (WhatsApp, Facebook, email)' };
  function seoSide(keys, data) {
    const side = sideEl; side.hidden = false; side.innerHTML = '<div class="sd-head"><b>SEO</b><span class="sd-score" data-score></span></div>';
    const sec = (title, sub, open) => { const d = document.createElement('details'); d.className = 'sd-sec'; d.open = !!open; d.innerHTML = '<summary><span>' + title + '</span><small>' + sub + '</small></summary><div class="sd-body"></div>'; side.appendChild(d); return d.querySelector('.sd-body'); };
    const put = (box, k) => {
      if (!keys.includes(k)) return null;
      const c = field(k, data[k], 0), f = fieldBox(k, c, true); f.classList.remove('half');
      const lb = f.querySelector(':scope > .lb, :scope > span'); if (lb && SEO_LABEL[k]) lb.textContent = SEO_LABEL[k];
      if (GHELP[k] && f.querySelector('.lb')) f.querySelector('.lb').insertAdjacentHTML('afterend', '<p class="fhelp">' + A.esc(GHELP[k]) + '</p>');
      box.appendChild(f); getters[k] = c.get; comps[k] = c;
      if (k === 'title' || k === 'description') counter(k, c);
      return f;
    };
    const g = sec('Google', 'how the page shows in search', true);
    g.insertAdjacentHTML('beforeend', '<div class="gprev"><div class="gu"><i>M</i><div>Meruka India Tourism<small>' + A.esc(location.host + (E.url || '')) + '</small></div></div><div class="gt"></div><div class="gd"></div></div><ul class="checks checks-s"></ul>');
    ['focusKeyword', 'title', 'description'].forEach(k => put(g, k));
    const so = sec('Social media', 'Facebook, WhatsApp, LinkedIn and X', false);
    so.insertAdjacentHTML('beforeend', '<div class="subtabs sd-tabs"><button type="button" class="on" data-net="fb">Facebook · WhatsApp</button><button type="button" data-net="x">X (Twitter)</button></div>' +
      '<div data-pane="fb"><div class="sp-card"><div class="sp-img" data-sp-img="fb"></div><div class="sp-txt"><small>' + A.esc(location.host) + '</small><b data-sp-t="fb"></b><span data-sp-d="fb"></span></div></div></div>' +
      '<div data-pane="x" hidden><div class="sp-card sp-x"><div class="sp-img" data-sp-img="x"></div><div class="sp-txt"><b data-sp-t="x"></b><span data-sp-d="x"></span><small>' + A.esc(location.host) + '</small></div></div></div>');
    const fbBox = so.querySelector('[data-pane="fb"]'), xBox = so.querySelector('[data-pane="x"]');
    ['ogTitle', 'ogDescription', 'ogImage'].forEach(k => put(fbBox, k)); ['twTitle', 'twDescription', 'twImage'].forEach(k => put(xBox, k));
    so.querySelectorAll('[data-net]').forEach(b => b.onclick = () => { so.querySelectorAll('[data-net]').forEach(x => x.classList.toggle('on', x === b)); fbBox.hidden = b.dataset.net !== 'fb'; xBox.hidden = b.dataset.net !== 'x'; });
    // (6 Nov 2026, client) what search engines may do with this page, one tick each: e.g. keep it out of Google but still
    // show a preview when it is shared by email or on social media
    const rl = sec('Rules for search engines', 'hide, no text, no photos, sharing', !!['noindex', 'nofollow', 'nosnippet', 'noimageindex', 'noarchive', 'noshare'].some(k => data[k]));
    rl.insertAdjacentHTML('beforeend', '<p class="fhelp">Each rule is for this page only. Rules for the whole website are in Google settings → Search engines.</p>');
    ['noindex', 'nofollow', 'nosnippet', 'noimageindex', 'noarchive', 'noshare'].forEach(k => put(rl, k));
    const ad = sec('Advanced', 'keywords, canonical address', false);
    ['keywords', 'canonical'].forEach(k => put(ad, k));
    const can = ad.querySelector('.f[data-k="canonical"] input'); if (can) can.placeholder = 'Empty: this page’s own address (' + (E.url || '/') + ')';
    const val = k => { const gt = getters[k]; return gt ? String(gt() || '').trim() : ''; };
    const ph = k => { const i = side.querySelector('.f[data-k="' + k + '"] input, .f[data-k="' + k + '"] textarea'); return i ? (i.placeholder || '').trim() : ''; };
    const pic = k => { const gt = getters[k]; return gt ? gt() : ''; };
    const fallbackImg = () => pic('ogImage') || (current && current.thumb) || data.heroSrc || data.photo || '/photos/taj-mahal-feature.webp';
    refreshGoogle = () => {
      const t = val('title') || ph('title'), d = val('description') || ph('description'), fk = val('focusKeyword').toLowerCase(), head = (getters.heading ? val('heading') : '').toLowerCase();
      side.querySelector('.gt').textContent = t || '(no SEO title yet)';
      side.querySelector('.gd').textContent = d || '(no description yet — Google will pick some text from the page)';
      const L = [];
      L.push([t.length >= 30 && t.length <= 60 ? '' : t ? 'warn' : 'no', 'SEO title ' + (t ? 'is ' + t.length + ' characters (best 30–60)' : 'is empty')]);
      L.push([d.length >= 120 && d.length <= 160 ? '' : d ? 'warn' : 'no', 'Meta description ' + (d ? 'is ' + d.length + ' characters (best 120–160)' : 'is empty')]);
      if (fk) {
        L.push([t.toLowerCase().includes(fk) ? '' : 'warn', 'Focus keyword ' + (t.toLowerCase().includes(fk) ? 'is' : 'is not') + ' in the SEO title']);
        L.push([d.toLowerCase().includes(fk) ? '' : 'warn', 'Focus keyword ' + (d.toLowerCase().includes(fk) ? 'is' : 'is not') + ' in the meta description']);
        if (getters.heading) L.push([head.includes(fk) ? '' : 'warn', 'Focus keyword ' + (head.includes(fk) ? 'is' : 'is not') + ' in the page title']);
      } else L.push(['warn', 'No focus keyword yet']);
      if (getters.noindex && getters.noindex()) L.push(['no', 'This page is hidden from Google']);
      side.querySelector('.checks').innerHTML = L.map(([c, txt]) => '<li class="' + c + '">' + A.esc(txt) + '</li>').join('');
      const good = L.filter(x => !x[0]).length, bad = L.some(x => x[0] === 'no');
      const sc = side.querySelector('[data-score]'); sc.textContent = bad ? 'Needs work' : good === L.length ? 'Good' : 'OK'; sc.className = 'sd-score ' + (bad ? 'bad' : good === L.length ? 'good' : 'ok');
      // social: empty boxes use the Google text
      const setPh = (k, v) => { const i = side.querySelector('.f[data-k="' + k + '"] input, .f[data-k="' + k + '"] textarea'); if (i) i.placeholder = v; };
      setPh('ogTitle', t); setPh('ogDescription', d); setPh('twTitle', val('ogTitle') || t); setPh('twDescription', val('ogDescription') || d);
      const fbT = val('ogTitle') || t, fbD = val('ogDescription') || d, xT = val('twTitle') || fbT, xD = val('twDescription') || fbD;
      side.querySelector('[data-sp-t="fb"]').textContent = fbT; side.querySelector('[data-sp-d="fb"]').textContent = fbD;
      side.querySelector('[data-sp-t="x"]').textContent = xT; side.querySelector('[data-sp-d="x"]').textContent = xD;
      side.querySelector('[data-sp-img="fb"]').style.backgroundImage = 'url("' + String(fallbackImg()).replace(/"/g, '') + '")';
      side.querySelector('[data-sp-img="x"]').style.backgroundImage = 'url("' + String(pic('twImage') || fallbackImg()).replace(/"/g, '') + '")';
    };
    side.addEventListener('input', () => refreshGoogle()); side.addEventListener('click', () => setTimeout(refreshGoogle, 300));
    refreshGoogle(); liveSeo(side);
  }
  // the page's current Google title and description (from the website itself) as grey placeholders
  function liveSeo(card) {
    if (!E.url) return;
    fetch(E.url, { credentials: 'same-origin' }).then(r => r.ok ? r.text() : '').then(html => {
      if (!html) return;
      const d = new DOMParser().parseFromString(html, 'text/html');
      const now = { title: (d.querySelector('title') || {}).textContent || '', description: (d.querySelector('meta[name="description"]') || { getAttribute: () => '' }).getAttribute('content') || '',
        keywords: (d.querySelector('meta[name="keywords"]') || { getAttribute: () => '' }).getAttribute('content') || '' };
      Object.entries(now).forEach(([k, v]) => { const i = card.querySelector('.f[data-k="' + k + '"] input, .f[data-k="' + k + '"] textarea'); if (i && v) { i.placeholder = v.trim(); i.dispatchEvent(new Event('ph')); } });
      refreshGoogle();
    }).catch(() => {});
  }
  const GHELP = {
    title: 'The blue headline in Google results and the name in the browser tab.',
    description: 'The two grey lines under the headline in Google.',
    keywords: 'Words people search for, separated by commas (Google mostly ignores these, other search engines may use them).',
    focusKeyword: 'The words a traveller types in Google to find this page, e.g. "Golden Triangle tour". Not shown on the website: the checks above use it.',
    ogImage: 'Shown when the page is shared. Empty: the page’s own photo. Best 1200 × 630.',
    ogTitle: 'Empty: the SEO title is used.', ogDescription: 'Empty: the meta description is used.',
    twTitle: 'Empty: the Facebook title is used.', twDescription: 'Empty: the Facebook description is used.', twImage: 'Empty: the Facebook picture is used.',
    canonical: 'Only when the same content is on another address: give the main address here. Usually leave empty.',
    nofollow: 'Rarely needed. Google then does not follow the links on this page.',
    nosnippet: 'The page can still be found, but Google shows only its title, no text under it.', noimageindex: 'The photos of this page do not show in Google Images.',
    noarchive: 'Search engines keep no saved copy of the page.', noshare: 'Untick to show the title, text and picture again when someone shares the link.'
  };

  // ---------- the form, in tabs ----------
  function build(res) {
    current = res; getters = {}; comps = {}; templates = res.templates || {}; root.innerHTML = ''; tabsEl.innerHTML = ''; refreshGoogle = () => {}; dayAuto = (res.dayPhotos || []).slice();
    const data = Object.assign({}, res.data);   // a copy: the SEO boxes below are unpacked from it
    // (26 Oct 2026, client) each day of a tour can have its own photo: the box sits under the day's title
    if (E.kind === 'tours' && Array.isArray(data.days)) data.days = data.days.map(d => d && typeof d === 'object' && !('photo' in d) ? Object.fromEntries(Object.entries(d).flatMap(([k, v]) => k === 'eta' ? [[k, v], ['photo', '']] : [[k, v]]).concat('eta' in d ? [] : [['photo', '']])) : d);
    let tabs = TABS[E.mode === 'single' ? E.id : E.kind];
    // (4 Nov 2026, client) a destination page (Four Regions) has its Tours tab again: up to four tours, chosen by hand
    if (E.kind === 'pages' && !(current && current.group === 'places')) tabs = tabs.filter(t => t[0] !== 'Tours');
    if (!tabs) tabs = res.fields.filter(k => k in data).map(k => [label(k), [k], HELP[k] || '']);   // settings: one tab per part
    singleSeo = E.mode === 'single' && data.seo && typeof data.seo === 'object';
    if (singleSeo) { const sv = data.seo; delete data.seo; GOOGLE.forEach(k => { data[k] = k in sv ? sv[k] : (k === 'noindex' || k === 'nofollow' ? false : ''); }); tabs = tabs.concat([[SEO_TAB, GOOGLE, 'How this page shows in Google and when it is shared. Leave a box empty to keep the text the website uses now (shown in grey).']]); }
    const used = new Set(tabs.flatMap(t => t[1]));
    // made automatically or chosen elsewhere: the breadcrumb, and a category's tours (ticked in each tour)
    // (3 Nov 2026, client) a category has no menu group or closing text any more: no "More" tab for them
    const AUTO = E.mode === 'item' ? ['breadcrumb'].concat(E.kind === 'lists' && E.id !== 'itineraries' ? ['groups', 'navGroup', 'outro', 'tourType'] : E.kind === 'tours' ? ['heroSrc', 'heroAlt'] : E.kind === 'pages' ? ['tours'] : []) : E.id === 'reviews' ? ['all'] : [];
    const rest = res.fields.filter(k => k in data && !used.has(k) && !AUTO.includes(k));
    if (rest.length) tabs = tabs.concat([['More', rest, '']]);
    const panes = [];
    sideEl.hidden = true; sideEl.innerHTML = '';
    tabs.forEach(([name, keys, intro], ti) => {
      keys = keys.filter(k => k in data); if (!keys.length) return;
      if (name === SEO_TAB) return seoSide(keys, data);
      const card = document.createElement('section'); card.className = 'card fg'; card.hidden = true;
      // (27 Oct 2026, client) a part of a page: its name as a heading, then what it is, then its fields
      // (27 Oct 2026, client video) the tab already names the part: only the short note what it is, no second heading
      if (E.mode === 'single' && tabs.length > 1 && intro) card.insertAdjacentHTML('beforeend', '<div class="tab-head"><p>' + A.esc(intro) + '</p></div>');
      else if (intro) card.insertAdjacentHTML('beforeend', '<p class="tab-intro">' + A.esc(intro) + '</p>');
      keys.forEach(k => {
        // (3 Nov 2026, client) a destination page is not put in the India Travel Guide
        if (k === 'guideSection' && current && current.group === 'places') return;
        if (k === 'listPhoto' && !(current && current.group === 'places' && (current.data.breadcrumb || []).length > 2)) return;
        const twoPhotos = (k === 'heroSrc' || k === 'listPhoto') && current && current.group === 'places' && (current.data.breadcrumb || []).length > 2;
        const c = field(k, data[k], 0);
        // (26 Oct 2026, client video II) a tab with one thing in it needs no second title for it
        const f = keys.length === 1 && name !== SEO_TAB ? Object.assign(document.createElement('div'), { className: 'f' }) : fieldBox(k, c, true);
        if (E.mode === 'single' && /^sec[A-Z]/.test(k) && f.querySelector(':scope > .lb')) f.querySelector(':scope > .lb').remove();
        if (keys.length === 1 && name !== SEO_TAB) f.appendChild(c.el);
        if (GHELP[k] && name === SEO_TAB) f.querySelector('.lb').insertAdjacentHTML('afterend', '<p class="fhelp">' + A.esc(GHELP[k]) + '</p>');
        if (typeof twoPhotos !== 'undefined' && twoPhotos) {
          f.classList.add('half', 'two-ph');
          const where = current.parentName || 'its region or state page', me = String(current.data.heading || '').replace(/<[^>]+>/g, '');
          const lb = f.querySelector(':scope > .lb'), help = f.querySelector(':scope > .fhelp');
          if (lb) lb.textContent = k === 'heroSrc' ? '1 · Banner photo' : '2 · Photo in the list';
          const say = k === 'heroSrc' ? 'The wide photo at the top of the ' + me + ' page itself.' : 'The photo of the ' + me + ' card on the ' + where + ' page. Not chosen: the banner photo shows there too.';
          if (help) help.textContent = say; else if (lb) lb.insertAdjacentHTML('afterend', '<p class="fhelp">' + A.esc(say) + '</p>');
        }
        card.appendChild(f); getters[k] = c.get; comps[k] = c;
        if ((k === 'title' || k === 'description') && name === SEO_TAB) counter(k, c);
      });
      pairHalves(card);
      if (name === SEO_TAB) { googlePanel(card, data); liveSeo(card); }
      const b = document.createElement('button'); b.type = 'button'; b.textContent = name; b.dataset.key = keys.join(' ');
      b.onclick = () => { panes.forEach(p => { p.card.hidden = p.b !== b; p.b.classList.toggle('on', p.b === b); }); history.replaceState(null, '', '#' + A.slug(name)); };
      tabsEl.appendChild(b); root.appendChild(card); panes.push({ b, card, slug: A.slug(name), keys });
    });
    const addPane = (name, card, onShow) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = name;
      b.onclick = () => { if (onShow) onShow(); panes.forEach(p => { p.card.hidden = p.b !== b; p.b.classList.toggle('on', p.b === b); }); history.replaceState(null, '', '#' + A.slug(name)); };
      const after = panes[0] ? panes[0].b.nextSibling : null;
      tabsEl.insertBefore(b, after); root.insertBefore(card, panes[0] ? panes[0].card.nextSibling : null);
      panes.splice(1, 0, { b, card, slug: A.slug(name), keys: [] });
      if (location.hash.slice(1) === A.slug(name)) b.click();
    };
    // (27 Oct 2026, client) the tour's includes, excludes and notes: the sections under the days, in a tab of their own
    if (comps.details && comps.details.more) {
      const card = document.createElement('section'); card.className = 'card fg'; card.hidden = true;
      card.insertAdjacentHTML('beforeend', '<p class="tab-intro">The lists under the days on the tour page. One point per line: press Enter for the next point.</p>');
      card.appendChild(comps.details.more);
      const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Includes & notes';
      b.onclick = () => { panes.forEach(p => { p.card.hidden = p.b !== b; p.b.classList.toggle('on', p.b === b); }); history.replaceState(null, '', '#includes-notes'); };
      const seoP = panes.find(p => p.b.textContent === SEO_TAB);   // SEO stays the last tab
      tabsEl.insertBefore(b, seoP ? seoP.b : null); root.insertBefore(card, seoP ? seoP.card : null); panes.push({ b, card, slug: 'includes-notes', keys: [] });
    }
    const h = location.hash.slice(1) || new URLSearchParams(location.search).get('tab') || (new URLSearchParams(location.search).get('col') ? 'link-columns' : '');
    const start = panes.find(p => p.slug === h || p.keys.includes(h)) || panes[0];
    panes.forEach(p => p.b.addEventListener('click', () => document.querySelectorAll('.ad-kids a[href*="?tab="]').forEach(a => a.classList.toggle('on', a.getAttribute('href').endsWith('tab=' + p.slug)))));
    if (start) start.b.click();
    if (panes.length < 2) tabsEl.hidden = true;
    if (E.kind === 'tours' && E.mode === 'item') { catState = null; categoriesTab(addPane).then(() => { tabsEl.hidden = false; }); }
    if (E.kind === 'tours' && comps.days) { autoFromDays(); dayNotes(comps.days.el); const dl = comps.days.el; new MutationObserver(() => dayNotes(dl)).observe(dl, { childList: true, subtree: true }); }
    // Footer menu ?col=2: that column opens, the others stay closed
    const col = +new URLSearchParams(location.search).get('col');
    if (E.id === 'footer' && col && comps.footerCols) { const its = [...comps.footerCols.el.querySelectorAll(':scope > .arr > .it')]; its.forEach((it, i) => it.classList.toggle('closed', i !== col - 1)); if (its[col - 1]) setTimeout(() => its[col - 1].scrollIntoView({ block: 'start', behavior: 'smooth' }), 50); }
    // a region page: its place cards in a tab of their own
    if (E.kind === 'posts' && comps.html) { postSectionsTab(root, tabsEl, panes); tabsEl.hidden = false; }
    if (E.kind === 'pages' && comps.html) { if (current && /^(places|guide)$/.test(current.group || '')) sectionsTab(addPane); cardsTab(addPane); glanceTab(addPane); if (panes.length > 1) tabsEl.hidden = false; const pc = h && panes.find(p => p.slug === h); if (pc) pc.b.click(); }
    dirty = false; state.textContent = ''; state.classList.remove('dirty');
  }
  // (26 Oct 2026, client) a tour's route and length fill in by themselves from its days: the length from how many days
  // there are, the route from the places in the day titles (a place repeated one after the other is written once)
  const DROP = /\b(arrival|arrive|departure|depart|sightseeing|sight seeing|local|excursion|drive|hometown|home town|onward|journey|full day|half day|day|tour|by air|by train|by road|fly|flight|train|via)\b/gi;
  function routeOf(days) {
    const out = [];
    // (4 Nov 2026, client) a date or "Day 3" in front of a day's title ("14 Nov: Delhi") is not a place
    days.forEach(d => String(d.title || '').replace(/^\s*(day\s*\d+|\d{1,2}(st|nd|rd|th)?\s+[a-z]{3,9}\.?(\s+\d{2,4})?|[a-z]{3,9}\s+\d{1,2})\s*[:.\-–]\s*/i, '').split(/\s*[–—-]\s*|\s+to\s+|,|\//i).forEach(p => {
      const n = p.replace(/\(.*?(\)|$)/g, '').replace(DROP, ' ').replace(/\s+/g, ' ').trim().replace(/^(in|at|to|from|and|of)\s+/i, '');
      if (n && /[a-z]/i.test(n) && (!out.length || out[out.length - 1].toLowerCase() !== n.toLowerCase())) out.push(n);
    }));
    return out.join(' - ');
  }
  const two = n => String(n).padStart(2, '0');
  // (4 Nov 2026, client) the route is typed by hand (left empty, it is made from the days, as before); the length still
  // comes from how many days there are
  function autoFromDays() {
    const route = comps.route && (comps.route.input || comps.route.el), dur = comps.duration && comps.duration.el;
    const pane = comps.days.el.closest('section') || comps.days.el;
    const durF = dur && dur.closest('.f'); if (durF) durF.hidden = true;
    const sum = document.createElement('div'); sum.className = 'auto-sum';
    const show = () => { sum.innerHTML = '<span>Length <small>made from the days</small></span><em>' + A.esc(dur ? dur.value : '') + '</em>'; };
    if (durF) { durF.parentNode.insertBefore(sum, durF); show(); }
    const rf = route && route.closest('.f');
    // (4 Nov 2026, client) the route box as wide as every other box (it was half, beside the hidden length)
    if (rf) rf.classList.remove('half'); if (durF) durF.classList.remove('half');
    let auto = route ? routeOf(getters.days() || []) : '';
    if (rf) {
      if (!rf.querySelector('.fhelp')) rf.querySelector('.lb').insertAdjacentHTML('afterend', '<p class="fhelp">The stops, e.g. Delhi - Agra - Jaipur - Delhi. Leave it empty and it is made from the day titles.</p>');
      route.placeholder = auto || 'Delhi - Agra - Jaipur - Delhi';
      const mk = document.createElement('button'); mk.type = 'button'; mk.className = 'lnk route-mk'; mk.textContent = 'Make it from the days';
      mk.onclick = () => { const r = routeOf(getters.days() || []); if (r) { route.value = r; auto = r; route.dispatchEvent(new Event('input', { bubbles: true })); touch(); } };
      rf.appendChild(mk);
    }
    let last = JSON.stringify((getters.days() || []).map(d => d.title));
    const run = () => {
      const days = getters.days() || [], key = JSON.stringify(days.map(d => d.title));
      if (key === last) return; last = key;
      if (dur && days.length) dur.value = two(days.length - 1) + ' Nights · ' + two(days.length) + ' Days';
      // a route typed by hand stays; an empty one, or one still as the days made it, follows the days
      if (route) { const r = routeOf(days); if (!route.value.trim() || route.value === auto) { if (r) route.value = r; } auto = r; route.placeholder = r || route.placeholder; }
      show(); touch();
    };
    pane.addEventListener('input', run); new MutationObserver(() => setTimeout(run, 0)).observe(pane, { childList: true, subtree: true });
  }
  // (3 Nov 2026, client, option A) a day's note shows as on the tour page: a yellow box with an "i", under the day's
  // text, with a pencil (the full editor in a popup) and a bin. Without a note: "+ Add a note for this day".
  const NOTE_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';
  const PEN_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
  const BIN_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';
  function dayNotes(root) {
    root.querySelectorAll('.f[data-k="note"]:not([data-dn])').forEach(nf => {
      nf.dataset.dn = '1';
      const it = nf.closest('.it'), ed = nf.querySelector('.rte');
      if (!it || !ed) return;
      nf.hidden = true;
      const wrap = document.createElement('div'); wrap.className = 'dna';
      const tf = nf.parentNode.querySelector(':scope > .f[data-k="html"]');
      (tf || nf).after(wrap);
      const dayName = () => { const t = it.querySelector('.f[data-k="title"] input'), d = it.querySelector('.f[data-k="day"] input'); return [(d && d.value) || '', (t && t.value) || ''].filter(Boolean).join(' — '); };
      const draw = () => {
        const has = !!ed.textContent.replace(/\s+/g, ' ').trim();
        wrap.innerHTML = '<label class="lb">Note for this day <span class="lb-opt">(optional)</span></label>' + (has
          ? '<div class="dna-box"><span class="dna-ic">' + NOTE_IC + '</span><div class="dna-t">' + ed.innerHTML + '</div><span class="dna-acts"><button type="button" class="dna-b" data-na="edit" title="Change the note" aria-label="Change the note">' + PEN_IC + '</button><button type="button" class="dna-b dna-rm" data-na="rm" title="Remove the note" aria-label="Remove the note">' + BIN_IC + '</button></span></div>'
          : '<button type="button" class="dna-add" data-na="edit"><b>+ Add a note for this day</b><small>E.g. “The Taj Mahal is closed on Fridays.” It shows in a yellow box under the day.</small></button>');
      };
      const save = html => { ed.innerHTML = html; ed.dispatchEvent(new Event('input', { bubbles: true })); touch(); draw(); };
      const edit = async () => {
        let ne = null;
        const box = await A.dialog({ title: 'Note for ' + (dayName() || 'this day'), ok: 'Save note',
          html: '<div data-ne></div><p class="hint" style="margin:8px 0 0">It shows in a yellow box under this day on the tour page.</p>',
          onOpen: b => {
            b.closest('.modal-box').classList.add('dc-modal');
            ne = rte(ed.innerHTML, { min: 140 }); b.querySelector('[data-ne]').appendChild(ne.el);
            setTimeout(() => { const r = ne.el.querySelector('.rte'); if (r) r.focus(); }, 30);
          } });
        if (box && ne) save(ne.html().replace(/^(<p><br><\/p>|<br>)$/i, ''));
      };
      wrap.onclick = async e => {
        const b = e.target.closest('[data-na]'); if (!b) return;
        if (b.dataset.na === 'edit') return edit();
        if (await A.confirm('Remove the note of ' + (dayName() || 'this day') + '?', 'The yellow note box goes away from this day. You can add it again later.', 'Remove', true)) save('');
      };
      draw();
    });
  }

  // ---------- (3 Nov 2026, client) the whole itinerary from a file: a Word file (.docx), a PDF, a text file or pasted
  // text (itinerary-import.js reads and understands it). It fills the days, the description, the prices and the lists,
  // is saved as a draft, and the editor opens again with it: check it, then publish. ----------
  const IMP_FMT = '<div class="imp-fmt"><b>How the file should look</b><pre>Golden Triangle Tour\nA short description of the tour …\n\nDay 1: Arrival in Delhi\nWelcome to India! …\n\nDay 2: Delhi – Agra (210 km / 4 hrs)\nAfter breakfast, drive to Agra …\nNote: The Taj Mahal is closed on Fridays.\n\nTour Pricing\n3-Star: $85 - $100 per person per day\n4-Star: $110 - $170 per person per day\n\nThis Tour Includes\nHotel accommodation with breakfast\n\nThis Tour Excludes\nAir fare\n\nImportant Notes\nPrices may change in festival weeks.</pre><small>“Day 1”, “Day 01 -” or “01 Day” all work. The text before Day 1 becomes the description. A line that starts with “Note:” is that day’s note.</small></div>';
  const impDialog = async opts => {
    let parsed = null;
    const box = await A.dialog({ title: 'Import the itinerary', ok: 'Import',
      html: IMP_FMT + '<label class="lb">The file: Word (.docx), PDF or text (.txt)</label><input type="file" class="in" data-file accept=".docx,.pdf,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain">' +
        '<label class="lb" style="margin-top:10px">Or paste the text</label><textarea class="in" data-text rows="6" placeholder="Day 1: Arrival in Delhi …"></textarea>' +
        (opts.keep ? '<label class="lb" style="margin-top:10px">The days the tour has now</label><select class="in" data-how><option value="replace">Replace them with the imported days</option><option value="add">Keep them; add the imported days after them</option></select>' : '') + '<p class="imp-res hint"></p>',
      onOpen: b => {
        const res = b.querySelector('.imp-res');
        const show = p => { parsed = p; const f = window.ITIN.found(p); res.className = 'imp-res ' + (p.days.length ? 'ok' : 'bad'); res.textContent = p.days.length ? 'Found: ' + f + '.' : 'No “Day 1: …” line found. Check the format above.'; };
        b.querySelector('[data-file]').onchange = async e => {
          const f = e.target.files[0]; if (!f) return;
          res.className = 'imp-res hint'; res.textContent = 'Reading the file…';
          try { show(window.ITIN.parse(await window.ITIN.read(f))); } catch (err) { parsed = null; res.className = 'imp-res bad'; res.textContent = err.message; }
        };
        b.querySelector('[data-text]').oninput = e => show(window.ITIN.parse(window.ITIN.textParas(e.target.value)));
      },
      validate: () => parsed && parsed.days.length ? '' : 'Choose a file or paste the text first (with “Day 1: …” lines).' });
    return box && parsed ? { parsed, keep: !!(box.querySelector('[data-how]') && box.querySelector('[data-how]').value === 'add') } : null;
  };
  window.MK_IMPORT = impDialog;   // the "Add a tour" popup uses it too
  function importDays(card) {
    const bar = document.createElement('div'); bar.className = 'imp-bar';
    bar.innerHTML = '<div><b>Import the itinerary</b><small>From a Word file, a PDF or text: the days, description, prices, includes, excludes and notes are filled in.</small></div><button type="button" class="btn btn-s btn-p" data-imp>Import a file…</button>';
    card.insertBefore(bar, card.querySelector('.f') || card.firstChild.nextSibling);
    bar.querySelector('[data-imp]').onclick = async () => {
      const r = await impDialog({ keep: true }); if (!r) return;
      try {
        const body = { data: window.ITIN.merge(collect(), r.parsed, r.keep) };
        if (catState) body.categories = catState();
        await A.api('PUT', apiUrl, body);
        dirty = false; await load();
        A.toast('Imported: ' + window.ITIN.found(r.parsed) + '. Saved as a draft: check it, then publish.');
      } catch (e) { A.toast(e.message, true); }
    };
  }
  const collect = () => {
    const out = Object.fromEntries(Object.entries(getters).map(([k, g]) => [k, g()]));
    if (singleSeo) { out.seo = {}; GOOGLE.forEach(k => { if (k in out) { out.seo[k] = out[k]; delete out[k]; } }); }
    return out;
  };

  // ---------- status, draft, publish (23 Oct 2026) ----------
  const when = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); };
  // (4 Nov 2026, client) a destination or guide page: where it is, and "Move" to put it somewhere else
  function showPlace(res) {
    const el = document.querySelector('[data-place]'); if (!el) return;
    if (E.kind !== 'pages' || !/^(places|guide)$/.test(res.group || '') || !res.data || !Array.isArray(res.data.breadcrumb)) { el.hidden = true; return; }
    const mid = res.data.breadcrumb.slice(1, -1);
    el.hidden = false;
    el.innerHTML = '<span class="muted">In:</span> ' + (mid.length ? mid.map(b => A.esc(b.label)).join(' › ') : res.group === 'guide' ? A.esc(el.dataset.part || 'the India Travel Guide') : 'its region') + ' <button type="button" class="lnk addr-edit" data-moveit>Move</button>';
    el.querySelector('[data-moveit]').onclick = async () => {
      if (dirty && !(await A.confirm('Save first?', 'The page has changes that are not saved. Moving it does not save them.', 'Move anyway', false))) return;
      const out = await A.movePage({ id: E.id, url: res.url, name: (res.data.heading || '').replace(/<[^>]+>/g, ''), group: res.group, now: mid.map(b => b.href).filter(Boolean) });
      if (out) showPlace(Object.assign({}, res, { data: Object.assign({}, res.data, { breadcrumb: out.data.breadcrumb }) }));
    };
  }
  function showStatus(res) {
    current = res; showPlace(res);
    const live = res.published !== false;
    statusEl.className = 'pill ' + (res.draft ? 'pill-draft' : live ? 'pill-live' : 'pill-off');
    statusEl.textContent = res.draft ? (live ? 'Live — with unpublished changes' : 'Draft — not on the website yet') : live ? 'Live on the website' : 'Not on the website';
    if (res.draft) { draftNote.hidden = false; draftNote.innerHTML = '📝 <span>You are seeing the draft saved ' + A.esc(when(res.draft.at)) + (res.draft.by ? ' by ' + A.esc(res.draft.by) : '') + '. ' + (E.canPublish ? 'Press Publish to put it on the website.' : 'An Owner or Editor will publish it.') + '</span>'; }
    else draftNote.hidden = true;
    const disc = document.querySelector('[data-discard]'), unp = document.querySelector('[data-unpublish]');
    if (disc) disc.hidden = !res.draft;
    if (unp) unp.hidden = !live || E.mode !== 'item';
    if (saveBtn) saveBtn.textContent = live ? 'Publish changes' : 'Publish';
  }
  async function load() {
    try { const res = await A.api('GET', apiUrl); build(res); showStatus(res); }
    catch (e) { root.innerHTML = '<div class="card"><p class="err">' + A.esc(e.message) + '</p></div>'; }
  }
  async function send(publish) {
    const btn = publish ? saveBtn : draftBtn;
    if (btn) btn.disabled = true; state.textContent = publish ? 'Publishing…' : 'Saving…';
    try {
      const body = { data: collect(), publish };
      if (catState) body.categories = catState();
      const res = await A.api('PUT', apiUrl, body);
      dirty = false; state.classList.remove('dirty');
      state.textContent = (publish ? '✓ Published ' : '✓ Draft saved ') + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (res.data && res.data.heading) document.querySelector('[data-title]').textContent = res.data.heading;
      showStatus(res);
      A.toast(publish ? 'Published — the website is updated' + (res.categoriesChanged && res.categoriesChanged.length ? ' (' + res.categoriesChanged.join(', ') + ')' : '') : 'Draft saved — the website is not changed');
    } catch (e) { state.textContent = 'Not saved'; A.toast(e.message, true); }
    if (btn) btn.disabled = false;
  }
  if (saveBtn) saveBtn.onclick = () => send(true);
  draftBtn.onclick = () => send(false);
  document.querySelector('[data-revert]') && (document.querySelector('[data-revert]').onclick = async () => {
    if (!(await A.confirm('Back to the original?', 'This brings back the original text of this ' + E.one + ' on the website. Earlier versions stay in History.', 'Bring back the original', true))) return;
    try { const res = await A.api('POST', apiUrl + '/revert'); build(res); showStatus(res); A.toast('Back to the original'); } catch (e) { A.toast(e.message, true); }
  });
  const disc = document.querySelector('[data-discard]');
  if (disc) disc.onclick = async () => {
    if (!(await A.confirm('Throw away the draft?', 'The changes saved as a draft are removed. What is on the website stays as it is.', 'Throw away', true))) return;
    try { const res = await A.api('POST', apiUrl + '/discard'); build(res); showStatus(res); A.toast('Draft thrown away'); } catch (e) { A.toast(e.message, true); }
  };
  const unp = document.querySelector('[data-unpublish]');
  if (unp) unp.onclick = async () => {
    if (!(await A.confirm('Take this ' + E.one + ' off the website?', 'Visitors will not find it any more. It stays here, and you can publish it again any time.', 'Take it off', true))) return;
    try { showStatus(await A.api('POST', apiUrl + '/unpublish')); A.toast('Taken off the website'); } catch (e) { A.toast(e.message, true); }
  };
  const del = document.querySelector('[data-delete]');
  if (del) del.onclick = async () => {
    if (!(await A.confirm('Delete this ' + E.one + '?', 'It is taken off the website. You can put it back from "Deleted items".', 'Delete', true))) return;
    try { await A.api('DELETE', apiUrl); dirty = false; location.href = '/admin/' + (E.kind === 'lists' ? 'lists' : E.kind); } catch (e) { A.toast(e.message, true); }
  };
  // History: every published version (and the original); one can be loaded into the form, then published again
  document.querySelector('[data-history]').onclick = async () => {
    let items;
    try { items = (await A.api('GET', apiUrl + '/revisions')).items; } catch (e) { return A.toast(e.message, true); }
    const box = await A.dialog({
      title: 'History', ok: 'Close', cancel: false,
      html: !items.length ? '<p class="hint">No earlier versions yet. Each time this is published, a copy is kept here (the latest 25).</p>' :
        '<p class="hint">Load a version into the form, check it, then press Publish to put it back on the website.</p><div class="pick-list">' +
        items.map(r => '<button type="button" data-rev="' + A.esc(r.rev) + '"><b>' + A.esc(when(r.at)) + ' — ' + A.esc(r.note) + '</b><small>' + A.esc(r.by ? 'by ' + r.by : 'imported content') + '</small></button>').join('') + '</div>',
      onOpen: (b, close) => {
        b.querySelectorAll('[data-rev]').forEach(x => x.onclick = async () => {
          try {
            const r = await A.api('GET', apiUrl + '/revisions/' + x.dataset.rev);
            build(Object.assign({}, current, { data: Object.assign({}, current.data, r.data) }));
            dirty = true; state.textContent = '● Older version loaded — publish to put it back'; state.classList.add('dirty');
            close(); A.toast('Version loaded into the form');
          } catch (e) { A.toast(e.message, true); }
        });
      }
    });
  };
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); draftBtn.click(); } });
  // (4 Nov 2026, client) leaving with unsaved changes asks in the panel's own popup (A.leaveGuard)
  A.leaveGuard(() => dirty);

  // ---------- a tour's categories: one tick per category; "+ New category" makes one here ----------
  // (26 Oct 2026, client) the chosen categories on top as tags, then every category in the groups of the website's menu
  async function categoriesTab(panesAdd) {
    let items;
    try { items = (await A.api('GET', '/admin/api/tour-categories/' + E.id)).items; } catch (e) { return; }
    // (27 Oct 2026, client) like WordPress's category box: the website's menu groups, each a tidy list of tick boxes;
    // one line says where the tour shows; categories are made in Tours → Categories, not here
    // (27 Oct 2026, client) the search sits in the row of tabs, beside "Categories", and shows only on this tab
    const card = document.createElement('section'); card.className = 'card'; card.hidden = true;
    card.innerHTML = '<p class="ct-sum" data-on></p><div class="ct-grid" data-cl></div>';
    const cs = document.createElement('input'); cs.className = 'in etabs-q'; cs.type = 'search'; cs.placeholder = 'Search a category or code'; cs.hidden = true;
    tabsEl.appendChild(cs);
    new MutationObserver(() => { cs.hidden = card.hidden; }).observe(card, { attributes: true, attributeFilter: ['hidden'] });
    const cl = card.querySelector('[data-cl]'), on = card.querySelector('[data-on]');
    const groups = [...new Set(items.map(c => c.group))];
    const drawOn = () => { const sel = items.filter(c => c.checked); on.innerHTML = sel.length ? 'Shows in: <b>' + sel.map(c => A.esc(c.name)).join(', ') + '</b>' : 'Not in any category yet: tick one below.'; };
    const draw = () => {
      const v = cs.value.trim().toLowerCase();
      cl.innerHTML = groups.map(g => {
        const list = items.filter(c => c.group === g && (!v || (c.name + ' ' + c.code + ' ' + g).toLowerCase().includes(v)));
        if (!list.length) return '';
        return '<div class="ct-g"><h4>' + A.esc(g) + ' <small>' + list.length + '</small></h4>' + list.map(c => '<label><input type="checkbox" data-c="' + A.esc(c.id) + '"' + (c.checked ? ' checked' : '') + '><span>' + A.esc(c.name) + (c.published ? '' : ' <small class="muted">(draft)</small>') + '</span>' + (c.code ? '<i class="code-b" title="Tour code">' + A.esc(c.code) + '</i>' : '') + '</label>').join('') + '</div>';
      }).join('') || '<p class="hint">No category found.</p>';
      drawOn();
    };
    cl.onchange = e => { const x = e.target.closest('[data-c]'); if (!x) return; items.find(c => c.id === x.dataset.c).checked = x.checked; drawOn(); touch(); };
    cs.oninput = draw; draw();
    catState = () => items.filter(c => c.checked).map(c => c.id);
    panesAdd('Categories', card);
  }

  // ---------- (27 Oct 2026, client) the page's address: this server's host, and "Change" to give it a new one ----------
  document.querySelectorAll('[data-host]').forEach(h => { h.textContent = location.host; });
  const addrBtn = document.querySelector('[data-addr]');
  if (addrBtn) addrBtn.onclick = async () => {
    const link = document.querySelector('[data-url]'), now = link.getAttribute('href'), pre = E.kind === 'posts' ? '/blog/' : '/';
    if (dirty) return A.toast('Save or publish your changes first, then change the address.', true);
    const box = await A.dialog({ title: 'Change the page address', ok: 'Change address',
      html: '<label class="lb">New address</label><div class="addr-row"><span class="muted">' + A.esc(location.host + pre) + '</span><input class="in" data-a></div>' +
        '<p class="hint">Letters, numbers and - only. The old address keeps working: visitors and Google are sent to the new one.</p>',
      onOpen: b => { const i = b.querySelector('[data-a]'); i.value = now.slice(pre.length); i.select(); },
      validate: b => /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(b.querySelector('[data-a]').value.trim()) ? '' : 'Use letters, numbers and - only.' });
    if (!box) return;
    try {
      const r = await A.api('POST', apiUrl + '/address', { url: box.querySelector('[data-a]').value.trim() });
      link.setAttribute('href', r.url); document.querySelector('[data-path]').textContent = r.url;
      const pv = document.querySelector('[data-preview]'); E.url = r.url;
      A.toast('Address changed to ' + r.url + ' — the old one now leads here');
    } catch (e) { A.toast(e.message, true); }
  };
  // ---------- (27 Oct 2026, client) a tour's code (GT-1 …): shown before the title; click it to give or change it ----------
  const codeBtn = document.querySelector('[data-code]');
  const showCode = c => { codeBtn.innerHTML = c ? 'Tour code <b>' + A.esc(c) + '</b>' : '+ Tour code'; codeBtn.classList.toggle('none', !c); };
  if (codeBtn) {
    A.api('GET', apiUrl + '/code').then(r => showCode(r.code)).catch(() => showCode(''));
    codeBtn.onclick = async () => {
      if (!E.canPublish) return A.toast('An Owner or Editor gives the codes.', true);
      let r = { code: '', suggest: '' }; try { r = await A.api('GET', apiUrl + '/code'); } catch (e) {}
      const box = await A.dialog({ title: 'Tour code', ok: 'Save code',
        html: '<label class="lb">Code</label><input class="in" data-c placeholder="e.g. GT-9" style="text-transform:uppercase">' +
          '<p class="hint">' + (E.kind === 'tours' ? 'The code of its category, a dash and a number (GT-1, ER-3 …).' : 'Two letters for this category (GT, ER …); its tours get GT-1, GT-2 …') +
          (r.suggest ? ' Next free code: <button type="button" class="lnk" data-s>' + A.esc(r.suggest) + '</button>' : '') + ' Shown with the tour name and price on the website.</p>',
        onOpen: b => { const i = b.querySelector('[data-c]'); i.value = r.code || r.suggest || ''; i.select(); const sg = b.querySelector('[data-s]'); if (sg) sg.onclick = () => { i.value = r.suggest; }; } });
      if (!box) return;
      try { const out = await A.api('POST', apiUrl + '/code', { code: box.querySelector('[data-c]').value }); showCode(out.code); A.toast(out.code ? 'Code saved: ' + out.code : 'Code removed'); }
      catch (e) { A.toast(e.message, true); }
    };
  }
  load();
})();
