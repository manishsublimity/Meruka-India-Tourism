(function () {
  // Numbered tips ("1. ATM's: Most big cities…") become cards: number badge, bold topic, text.
  // The words stay exactly as written; only the layout changes. Runs of tips are grouped in a grid.
  var TIP = /^\s*(\d{1,2})\.\s*([^:]{2,45}):\s*/;
  var prose = $('.ar-body .prose'); if (!prose) return;
  var group = null;
  Array.prototype.slice.call(prose.children).forEach(function (el) {
    var m = el.tagName === 'P' && el.textContent.match(TIP);
    if (!m) { group = null; return; }
    if (!group) { group = document.createElement('div'); group.className = 'ar-tips'; el.parentNode.insertBefore(group, el); }
    // strip the "1. Topic:" prefix from the first text node(s) and rebuild it as badge + title
    var need = m[0].length, node = el.firstChild;
    while (node && need > 0) {
      var next = node.nextSibling;
      if (node.nodeType === 3) { var take = Math.min(need, node.textContent.length); node.textContent = node.textContent.slice(take); need -= take; }
      else { need -= node.textContent.length; el.removeChild(node); }
      node = next;
    }
    var card = document.createElement('div');
    card.className = 'ar-tip';
    card.innerHTML = '<span class="ar-tip-n">' + m[1] + '</span><span class="ar-tip-t"></span>';
    card.querySelector('.ar-tip-t').textContent = m[2].trim();
    group.appendChild(card);
    card.appendChild(el);
  });
})();

(function () {
  // Place lists (thumbnail · name · text · Read More): add a row of "jump to" chips above them.
  var BIG_PHOTO = {
    'delhi': '/photos/delhi-red-fort.jpg', 'himachal pradesh': '/photos/manali-balloon.jpg', 'jammu & kashmir': '/photos/ladakh-pangong.webp',
    'punjab': '/photos/golden-temple-amritsar.webp', 'rajasthan': '/photos/hawa-mahal-dusk.webp', 'uttar pradesh': '/photos/taj-mahal-wide.jpg',
    'lakshadweep': '/photos/lakshadweep-hd.webp', 'karnataka': '/photos/mysore-palace.webp', 'kerala': '/photos/kerala-backwaters.webp', 'tamil nadu': '/photos/brihadeshwara-temple.webp',
    'arunachal pradesh': '/photos/arunachal-losar.webp', 'nagaland': '/photos/nagaland-festival.webp', 'west bengal': '/photos/darjeeling.jpg',
    'gujarat': '/photos/gujarat.jpg', 'goa': '/photos/goa-beach-palms.avif', 'madhya pradesh': '/photos/bengal-tiger.jpg'
  };
  var slugify = function (s) { return s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  $$('.ar-body .prose ul').forEach(function (ul) {
    var items = $$(':scope > li', ul).filter(function (li) { return $(':scope > a > img', li); });
    if (items.length < 3) return;
    var nav = document.createElement('nav');
    nav.className = 'ar-jump';
    nav.setAttribute('aria-label', 'Places on this page');
    nav.innerHTML = '<div class="ar-places-head"><p class="ar-places-h">Places to <em>explore</em></p><span class="ar-jump-t">' + items.length + ' places</span></div>';
    items.forEach(function (li) {
      var name = ($$(':scope > a', li)[1] || {}).textContent || '';
      name = name.trim(); if (!name) return;
      li.id = li.id || 'place-' + slugify(name);
      var a = document.createElement('a');
      a.href = '#' + li.id;
      a.textContent = name;
      (nav.querySelector('.ar-jump-list') || nav.appendChild(Object.assign(document.createElement('div'), { className: 'ar-jump-list' }))).appendChild(a);
    });
    ul.parentNode.insertBefore(nav, ul);
    ul.classList.add('ar-ph');
    // photo-top cards: where the photo library has a large, clearly matching photo of the
    // place it replaces the small original thumbnail (each used once on the page)
    items.forEach(function (li) {
      var name = (($$(':scope > a', li)[1] || {}).textContent || '').trim().toLowerCase(), img = $(':scope > a > img', li);
      var big = BIG_PHOTO[name];
      // never show a photo twice on a page
      if (img && big && !$$('img').some(function (x) { return x.getAttribute('src') === big; })) img.setAttribute('src', big);
    });
    // the places get their own full-width section after the article (as in the client's
    // reference), and the article gets a sidebar: the places as quick links + Plan My Trip
    var content = document.getElementById('content');
    if (content && content.classList.contains('ar-region')) {
      var sec = document.createElement('section'); sec.className = 'az az-a ar-places-sec';
      var wrapIn = document.createElement('div'); wrapIn.className = 'az-wrap';
      wrapIn.appendChild(nav); wrapIn.appendChild(ul); sec.appendChild(wrapIn);
      content.parentNode.insertBefore(sec, content.nextSibling);
      var arWrap = document.getElementById('ar-wrap');
      if (arWrap) {
        var cta = document.querySelector('.az-end .az-acts');
        var side = document.createElement('aside'); side.className = 'ar-aside2';
        side.innerHTML = '<div class="ar-a2-card"><p class="ar-a2-h">Places to <em>explore</em></p><div class="ar-a2-list"></div></div>'
          + (cta ? '<div class="ar-a2-card ar-a2-plan"><p class="ar-a2-h">Plan your <em>trip</em></p><div class="ar-a2-acts"></div></div>' : '');
        var list = side.querySelector('.ar-a2-list');
        items.forEach(function (li) {
          var n = (($$(':scope > a', li)[1] || {}).textContent || '').trim(); if (!n) return;
          var a = document.createElement('a'); a.href = '#' + li.id; a.textContent = n; list.appendChild(a);
        });
        if (cta) $$('a', cta).forEach(function (a) { side.querySelector('.ar-a2-acts').appendChild(a.cloneNode(true)); });
        arWrap.appendChild(side); arWrap.classList.add('ar-has-aside2');
      }
    }
    // the whole card opens the place (clicks on its links work as usual)
    ul.addEventListener('click', function (e) {
      var li = e.target.closest('li'); if (!li || li.parentNode !== ul || e.target.closest('a')) return;
      var a = $(':scope > a', li); if (a) location.href = a.href;
    });
  });


})();

(function () {
  // Destination guides (Delhi, Jaipur, Kerala …): the imported text is laid out for easy reading —
  // the opening as a lead with the rest behind "Read the full story", the fact lines (area, climate,
  // best season …) as a Quick facts card, "Places of Interest" as cards with place chips,
  // "Excursions" as distance chips, "Reach" as By Air / Rail / Road cards and "How to plan your
  // tours" as a plan box. The words themselves are not changed.
  var content = document.getElementById('content');
  if (!content || !content.classList.contains('ar-dest')) return;
  var prose = $('.ar-body .prose', content), wrap = document.getElementById('ar-wrap');
  if (!prose || !wrap) return;
  var svg = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
  var ICON = {
    area: '<path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3z"/><path d="M9 4v13M15 7v13"/>',
    altitude: '<path d="m3 20 6-10 4 6 2-3 6 7z"/><path d="M14 5l2-2 2 2"/>',
    climate: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    rain: '<path d="M7 16a4 4 0 1 1 .5-8A6 6 0 0 1 19 9a4 4 0 0 1-1 7.9"/><path d="M9 19l-1 2M13 19l-1 2M17 19l-1 2"/>',
    lang: '<path d="M4 5h9M8.5 3v2M6 5c0 4 3 7 6 8M11 5c0 3-3 7-7 9"/><path d="m13 21 4-9 4 9M14.5 18h5"/>',
    season: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.6" r=".6" fill="currentColor"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    star: '<path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h7"/>',
    air: '<path d="M10.5 13.5 3 11l1.5-1.5 8 1 4-4c.8-.8 2.2-.8 2.5-.5s.3 1.7-.5 2.5l-4 4 1 8L14 22l-2.5-7.5-3 3V20l-1.5 1-1-3-3-1 1-1.5h2.5z"/>',
    rail: '<rect x="6" y="3" width="12" height="13" rx="3"/><path d="M6 11h12M9 20l-2 2M15 20l2 2M9 16l-1 4h8l-1-4"/><circle cx="9.5" cy="13.5" r=".6" fill="currentColor"/><circle cx="14.5" cy="13.5" r=".6" fill="currentColor"/>',
    road: '<path d="M5 17h14l-1.5-6a2 2 0 0 0-2-1.5h-7a2 2 0 0 0-2 1.5z"/><circle cx="8" cy="17.5" r="1.5"/><circle cx="16" cy="17.5" r="1.5"/><path d="M5 17v2M19 17v2"/>',
    plan: '<path d="M9 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><path d="M14 3h7v7M21 3 11 13"/>'
  };
  var FACT = /^(area|altitude|climate|temperature|rainfall|languages?(\s+spoken)?|best\s+(season|time)(\s+to\s+visit)?|population|capital|clothing|season)\b/i;
  var factIcon = function (l) { return /area/i.test(l) ? ICON.area : /alti/i.test(l) ? ICON.altitude : /rain/i.test(l) ? ICON.rain : /clim|temp/i.test(l) ? ICON.climate : /lang/i.test(l) ? ICON.lang : /best|season/i.test(l) ? ICON.season : ICON.info; };
  var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  var clean = function (s) { return String(s).replace(/\s+/g, ' ').replace(/^[\s:–-]+|[\s.,;]+$/g, '').trim(); };
  var isHead = function (n) { return /^H[1-4]$/.test(n.tagName); };
  var multiCity = !!$('h3', prose);

  // fact pairs inside one paragraph: <strong>Area:</strong> 1470 Sq.Km. <strong>Altitude:</strong> 239 Mts
  function factPairs(p) {
    var strongs = $$('strong', p); if (!strongs.length) return null;
    var pairs = [];
    for (var i = 0; i < strongs.length; i++) {
      var label = clean(strongs[i].textContent.replace(/:.*$/, '')), value = '';
      var tail = strongs[i].textContent.split(':').slice(1).join(':');
      for (var n = strongs[i].nextSibling; n && n !== strongs[i + 1]; n = n.nextSibling) value += n.textContent;
      value = clean(tail + ' ' + value);
      if (!FACT.test(label)) return null;
      pairs.push({ label: label, value: value });
    }
    // the paragraph must start with its first label (no text before it)
    var before = ''; for (var b = p.firstChild; b && b !== strongs[0]; b = b.nextSibling) before += b.textContent;
    return clean(before).replace(/[…]/g, '') ? null : pairs;
  }
  function factsGrid(pairs) {
    var g = el('div', 'dx-facts');
    pairs.forEach(function (f) {
      var c = el('div', 'dx-fact', '<span class="dx-fact-ic">' + svg(factIcon(f.label)) + '</span><span class="dx-fact-t"><small></small><b></b></span>');
      c.querySelector('small').textContent = f.label; c.querySelector('b').textContent = f.value; g.appendChild(c);
    });
    return g;
  }
  var sideFacts = [];

  // some guides mark their sections with a bold paragraph instead of a heading —
  // <p><strong>Places of Interest:</strong></p> or <p><strong>Excursions:</strong><br>Hajo- 32 kms, …</p>
  var SECTION = /^(places of interest|excursions?|reach|how to reach|how to plan your tours|best (time|season)( to visit)?)\s*[:\-–]?\s*$/i;
  $$(':scope > p', prose).forEach(function (p) {
    var s = p.firstElementChild;
    if (!s || s.tagName !== 'STRONG' || !SECTION.test(clean(s.textContent))) return;
    var before = ''; for (var b = p.firstChild; b && b !== s; b = b.nextSibling) before += b.textContent;
    if (clean(before)) return;
    var h = el('h4'); h.textContent = s.textContent.trim();
    var rest = p.cloneNode(true); rest.removeChild(rest.firstElementChild);
    while (rest.firstChild && (rest.firstChild.nodeName === 'BR' || !rest.firstChild.textContent.replace(/[\s:\-–]/g, ''))) rest.removeChild(rest.firstChild);
    p.parentNode.insertBefore(h, p);
    if (rest.textContent.trim()) p.parentNode.insertBefore(rest, p);
    p.remove();
  });
  // fact lines written as plain text: "Altitude: 55 meters. Temperature (deg C): … Best Season: October to May."
  var TEXT_FACT = /(Area|Altitude|Temperature(?:\s*\([^)]*\))?|Rainfall|Climate(?:\s*\([^)]*\))?|Best Season|Clothing|Languages?(?: spoken)?|Population)\s*:/g;
  function textFactPairs(p) {
    if (p.querySelector('strong')) return null;
    var t = clean(p.textContent), m, hits = [];
    TEXT_FACT.lastIndex = 0;
    while ((m = TEXT_FACT.exec(t))) hits.push({ label: m[1], at: m.index, end: TEXT_FACT.lastIndex });
    if (hits.length < 2 || hits[0].at !== 0) return null;
    return hits.map(function (h, i) { return { label: h.label, value: clean(t.slice(h.end, i + 1 < hits.length ? hits[i + 1].at : t.length)) }; });
  }

  // 1) the opening: lead paragraph, the rest folded behind "Read the full story"
  var kids = Array.prototype.slice.call(prose.children), intro = [];
  for (var i = 0; i < kids.length; i++) { if (isHead(kids[i]) || kids[i].tagName !== 'P' || factPairs(kids[i]) || textFactPairs(kids[i])) break; intro.push(kids[i]); }
  if (intro.length) intro[0].classList.add('dx-lead');
  if (intro.length > 2) {
    var more = el('div', 'dx-more'); intro[1].parentNode.insertBefore(more, intro[1]);
    intro.slice(1).forEach(function (p) { more.appendChild(p); });
    var btn = el('button', 'dx-more-btn', '<span>Read the full story</span> ' + svg('<path d="m6 9 6 6 6-6"/>'));
    btn.type = 'button'; btn.setAttribute('aria-expanded', 'false');
    more.parentNode.insertBefore(btn, more.nextSibling);
    btn.addEventListener('click', function () {
      var open = more.classList.toggle('open'); btn.setAttribute('aria-expanded', open);
      btn.querySelector('span').textContent = open ? 'Show less' : 'Read the full story';
      if (!open) more.scrollIntoView({ block: 'nearest' });
    });
  }

  // 2) fact paragraphs and "Best time to visit" headings
  $$(':scope > p', prose).forEach(function (p) {
    var pairs = factPairs(p) || textFactPairs(p); if (!pairs || !pairs.length) return;
    if (!multiCity) { sideFacts = sideFacts.concat(pairs); p.remove(); }
    else p.parentNode.replaceChild(factsGrid(pairs), p);
  });
  $$(':scope > h4', prose).forEach(function (h) {
    if (!/best\s+(time|season)/i.test(h.textContent)) return;
    var p = h.nextElementSibling; if (!p || p.tagName !== 'P' || p.textContent.length > 160) return;
    var pair = { label: clean(h.textContent), value: clean(p.textContent) };
    if (!multiCity) { sideFacts.push(pair); h.remove(); p.remove(); }
    else { p.parentNode.replaceChild(factsGrid([pair]), p); h.remove(); }
  });

  // 3) sections that start with an h4
  var sectionOf = function (h) {
    var t = h.textContent;
    return /places of interest|attractions|sightseeing/i.test(t) ? 'places' : /excursion/i.test(t) ? 'excursions' : /reach|getting there|how to get/i.test(t) ? 'reach' : /how to plan/i.test(t) ? 'plan' : '';
  };
  // never drop words: a text becomes chips only when every piece is a short name
  var listItems = function (s) { return s.split(/\s*,\s*/).map(clean).filter(Boolean); };
  var isList = function (s) { var it = listItems(s); return it.length >= 2 && it.every(function (x) { return x.length < 60; }) && it.reduce(function (n, x) { return n + x.length; }, 0) / it.length < 34; };
  // a clean list of names; when an item ends in a distance ("Hajo- 32 kms") the distance sits on
  // the right of a dotted line, menu style. The words keep their own spelling; spaces keep them apart.
  var DIST = /^([^\d]*?)[\s:–-]+(\d[\d.]*)(\s*)(kms?|km)(\.?)$/i;
  var listOf = function (items, dist) {
    var ul = el('ul', 'dx-list'), any = false;
    items.forEach(function (x) {
      var li = el('li'), m = dist && x.match(DIST);
      if (m) { any = true; li.className = 'dx-d'; li.innerHTML = '<span class="dx-n"></span> <span class="dx-km"></span>'; li.firstChild.textContent = clean(m[1]); li.lastChild.textContent = m[2] + m[3] + m[4] + m[5]; }
      else li.textContent = x;
      ul.appendChild(li); ul.appendChild(document.createTextNode(' '));
    });
    if (any) ul.classList.add('dx-dist');
    return ul;
  };
  // a paragraph that opens with a bold label: "Moghul Monuments: Red Fort, Qutub Minar, …"
  var labelled = function (p) {
    var s = p.querySelector('strong'), txt = clean(p.textContent);
    var lead = s && txt.indexOf(clean(s.textContent)) <= 2;
    return { title: lead ? clean(s.textContent.replace(/:\s*$/, '')) : '', rest: lead ? clean(txt.slice(txt.indexOf(clean(s.textContent)) + clean(s.textContent).length)) : txt };
  };
  var block = function (p) {
    var x = labelled(p), b;
    if (isList(x.rest)) { b = el('div', 'dx-cat'); if (x.title) b.appendChild(el('p', 'dx-cat-t')).textContent = x.title; b.appendChild(listOf(listItems(x.rest), true)); }
    else if (x.title) { b = el('div', 'dx-spot'); b.appendChild(el('p', 'dx-spot-t')).textContent = x.title; b.appendChild(el('p', 'dx-spot-d')).textContent = x.rest; }
    else { b = p.cloneNode(true); }
    return b;
  };
  $$(':scope > h4', prose).forEach(function (h) {
    var type = sectionOf(h); if (!type) return;
    h.classList.add('dx-h', 'dx-h-' + type);
    var body = [];
    for (var n = h.nextElementSibling; n && !isHead(n) && !(n.tagName === 'DIV' && !n.textContent.trim()); n = n.nextElementSibling) body.push(n);
    body = body.filter(function (n) { return n.tagName === 'P' && n.textContent.trim(); });
    if (!body.length) return;
    var box;
    if (type === 'places' || type === 'excursions') {
      box = el('div', 'dx-sec dx-' + type);
      body.forEach(function (p) { box.appendChild(block(p)); });
    } else if (type === 'reach') {
      box = el('div', 'dx-sec dx-reach');
      body.forEach(function (p) {
        var txt = clean(p.textContent), m = txt.match(/^By\s+(Air|Rail|Road|Train|Bus|Sea)\s*:?\s*([\s\S]*)$/i);
        if (!m) { box.appendChild(p.cloneNode(true)); return; }
        var mode = m[1].toLowerCase(), row = el('div', 'dx-way dx-way-' + mode, '<span class="dx-way-ic">' + svg(mode === 'air' ? ICON.air : mode === 'road' || mode === 'bus' ? ICON.road : ICON.rail) + '</span><div class="dx-way-b"><p class="dx-way-t"></p></div>');
        row.querySelector('.dx-way-t').textContent = 'By ' + m[1];
        if (/\d\s*kms?/i.test(m[2]) && isList(m[2])) row.querySelector('.dx-way-b').appendChild(listOf(listItems(m[2]), true));
        else row.querySelector('.dx-way-b').appendChild(el('p', 'dx-way-d')).textContent = clean(m[2]);
        box.appendChild(row);
      });
    } else if (type === 'plan') {
      box = el('div', 'dx-plan');
      body.forEach(function (p) { box.appendChild(p.cloneNode(true)); });
      box.appendChild(el('div', 'dx-acts', '<a href="/#plan" class="dx-btn dx-btn-gold">Plan My Trip <span>→</span></a><a href="/contactus#enquiry" class="dx-btn dx-btn-line">Enquire Now <span>→</span></a>'));
    }
    body.forEach(function (p) { p.remove(); });
    h.parentNode.insertBefore(box, h.nextSibling);
  });

  // 4) the sidebar: Quick facts + Plan your trip (sticky beside the text)
  var side = el('aside', 'ar-aside2 dx-aside');
  if (sideFacts.length) {
    var fc = el('div', 'ar-a2-card dx-qf', '<p class="ar-a2-h">Quick <em>facts</em></p>');
    fc.appendChild(factsGrid(sideFacts)); side.appendChild(fc);
  }
  var cta = document.querySelector('.az-end .az-acts');
  if (cta) {
    var pc = el('div', 'ar-a2-card dx-plancard', '<p class="ar-a2-h">Plan your <em>trip</em></p><div class="dx-acts"></div>');
    $$('a', cta).forEach(function (a) {
      var b = el('a', 'dx-btn ' + (/ph-btn-gold/.test(a.className) ? 'dx-btn-gold' : 'dx-btn-line'));
      b.href = a.getAttribute('href'); if (a.target) { b.target = a.target; b.rel = 'noopener'; }
      b.textContent = clean(a.textContent.replace(/→/g, '')) + ' '; b.appendChild(el('span', null, '→'));
      pc.querySelector('.dx-acts').appendChild(b);
    });
    side.appendChild(pc);
  }
  wrap.appendChild(side); wrap.classList.add('ar-has-aside2');
  // on phones and tablets (one column) the Quick facts card sits right after the opening,
  // not below the whole guide; on wider screens it goes back into the sidebar
  var qf = $('.dx-qf', side);
  if (qf) {
    var spot = document.createComment('quick facts');
    var after = $('.dx-more-btn', prose) || $('.dx-lead', prose);
    if (after) after.parentNode.insertBefore(spot, after.nextSibling);
    var mq = matchMedia('(max-width: 999.98px)');
    var place = function () {
      if (mq.matches && after) { spot.parentNode.insertBefore(qf, spot.nextSibling); qf.classList.add('dx-qf-in'); }
      else { side.insertBefore(qf, side.querySelector('.dx-plancard')); qf.classList.remove('dx-qf-in'); }
    };
    place(); (mq.addEventListener ? mq.addEventListener('change', place) : mq.addListener(place));
  }
})();

(function () {
  // Builds the "On this page" list from the article's own headings, and marks the one in view.
  var prose = $('.ar-body .prose'), toc = $('#ar-toc'), side = $('#ar-side'), wrap = $('#ar-wrap');
  if (!prose || !toc) return;
  var heads = $$('h2, h3, h4', prose).filter(function (h) { return h.textContent.trim().length > 1; });
  if (heads.length < 2) { wrap.classList.add('ar-single'); return; }

  var slug = function (s) { return s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var used = {};
  // the highest heading level on the page is the top of the list; deeper ones are indented under it
  var top = Math.min.apply(null, heads.map(function (h) { return +h.tagName[1]; }));
  var links = heads.map(function (h) {
    if (!h.id) { var id = slug(h.textContent) || 'section'; while (used[id] || document.getElementById(id)) id += '-2'; h.id = id; }
    used[h.id] = 1;
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent.trim();
    var depth = +h.tagName[1] - top;
    if (depth) a.className = depth > 1 ? 'sub sub2' : 'sub';
    else if (heads.some(function (x) { return +x.tagName[1] > top; })) a.className = 'grp';
    toc.appendChild(a);
    return a;
  });
  side.classList.remove('is-hidden');
  var a2 = $('.ar-aside2'); if (a2) a2.insertBefore(side, a2.firstChild);

  if (!('IntersectionObserver' in window)) return;
  var current = null;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) current = e.target; });
    if (!current) return;
    var i = heads.indexOf(current);
    links.forEach(function (a, k) { a.classList.toggle('on', k === i); });
  }, { rootMargin: '-90px 0px -65% 0px' });
  heads.forEach(function (h) { io.observe(h); });
})();
