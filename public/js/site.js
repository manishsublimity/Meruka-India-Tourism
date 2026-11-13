// Shared behaviour: hover / focus styles (data-hover, data-focus) and state-based styles.
(function () {
  // An element's "base" inline style; hover/focus styles are layered on top of it.
  function base(el) {
    if (el._base == null) el._base = el.getAttribute('style') || '';
    return el._base;
  }
  function paint(el) {
    var s = base(el);
    if (el._hover && el.dataset.hover) s += ';' + el.dataset.hover;
    if (el._focus && el.dataset.focus) s += ';' + el.dataset.focus;
    el.setAttribute('style', s);
  }
  // Replace an element's base style (used when state changes, e.g. active tab).
  window.setBaseStyle = function (el, style) { el._base = style; paint(el); };
  // Elements with data-on / data-off hold two base styles; toggle between them.
  window.setOn = function (el, on) { window.setBaseStyle(el, on ? el.dataset.on : el.dataset.off); };

  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest && e.target.closest('[data-hover]');
    while (el) {
      if (!el._hover) { base(el); el._hover = true; paint(el); }
      el = el.parentElement && el.parentElement.closest('[data-hover]');
    }
  });
  document.addEventListener('mouseout', function (e) {
    var el = e.target.closest && e.target.closest('[data-hover]');
    while (el) {
      if (el._hover && !el.contains(e.relatedTarget)) { el._hover = false; paint(el); }
      el = el.parentElement && el.parentElement.closest('[data-hover]');
    }
  });
  document.addEventListener('focusin', function (e) {
    var el = e.target;
    if (el.dataset && el.dataset.focus) { base(el); el._focus = true; paint(el); }
  });
  document.addEventListener('focusout', function (e) {
    var el = e.target;
    if (el.dataset && el.dataset.focus) { el._focus = false; paint(el); }
  });

  window.$ = function (sel, root) { return (root || document).querySelector(sel); };
  window.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  window.postEnquiry = function (data) {
    return fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); }).catch(function () {
      return { ok: false, error: 'Could not send right now — please try again.' };
    });
  };

  window.copyText = function (text, done) {
    function fallback() {
      var t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(t);
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, function () { fallback(); done(); }); return; }
    } catch (e) {}
    fallback(); done();
  };

  // (23 Oct 2026, client doc) content protection: no copying of page text, no right-click / dragging of photos;
  // typing and copy-paste inside form fields work as usual
  var inField = function (t) { return t && t.closest && t.closest('input, textarea, select, [contenteditable]'); };
  ['copy', 'cut'].forEach(function (ev) { document.addEventListener(ev, function (e) { if (!inField(e.target)) e.preventDefault(); }); });
  document.addEventListener('contextmenu', function (e) { if (e.target.closest && e.target.closest('img, picture, figure')) e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { if (e.target.tagName === 'IMG') e.preventDefault(); });

  // (27 Oct 2026, client video) phones: the guest reviews move on by themselves, one card at a time; a touch or the
  // Pause button stops them for a while
  document.addEventListener('DOMContentLoaded', function () {
    if (!window.matchMedia('(max-width: 767.98px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    Array.prototype.forEach.call(document.querySelectorAll('.rm-row'), function (row) {
      var sec = row.closest('.rm'), hold = 0;
      row.addEventListener('touchstart', function () { hold = Date.now() + 9000; }, { passive: true });
      setInterval(function () {
        if (Date.now() < hold || (sec && sec.classList.contains('paused'))) return;
        var cards = Array.prototype.filter.call(row.querySelectorAll('.rm-card'), function (c) { return c.getAttribute('aria-hidden') !== 'true'; });
        if (!cards.length) return;
        var mid = row.scrollLeft + row.clientWidth / 2, i = 0, best = 1e9;
        cards.forEach(function (c, k) { var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < best) { best = d; i = k; } });
        var next = cards[(i + 1) % cards.length];
        row.scrollTo({ left: next.offsetLeft - (row.clientWidth - next.offsetWidth) / 2, behavior: i + 1 >= cards.length ? 'auto' : 'smooth' });
      }, 4500);
    });
  });

  // Site header (every page): mobile menu, language picker, shadow once scrolled
  document.addEventListener('DOMContentLoaded', function () {
    var h = document.getElementById('site-header');
    if (!h) return;
    var burger = h.querySelector('[data-mh-burger]'), drawer = h.querySelector('[data-mh-drawer]');
    var langBtn = h.querySelector('[data-mh-lang]'), langMenu = h.querySelector('[data-mh-lang-menu]'), langCur = h.querySelector('[data-mh-lang-cur]');
    // (27 Oct 2026, client video) the menu and the language list slide in from the side; a click outside, the ✕ or
    // Escape closes them; only one is open at a time
    var scrim = h.querySelector('[data-mh-scrim]');
    // (13 Nov 2026) the currency list: opened and closed like the languages (only one list open at a time)
    var curBtn = h.querySelector('[data-mh-cur-btn]'), curMenu = h.querySelector('[data-mh-cur-menu]');
    // (13 Nov 2026) the slide-in menu works from 1200px down, and on a wider screen whose menu does not fit (html.mh-squeeze)
    var slideIn = function () { return window.innerWidth < 1200 || document.documentElement.classList.contains('mh-squeeze'); };
    var syncScrim = function () { var any = !drawer.classList.contains('is-hidden') || !langMenu.classList.contains('is-hidden') || (curMenu && !curMenu.classList.contains('is-hidden')); if (scrim) scrim.hidden = !any; document.documentElement.classList.toggle('mh-lock', any && slideIn()); if (!any && fit && fit.later) setTimeout(fit, 60); };
    var setCur = function (open) { if (!curMenu) return; curMenu.classList.toggle('is-hidden', !open); curBtn.setAttribute('aria-expanded', open); syncScrim(); };
    var setLang = function (open) { if (open) setCur(false); langMenu.classList.toggle('is-hidden', !open); langBtn.setAttribute('aria-expanded', open); syncScrim(); };
    var setMenu = function (open) { if (open) { setLang(false); setCur(false); } drawer.classList.toggle('is-hidden', !open); burger.setAttribute('aria-expanded', open); h.classList.toggle('menu-open', open); syncScrim(); };
    burger.addEventListener('click', function (e) { e.stopPropagation(); setMenu(drawer.classList.contains('is-hidden')); });
    var mx = h.querySelector('[data-mh-close]'); if (mx) mx.addEventListener('click', function () { setMenu(false); });
    var lx = h.querySelector('[data-mh-lang-close]'); if (lx) lx.addEventListener('click', function (e) { e.stopPropagation(); setLang(false); });
    if (scrim) scrim.addEventListener('click', function () { setMenu(false); setLang(false); setCur(false); });
    if (curMenu) {
      curBtn.addEventListener('click', function (e) { e.stopPropagation(); var open = curMenu.classList.contains('is-hidden'); if (open) { setMenu(false); setLang(false); } setCur(open); });
      var cx = h.querySelector('[data-mh-cur-close]'); if (cx) cx.addEventListener('click', function (e) { e.stopPropagation(); setCur(false); });
      curMenu.addEventListener('click', function (e) {
        e.stopPropagation();
        var b = e.target.closest('[data-mh-cur-pick]'); if (!b) return;
        var sel = h.querySelector('[data-mh-cur]'); sel.value = b.dataset.mhCurPick; sel.dispatchEvent(new Event('change')); setCur(false);
      });
      document.addEventListener('click', function (e) { if (!curMenu.classList.contains('is-hidden') && !curMenu.contains(e.target) && !curBtn.contains(e.target)) setCur(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setCur(false); });
    }
    document.addEventListener('click', function (e) { if (!drawer.classList.contains('is-hidden') && !drawer.contains(e.target) && !burger.contains(e.target)) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); setLang(false); } });
    Array.prototype.forEach.call(drawer.querySelectorAll('a'), function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (!slideIn()) setMenu(false); });
    // (13 Nov 2026, client) a translated menu (Spanish, German …) can be longer than the room beside the logo: smaller words
    // first, then the menu button — measured on load, on resize and whenever Google Translate changes the words
    var nav = h.querySelector('.mh-nav'), logo = h.querySelector('.mh-logo'), acts = h.querySelector('.mh-actions'), root = document.documentElement;
    if (nav && logo && acts) {
      var crowded = function () {
        var links = nav.querySelectorAll('.mh-link'); if (!links.length || !nav.offsetWidth) return false;
        var first = links[0].getBoundingClientRect(), last = links[links.length - 1].getBoundingClientRect();
        return nav.scrollWidth > nav.clientWidth + 1 || first.left < logo.getBoundingClientRect().right + 2 || last.right > acts.getBoundingClientRect().left - 2;
      };
      var fitting = false, fit = function () {
        if (fitting) return;
        // never measured while a side panel is open: taking the squeeze off for a moment would restart its slide and
        // its dark overlay (a blink); measured again once it is closed
        if (root.classList.contains('mh-lock') || !drawer.classList.contains('is-hidden') || !langMenu.classList.contains('is-hidden') || (curMenu && !curMenu.classList.contains('is-hidden'))) { fit.later = true; return; }
        fit.later = false; fitting = true;
        h.classList.remove('mh-tight'); root.classList.remove('mh-squeeze');
        if (window.innerWidth >= 1200 && crowded()) { h.classList.add('mh-tight'); if (crowded()) { h.classList.remove('mh-tight'); root.classList.add('mh-squeeze'); } }
        if (!slideIn()) setMenu(false);
        fitting = false;
      };
      var soon = function () { clearTimeout(soon.t); soon.t = setTimeout(fit, 60); };
      fit(); window.addEventListener('load', soon); window.addEventListener('resize', soon);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
      new MutationObserver(soon).observe(nav, { childList: true, characterData: true, subtree: true });
      // only when Google Translate turns the page's language on or off (not when a panel locks the page's scroll)
      var tr = /translated-/.test(root.className);
      new MutationObserver(function () {
        var now = /translated-/.test(root.className);
        if (now !== tr) { tr = now; soon(); } else if (fit.later && !root.classList.contains('mh-lock')) soon();
      }).observe(root, { attributes: true, attributeFilter: ['class'] });
    }
    langBtn.addEventListener('click', function (e) { e.stopPropagation(); var open = langMenu.classList.contains('is-hidden'); if (open) setMenu(false); setLang(open); });
    Array.prototype.forEach.call(langMenu.querySelectorAll('[data-mh-lang-pick]'), function (b) {
      b.addEventListener('click', function () {
        langCur.textContent = b.dataset.mhLangPick; langMenu.classList.add('is-hidden'); langBtn.setAttribute('aria-expanded', false);
        // (21 Oct 2026) translate the site with Google Translate: its cookie says which language, then the page reloads
        var code = b.dataset.code || 'en';
        // (23 Oct 2026) Google also writes this cookie itself, on the site's own name and on its parent domains; an old copy
        // left on any of them won the next time, so the new language did not show. Every copy is removed first.
        var parts = location.hostname.split('.'), domains = [''];
        for (var i = 0; i < parts.length - 1; i++) { var dmn = parts.slice(i).join('.'); domains.push('; domain=' + dmn, '; domain=.' + dmn); }
        domains.forEach(function (d) { document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT' + d; });
        if (code !== 'en') {
          var host = location.hostname.replace(/^www\./, '');
          document.cookie = 'googtrans=/en/' + code + '; path=/';
          if (host.indexOf('.') > -1) document.cookie = 'googtrans=/en/' + code + '; path=/; domain=.' + host;
        }
        location.reload();
      });
    });
    // the language in use (from Google Translate's cookie) on the button; the translator itself loads in the head (partials/head.ejs)
    var gt = (document.cookie.match(/(?:^|; )googtrans=\/en\/([^;]+)/) || [])[1];
    var gtBtn = gt && langMenu.querySelector('[data-code="' + gt + '"]');
    if (gtBtn) { langCur.textContent = gtBtn.dataset.mhLangPick; gtBtn.setAttribute('aria-current', 'true'); }
    document.addEventListener('click', function (e) { if (!langMenu.classList.contains('is-hidden') && !langMenu.contains(e.target)) setLang(false); });
    var onScroll = function () { h.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // Search panel: opens under the bar; Escape, the close button or a click outside closes it
    var sBtn = h.querySelector('[data-mh-search-open]'), sPanel = h.querySelector('[data-mh-search]');
    if (sBtn && sPanel) {
      var setSearch = function (open) {
        sPanel.classList.toggle('is-hidden', !open);
        sBtn.setAttribute('aria-expanded', open);
        h.classList.toggle('search-open', open);
        if (open) sPanel.querySelector('input').focus(); else if (h.contains(document.activeElement)) sBtn.focus();
      };
      sBtn.addEventListener('click', function (e) { e.stopPropagation(); setSearch(sPanel.classList.contains('is-hidden')); });
      sPanel.querySelector('[data-mh-search-close]').addEventListener('click', function () { setSearch(false); });
      document.addEventListener('click', function (e) { if (!sPanel.classList.contains('is-hidden') && !sPanel.contains(e.target)) setSearch(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sPanel.classList.contains('is-hidden')) setSearch(false); });
    }

    // Destinations / Tour Packages dropdowns: hover on desktop, tap or keyboard elsewhere
    var dds = Array.prototype.slice.call(h.querySelectorAll('[data-mh-dd]'));
    var setDd = function (item, open) {
      item.classList.toggle('open', open);
      item.querySelector('.mh-link').setAttribute('aria-expanded', open);
    };
    var closeAll = function (except) { dds.forEach(function (d) { if (d !== except) setDd(d, false); }); };
    var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
    dds.forEach(function (item) {
      var timer;
      item.addEventListener('mouseenter', function () { clearTimeout(timer); closeAll(item); setDd(item, true); });
      item.addEventListener('mouseleave', function () { timer = setTimeout(function () { setDd(item, false); }, 120); });
      item.addEventListener('focusin', function () { closeAll(item); setDd(item, true); });
      item.addEventListener('focusout', function (e) { if (!item.contains(e.relatedTarget)) setDd(item, false); });
      // on touch screens the first tap opens the menu instead of following the link
      item.querySelector('.mh-link').addEventListener('click', function (e) {
        if (!canHover && !item.classList.contains('open')) { e.preventDefault(); closeAll(item); setDd(item, true); }
      });
    });
    document.addEventListener('click', function (e) { dds.forEach(function (d) { if (!d.contains(e.target)) setDd(d, false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeAll(); langMenu.classList.add('is-hidden'); } });
  });
  // (13 Nov 2026, client) the prices in another currency. Every price on the page ("USD 1,650", "From USD 510",
  // "$85 - $100", "USD 1,650 – 1,950") is marked once and shown in the visitor's currency at today's rate (/api/rates,
  // fetched by the server once or twice a day). The choice is kept for the next pages. The price itself stays in USD.
  document.addEventListener('DOMContentLoaded', function () {
    var sel = document.querySelector('[data-mh-cur]'), frame = document.getElementById('mk-frame');
    if (!sel || !frame) return;
    var code = document.querySelector('[data-mh-cur-code]'), note = document.querySelector('[data-cur-note]'), noteName = document.querySelector('[data-cur-name]');
    var KEY = 'mk-cur', cur = 'USD', rates = { USD: 1 };
    try { cur = localStorage.getItem(KEY) || 'USD'; } catch (e) { /* private window */ }
    if (![].some.call(sel.options, function (o) { return o.value === cur; })) cur = 'USD';
    sel.value = cur; if (code) code.textContent = cur;
    // "USD 1,650 – 1,950", "US$ 90-100", "$85 - $100", "USD 510" (the second number may come without its currency)
    var RE = /(USD|US\$|\$)\s?(\d[\d,]*)(?:(\s?[–-]\s?)(USD\s?|US\$\s?|\$\s?)?(\d[\d,]*))?/g;
    var SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|OPTION|CODE|NOSCRIPT)$/;
    // the price's own text is changed in place, so every price keeps its own look (colour, size, weight) exactly; the
    // English text of each is kept to go back to US dollars. Google Translate is told to leave the prices alone
    // (translate="no"): it would rewrite them ("510 USD") into new text that a later change of currency no longer reaches.
    // A price inside a sentence ("Tour Cost USD 2190 per pax") gets a bare inline holder that only inherits the text's look.
    var nodes = [], seen = new WeakSet();
    var keep = function (el) { el.setAttribute('translate', 'no'); el.classList.add('notranslate'); };
    var track = function (n) {
      var p = n.parentNode, text = n.nodeValue;
      seen.add(n);
      // the element holds nothing but the price: it is kept as it is (only told not to be translated)
      if (p.textContent.trim() === text.trim() && !text.replace(RE, '').replace(/[\s+*.,:;()\/–-]/g, '')) { keep(p); nodes.push({ n: n, orig: text }); return; }
      var frag = document.createDocumentFragment(), at = 0, m;
      RE.lastIndex = 0;
      while ((m = RE.exec(text))) {
        if (m.index > at) frag.appendChild(document.createTextNode(text.slice(at, m.index)));
        var w = document.createElement('mk-px'); keep(w);
        w.style.cssText = 'display:inline;margin:0;padding:0;border:0;background:none;font:inherit !important;font-family:inherit !important;color:inherit;letter-spacing:inherit;text-transform:inherit;text-decoration:inherit;white-space:inherit';
        var t = document.createTextNode(m[0]); seen.add(t); w.appendChild(t); frag.appendChild(w);
        nodes.push({ n: t, orig: m[0] }); at = m.index + m[0].length;
      }
      if (at < text.length) frag.appendChild(document.createTextNode(text.slice(at)));
      p.replaceChild(frag, n);
    };
    var mark = function (root) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
        var p = n.parentNode;
        if (seen.has(n) || !p || SKIP.test(p.nodeName) || p.closest('[data-no-cur],.mh-cur,.sf-cur-note,.mk-adminbar')) return NodeFilter.FILTER_REJECT;
        RE.lastIndex = 0; return RE.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      } });
      var list = []; while (walker.nextNode()) list.push(walker.currentNode);
      list.forEach(track);
      // a price written in two parts, the code and the number apart ("<span>USD</span><b>170</b>")
      var w2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
        var p = n.parentNode;
        return !seen.has(n) && p && !p.closest('[data-no-cur],.mh-cur,.sf-cur-note,.mk-adminbar') && /^\s*(USD|US\$|\$)\s*$/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      } });
      var pairs = []; while (w2.nextNode()) pairs.push(w2.currentNode);
      pairs.forEach(function (n) {
        var el = n.parentNode.childNodes.length === 1 ? n.parentNode : null, nx = el ? el.nextSibling : n.nextSibling;
        while (nx && nx.nodeType === 3 && !nx.nodeValue.trim()) nx = nx.nextSibling;
        if (!nx || nx.nodeType !== 1 || nx.childNodes.length !== 1 || nx.firstChild.nodeType !== 3 || !/^\s*\d[\d,]*\s*$/.test(nx.firstChild.nodeValue)) return;
        var t = nx.firstChild; seen.add(n); seen.add(t); keep(n.parentNode); keep(nx);
        nodes.push({ n: n, orig: n.nodeValue, code: true }, { n: t, orig: t.nodeValue, num: true });
      });
    };
    var num = function (s) { return +String(s).replace(/,/g, ''); };
    // big amounts rounded to a sensible step, so a converted price does not look exact to the unit
    var round = function (v) { var a = Math.abs(v), step = a >= 100000 ? 1000 : a >= 10000 ? 100 : a >= 1000 ? 10 : 1; return Math.round(v / step) * step; };
    // written like the site's own: "USD 510" → "EUR 461"; a price with the $ sign ("$85") gets the currency's sign ("€77")
    var nf = new Intl.NumberFormat('en', { maximumFractionDigits: 0 }), sym = {};
    var sign = function () {
      if (!(cur in sym)) { try { sym[cur] = new Intl.NumberFormat('en', { style: 'currency', currency: cur, currencyDisplay: 'narrowSymbol' }).formatToParts(1).filter(function (p) { return p.type === 'currency'; })[0].value; } catch (e) { sym[cur] = cur; } }
      return sym[cur];
    };
    var pre = function (tag) { return !tag ? '' : /^\$/.test(tag.trim()) ? sign() + (sign().length > 1 ? ' ' : '') : cur + (/\s$/.test(tag) || tag.length > 1 ? ' ' : ''); };
    var conv = function (text, r) {
      return text.replace(RE, function (all, c1, n1, sep, c2, n2) {
        var a = pre(c1 + (all.charAt(c1.length) === ' ' ? ' ' : '')) + nf.format(round(num(n1) * r));
        return n2 ? a + sep + pre(c2) + nf.format(round(num(n2) * r)) : a;
      });
    };
    var show = function () {
      var r = rates[cur], usd = cur === 'USD' || !r;
      nodes = nodes.filter(function (x) { return x.n.isConnected; });
      nodes.forEach(function (x) {
        var t = usd ? x.orig : x.code ? x.orig.replace(/\S+/, /\$/.test(x.orig) && !/US/.test(x.orig) ? sign() : cur) : x.num ? x.orig.replace(/\d[\d,]*/, function (v) { return nf.format(round(num(v) * r)); }) : conv(x.orig, r);
        if (x.n.nodeValue !== t) x.n.nodeValue = t;
      });
      if (code) code.textContent = cur;
      document.querySelectorAll('[data-mh-cur-pick]').forEach(function (b) { b.classList.toggle('on', b.dataset.mhCurPick === cur); b.setAttribute('aria-pressed', b.dataset.mhCurPick === cur); });
      if (note) { note.hidden = usd; if (noteName) noteName.textContent = cur; }
    };
    mark(frame); show();
    var loaded = false, load = function () {
      if (loaded) return Promise.resolve(); loaded = true;
      return fetch('/api/rates').then(function (r) { return r.json(); }).then(function (j) { if (j && j.rates) rates = j.rates; }).catch(function () {});
    };
    if (cur !== 'USD') load().then(show);
    sel.addEventListener('change', function () {
      cur = sel.value; try { localStorage.setItem(KEY, cur); } catch (e) {}
      load().then(show);
    });
    // prices that come later (the tour finder, "Load more", filters): marked and shown as soon as they appear
    var busy = false;
    new MutationObserver(function (list) {
      if (busy) return;
      var added = list.some(function (x) { return x.addedNodes.length > 0; });
      if (!added) return;
      busy = true; setTimeout(function () { try { mark(frame); show(); } finally { busy = false; } }, 30);
    }).observe(frame, { childList: true, subtree: true });
  });
})();
