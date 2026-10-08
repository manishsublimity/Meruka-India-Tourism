// Tour detail: hotel-category price selector
(function () {
  $$('[data-pricing]').forEach(function (card) {
    var tiers = $$('.pr-tier', card), cta = $('[data-cta]', card);
    function pick(t) {
      tiers.forEach(function (x) { var on = x === t; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
      var n = +t.dataset.stars, stars = $('[data-stars]', card);
      stars.innerHTML = '★'.repeat(n) + '<span>' + '★'.repeat(Math.max(0, 5 - n)) + '</span>';
      stars.classList.toggle('is-hidden', !n);
      $('[data-price]', card).textContent = t.dataset.range;
      $('[data-unit]', card).textContent = t.dataset.unit;
      // "Available on request" style tiers have no price range to plot
      $('[data-bar]', card).classList.toggle('is-hidden', t.dataset.priced !== 'true');
      var f = $('[data-fill]', card); f.style.left = t.dataset.left + '%'; f.style.width = t.dataset.width + '%';
      var base = cta.dataset.base, q = (base.indexOf('?') > -1 ? '&' : '?') + 'hotel=' + encodeURIComponent(t.dataset.label);
      cta.href = base.replace(/(#|$)/, q + '$1');
    }
    tiers.forEach(function (t) { t.addEventListener('click', function () { pick(t); }); });
    // Arrow keys move between tiers, like a radio group
    card.addEventListener('keydown', function (e) {
      var i = tiers.indexOf(document.activeElement); if (i < 0) return;
      var dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!dir) return; e.preventDefault();
      var t = tiers[(i + dir + tiers.length) % tiers.length]; t.focus(); pick(t);
    });
  });
})();

// Tour page v5: "Expand all" opens / closes every day of the itinerary
(function () {
  var btn = $('[data-tp-expand]'); if (!btn) return;
  var days = $$('.tp-day');
  function sync() { var all = days.every(function (d) { return d.open; }); btn.textContent = all ? 'Collapse all' : 'Expand all'; btn.setAttribute('aria-pressed', all); }
  btn.addEventListener('click', function () { var open = !days.every(function (d) { return d.open; }); days.forEach(function (d) { d.open = open; }); sync(); });
  days.forEach(function (d) { d.addEventListener('toggle', sync); });
})();
