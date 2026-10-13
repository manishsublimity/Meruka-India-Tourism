// Tour-list pages: category cards open and close to show their tours; the filters on the right
// (search, price, region, interest, length) narrow the tours. ?nights=8-10 and ?q=kerala (links from
// the home page) preset the filters.
(function () {
  var root = document.querySelector('.tp2'); if (!root) return;
  var $$ = function (s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); };
  var groups = $$('[data-tp2-group]'), form = root.querySelector('[data-tp2-form]');
  var none = root.querySelector('[data-tp2-none]'), count = root.querySelector('[data-tp2-count]'), fcount = root.querySelector('[data-tp2-fcount]');
  var total = $$('[data-tp2-row]').length;

  function setOpen(g, open) {
    g.classList.toggle('open', open);
    var b = g.querySelector('.tp2-chev'); if (b) b.setAttribute('aria-expanded', open);
  }
  groups.forEach(function (g) {
    g.querySelector('[data-tp2-toggle]').addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      setOpen(g, !g.classList.contains('open'));
    });
  });

  var inRange = function (v, r) { if (!r) return true; var p = r.split('-'); v = +v; return v > 0 && v >= +p[0] && v <= +p[1]; };
  function values(name) { return $$('input[name="' + name + '"]:checked', form).map(function (i) { return i.value; }); }

  function apply(fromUser) {
    var q = (form.elements.q.value || '').trim().toLowerCase();
    var price = (values('price')[0] || ''), nights = (values('nights')[0] || '');
    var regions = values('region'), interests = values('interest');
    var active = !!(q || price || nights || regions.length || interests.length), shown = 0;
    groups.forEach(function (g, gi) {
      var n = 0;
      $$('[data-tp2-row]', g).forEach(function (r) {
        var d = r.dataset, ok = inRange(d.price, price) && inRange(d.nights, nights);
        if (ok && regions.length) ok = regions.some(function (x) { return (' ' + d.region + ' ').indexOf(' ' + x + ' ') > -1; });
        if (ok && interests.length) ok = interests.some(function (x) { return (' ' + d.interest + ' ').indexOf(' ' + x + ' ') > -1; });
        if (ok && q) ok = q.split(/\s+/).every(function (w) { return d.search.indexOf(w) > -1; });
        r.hidden = !ok; if (ok) n++;
      });
      g.hidden = !n; shown += n;
      var nEl = g.querySelector('[data-tp2-n]'); if (nEl) nEl.textContent = n;
      if (active && n && fromUser !== 'toggle') setOpen(g, true);
      if (!active && fromUser) setOpen(g, gi === 0);
    });
    none.classList.toggle('is-hidden', shown > 0);
    if (count) { count.textContent = 'Showing ' + shown + ' of ' + total + ' tours'; count.classList.toggle('is-hidden', !active || !shown); }
    var k = (q ? 1 : 0) + (price ? 1 : 0) + (nights ? 1 : 0) + regions.length + interests.length;
    if (fcount) fcount.textContent = k ? '(' + k + ')' : '';
  }

  form.addEventListener('change', function () { apply(true); });
  form.elements.q.addEventListener('input', function () { apply(true); });
  $$('[data-tp2-clear]').forEach(function (b) {
    b.addEventListener('click', function () {
      form.reset();
      $$('input[type="radio"]', form).forEach(function (i) { i.checked = i.value === ''; });
      apply(true);
    });
  });

  // presets from the address (home page links)
  var p = new URLSearchParams(location.search), qp = (p.get('q') || '').trim(), np = p.get('nights');
  if (qp) form.elements.q.value = qp;
  if (np) {
    var lo = +np.split('-')[0], hi = +np.split('-')[1];
    var pick = $$('input[name="nights"]', form).filter(function (i) { if (!i.value) return false; var r = i.value.split('-'); return +r[0] <= hi && +r[1] >= lo; })[0];
    if (pick) pick.checked = true;
  }
  if (qp || np) apply(true);

  // phones: the filters start folded under a "Filters" bar
  var det = root.querySelector('[data-tp2-details]');
  if (det && window.matchMedia('(max-width: 1199.98px)').matches && !(qp || np)) det.removeAttribute('open');
})();
