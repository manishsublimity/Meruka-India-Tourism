(function () {
  // Inner pages: sections and cards fade up as they scroll into view — the same .rv / .in
  // reveal the home-4 page uses (styles in site.css)
  var frame = document.querySelector('#mk-frame.ux.in4'); if (!frame || !('IntersectionObserver' in window)) return;
  var els = [].slice.call(frame.querySelectorAll([
    '.az-head', '.az-row > *', '.az-split > *', '.az-list li', '.az-cta',
    '.af-card', '.ar-body', '.tl3-grid > *', '.tl-group-head', '.tc',
    '.ct-aside', '.ct-card', '.ct-off-head', '.off-grid',
    '.tm-bar', '.ls-card', '.h8-stats-in > div'
  ].join(',')));
  // anything already on screen shows at once (no flash on load)
  var vh = window.innerHeight;
  els = els.filter(function (el) { return el.getBoundingClientRect().top > vh * .92; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el) { el.classList.add('rv'); io.observe(el); });
})();
