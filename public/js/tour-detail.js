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

// Tour page v2: each day shows four lines; "Read more" opens the rest
(function () {
  $$('[data-td2-more]').forEach(function (box) {
    var btn = box.parentNode.querySelector('[data-td2-rm]'); if (!btn) return;
    if (box.scrollHeight <= box.clientHeight + 4) { box.classList.add('td2-all'); return; }
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var open = box.classList.toggle('td2-open');
      btn.setAttribute('aria-expanded', open);
      btn.innerHTML = open ? 'Show less <span aria-hidden="true">↑</span>' : 'Read more <span aria-hidden="true">↓</span>';
    });
  });
})();

// Tour page v2: a long route shows its first stops; "Show all" opens the rest
(function () {
  $$('[data-td2-route]').forEach(function (box) {
    var btn = box.querySelector('[data-td2-route-all]'); if (!btn) return;
    var label = btn.innerHTML;
    btn.addEventListener('click', function () {
      var open = box.classList.toggle('td2-route-open');
      btn.setAttribute('aria-expanded', open);
      btn.innerHTML = open ? 'Show fewer stops <span aria-hidden="true">↑</span>' : label;
    });
  });
})();

// Tour page v3: day groups as tabs, each day opens with "View Details", "View Complete Itinerary" opens all
(function () {
  var root = document.querySelector('[data-td3]'); if (!root) return;
  var tabs = $$('[data-td3-tab]', root), groups = $$('[data-td3-group]', root), allBtn = root.querySelector('[data-td3-all]');
  function show(i) {
    tabs.forEach(function (t, k) { t.classList.toggle('on', k === i); t.setAttribute('aria-selected', k === i); });
    groups.forEach(function (g, k) { g.classList.toggle('on', k === i); });
  }
  tabs.forEach(function (t, k) { t.addEventListener('click', function () { show(k); }); });
  function openDay(li, open) {
    var full = li.querySelector('.td3-dfull'), b = li.querySelector('[data-td3-more]');
    full.hidden = !open; li.classList.toggle('open', open);
    b.setAttribute('aria-expanded', open);
    b.innerHTML = open ? 'Hide Details <span aria-hidden="true">↑</span>' : 'View Details <span aria-hidden="true">→</span>';
  }
  $$('[data-td3-day]', root).forEach(function (li) {
    li.querySelector('[data-td3-more]').addEventListener('click', function () { openDay(li, li.querySelector('.td3-dfull').hidden); });
  });
  if (allBtn) allBtn.addEventListener('click', function () {
    var on = root.classList.toggle('td3-showall');
    allBtn.setAttribute('aria-pressed', on);
    allBtn.innerHTML = on ? 'Show Less <span aria-hidden="true">↑</span>' : 'View Complete Itinerary <span aria-hidden="true">→</span>';
    $$('[data-td3-day]', root).forEach(function (li) { openDay(li, on); });
    if (!on) root.scrollIntoView({ block: 'start' });
  });
})();
