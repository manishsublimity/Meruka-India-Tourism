(function () {
  // Testimonials: filter by tour group, search, "Show more", and "Read more" on long quotes.
  var cards = $$('.tm-card'), chips = $$('.tm-chip'), input = $('#tm-q');
  // (16 Oct 2026) nine reviews to start (three rows), then 18 more per click
  var FIRST = window.matchMedia('(max-width: 767.98px)').matches ? 4 : 9, PAGE = 18, limit = FIRST, group = '', q = '', more = true;   // phones: four to start

  function render() {
    var matches = cards.filter(function (c) {
      var inGroup = !group || (' ' + c.dataset.g + ' ').indexOf(' ' + group + ' ') > -1;
      return inGroup && (!q || c.dataset.search.indexOf(q) > -1);
    });
    cards.forEach(function (c) { c.classList.add('is-hidden'); });
    matches.slice(0, limit).forEach(function (c) { c.classList.remove('is-hidden'); });
    if ($('#tm-shown')) $('#tm-shown').textContent = Math.min(limit, matches.length);   // (no "Showing 9 of 72" line since 16 Oct 2026)
    if ($('#tm-total')) $('#tm-total').textContent = matches.length;
    $('#tm-load').classList.toggle('is-hidden', matches.length <= limit);
    more = matches.length > limit;
    $('#tm-empty').classList.toggle('is-hidden', matches.length > 0);
    checkMore();
  }
  chips.forEach(function (b) {
    b.addEventListener('click', function () {
      group = b.dataset.g; limit = FIRST;
      chips.forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
      render();
    });
  });
  if (input) input.addEventListener('input', function () { q = input.value.trim().toLowerCase(); limit = FIRST; render(); });   // (no search box since 16 Oct 2026)
  $('#tm-load').addEventListener('click', function () { limit += PAGE; render(); });
  $('#tm-reset').addEventListener('click', function () {
    q = ''; if (input) input.value = ''; group = ''; limit = FIRST;
    chips.forEach(function (x, i) { x.classList.toggle('on', i === 0); x.setAttribute('aria-pressed', i === 0); });
    render();
  });

  if (FIRST !== 9) render();   // phones start with fewer than the page shows

  // "Read more" only where the quote is actually cut off
  function checkMore() {
    cards.forEach(function (c) {
      if (c.classList.contains('is-hidden') || c.classList.contains('open')) return;
      var qEl = $('.tm-quote', c);
      $('.tm-more', c).hidden = qEl.scrollHeight <= qEl.clientHeight + 2;
    });
  }
  cards.forEach(function (c) {
    var b = $('.tm-more', c);
    b.addEventListener('click', function () {
      var open = c.classList.toggle('open');
      b.setAttribute('aria-expanded', open);
      b.textContent = open ? 'Show less' : 'Read more';
    });
  });
  window.addEventListener('resize', checkMore);
  render();

  // (16 Oct 2026) the rest load by themselves as the visitor scrolls near the end of the list (the button stays as a fallback)
  if ('IntersectionObserver' in window) {
    var foot = $('.tm-foot');
    foot.classList.add('tm-auto');
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting && more) { limit += PAGE; render(); }
    }, { rootMargin: '0px 0px 400px 0px' }).observe(foot);
  }
})();
