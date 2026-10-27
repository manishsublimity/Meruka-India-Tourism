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
    var syncScrim = function () { var any = !drawer.classList.contains('is-hidden') || !langMenu.classList.contains('is-hidden'); if (scrim) scrim.hidden = !any; document.documentElement.classList.toggle('mh-lock', any && window.innerWidth < 1100); };
    var setLang = function (open) { langMenu.classList.toggle('is-hidden', !open); langBtn.setAttribute('aria-expanded', open); syncScrim(); };
    var setMenu = function (open) { if (open) setLang(false); drawer.classList.toggle('is-hidden', !open); burger.setAttribute('aria-expanded', open); h.classList.toggle('menu-open', open); syncScrim(); };
    burger.addEventListener('click', function (e) { e.stopPropagation(); setMenu(drawer.classList.contains('is-hidden')); });
    var mx = h.querySelector('[data-mh-close]'); if (mx) mx.addEventListener('click', function () { setMenu(false); });
    var lx = h.querySelector('[data-mh-lang-close]'); if (lx) lx.addEventListener('click', function (e) { e.stopPropagation(); setLang(false); });
    if (scrim) scrim.addEventListener('click', function () { setMenu(false); setLang(false); });
    document.addEventListener('click', function (e) { if (!drawer.classList.contains('is-hidden') && !drawer.contains(e.target) && !burger.contains(e.target)) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); setLang(false); } });
    Array.prototype.forEach.call(drawer.querySelectorAll('a'), function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1100) setMenu(false); });
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
})();
