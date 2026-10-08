(function () {
  // Category bar on tour-list pages: arrows, "All categories" panel, and the current category highlighted.
  var nav = $('[data-tl-chips]'); if (!nav) return;
  var track = $('[data-tl-track]', nav), prev = $('[data-tl-prev]', nav), next = $('[data-tl-next]', nav);
  var allBtn = $('[data-tl-all]', nav), panel = $('[data-tl-panel]', nav), chips = $$('[data-tl-chip]', nav);

  function edges() {
    var max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
    nav.classList.toggle('fade-l', track.scrollLeft > 2);
    nav.classList.toggle('fade-r', track.scrollLeft < max - 2);
  }
  prev.addEventListener('click', function () { track.scrollBy({ left: -track.clientWidth * 0.7, behavior: 'smooth' }); });
  next.addEventListener('click', function () { track.scrollBy({ left: track.clientWidth * 0.7, behavior: 'smooth' }); });
  track.addEventListener('scroll', edges, { passive: true });
  window.addEventListener('resize', edges);
  edges();

  function setPanel(open) { panel.classList.toggle('is-hidden', !open); allBtn.setAttribute('aria-expanded', open); }
  allBtn.addEventListener('click', function (e) { e.stopPropagation(); setPanel(panel.classList.contains('is-hidden')); });
  $$('a', panel).forEach(function (a) { a.addEventListener('click', function () { setPanel(false); }); });
  document.addEventListener('click', function (e) { if (!nav.contains(e.target)) setPanel(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setPanel(false); });

  // highlight the category being read, and keep its chip in view
  if (!('IntersectionObserver' in window)) return;
  var groups = chips.map(function (c) { return document.getElementById(c.dataset.tlChip); }).filter(Boolean);
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      chips.forEach(function (c) {
        var on = c.dataset.tlChip === en.target.id;
        c.classList.toggle('on', on);
        if (on) track.scrollTo({ left: c.offsetLeft - track.clientWidth / 2 + c.offsetWidth / 2, behavior: 'smooth' });
      });
    });
  }, { rootMargin: '-180px 0px -60% 0px' });
  groups.forEach(function (g) { io.observe(g); });
})();

(function () {
  // ?nights=8-10 and ?q=kerala (from the home page) filter the tours on this list
  var p = new URLSearchParams(location.search), range = p.get('nights'), q = (p.get('q') || '').trim().toLowerCase();
  if (!range && !q) return;
  var lo = 0, hi = 999;
  if (range) { var m = range.match(/^(\d+)-(\d+)$/); if (m) { lo = +m[1]; hi = +m[2]; } }
  var cards = $$('.tc'), shown = 0;
  cards.forEach(function (c) {
    var n = +c.dataset.nights, ok = true;
    if (range) ok = n >= lo && n <= hi;
    if (ok && q) ok = q.split(/\s+/).every(function (w) { return c.dataset.search.indexOf(w) > -1; });
    c.style.display = ok ? '' : 'none';
    if (ok) shown++;
  });
  // hide categories with no matching tour, and the category bar (its counts no longer apply)
  $$('.tl-group').forEach(function (g) { g.style.display = $$('.tc', g).some(function (c) { return c.style.display !== 'none'; }) ? '' : 'none'; });
  var bar = $('[data-tl-chips]'); if (bar) bar.style.display = 'none';
  var box = $('[data-tl-filter]');
  var what = [];
  if (range) what.push(hi >= 99 ? lo + '+ nights' : (lo === 0 ? 'up to ' + hi : lo + '–' + hi) + ' nights');
  if (q) what.push('“' + p.get('q') + '”');
  box.querySelector('[data-tl-filter-t]').textContent = shown + ' tour' + (shown === 1 ? '' : 's') + ' · ' + what.join(' · ') + (shown ? '' : ' — try a different search');
  box.classList.remove('is-hidden');
  document.getElementById('tour-options').scrollIntoView();
})();

// Tour-list intro: long text opens with "Read more"
(function () {
  var box = $('[data-tl3]'), btn = $('[data-tl3-more]'); if (!box || !btn) return;
  btn.addEventListener('click', function () {
    var open = box.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    btn.firstChild.nodeValue = open ? 'Show less ' : 'Read more ';
    if (!open) box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
})();
