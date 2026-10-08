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

  // Site header (every page): mobile menu, language picker, shadow once scrolled
  document.addEventListener('DOMContentLoaded', function () {
    var h = document.getElementById('site-header');
    if (!h) return;
    var burger = h.querySelector('[data-mh-burger]'), drawer = h.querySelector('[data-mh-drawer]');
    var langBtn = h.querySelector('[data-mh-lang]'), langMenu = h.querySelector('[data-mh-lang-menu]'), langCur = h.querySelector('[data-mh-lang-cur]');
    var setMenu = function (open) { drawer.classList.toggle('is-hidden', !open); burger.setAttribute('aria-expanded', open); h.classList.toggle('menu-open', open); };
    burger.addEventListener('click', function () { setMenu(drawer.classList.contains('is-hidden')); });
    Array.prototype.forEach.call(drawer.querySelectorAll('a'), function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1100) setMenu(false); });
    langBtn.addEventListener('click', function (e) { e.stopPropagation(); var open = langMenu.classList.toggle('is-hidden') === false; langBtn.setAttribute('aria-expanded', open); });
    Array.prototype.forEach.call(langMenu.querySelectorAll('[data-mh-lang-pick]'), function (b) {
      b.addEventListener('click', function () { langCur.textContent = b.dataset.mhLangPick; langMenu.classList.add('is-hidden'); langBtn.setAttribute('aria-expanded', false); });
    });
    document.addEventListener('click', function (e) { if (!langMenu.contains(e.target)) { langMenu.classList.add('is-hidden'); langBtn.setAttribute('aria-expanded', false); } });
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
