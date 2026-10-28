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
    heading: 'Page title (the big heading on the page)', photo: 'Tour photo (used in lists and cards)', route: 'Route', duration: 'Length of the tour',
    days: 'Days', day: 'Day number', title: 'Title', eta: 'Distance / drive time', paras: 'What happens this day', note: 'Extra note (optional)',
    details: 'Price & what is included', text: 'Text', items: 'Points', breadcrumb: 'Breadcrumb', label: 'Text', href: 'Link to',
    heroSrc: 'Banner photo (top of the page)', heroSrc_tours: 'Banner photo (optional)', heroAlt: 'Describe the banner photo in a few words', description: 'Description', keywords: 'Keywords',
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
    offer: 'Seasonal offer', show: 'Show the offer on the home page', eyebrow: 'Small line above', percent: 'Big figure (e.g. 10%)', headerMenu: 'Header menu links', popularSearches: 'Popular searches', footerSocial: 'Social media', footerAbout: 'Text under the footer logo', siteLogo: 'Logo picture (optional)',
    date: 'Date', author: 'Written by', category: 'Category', guideSection: 'Show in the India Travel Guide', excerpt: 'Short summary (shown in the list of posts)', topics: 'Topic groups', glance: 'Useful information at a glance', seasons: 'Seasons',
    goodToKnow: 'Good to know', tips: 'Travel tips', titles: 'Titles (Mr., Mrs. …)', countries: 'Countries', months: 'Months', years: 'Years', adults: 'Adults', children: 'Children',
    photo_single: 'Photo', note_single: 'Small text under the cards',
    intro_lists: 'Description (shown above the tours)', outro_lists: 'Closing text (under the list of tours, optional)',
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
    heading: 'The large title at the top of the page.',
    route: 'The places in order, with " - " between them. Example: Delhi - Agra - Jaipur - Delhi',
    duration: 'Example: 06 Nights · 07 Days',
    photo: 'Shown for this tour in tour lists and "Most Popular Tours". Leave empty to use a matching photo automatically.',
    heroSrc: 'The wide photo at the very top of the page.',
    guideSection: 'Choose a section and this page is listed there by itself: on the home page’s Travel Guide cards and on the India Travel Guide page (/guide). The pages already listed there stay as they are.',
    heroSrc_tours: 'Leave it empty to show the banner of the tour’s category. Choose a photo only if this tour needs its own.',
    heroAlt: 'For Google and for people who cannot see the photo. Example: Taj Mahal at sunrise',
    days: 'Click a day to open it. Drag it by its dots to change the order; the bin removes it.',
    paras: 'Write it like in Word: Enter starts a new paragraph. Select words and use the toolbar for bold, italic, underline or a link.',
    details: 'First the prices per hotel class, then what the tour includes and excludes, and the important notes.',
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
    photo: 'Shown for this tour or post in lists and cards.',
    outro: 'Shown under the list of tours on the category page. Leave it empty if the page needs no closing text.',
    cards: 'Drag a card by its dots to change the order; the bin removes it.',
    cities: 'Each city: its name and the page it opens.',
    siteLogo: 'Leave it empty to keep the Meruka logo as it is now. A picture chosen here replaces it in the header and the footer.'
  };
    const label = k => LABELS[k + '_' + E.kind] || LABELS[k] || String(k).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/^./, c => c.toUpperCase());

  // ---------- tabs for each kind of page ----------
  const GOOGLE = ['title', 'description', 'keywords', 'focusKeyword', 'noindex', 'ogImage', 'nofollow', 'canonical', 'ogTitle', 'ogDescription', 'twTitle', 'twDescription', 'twImage'];
  // (28 Oct 2026, client) every page has its SEO tab again: tours, categories, pages, posts and the fixed pages
  const SEO_TAB = 'SEO';
  const TABS = {
    // (26 Oct 2026, client) the banner sits in Basic info; the breadcrumb is made automatically, so it has no tab
    // (26 Oct 2026, client video II) one photo per tour; the banner is its category's; route and length come from the days
    // (27 Oct 2026, client) no Google tab for now; the prices (the box beside the days) apart from the includes and notes
    tours: [['Basic info', ['heading', 'photo', 'route', 'duration'], ''], ['Day by day', ['days'], 'Click a day to open it. Drag a day by its dots to change the order.'],
      ['Prices', ['details'], 'The price box beside the days on the tour page: one line per hotel class.'], [SEO_TAB, GOOGLE, '']],
    // a category's tours are chosen in each tour (its Categories tab), so the category only needs its text and banner
    lists: [['Basic info', ['heading', 'intro', 'outro', 'heroSrc', 'heroAlt'], ''], [SEO_TAB, GOOGLE, '']],
    pages: [['Text', ['heading', 'html', 'guideSection', 'heroSrc', 'heroAlt'], 'Write the page like in Word: the buttons make headings, bold text, lists, links and photos.'], [SEO_TAB, GOOGLE, '']],
    posts: [['Post', ['heading', 'category', 'date', 'author', 'photo', 'excerpt'], 'The title, date and summary shown in the list of posts.'], ['Text', ['html'], 'Write the post like in Word: the buttons make headings, bold text, lists, links and photos.'], [SEO_TAB, GOOGLE, '']],
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
    footer: [['Logo & about', ['siteLogo', 'footerAbout'], 'The logo at the top of every page and in the footer, and the short text under the footer logo.'],
      ['Link columns', ['footerCols'], 'Each column has a title and its links. Open a column to change its links: “+ Add pages from the website” to tick pages, “+ Add a custom link” for anything else.'],
      ['Popular searches', ['popularSearches'], 'The line of search words at the very bottom of every page: each word and the page it opens.'],
      ['Social media', ['footerSocial'], 'Paste the address of each profile. Its icon shows in the footer once the address is filled in.']],
    seo: [['Search Console & Analytics', ['googleVerification', 'googleAnalytics', 'bingVerification'], 'Connect the website to Google’s free tools to see how people find you.'],
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

  // ---------- field builders: each returns { el, get } ----------
  function field(key, value, depth, inList) {
    if (key === 'html' && typeof value === 'string') return rte(value);
    // (27 Oct 2026, client) a list of words (choices, phone numbers, address lines, paragraphs): one box, one per line
    if (!inList && Array.isArray(value) && value.length && value.every(x => typeof x === 'string') && !isLinkRow(value)) return linesBox(key, value);
    // a short row of words inside a list (e.g. “Visa | e-Visa … | link”): its boxes side by side
    if (inList && Array.isArray(value) && value.length >= 2 && value.length <= 4 && value.every(x => typeof x === 'string') && !isLinkRow(value)) return tupleRow(value);
    if (key === 'noindex') return toggle(value);
    if (key === 'date' && typeof value === 'string') return input(value, 'date', x => x);
    // a tour's banner: empty means "use its category's banner" (the old shared banner counts as empty)
    // (27 Oct 2026, client) a tour without its own photo shows the one the website picks for it
    if (key === 'photo' && depth === 0 && (E.kind === 'tours' || E.kind === 'lists') && current && current.thumb && !current.isNew) return image(value, () => current.thumb);
    if (key === 'heroSrc' && E.kind === 'tours') return image(value === '/images/india-tours-main.webp' ? '' : value);
    // (27 Oct 2026, client) a few lines, one per line ("What is included", "You can also")
    if (/^(included|extras)$/.test(key) && Array.isArray(value) && value.every(x => typeof x === 'string')) {
      const t = textBox(value.join('\n'), x => x.split('\n').map(l => l.trim()).filter(Boolean), Math.max(3, value.length)); t.input.placeholder = 'One point per line'; return t;
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
    if (key === 'category' && E.kind === 'posts') {
      const c = input(s, 'text', x => x.trim()); c.el.setAttribute('list', 'mk-blogcats'); c.el.placeholder = 'e.g. Travel tips, Destinations, Festivals';
      if (!document.getElementById('mk-blogcats')) { const dl = document.createElement('datalist'); dl.id = 'mk-blogcats'; document.body.appendChild(dl);
        A.api('GET', '/admin/api/blog-categories').then(r => { dl.innerHTML = (r.items || []).map(x => '<option value="' + A.esc(x) + '">').join(''); }).catch(() => {}); }
      return c;
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
  // ---------- (26 Oct 2026, client video II) a proper text editor: a toolbar with icons, as in Word / WordPress ----------
  const TB_ICON = {
    bold: '<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>', italic: '<path d="M14 5h-4M14 19h-4M14 5l-4 14"/>',
    underline: '<path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14"/>', link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    unlink: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/><path d="M4 4l16 16"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>', redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
    clear: '<path d="M6 5h12M12 5l-4 14M4 20h8"/><path d="m15 14 5 5M20 14l-5 5"/>', ul: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    ol: '<path d="M10 6h10M10 12h10M10 18h10M4 4.5h1.5V9M4 9h3M4 14.5c.5-1 3-1 3 .5S4 17 4 19h3"/>', h2: '<path d="M4 5v14M12 5v14M4 12h8"/><path d="M15 9c.5-1.5 5-1.5 5 1s-5 4-5 7h5"/>',
    h3: '<path d="M4 5v14M12 5v14M4 12h8"/><path d="M15 8h5l-3 4c2 0 3 1 3 3s-3 3-5 1"/>', p: '<path d="M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>',
    quote: '<path d="M7 7h4v4c0 3-2 5-4 6M15 7h4v4c0 3-2 5-4 6"/>', img: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 8"/>',
    src: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>'
  };
  const TB_TITLE = { bold: 'Bold (Ctrl+B)', italic: 'Italic (Ctrl+I)', underline: 'Underline (Ctrl+U)', link: 'Link: select words, then press', unlink: 'Remove the link', undo: 'Undo (Ctrl+Z)', redo: 'Redo (Ctrl+Y)',
    clear: 'Remove the formatting of the selected words', ul: 'Bullet list', ol: 'Numbered list', h2: 'Heading', h3: 'Small heading', p: 'Normal text', quote: 'Quote', img: 'Add a photo', src: 'Show the HTML code' };
  // a toolbar: groups of buttons, separated by thin lines
  function toolbar(groups) {
    const bar = document.createElement('div'); bar.className = 'tb';
    bar.innerHTML = groups.map(g => '<span class="tb-g">' + g.map(c => '<button type="button" data-c="' + c + '" title="' + TB_TITLE[c] + '" aria-label="' + TB_TITLE[c] + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + TB_ICON[c] + '</svg></button>').join('') + '</span>').join('');
    bar.onmousedown = e => { if (e.target.closest('button')) e.preventDefault(); };   // keep the selection in the text
    return bar;
  }
  const tbState = (bar, ed) => {   // light up B / I / U where the cursor is
    const upd = () => { if (!ed.contains(document.getSelection().anchorNode)) return; ['bold', 'italic', 'underline'].forEach(c => { const b = bar.querySelector('[data-c="' + c + '"]'); if (b) b.classList.toggle('on', document.queryCommandState(c)); }); };
    document.addEventListener('selectionchange', upd);
  };
  const askLink = async (current) => {
    const box = await A.dialog({ title: 'Add a link', ok: 'Add link', html: '<label class="lb">Link to</label><input class="in" data-l placeholder="Type a page name, e.g. Rajasthan Tours, or paste https://…"><p class="hint">' + HELP.href + '</p>',
      onOpen: b => { const i = b.querySelector('[data-l]'); i.value = current || ''; pageLink(i); }, validate: b => b.querySelector('[data-l]').value.trim() ? '' : 'Type a page or an address.' });
    return box ? box.querySelector('[data-l]').value.trim() : '';
  };

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
        if (!picked()) return A.toast('First select the words to turn into a link');
        const r = getSelection().getRangeAt(0).cloneRange(), url = await askLink('');
        if (url) { const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand('createLink', false, url); }
      } else if (c === 'clear') { if (!picked()) return A.toast('First select the words'); document.execCommand('removeFormat'); document.execCommand('unlink'); }
      else document.execCommand(c);
      touch();
    };
    tbState(bar, ed);
    ed.oninput = touch;
    ed.onpaste = e => { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain')); };
    if (one) ed.onkeydown = e => { if (e.key === 'Enter') e.preventDefault(); };
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
    el.innerHTML = '<div class="f"><label class="lb">Short text under the price heading (optional)</label><p class="fhelp">Shown in small letters at the top of the price box.</p></div>' +
      '<div class="px-t"><div class="px-hd"><span>Hotel class</span><span>From (USD)</span><span>To (USD)</span><span title="Shows the price as $250+">Add “+”</span><span>The price is</span><span></span></div><div data-rows></div></div>' +
      '<div class="chips"><button type="button" class="btn btn-s" data-add>+ Add a hotel class</button></div>';
    const intro = textBox(pb.text || '', x => x, 2); intro.input.placeholder = 'e.g. The final cost depends on the hotels, the travel dates and the number of travellers.';
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
      const sec = document.createElement('div'); sec.className = 'px-sec' + (/includ|exclud/i.test(b.title || '') ? ' px-half' : '');
      sec.innerHTML = '<h3>' + A.esc(b.title || '') + '</h3>';
      let tx = null;
      if (b.text) { tx = textBox(b.text, x => x, 2); const f = document.createElement('div'); f.className = 'f'; f.innerHTML = '<label class="lb">Text above the points</label>'; f.appendChild(tx.el); sec.appendChild(f); }
      const t = richText(b.items || [], false); t.input.dataset.ph = 'One point per line: press Enter for the next point'; sec.appendChild(t.el);
      more.appendChild(sec);
      return { b, get: () => Object.assign({}, b, { text: tx ? tx.get() : b.text, items: t.get() }) };
    });
    const priceOut = () => Object.assign({}, pb, { text: intro.get(), items: rows.filter(o => !(o.empty && o.empty())).map(o => o.get()) });
    return { el, more: others.length ? more : null, get: () => blocks.map(b => b === pb ? priceOut() : others.find(o => o.b === b).get()).concat(blocks.includes(pb) ? [] : [priceOut()]) };
  }
  // (26 Oct 2026, client) a destination or guide page edited in the same shape the website shows it: "Quick facts"
  // (Area, Altitude, Climate …), then each heading of the page ("Places of Interest", "Reach" …) with its groups — a list
  // of places in columns, with the distance where there is one — and its one-line facts (By Air, By Road …).
  // Every change is written straight into the page text (the same paragraph), so the website lays it out as before.
  const LABEL_P = p => { const st = p.firstElementChild; return st && /^(STRONG|B)$/.test(st.nodeName) && /:\s*$/.test(st.textContent) && st === p.firstChild ? st : null; };
  const LIST_P = p => {
    const st = LABEL_P(p); if (!st) return null;
    const rest = p.textContent.slice(st.textContent.length).trim().replace(/\.\s*$/, '');
    const parts = rest.split(/\s*,\s*|\s+and\s+(?=[A-Z])/).map(x => x.trim()).filter(Boolean);
    if (parts.length < 3 || p.querySelector('a,img')) return null;
    if (/^(climate|languages?|best season|altitude|area|population|temperature|clothing|currency|religions?|rainfall|season)/i.test(st.textContent.trim())) return null;
    const sep = /^[^,]*?\s*:\s*\d/.test(rest) ? ': ' : '- ';
    return { label: st.textContent.trim(), sep, items: parts.map(x => { const m = /^(.*?)\s*[-–:]\s*([\d.]+)\s*(?:kms?|km)?\.?$/i.exec(x); return m ? { name: m[1].trim(), km: m[2] } : { name: x, km: '' }; }) };
  };
  const FACT_P = p => { const st = LABEL_P(p); if (!st || LIST_P(p) || p.querySelector('img')) return null; const v = p.textContent.slice(st.textContent.length).trim(); return v.length <= 400 ? { label: st.textContent.replace(/:\s*$/, '').trim(), value: v } : null; };
  const hasSections = html => { const t = document.createElement('div'); t.innerHTML = html || ''; const ps = [...t.querySelectorAll('p')]; return ps.some(LIST_P) || ps.filter(FACT_P).length >= 2; };
  function placesTab(panesAdd) {
    const card = document.createElement('section'); card.className = 'card ps'; card.hidden = true;
    const draw = () => {
      const ed = comps.html && comps.html.el.querySelector('.rte');
      card.innerHTML = '';
      if (!ed || ed.hidden) { card.insertAdjacentHTML('beforeend', '<p class="hint">Switch the HTML view off in the Text tab first.</p>'); return; }
      // walk the page: headings open a part; label paragraphs are facts or lists
      const parts = [{ title: 'Quick facts', facts: [], lists: [], after: null }];
      [...ed.children].forEach(n => {
        if (/^H[1-6]$/.test(n.nodeName)) { parts.push({ title: n.textContent.replace(/:\s*$/, '').trim(), facts: [], lists: [], after: n }); return; }
        if (n.nodeName !== 'P') return;
        const cur = parts[parts.length - 1], l = LIST_P(n), f = !l && FACT_P(n);
        if (l) cur.lists.push({ p: n, l }); else if (f) cur.facts.push({ p: n, f });
      });
      parts.filter(pt => pt.facts.length || pt.lists.length).forEach((pt, pi) => {
        const box = document.createElement('div'); box.className = 'ps-part' + (pi === 0 && pt.title === 'Quick facts' ? ' ps-facts' : '');
        box.innerHTML = '<h3 class="ps-h">' + A.esc(pt.title) + '</h3>';
        // one-line facts: label | value
        if (pt.facts.length) {
          const g = document.createElement('div'); g.className = 'ps-fg';
          pt.facts.forEach(({ p, f }) => {
            const r = document.createElement('label'); r.className = 'ps-fact';
            r.innerHTML = '<span>' + A.esc(f.label) + '</span><input class="in">';
            const i = r.querySelector('input'); i.value = f.value;
            i.oninput = () => { p.innerHTML = '<strong>' + A.esc(f.label) + ':</strong> ' + A.esc(i.value.trim()); touch(); };
            g.appendChild(r);
          });
          box.appendChild(g);
        }
        // lists of places: in columns, with the distance where the list has distances
        pt.lists.forEach(({ p, l }) => {
          const withKm = l.items.some(x => x.km);
          const grp = document.createElement('div'); grp.className = 'ps-list';
          grp.innerHTML = '<h4>' + A.esc(l.label.replace(/:\s*$/, '')) + ' <small>' + l.items.length + '</small></h4><div class="ps-items' + (withKm ? ' km' : '') + '"></div><button type="button" class="btn btn-s">+ Add a place</button>';
          const itemsEl = grp.querySelector('.ps-items');
          const write = () => {
            const items = [...itemsEl.children].map(r => ({ name: r.querySelector('[data-n]').value.trim(), km: (r.querySelector('[data-k]') || { value: '' }).value.trim() })).filter(x => x.name);
            p.innerHTML = '<strong>' + A.esc(l.label) + '</strong> ' + A.esc(items.map(x => x.km ? x.name + l.sep + x.km + ' kms' : x.name).join(', ') + '.');
            grp.querySelector('h4 small').textContent = items.length; touch();
          };
          const add = (x, focus) => {
            const r = document.createElement('div'); r.className = 'ps-it';
            r.innerHTML = '<input class="in" data-n placeholder="Place">' + (withKm ? '<input class="in" data-k inputmode="decimal" placeholder="km" title="Distance in km">' : '') + '<button type="button" title="Remove">✕</button>';
            r.querySelector('[data-n]').value = x.name; if (withKm) r.querySelector('[data-k]').value = x.km;
            r.querySelector('button').onclick = () => { r.remove(); write(); };
            r.oninput = write; itemsEl.appendChild(r); if (focus) r.querySelector('[data-n]').focus();
          };
          l.items.forEach(x => add(x));
          grp.querySelector('.btn').onclick = () => add({ name: '', km: '' }, true);
          box.appendChild(grp);
        });
        card.appendChild(box);
      });
    };
    panesAdd('Facts & places', card, draw);
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
  let linkIndex = null;
  const loadLinks = () => linkIndex || (linkIndex = A.api('GET', '/admin/api/link-index').then(r => r.items || []).catch(() => []));
  const LK = [['', 'All'], ['main', 'Main pages'], ['Category', 'Categories'], ['Tour', 'Tours'], ['Page', 'Pages']];
  const lkKind = it => (/^(Category|Tour|Page|Blog): /.exec(it.name) || [, 'main'])[1];
  const lkName = it => it.name.replace(/^(Category|Tour|Page|Blog): /, '');
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
  function image(v, auto) {
    const el = document.createElement('div'); el.className = 'img-f';
    el.innerHTML = '<button type="button" class="pv" title="Choose a photo"><span class="pv-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 8"/></svg>Choose a photo</span></button>' +
      '<span class="img-acts"><button type="button" class="img-ic" data-ch title="Choose another photo" aria-label="Choose another photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 16v3h3l10-10-3-3L4 16z"/><path d="m13 7 3 3"/></svg></button><button type="button" class="img-ic img-ic-d" data-rm title="Remove the photo" aria-label="Remove the photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button></span>' +
      '<span class="img-name"></span><input type="hidden">';
    const pv = el.querySelector('.pv'), inp = el.querySelector('input'), name = el.querySelector('.img-name'), ch = el.querySelector('[data-ch]'), rm = el.querySelector('[data-rm]');
    const show = () => {
      const own = inp.value.trim(), a = !own && auto ? auto() || '' : '', src = own || a;
      pv.style.backgroundImage = src ? 'url("' + src.replace(/"/g, '') + '")' : 'none'; pv.classList.toggle('has', !!src);
      if (a) pv.dataset.auto = 'Chosen by itself'; else delete pv.dataset.auto;
      name.textContent = own ? own.split('/').pop() : a ? 'Chosen by the website — click the photo to use your own' : '';
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
    const isDay = 'paras' in obj && 'title' in obj;
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
      const ph = isDay && { day: 'e.g. 01 Day', title: 'e.g. Delhi - Agra', eta: 'e.g. 210 km · about 4 hours', note: 'Optional' }[k], inp = ph && fb.querySelector('input.in, textarea.in');
      if (inp) inp.placeholder = ph;
      if (isDay && k === 'paras' && c.input) c.input.dataset.ph = 'What happens this day: the sights, the drive, the overnight stay';
      if (/^(included|extras)$/.test(k)) fb.classList.add('half');
      if (Object.keys(obj).filter(x => !hide.includes(x)).length === 1) fb.classList.add('f-solo'); if ((k === 'title' || k === 'description') && Object.keys(obj).every(x => x === 'title' || x === 'description')) counter(k, c); });   // the main pages' Google text
    pairHalves(el);
    // (27 Oct 2026, client video) a card with a photo: the photo on the left, its fields beside it (no empty space)
    const ph = [...el.children].filter(f => f.querySelector(':scope > .img-f'));
    if (ph.length === 1 && el.children.length >= 3 && !obj.paras) { el.classList.add('fg-media'); ph[0].classList.add('f-photo'); ph[0].classList.remove('half'); }
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
    const gridCols = !simple && { stats: 5, heroSlides: 4, cards: key === 'cards' && E.id === 'home' && arr[0] ? ('price' in arr[0] ? 4 : 'cities' in arr[0] ? 2 : 0) : 0, points: arr.length === 4 ? 4 : 3, steps: 4, seasons: 3, glance: 3, guideCols: 3, footerCols: 2, offices: 2, tips: 3 }[key];
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
      if (gridCols) b.textContent = { stats: 'Figure', heroSlides: 'Photo', cards: 'Card', points: 'Point', steps: 'Step', guideCols: 'Card', footerCols: 'Column', offices: 'Office', topics: 'Topic', tips: 'Group', seasons: 'Season', glance: 'Box' }[key] || 'Item';
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
  // a simple word processor for page text (HTML), with a switch to edit the HTML itself
  // a page's whole text (HTML): the same toolbar, plus headings, lists, quote, photo and the HTML code
  function rte(html) {
    const el = document.createElement('div'); el.className = 'rt';
    const bar = toolbar([['p', 'h2', 'h3'], ['bold', 'italic', 'underline'], ['ul', 'ol', 'quote'], ['link', 'unlink', 'img'], ['undo', 'redo', 'clear'], ['src']]);
    const ed = document.createElement('div'); ed.className = 'rte'; ed.contentEditable = 'true';
    const raw = document.createElement('textarea'); raw.className = 'in rte-src'; raw.rows = 18; raw.hidden = true;
    el.append(bar, ed, raw);
    ed.innerHTML = html; ed.oninput = touch; raw.oninput = touch;
    tbState(bar, ed);
    const cmd = (c, v) => { ed.focus(); document.execCommand(c, false, v); touch(); };
    bar.onclick = async e => {
      const b = e.target.closest('button'); if (!b) return;
      const c = b.dataset.c;
      if (c === 'src') { if (raw.hidden) { raw.value = ed.innerHTML; raw.hidden = false; ed.hidden = true; b.classList.add('on'); } else { ed.innerHTML = raw.value; raw.hidden = true; ed.hidden = false; b.classList.remove('on'); } return; }
      if (!raw.hidden) return A.toast('Press the </> button again to go back to the normal view');
      if (['bold', 'italic', 'underline', 'unlink', 'undo', 'redo'].includes(c)) cmd(c);
      else if (c === 'clear') cmd('removeFormat');
      else if (c === 'h2' || c === 'h3' || c === 'p') cmd('formatBlock', c.toUpperCase());
      else if (c === 'quote') cmd('formatBlock', 'BLOCKQUOTE');
      else if (c === 'ul') cmd('insertUnorderedList');
      else if (c === 'ol') cmd('insertOrderedList');
      else if (c === 'link') {
        const sel = window.getSelection(), range = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
        if (!range || range.collapsed) return A.toast('First select the words to turn into a link');
        const url = await askLink('');
        if (url) { sel.removeAllRanges(); sel.addRange(range); cmd('createLink', url); }
      }
      else if (c === 'img') { const sel = window.getSelection(), range = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null; const src = await A.pickImage(); if (src) { if (range) { sel.removeAllRanges(); sel.addRange(range); } cmd('insertHTML', '<img src="' + src + '" alt="">'); } }
    };
    return { el, get: () => (raw.hidden ? ed.innerHTML : raw.value).trim() };
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
    twTitle: 'Title', twDescription: 'Description', twImage: 'Picture' };
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
    const ad = sec('Advanced', 'keywords, canonical, noindex, nofollow', false);
    ['keywords', 'canonical', 'noindex', 'nofollow'].forEach(k => put(ad, k));
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
    nofollow: 'Rarely needed. Google then does not follow the links on this page.'
  };

  // ---------- the form, in tabs ----------
  function build(res) {
    current = res; getters = {}; comps = {}; templates = res.templates || {}; root.innerHTML = ''; tabsEl.innerHTML = ''; refreshGoogle = () => {}; dayAuto = (res.dayPhotos || []).slice();
    const data = Object.assign({}, res.data);   // a copy: the SEO boxes below are unpacked from it
    // (26 Oct 2026, client) each day of a tour can have its own photo: the box sits under the day's title
    if (E.kind === 'tours' && Array.isArray(data.days)) data.days = data.days.map(d => d && typeof d === 'object' && !('photo' in d) ? Object.fromEntries(Object.entries(d).flatMap(([k, v]) => k === 'eta' ? [[k, v], ['photo', '']] : [[k, v]]).concat('eta' in d ? [] : [['photo', '']])) : d);
    let tabs = TABS[E.mode === 'single' ? E.id : E.kind];
    if (!tabs) tabs = res.fields.filter(k => k in data).map(k => [label(k), [k], HELP[k] || '']);   // settings: one tab per part
    singleSeo = E.mode === 'single' && data.seo && typeof data.seo === 'object';
    if (singleSeo) { const sv = data.seo; delete data.seo; GOOGLE.forEach(k => { data[k] = k in sv ? sv[k] : (k === 'noindex' || k === 'nofollow' ? false : ''); }); tabs = tabs.concat([[SEO_TAB, GOOGLE, 'How this page shows in Google and when it is shared. Leave a box empty to keep the text the website uses now (shown in grey).']]); }
    const used = new Set(tabs.flatMap(t => t[1]));
    // made automatically or chosen elsewhere: the breadcrumb, and a category's tours (ticked in each tour)
    const AUTO = E.mode === 'item' ? ['breadcrumb'].concat(E.kind === 'lists' && E.id !== 'itineraries' ? ['groups'] : E.kind === 'tours' ? ['heroSrc', 'heroAlt'] : []) : E.id === 'reviews' ? ['all'] : [];
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
        const c = field(k, data[k], 0);
        // (26 Oct 2026, client video II) a tab with one thing in it needs no second title for it
        const f = keys.length === 1 && name !== SEO_TAB ? Object.assign(document.createElement('div'), { className: 'f' }) : fieldBox(k, c, true);
        if (E.mode === 'single' && /^sec[A-Z]/.test(k) && f.querySelector(':scope > .lb')) f.querySelector(':scope > .lb').remove();
        if (keys.length === 1 && name !== SEO_TAB) f.appendChild(c.el);
        if (GHELP[k] && name === SEO_TAB) f.querySelector('.lb').insertAdjacentHTML('afterend', '<p class="fhelp">' + A.esc(GHELP[k]) + '</p>');
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
    if (E.kind === 'tours' && comps.days) autoFromDays();
    // Footer menu ?col=2: that column opens, the others stay closed
    const col = +new URLSearchParams(location.search).get('col');
    if (E.id === 'footer' && col && comps.footerCols) { const its = [...comps.footerCols.el.querySelectorAll(':scope > .arr > .it')]; its.forEach((it, i) => it.classList.toggle('closed', i !== col - 1)); if (its[col - 1]) setTimeout(() => its[col - 1].scrollIntoView({ block: 'start', behavior: 'smooth' }), 50); }
    // a destination / guide page with facts and lists opens on "Page sections", in the website's shape
    if (E.kind === 'pages' && comps.html && hasSections(data.html)) { placesTab(addPane); tabsEl.hidden = false; if (!h) { const b = [...tabsEl.children].find(x => x.textContent === 'Facts & places'); if (b) b.click(); } }
    dirty = false; state.textContent = ''; state.classList.remove('dirty');
  }
  // (26 Oct 2026, client) a tour's route and length fill in by themselves from its days: the length from how many days
  // there are, the route from the places in the day titles (a place repeated one after the other is written once)
  const DROP = /(arrival|arrive|departure|depart|sightseeing|sight seeing|local|excursion|drive|hometown|home town|onward|journey|full day|half day|day|tour|by air|by train|by road|fly|flight|train|via)/gi;
  function routeOf(days) {
    const out = [];
    days.forEach(d => String(d.title || '').split(/\s*[–—-]\s*|\s+to\s+|,|\//i).forEach(p => {
      const n = p.replace(/\(.*?(\)|$)/g, '').replace(DROP, ' ').replace(/\s+/g, ' ').trim();
      if (n && /[a-z]/i.test(n) && (!out.length || out[out.length - 1].toLowerCase() !== n.toLowerCase())) out.push(n);
    }));
    return out.join(' - ');
  }
  const two = n => String(n).padStart(2, '0');
  function autoFromDays() {
    const route = comps.route && comps.route.el, dur = comps.duration && comps.duration.el;
    const pane = comps.days.el.closest('section') || comps.days.el;
    // (26 Oct 2026, client video II) not typed by hand: shown as one line, made from the days
    [route, dur].forEach(x => { const f = x && x.closest('.f'); if (f) f.hidden = true; });
    const sum = document.createElement('div'); sum.className = 'auto-sum';
    const show = () => { sum.innerHTML = '<span>Route &amp; length <small>made from the days</small></span><b>' + A.esc(route ? route.value : '') + '</b><em>' + A.esc(dur ? dur.value : '') + '</em>'; };
    const anchor = (route || dur).closest('.f'); anchor.parentNode.insertBefore(sum, anchor); show();
    let last = JSON.stringify((getters.days() || []).map(d => d.title));
    const run = () => {
      const days = getters.days() || [], key = JSON.stringify(days.map(d => d.title));
      if (key === last) return; last = key;
      if (dur && days.length) dur.value = two(days.length - 1) + ' Nights · ' + two(days.length) + ' Days';
      if (route) { const r = routeOf(days); if (r) route.value = r; }
      show(); touch();
    };
    pane.addEventListener('input', run); new MutationObserver(() => setTimeout(run, 0)).observe(comps.days.el, { childList: true, subtree: true });
  }
  const collect = () => {
    const out = Object.fromEntries(Object.entries(getters).map(([k, g]) => [k, g()]));
    if (singleSeo) { out.seo = {}; GOOGLE.forEach(k => { if (k in out) { out.seo[k] = out[k]; delete out[k]; } }); }
    return out;
  };

  // ---------- status, draft, publish (23 Oct 2026) ----------
  const when = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); };
  function showStatus(res) {
    current = res;
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
  window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

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
