// Meruka admin: the editor (16 Oct 2026, v2 — made for the client: tabs, plain-language help, a bold button, a live
// Google preview with checks). It builds the form from the data itself, so every page type and setting uses it.
(function () {
  const A = window.ADMIN, E = window.EDIT;
  const root = document.querySelector('[data-form]'), tabsEl = document.querySelector('[data-tabs]');
  const saveBtn = document.querySelector('[data-save]'), state = document.querySelector('[data-state]');
  const apiUrl = E.mode === 'single' ? '/admin/api/single/' + E.id : '/admin/api/item/' + E.kind + '/' + E.id;
  let getters = {}, dirty = false, templates = {}, refreshGoogle = () => {};

  // ---------- plain-language names and help ----------
  const LABELS = {
    heading: 'Page title (the big heading on the page)', photo: 'Tour photo (used in lists and cards)', route: 'Route', duration: 'Length of the tour',
    days: 'Days', day: 'Day number', title: 'Title', eta: 'Distance / drive time', paras: 'What happens this day', note: 'Extra note (optional)',
    details: 'Price & what is included', text: 'Text', items: 'Points', breadcrumb: 'Breadcrumb', label: 'Text', href: 'Link to',
    heroSrc: 'Banner photo (top of the page)', heroAlt: 'Describe the banner photo in a few words', description: 'Description', keywords: 'Keywords',
    focusKeyword: 'Focus phrase', noindex: 'Hide this page from Google', ogImage: 'Picture when shared on WhatsApp / Facebook',
    intro: 'Introduction text', groups: 'Tours on this page', tours: 'Tours', outro: 'Closing text', name: 'Name', html: 'Page text',
    steps: 'How it works (steps)', faqs: 'Questions & answers', q: 'Question', a: 'Answer', guideCols: 'Travel guide links', stateGroups: 'Destinations by state',
    footerCols: 'Footer link columns', seoLinks: 'Footer "Popular searches" links', social: 'Social media', all: 'Reviews', quote: 'What the guest wrote', tour: 'Tour they took',
    closing: 'Closing line', leadName: 'Lead name', paragraphs: 'Paragraphs', mission: 'Mission', founder: 'Founder', atithi: 'Atithi Devo Bhava',
    offices: 'Other offices (and the head office for the footer)', hqBlock: 'Head office as shown on the Contact page', cell: 'Mobile', landline: 'Landline', gmail: 'Gmail', website: 'Website', infoList: 'What we ask for (list on the Contact page)', interests: 'Interests (buttons in the enquiry form)', tourNames: 'Tours in the enquiry form',
    guide: 'Travel guide (Contact page)', city: 'City', area: 'Area', phones: 'Phone numbers', email: 'Email', lines: 'Address lines', kind: 'Type', img: 'Photo',
    initials: 'Initials (shown in the circle)', details_: 'Details', googleVerification: 'Google Search Console code', googleAnalytics: 'Google Analytics ID',
    bingVerification: 'Bing Webmaster code (optional)', defaultShareImage: 'Default share picture', pages: 'Main pages in Google', redirects: 'Redirects',
    from: 'Old address', to: 'New address', '/': 'Home page', '/aboutus': 'About us page', '/contactus': 'Contact us page', '/testimonials': 'Guest Reviews page', '/plan-my-trip': 'Plan My Trip page'
  };
  const HELP = {
    heading: 'The large title at the top of the page.',
    route: 'The places in order, with " - " between them. Example: Delhi - Agra - Jaipur - Delhi',
    duration: 'Example: 06 Nights · 07 Days',
    photo: 'Shown for this tour in tour lists and "Most Popular Tours". Leave empty to use a matching photo automatically.',
    heroSrc: 'The wide photo at the very top of the page.',
    heroAlt: 'For Google and for people who cannot see the photo. Example: Taj Mahal at sunrise',
    days: 'Click a day to open it. Use ↑ ↓ to change the order, ✕ to remove a day.',
    paras: 'A blank line starts a new paragraph. Select words and press B Bold to make them stand out.',
    details: 'The first block is the price list (one hotel type per line, e.g. **3-Star:** $85 - $100 per person per day). Then what is included, excluded and notes.',
    items: 'One point per line.',
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
    all: 'Each review: what the guest wrote, their name and country, and the tour they took.'
  };
  const label = k => LABELS[k] || String(k).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/^./, c => c.toUpperCase());

  // ---------- tabs for each kind of page ----------
  const GOOGLE = ['title', 'description', 'keywords', 'focusKeyword', 'noindex', 'ogImage'];
  const TABS = {
    tours: [['Basic info', ['heading', 'route', 'duration', 'photo'], 'The main details of this tour.'], ['Day by day', ['days'], 'The itinerary, one day at a time.'],
      ['Price & inclusions', ['details'], 'Price per person and what the tour includes and does not include.'], ['Banner photo', ['heroSrc', 'heroAlt'], 'The wide photo at the top of the page.'],
      ['Google', GOOGLE, ''], ['Breadcrumb', ['breadcrumb'], '']],
    lists: [['Basic info', ['heading', 'intro', 'outro'], 'The title and the text above and below the tours.'], ['Tours on this page', ['groups'], 'Which tours this page shows, in what order.'],
      ['Banner photo', ['heroSrc', 'heroAlt'], ''], ['Google', GOOGLE, ''], ['Breadcrumb', ['breadcrumb'], '']],
    pages: [['Text', ['heading', 'html'], 'Write the page like in Word: the buttons make headings, bold text, lists, links and photos.'], ['Banner photo', ['heroSrc', 'heroAlt'], ''],
      ['Google', GOOGLE, ''], ['Breadcrumb', ['breadcrumb'], '']],
    seo: [['Search Console & Analytics', ['googleVerification', 'googleAnalytics', 'bingVerification'], 'Connect the website to Google’s free tools to see how people find you.'],
      ['Main pages in Google', ['pages'], 'The Google title and description of the Home, About, Contact, Guest Reviews and Plan My Trip pages.'],
      ['Share picture', ['defaultShareImage'], ''], ['Redirects', ['redirects'], '']]
  };

  // ---------- recognising the data's shapes ----------
  const isSeg = v => v && typeof v === 'object' && !Array.isArray(v) && typeof v.text === 'string' && Object.keys(v).every(k => k === 'text' || k === 'bold');
  const isSegs = v => Array.isArray(v) && v.length > 0 && v.every(isSeg);
  const isParas = v => Array.isArray(v) && v.length > 0 && v.every(p => Array.isArray(p) && p.every(isSeg));
  const IMG_KEY = /^(img|image|photo|heroSrc|src|logo|icon|thumb|ogImage|defaultShareImage)$|(Img|Src|Photo)$/;
  const isImg = (k, v) => typeof v === 'string' && (IMG_KEY.test(k) || /^\/.*\.(webp|jpe?g|png|gif|avif)$/i.test(v));
  const LONG = /^(description|intro|text|quote|a|note|closing|mission|html|line|lead|summary|body|desc)$/i;
  const segText = segs => segs.map(s => s.bold && s.text.trim() ? '**' + s.text + '**' : s.text).join('');
  const textSeg = str => String(str).split(/(\*\*[^*]+\*\*)/).filter(x => x !== '').map(x => /^\*\*[^*]+\*\*$/.test(x) ? { text: x.slice(2, -2), bold: true } : { text: x, bold: false });
  const blank = v => Array.isArray(v) ? (isSegs(v) ? [{ text: '', bold: false }] : []) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)])) : typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : '';
  const summary = v => {
    if (v == null) return '';
    if (typeof v !== 'object') return String(v);
    if (isSegs(v)) return segText(v).replace(/\*\*/g, '');
    if (Array.isArray(v)) return v.length + ' items';
    const pick = ['day', 'title', 'name', 'label', 'heading', 'q', 'city', 'from', 'to', 'tour', 'text', 'quote'].filter(k => typeof v[k] === 'string' && v[k].trim());
    return pick.slice(0, 2).map(k => v[k]).join(' — ').replace(/<[^>]+>/g, '');
  };
  const touch = () => { if (!dirty) { dirty = true; state.textContent = '● Unsaved changes'; state.classList.add('dirty'); } refreshGoogle(); };

  // ---------- field builders: each returns { el, get } ----------
  function field(key, value, depth) {
    if (key === 'html' && typeof value === 'string') return rte(value);
    if (key === 'noindex') return toggle(value);
    if (isImg(key, value)) return image(value);
    if (isParas(value)) return textBox(value.map(segText).join(key === 'items' ? '\n' : '\n\n'), txt => txt.split(key === 'items' ? /\n/ : /\n\s*\n/).map(p => p.trim()).filter(Boolean).map(textSeg), 6, true);
    if (isSegs(value)) return textBox(segText(value), textSeg, 3, true);
    if (key === 'items' && Array.isArray(value) && value.length === 0) return textBox('', txt => txt.split(/\n/).map(p => p.trim()).filter(Boolean).map(textSeg), 4, true);
    if (Array.isArray(value)) return list(key, value, depth);
    if (value && typeof value === 'object') return group(value, depth);
    if (typeof value === 'number') return input(value, 'number', v => v === '' ? 0 : +v);
    if (typeof value === 'boolean') return check(value);
    const s = value == null ? '' : String(value);
    return LONG.test(key) || s.length > 90 || s.includes('\n') ? textBox(s, x => x, s.length > 400 ? 8 : 3) : input(s, 'text', x => x);
  }
  function input(v, type, read) {
    const el = document.createElement('input'); el.className = 'in'; el.type = type; el.value = v; el.oninput = touch;
    return { el, get: () => read(el.value) };
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
  function image(v) {
    const el = document.createElement('div'); el.className = 'img-f';
    el.innerHTML = '<div class="pv"></div><div><div class="row" style="margin:0 0 6px"><button type="button" class="btn btn-s btn-p">Choose a photo</button><button type="button" class="btn btn-s btn-d">Remove</button></div><input class="in" type="text" placeholder="No photo chosen"></div>';
    const pv = el.querySelector('.pv'), inp = el.querySelector('input');
    const show = () => { pv.style.backgroundImage = inp.value ? 'url("' + inp.value.replace(/"/g, '') + '")' : 'none'; };
    inp.value = v || ''; show();
    inp.oninput = () => { touch(); show(); };
    el.querySelectorAll('button')[0].onclick = async () => { const src = await A.pickImage(); if (src) { inp.value = src; show(); touch(); } };
    el.querySelectorAll('button')[1].onclick = () => { inp.value = ''; show(); touch(); };
    return { el, get: () => inp.value.trim() };
  }
  function fieldBox(k, c, top) {
    const f = document.createElement('div'); f.className = 'f';
    f.innerHTML = '<label class="lb">' + A.esc(label(k)) + '</label>' + (HELP[k] && (top || k === 'href' || k === 'paras' || k === 'items') ? '<p class="fhelp">' + A.esc(HELP[k]) + '</p>' : '');
    f.appendChild(c.el);
    return f;
  }
  function group(obj, depth) {
    const el = document.createElement('div'), gets = {};
    Object.entries(obj).forEach(([k, v]) => { const c = field(k, v, depth + 1); el.appendChild(fieldBox(k, c, false)); gets[k] = c.get; if ((k === 'title' || k === 'description') && Object.keys(obj).every(x => x === 'title' || x === 'description')) counter(k, c); });   // the main pages' Google text
    return { el, get: () => Object.fromEntries(Object.entries(gets).map(([k, g]) => [k, g()])) };
  }
  function list(key, arr, depth) {
    const el = document.createElement('div'); el.className = 'arr';
    const box = document.createElement('div'); box.className = 'arr'; el.appendChild(box);
    const tmpl = arr.length ? blank(arr[0]) : (templates[key] !== undefined ? templates[key] : '');
    const rows = [];
    const simple = arr.length ? arr.every(x => typeof x !== 'object' || x === null) : typeof tmpl !== 'object';
    const renum = () => rows.forEach((r, i) => { r.n.textContent = key === 'days' ? '' : i + 1; });
    const add = (v, open) => {
      const it = document.createElement('div'); it.className = 'it' + (open || simple ? '' : ' closed');
      it.innerHTML = '<div class="it-h"><span class="n"></span><b></b><button type="button" title="Move up">↑</button><button type="button" title="Move down">↓</button><button type="button" class="x" title="Remove">✕</button></div><div class="it-b"></div>';
      const c = field(key === 'items' ? 'item' : key, v, depth + 1), b = it.querySelector('b');
      it.querySelector('.it-b').appendChild(c.el);
      const r = { it, get: c.get, n: it.querySelector('.n') };
      const setSum = () => { b.textContent = summary(c.get()) || '(empty — click to fill in)'; };
      setSum(); it.addEventListener('input', setSum);
      if (simple) { b.style.display = 'none'; it.classList.remove('closed'); it.style.display = 'grid'; it.style.gridTemplateColumns = 'minmax(0,1fr) auto'; it.querySelector('.it-b').style.padding = '6px'; it.insertBefore(it.querySelector('.it-b'), it.firstChild); Object.assign(it.querySelector('.it-h').style, { borderBottom: '0', background: 'none', cursor: 'default' }); r.n.style.display = 'none'; }
      const [up, down, x] = it.querySelectorAll('.it-h button');
      it.querySelector('.it-h').onclick = e => { if (!e.target.closest('button') && !simple) it.classList.toggle('closed'); };
      up.onclick = () => { const i = rows.indexOf(r); if (i > 0) { rows.splice(i, 1); rows.splice(i - 1, 0, r); box.insertBefore(it, rows[i].it); renum(); touch(); } };
      down.onclick = () => { const i = rows.indexOf(r); if (i < rows.length - 1) { rows.splice(i, 1); rows.splice(i + 1, 0, r); box.insertBefore(it, rows[i].it.nextSibling); renum(); touch(); } };
      x.onclick = async () => { if (!(await A.confirm('Remove this?', '"' + (summary(c.get()) || 'This item') + '" will be removed when you save.', 'Remove', true))) return; rows.splice(rows.indexOf(r), 1); it.remove(); renum(); touch(); };
      rows.push(r); box.appendChild(it); renum();
      if (open && !simple) it.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    arr.forEach(v => add(v, false));
    const btns = document.createElement('div'); btns.className = 'chips';
    const addBtn = document.createElement('button'); addBtn.type = 'button'; addBtn.className = 'btn btn-s add';
    addBtn.textContent = '+ Add ' + ({ days: 'a day', faqs: 'a question', all: 'a review', offices: 'an office', redirects: 'a redirect', tours: 'a tour by hand', groups: 'a group' }[key] || (simple ? 'a line' : 'one more'));
    addBtn.onclick = () => { add(JSON.parse(JSON.stringify(tmpl)), true); touch(); };
    // a category's tours: pick an existing tour instead of typing it in
    if (key === 'tours' && (arr.length ? arr.every(t => t && typeof t === 'object' && 'href' in t) : true)) {
      const pickBtn = document.createElement('button'); pickBtn.type = 'button'; pickBtn.className = 'btn btn-s btn-g'; pickBtn.textContent = '+ Add one of your tours';
      pickBtn.onclick = () => pickTour(t => { add(t, false); touch(); A.toast('Added: ' + t.name); });
      btns.appendChild(pickBtn);
    }
    btns.appendChild(addBtn);
    el.appendChild(btns);
    return { el, get: () => rows.map(r => r.get()) };
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
  function rte(html) {
    const el = document.createElement('div');
    el.innerHTML = '<div class="rte-bar">' + [['bold', '<b>B</b> Bold'], ['italic', '<i>I</i>'], ['h2', 'Heading'], ['h3', 'Small heading'], ['p', 'Normal text'], ['ul', '• List'], ['ol', '1. List'], ['link', 'Link'], ['unlink', 'Remove link'], ['img', 'Photo'], ['src', 'HTML']]
      .map(([c, t]) => '<button type="button" data-c="' + c + '">' + t + '</button>').join('') + '</div><div class="rte" contenteditable="true"></div><textarea class="in" rows="18" hidden style="font-family:monospace;font-size:13px;border-radius:0 0 5px 5px"></textarea>';
    const ed = el.querySelector('.rte'), raw = el.querySelector('textarea');
    ed.innerHTML = html; ed.oninput = touch; raw.oninput = touch;
    const cmd = (c, v) => { ed.focus(); document.execCommand(c, false, v); touch(); };
    el.querySelector('.rte-bar').onclick = async e => {
      const b = e.target.closest('button'); if (!b) return;
      const c = b.dataset.c;
      if (c === 'src') { if (raw.hidden) { raw.value = ed.innerHTML; raw.hidden = false; ed.hidden = true; } else { ed.innerHTML = raw.value; raw.hidden = true; ed.hidden = false; } return; }
      if (!raw.hidden) return A.toast('Switch HTML off to use the buttons');
      if (c === 'bold' || c === 'italic' || c === 'unlink') cmd(c);
      else if (c === 'h2' || c === 'h3' || c === 'p') cmd('formatBlock', c.toUpperCase());
      else if (c === 'ul') cmd('insertUnorderedList');
      else if (c === 'ol') cmd('insertOrderedList');
      else if (c === 'link') {
        const sel = window.getSelection(), range = sel.rangeCount ? sel.getRangeAt(0) : null;
        if (!range || range.collapsed) return A.toast('First select the words to turn into a link');
        const box = await A.dialog({ title: 'Add a link', ok: 'Add link', html: '<label class="lb">Link to</label><input class="in" placeholder="/golden_triangle_packages or https://…"><p class="hint">' + HELP.href + '</p>', validate: b => b.querySelector('input').value.trim() ? '' : 'Please type an address.' });
        if (box) { sel.removeAllRanges(); sel.addRange(range); cmd('createLink', box.querySelector('input').value.trim()); }
      }
      else if (c === 'img') { const sel = window.getSelection(), range = sel.rangeCount ? sel.getRangeAt(0) : null; const src = await A.pickImage(); if (src) { if (range) { sel.removeAllRanges(); sel.addRange(range); } cmd('insertHTML', '<img src="' + src + '" alt="">'); } }
    };
    return { el, get: () => (raw.hidden ? ed.innerHTML : raw.value).trim() };
  }

  // ---------- Google: counters, preview, checks ----------
  const LIMITS = { title: [30, 60, 65], description: [120, 160, 170] };
  function counter(k, c) {
    const inp = c.input || (c.el.matches('input,textarea') ? c.el : c.el.querySelector('input,textarea')); if (!inp) return;
    const d = document.createElement('div'); d.className = 'count'; d.innerHTML = '<span class="bar"><i></i></span><span></span>';
    const upd = () => {
      const n = inp.value.trim().length, [lo, hi, max] = LIMITS[k];
      const lv = !n ? 'bad' : n < (k === 'title' ? lo : 70) || n > max ? 'bad' : n < lo || n > hi ? 'ok' : 'good';
      d.className = 'count ' + lv;
      d.querySelector('i').style.width = Math.min(100, 100 * n / max) + '%';
      d.lastChild.textContent = n + ' characters — ' + (!n ? 'empty' : n < lo ? 'a little short (aim for ' + lo + '–' + hi + ')' : n > hi ? 'Google may cut it off (aim for ' + lo + '–' + hi + ')' : 'good length');
    };
    inp.addEventListener('input', upd); upd();
    setTimeout(() => inp.closest('.f') && inp.closest('.f').appendChild(d));
  }
  function googlePanel(card, data) {
    const pv = document.createElement('div');
    pv.innerHTML = '<p class="tab-intro">This is how the page can look in Google. Write the title and description for a traveller who is searching — say what the page offers and why to click.</p>' +
      '<div class="gprev"><div class="gu"><i>M</i><div>Meruka India Tourism<small>' + A.esc(location.host + (E.url || '')) + '</small></div></div><div class="gt"></div><div class="gd"></div></div>' +
      '<h3 style="margin:18px 0 8px">Checklist</h3><ul class="checks"></ul><hr style="border:0;border-top:1px solid var(--line);margin:20px 0">';
    card.prepend(pv);
    const v = k => { const g = getters[k]; return g ? String(g() || '') : ''; };
    refreshGoogle = () => {
      const t = v('title').trim(), d = v('description').trim(), fk = v('focusKeyword').trim().toLowerCase();
      const head = (getters.heading ? v('heading') : '').toLowerCase();
      pv.querySelector('.gt').textContent = t || '(no Google title yet)';
      pv.querySelector('.gd').textContent = d || '(no description yet — Google will pick some text from the page)';
      const L = [];
      L.push([t.length >= 30 && t.length <= 60 ? '' : t ? 'warn' : 'no', 'Google title ' + (t ? 'is ' + t.length + ' characters (best 30–60)' : 'is empty')]);
      L.push([d.length >= 120 && d.length <= 160 ? '' : d ? 'warn' : 'no', 'Description ' + (d ? 'is ' + d.length + ' characters (best 120–160)' : 'is empty')]);
      if (fk) {
        L.push([t.toLowerCase().includes(fk) ? '' : 'warn', 'Focus phrase "' + fk + '" ' + (t.toLowerCase().includes(fk) ? 'is' : 'is not') + ' in the Google title']);
        L.push([d.toLowerCase().includes(fk) ? '' : 'warn', 'Focus phrase ' + (d.toLowerCase().includes(fk) ? 'is' : 'is not') + ' in the description']);
        if (getters.heading) L.push([head.includes(fk) ? '' : 'warn', 'Focus phrase ' + (head.includes(fk) ? 'is' : 'is not') + ' in the page title']);
      } else L.push(['warn', 'Add a focus phrase (what people type in Google, e.g. "Rajasthan tour") to get tips']);
      if (getters.heroAlt) L.push([v('heroAlt').trim() ? '' : 'warn', 'Banner photo ' + (v('heroAlt').trim() ? 'has a description' : 'has no description (Banner photo tab)')]);
      if (getters.noindex && getters.noindex()) L.push(['no', 'This page is hidden from Google']);
      pv.querySelector('.checks').innerHTML = L.map(([c, txt]) => '<li class="' + c + '">' + A.esc(txt) + '</li>').join('');
    };
    refreshGoogle();
  }
  const GHELP = {
    title: 'The blue headline in Google results and the name in the browser tab.',
    description: 'The two grey lines under the headline in Google.',
    keywords: 'Words people search for, separated by commas (Google mostly ignores these, other search engines may use them).',
    focusKeyword: 'The main phrase this page should be found for, e.g. "Golden Triangle tour". Only used for the checklist above.',
    ogImage: 'Optional. Leave empty to use the tour photo or the banner photo.'
  };

  // ---------- the form, in tabs ----------
  function build(res) {
    getters = {}; templates = res.templates || {}; root.innerHTML = ''; tabsEl.innerHTML = ''; refreshGoogle = () => {};
    const data = res.data;
    let tabs = TABS[E.mode === 'single' ? E.id : E.kind];
    if (!tabs) tabs = res.fields.filter(k => k in data).map(k => [label(k), [k], HELP[k] || '']);   // settings: one tab per part
    const used = new Set(tabs.flatMap(t => t[1]));
    const rest = res.fields.filter(k => k in data && !used.has(k));
    if (rest.length) tabs = tabs.concat([['More', rest, '']]);
    const panes = [];
    tabs.forEach(([name, keys, intro], ti) => {
      keys = keys.filter(k => k in data); if (!keys.length) return;
      const card = document.createElement('section'); card.className = 'card'; card.hidden = true;
      if (intro) card.insertAdjacentHTML('beforeend', '<p class="tab-intro">' + A.esc(intro) + '</p>');
      keys.forEach(k => {
        const c = field(k, data[k], 0);
        const f = fieldBox(k, c, true);
        if (GHELP[k] && name === 'Google') f.querySelector('.lb').insertAdjacentHTML('afterend', '<p class="fhelp">' + A.esc(GHELP[k]) + '</p>');
        card.appendChild(f); getters[k] = c.get;
        if ((k === 'title' || k === 'description') && name === 'Google') counter(k, c);
      });
      if (name === 'Google') googlePanel(card, data);
      const b = document.createElement('button'); b.type = 'button'; b.textContent = name; b.dataset.key = keys.join(' ');
      b.onclick = () => { panes.forEach(p => { p.card.hidden = p.b !== b; p.b.classList.toggle('on', p.b === b); }); history.replaceState(null, '', '#' + A.slug(name)); };
      tabsEl.appendChild(b); root.appendChild(card); panes.push({ b, card, slug: A.slug(name), keys });
    });
    const h = location.hash.slice(1);
    const start = panes.find(p => p.slug === h || p.keys.includes(h)) || panes[0];
    if (start) start.b.click();
    if (panes.length < 2) tabsEl.hidden = true;
    dirty = false; state.textContent = 'No changes yet'; state.classList.remove('dirty');
  }
  const collect = () => Object.fromEntries(Object.entries(getters).map(([k, g]) => [k, g()]));

  async function load() {
    try { build(await A.api('GET', apiUrl)); }
    catch (e) { root.innerHTML = '<div class="card"><p class="err">' + A.esc(e.message) + '</p></div>'; }
  }
  saveBtn.onclick = async () => {
    saveBtn.disabled = true; state.textContent = 'Saving…';
    try {
      const res = await A.api('PUT', apiUrl, { data: collect() });
      dirty = false; state.textContent = '✓ Saved ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' — live on the website'; state.classList.remove('dirty');
      if (res.data && res.data.heading) document.querySelector('[data-title]').textContent = res.data.heading;
      A.toast('Saved — the website is updated');
    } catch (e) { state.textContent = 'Not saved'; A.toast(e.message, true); }
    saveBtn.disabled = false;
  };
  document.querySelector('[data-revert]').onclick = async () => {
    if (!(await A.confirm('Undo all your edits?', 'This brings back the original text of this ' + (E.mode === 'single' ? 'section' : 'page') + '. Your changes cannot be recovered.', 'Undo my edits', true))) return;
    try { build(await A.api('POST', apiUrl + '/revert')); A.toast('Back to the original'); } catch (e) { A.toast(e.message, true); }
  };
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveBtn.click(); } });
  window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  load();
})();
