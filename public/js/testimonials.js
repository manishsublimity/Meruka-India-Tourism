(function () {
  // Guest Reviews (23 Oct 2026, client's reference reviews-4): six cards to start, six more per "View more reviews";
  // a review longer than six lines shows "… View more" on its sixth line (one short seventh line is shown in full instead)
  var grid = $('#rv4-grid'); if (!grid) return;
  var cards = $$('.rv4-card', grid), loadBtn = $('#rv4-load'), PAGE = 6;

  function fit(c) {
    if (c.hidden || c.classList.contains('open')) return;
    var tw = $('.rv4-tw', c), tx = $('.rv4-tx', c), btn = $('.rv4-vm', c);
    tw.classList.remove('full');
    tx.style.display = 'block';   // measure the whole text without the six-line cut
    var rg = document.createRange(); rg.selectNodeContents(tx);
    var lines = [].filter.call(rg.getClientRects(), function (r) { return r.width > 1; }), over = lines.length > 6;
    if (lines.length === 7 && lines[6].width < tx.clientWidth * 0.4) { tw.classList.add('full'); over = false; }
    tx.style.display = '';
    btn.hidden = !over;
  }
  function fitAll() { cards.forEach(fit); }

  cards.forEach(function (c) {
    var btn = $('.rv4-vm', c);
    btn.addEventListener('click', function () {
      // the card beside it in the row keeps its height (no empty stretched card next to an opened review)
      cards.forEach(function (o) {
        if (o === c || o.hidden || o.offsetTop !== c.offsetTop) return;
        if (!c.classList.contains('open')) { o.style.height = o.offsetHeight + 'px'; o.style.alignSelf = 'start'; }
        else if (!o.classList.contains('open')) { o.style.height = ''; o.style.alignSelf = ''; }
      });
      var open = c.classList.toggle('open');
      btn.textContent = open ? 'View less' : '… View more';
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  // (23 Oct 2026, client) the button always shows: "View more reviews" until every review is open, then "Show fewer
  // reviews" (back to the first six)
  if (loadBtn) loadBtn.addEventListener('click', function () {
    if (!cards.some(function (c) { return c.hidden; })) {
      cards.forEach(function (c, i) { c.hidden = i >= PAGE; });
      loadBtn.textContent = 'View more reviews';
      grid.scrollIntoView({ block: 'start' });
      return;
    }
    var next = cards.filter(function (c) { return c.hidden; }).slice(0, PAGE);
    next.forEach(function (c) { c.hidden = false; });
    fitAll();
    // keyboard users land on the first new review
    if (next[0]) { next[0].setAttribute('tabindex', '-1'); next[0].focus({ preventScroll: true }); }
    if (!cards.some(function (c) { return c.hidden; })) loadBtn.textContent = 'Show fewer reviews';
  });

  window.addEventListener('resize', fitAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  // (23 Oct 2026) the reviews' handwriting font may arrive after the page: count the lines again once it is there
  if (document.fonts && document.fonts.load) document.fonts.load("15.5px 'Shantell Sans'").then(fitAll);
  fitAll();
})();
