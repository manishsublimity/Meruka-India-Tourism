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
    'delhi': '/photos/delhi-red-fort.jpg', 'himachal pradesh': '/photos/manali-balloon.jpg', 'jammu & kashmir': '/photos/ladakh-pangong.jpg',
    'punjab': '/photos/golden-temple-amritsar.jpg', 'rajasthan': '/photos/hawa-mahal-dusk.jpg', 'uttar pradesh': '/photos/taj-mahal-wide.jpg',
    'lakshadweep': '/photos/lakshadweep-hd.jpg', 'karnataka': '/photos/mysore-palace.jpg', 'kerala': '/photos/kerala-backwaters.jpg', 'tamil nadu': '/photos/brihadeshwara-temple.webp',
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
  // Builds the "On this page" list from the article's own headings, and marks the one in view.
  var prose = $('.ar-body .prose'), toc = $('#ar-toc'), side = $('#ar-side'), wrap = $('#ar-wrap');
  if (!prose || !toc) return;
  var heads = $$('h2, h3, h4', prose).filter(function (h) { return h.textContent.trim().length > 1; });
  if (heads.length < 2) { wrap.classList.add('ar-single'); return; }

  var slug = function (s) { return s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var used = {};
  var links = heads.map(function (h) {
    if (!h.id) { var id = slug(h.textContent) || 'section'; while (used[id] || document.getElementById(id)) id += '-2'; h.id = id; }
    used[h.id] = 1;
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent.trim();
    if (h.tagName === 'H3') a.className = 'sub';
    toc.appendChild(a);
    return a;
  });
  side.classList.remove('is-hidden');

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
