(function () {
  var isWide = function () { return window.innerWidth >= 1100; };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  // Enquiry form
  var form = $('#enquiry-form'), err = $('#err'), interests = [];
  $$('.num', form).forEach(function (i) { i.addEventListener('input', function () { i.value = i.value.replace(/[^0-9]/g, ''); }); });
  $$('.chip', form).forEach(function (c) {
    c.addEventListener('click', function () {
      var v = c.dataset.val, on = interests.indexOf(v) < 0;
      interests = on ? interests.concat(v) : interests.filter(function (x) { return x !== v; });
      setOn(c, on);
      c.textContent = on ? '✓ ' + v : v;
    });
  });
  form.addEventListener('input', function () { err.classList.add('is-hidden'); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var data = {
      source: 'contact', month: f.month.value, year: f.year.value, days: f.days.value, people: f.people.value,
      interests: interests, hotel: f.hotel.value, tour: f.tour.value, dest: f.dest.value, name: f.name.value, email: f.email.value
    };
    postEnquiry(data).then(function (r) {
      if (!r.ok) { err.textContent = r.error; err.classList.remove('is-hidden'); return; }
      $('#first-name').textContent = r.firstName || '';
      form.classList.add('is-hidden');
      $('#sent').classList.remove('is-hidden');
    });
  });
  $('#reset').addEventListener('click', function () {
    var name = form.elements.name.value, email = form.elements.email.value;
    form.reset();
    form.elements.name.value = name; form.elements.email.value = email;
    interests = [];
    $$('.chip', form).forEach(function (c) { setOn(c, false); c.textContent = c.dataset.val; });
    $('#sent').classList.add('is-hidden');
    form.classList.remove('is-hidden');
  });

  // Pre-fill the tour when arriving from a tour page (?tour=...)
  var params = new URLSearchParams(location.search), wanted = params.get('tour');
  if (params.get('hotel')) form.elements.hotel.value = params.get('hotel') + ' hotels';
  if (wanted) {
    var opt = Array.prototype.find.call(form.elements.tour.options, function (o) { return o.value === wanted; });
    if (opt) form.elements.tour.value = wanted;
    else form.elements.dest.value = wanted;
  }

  // Offices
  var office = 0, rows = $$('.off-row');
  function renderOffice() {
    var shown = office < 0 ? (isWide() ? 0 : -1) : office;
    rows.forEach(function (r, i) {
      var on = i === office;
      r.setAttribute('aria-selected', on ? 'true' : 'false');
      setOn(r, on); setOn($('.off-num', r), on); setOn($('.off-arrow', r), on);
    });
    $$('.off-detail').forEach(function (d) { d.classList.toggle('is-hidden', +d.dataset.office !== shown); });
  }
  rows.forEach(function (r) {
    r.addEventListener('click', function () {
      var i = +r.dataset.office;
      office = (!isWide() && office === i) ? -1 : i;
      renderOffice();
    });
  });
  window.addEventListener('resize', renderOffice);

  // Copy buttons
  $$('.copy').forEach(function (b) {
    b.addEventListener('click', function () {
      copyText(b.dataset.copy, function () {
        setOn(b, true); b.textContent = 'Copied ✓';
        clearTimeout(b._t);
        b._t = setTimeout(function () { setOn(b, false); b.textContent = b.dataset.label; }, 1800);
      });
    });
  });

  // Travel guide: tabs + search
  if (!$('#g-tiles')) return;              // the guide is not shown on this page
  var guide = window.GUIDE || [], gTab = 0, gq = '';
  var tabs = $$('.g-tab'), input = $('#gq'), body = $('.g-body'), tiles = $('#g-tiles');
  function tile(it, num, group) {
    return '<a href="' + esc(it.href) + '" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:14px;min-height:68px;padding:14px 14px 14px 18px;background:#fff;border:1px solid #E2E8F0;border-radius:18px;color:#0B1B33;transition:all .2s ease;min-width:0" data-hover="border-color:#336699;box-shadow:0 12px 28px rgba(51,102,153,.12);transform:translateY(-2px);color:#336699">' +
      '<span style="font-family:\'Instrument Serif\',Georgia,serif;font-style:italic;font-size:22px;line-height:1;color:#C9A24A;width:28px;flex-shrink:0">' + num + '</span>' +
      '<span style="flex:1;min-width:0"><span style="display:block;font-size:15.5px;font-weight:700;letter-spacing:-.005em">' + esc(it.label) + '</span>' +
      (group ? '<span style="display:block;font-size:12.5px;color:#8A97AB;margin-top:2px">' + esc(group) + '</span>' : '') + '</span>' +
      '<span style="width:36px;height:36px;border-radius:50%;background:#F0F4FA;color:#336699;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0">↗</span></a>';
  }
  function renderGuide() {
    var q = gq.trim().toLowerCase(), searching = q.length > 0, html = '', n = 0;
    if (searching) {
      guide.forEach(function (g) { g.items.forEach(function (it) { if (it.label.toLowerCase().indexOf(q) > -1) html += tile(it, pad(++n), g.title); }); });
    } else {
      guide[gTab].items.forEach(function (it, j) { html += tile(it, pad(j + 1), ''); });
      n = guide[gTab].items.length;
    }
    tiles.innerHTML = html;
    tiles.classList.toggle('searching', searching);
    body.classList.toggle('searching', searching);
    $('#g-panel').classList.toggle('is-hidden', searching);
    $('#g-empty').classList.toggle('is-hidden', !(searching && n === 0));
    $('#g-empty-q').textContent = gq;
    $('#gq-clear').classList.toggle('is-hidden', !searching);
    tabs.forEach(function (t, i) { var on = i === gTab && !searching; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); });
    var g = guide[gTab];
    $('#g-img').src = g.img; $('#g-img').alt = g.title;
    $('#g-pos').textContent = pad(gTab + 1) + ' / ' + pad(guide.length);
    $('#g-count').textContent = g.items.length;
    $('#g-title').textContent = g.title;
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { gTab = +t.dataset.tab; gq = ''; input.value = ''; renderGuide(); }); });
  input.addEventListener('input', function () { gq = input.value; renderGuide(); });
  function clear() { gq = ''; input.value = ''; renderGuide(); }
  $('#gq-clear').addEventListener('click', clear);
  $('#g-empty-clear').addEventListener('click', clear);
})();
