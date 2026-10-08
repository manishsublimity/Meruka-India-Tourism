(function () {
  // Testimonials: filter by tour group, search, "Show more", and "Read more" on long quotes.
  var cards = $$('.tm-card'), chips = $$('.tm-chip'), input = $('#tm-q');
  var PAGE = 18, limit = PAGE, group = '', q = '';

  function render() {
    var matches = cards.filter(function (c) {
      var inGroup = !group || (' ' + c.dataset.g + ' ').indexOf(' ' + group + ' ') > -1;
      return inGroup && (!q || c.dataset.search.indexOf(q) > -1);
    });
    cards.forEach(function (c) { c.classList.add('is-hidden'); });
    matches.slice(0, limit).forEach(function (c) { c.classList.remove('is-hidden'); });
    $('#tm-shown').textContent = Math.min(limit, matches.length);
    $('#tm-total').textContent = matches.length;
    $('#tm-load').classList.toggle('is-hidden', matches.length <= limit);
    $('#tm-empty').classList.toggle('is-hidden', matches.length > 0);
    checkMore();
  }
  chips.forEach(function (b) {
    b.addEventListener('click', function () {
      group = b.dataset.g; limit = PAGE;
      chips.forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
      render();
    });
  });
  input.addEventListener('input', function () { q = input.value.trim().toLowerCase(); limit = PAGE; render(); });
  $('#tm-load').addEventListener('click', function () { limit += PAGE; render(); });
  $('#tm-reset').addEventListener('click', function () {
    q = ''; input.value = ''; group = ''; limit = PAGE;
    chips.forEach(function (x, i) { x.classList.toggle('on', i === 0); x.setAttribute('aria-pressed', i === 0); });
    render();
  });

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
})();
