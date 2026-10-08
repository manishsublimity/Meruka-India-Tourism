(function () {
  // Guest reviews "card stack": the front card is the current testimonial, the next two peek behind.
  var stack = document.querySelector('[data-rs-stack]'); if (!stack) return;
  var cards = [].slice.call(stack.querySelectorAll('[data-rs-card]'));
  var curEl = document.querySelector('[data-rs-cur]'), n = cards.length, cur = 0, timer;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pad = function (x) { return (x < 10 ? '0' : '') + x; };

  function show(i) {
    cur = (i + n) % n;
    cards.forEach(function (c, k) {
      var pos = (k - cur + n) % n;                 // 0 = front, 1 and 2 peek behind, the rest hidden
      c.dataset.pos = pos < 3 ? pos : 'x';
      c.setAttribute('aria-hidden', pos !== 0);
    });
    curEl.textContent = pad(cur + 1);
  }
  function auto() { clearInterval(timer); if (!still) timer = setInterval(function () { show(cur + 1); }, 7000); }
  document.querySelector('[data-rs-prev]').addEventListener('click', function () { show(cur - 1); auto(); });
  document.querySelector('[data-rs-next]').addEventListener('click', function () { show(cur + 1); auto(); });
  stack.addEventListener('click', function (e) {             // clicking a peeking card brings it forward
    var c = e.target.closest('[data-rs-card]');
    if (c && c.dataset.pos !== '0') { show(+c.dataset.rsCard); auto(); }
  });
  var root = stack.closest('.rs');
  root.addEventListener('mouseenter', function () { clearInterval(timer); });
  root.addEventListener('mouseleave', auto);
  root.addEventListener('focusin', function () { clearInterval(timer); });
  var x0 = null;
  stack.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  stack.addEventListener('touchend', function (e) {
    if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) { show(cur + (dx < 0 ? 1 : -1)); auto(); }
  });
  show(0); auto();
})();

(function () {
  // Page parts shared with the home page: states filter, enquiry form, FAQ; plus the category carousel arrows.
  var cloud = $('#se-cloud');
  if (cloud) {
    var btns = $$('.se-filter button'), links = $$('a', cloud);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var r = b.dataset.r;
        btns.forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
        cloud.classList.toggle('filtered', !!r);
        links.forEach(function (a) { a.classList.toggle('dim', !!r && a.dataset.r !== r); });
      });
    });
  }

  var form = $('#plan-form');
  if (form) {
    var stars = $$('.star'), star = '';
    stars.forEach(function (s) { if (/#(1E5FD6|0B2B66)/i.test(s.getAttribute('style'))) star = s.dataset.star; });
    stars.forEach(function (s) {
      s.addEventListener('click', function () { star = s.dataset.star; stars.forEach(function (x) { setOn(x, x === s); }); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, err = $('#plan-err');
      postEnquiry({
        source: 'home', name: f.name.value, email: f.email.value, country: f.country.value, date: f.date.value,
        travellers: f.travellers.value, duration: f.duration.value, hotel: star, message: f.message.value
      }).then(function (r) {
        if (!r.ok) { err.textContent = r.error; err.classList.remove('is-hidden'); return; }
        err.classList.add('is-hidden');
        form.classList.add('is-hidden');
        $('#plan-sent').classList.remove('is-hidden');
      });
    });
  }

  var faqs = $$('.faq');
  faqs.forEach(function (f) {
    $('button', f).addEventListener('click', function () {
      var wasOpen = !$('.faq-a', f).classList.contains('is-hidden');
      faqs.forEach(function (x) {
        var open = x === f && !wasOpen;
        setOn(x, open); setOn($('.faq-icon', x), open);
        $('.faq-a', x).classList.toggle('is-hidden', !open);
        $('button', x).setAttribute('aria-expanded', open);
      });
    });
  });

  // carousel arrows (tour categories)
  $$('[data-b-prev],[data-b-next]').forEach(function (b) {
    var track = document.getElementById(b.dataset.bPrev || b.dataset.bNext), dir = b.dataset.bPrev ? -1 : 1;
    b.addEventListener('click', function () { track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: 'smooth' }); });
    var edges = function () {
      var max = track.scrollWidth - track.clientWidth;
      b.disabled = dir < 0 ? track.scrollLeft <= 2 : track.scrollLeft >= max - 2;
    };
    track.addEventListener('scroll', edges, { passive: true }); window.addEventListener('resize', edges); edges();
  });
})();

(function () {
  // Tour finder: 1) India Tours category → 2) a tour in it → 3) search; the packages show below.
  var data = window.TOUR_FINDER, grid = $('#tf-grid'); if (!data || !grid) return;
  var cat = $('#tf-cat'), tour = $('#tf-tour'), q = $('#tf-q'), status = $('#tf-status'), empty = $('#tf-empty');
  var popular = grid.innerHTML, LIMIT = 9;
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var longDur = function (v) { var m = String(v || '').match(/(\d+)\s*Nights?\s*[-–]\s*(\d+)\s*Days?/i); return m ? (+m[1]) + ' Nights / ' + (+m[2]) + ' Days' : (v || ''); };
  var shortDur = function (v) { var m = String(v || '').match(/(\d+)\s*Nights?\s*[-–]\s*(\d+)\s*Days?/i); return m ? (+m[1]) + 'N / ' + (+m[2]) + 'D' : (v || ''); };
  var stops = function (r) {
    var u = String(r || '').split(/\s+[-–]\s+/).map(function (x) { return x.trim(); }).filter(function (x, i, arr) { return x && arr.indexOf(x) === i; });
    if (u.length <= 4) return u; var n = u.length - 1; return [u[0], u[Math.round(n / 3)], u[Math.round(2 * n / 3)], u[n]];
  };
  var wa = grid.dataset.wa || '';
  var WA_ICON = (grid.querySelector('.pq-wa svg, .pt-wa svg') || { outerHTML: '' }).outerHTML;
  function cardPq(t, g) {
    var href = esc(t.href || g.href);
    var all = String(t.route || '').split(/\s+[-–]\s+/).map(function (x) { return x.trim(); }).filter(function (x, i, a) { return x && a.indexOf(x) === i; });
    var m = String(t.duration || '').match(/(\d+)\s*Nights?/i), n = m ? +m[1] : 0;
    var PIN = '<svg class="pq-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
    var stopsHtml = PIN + all.map(function (x, i) { return '<span' + (i >= 3 ? ' class="pq-more-x" hidden' : '') + '>' + esc(x) + '</span>'; }).join('') +
      '<button type="button" class="pq-more" data-pq-more aria-expanded="false"' + (all.length > 3 ? '' : ' hidden') + ' data-label="+' + Math.max(all.length - 3, 0) + ' more">+' + Math.max(all.length - 3, 0) + ' more</button>';
    var price = t.from && n ? '<small>Start from</small><b>$' + (t.from * n).toLocaleString('en-US') + '</b>' : '<small>Start from</small><b class="pq-req">On request</b>';
    return '<article class="pq-card"><a href="' + href + '" class="pq-img" tabindex="-1" aria-hidden="true"><img src="' + esc(t.img) + '" alt="" loading="lazy"' + (/taj-mahal/.test(t.img) ? ' class="pq-zoom"' : '') + '>' +
      '</a>' +
      '<div class="pq-mid"><h3 class="pq-name"><a href="' + href + '">' + esc(t.name) + '</a></h3>' + (t.duration ? '<p class="pq-nd">' + esc(longDur(t.duration)) + '</p>' : '') + '<p class="pq-stops">' + stopsHtml + '</p><p class="pq-desc">' + esc(g.title) + '</p></div>' +
      '<div class="pq-cost"><div class="pq-price">' + price + '</div><div class="pq-btns"><a href="' + href + '" class="pq-view">View Itinerary</a>' +
      '<a href="' + esc(wa) + '?text=' + encodeURIComponent('Hello Meruka, I am interested in the ' + t.name + '.') + '" target="_blank" rel="noopener" class="pq-wa" aria-label="Ask on WhatsApp" title="Ask on WhatsApp">' + WA_ICON + '</a></div>' +
      '</div></article>';
  }
  function card(t, g) {
    if (grid.dataset.card === 'pq') return cardPq(t, g);
    var href = esc(t.href || g.href), st = stops(t.route);
    return '<article class="pt-card"><a href="' + href + '" class="pt-img" tabindex="-1" aria-hidden="true"><img src="' + esc(t.img) + '" alt="" loading="lazy">' +
      '<span class="pt-tag">' + esc(g.title) + '</span>' + (t.duration ? '<span class="pt-dur">' + esc(shortDur(t.duration)) + '</span>' : '') + '</a>' +
      '<div class="pt-body"><h3 class="pt-name"><a href="' + href + '">' + esc(t.name) + '</a></h3>' +
      (st.length ? '<ol class="pt-route" title="' + esc(t.route) + '">' + st.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' : '') +
      '<div class="pt-foot"><div class="pt-price">' + (t.from ? '<small>From</small><b>$' + t.from + '</b><span>per person / day</span>' : '<small>Price</small><b class="pt-req">On request</b>') + '</div>' +
      '<div class="pt-btns"><a href="' + href + '" class="pt-view">View Itinerary</a><a href="' + esc(wa) + '?text=' + encodeURIComponent('Hello Meruka, I am interested in the ' + t.name + '.') + '" target="_blank" rel="noopener" class="pt-wa" aria-label="Ask on WhatsApp" title="Ask on WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg></a></div></div></div></article>';
  }
  function render() {
    var ci = cat.value, ti = tour.value, words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (ci === '' && !words.length) {                       // nothing chosen: the popular tours
      grid.innerHTML = popular; empty.classList.add('is-hidden');
      status.textContent = 'Our 6 most popular tours';
      return;
    }
    var groups = ci === '' ? data : [data[+ci]], out = [];
    groups.forEach(function (g) {
      g.tours.forEach(function (t, k) {
        if (ci !== '' && ti !== '' && +ti !== k) return;
        var hay = (t.name + ' ' + t.route + ' ' + g.title).toLowerCase();
        if (words.every(function (w) { return hay.indexOf(w) > -1; })) out.push(card(t, g));
      });
    });
    grid.innerHTML = out.slice(0, LIMIT).join('');
    empty.classList.toggle('is-hidden', out.length > 0);
    var where = ci === '' ? 'all India tours' : data[+ci].title;
    status.innerHTML = '<b>' + out.length + '</b> package' + (out.length === 1 ? '' : 's') + ' in ' + esc(where) +
      (out.length > LIMIT ? ' — showing the first ' + LIMIT + '. <a href="/itineraries' + (words.length ? '?q=' + encodeURIComponent(q.value.trim()) : '') + '">See all →</a>' : '');
  }
  cat.addEventListener('change', function () {
    var g = data[+cat.value];
    tour.innerHTML = cat.value === '' ? '<option value="">Pick a tour category first</option>'
      : '<option value="">All ' + g.tours.length + ' tours</option>' + g.tours.map(function (t, k) { return '<option value="' + k + '">' + esc(t.name) + '</option>'; }).join('');
    tour.disabled = cat.value === '';
    render();
  });
  tour.addEventListener('change', render);
  q.addEventListener('input', render);
  function reset() { cat.value = ''; q.value = ''; cat.dispatchEvent(new Event('change')); }
  $('#tf-reset').addEventListener('click', reset);
  $('#tf-clear').addEventListener('click', reset);
})();

(function () {
  // Guest reviews: featured quote on the left, guest list on the right; auto-advances, pauses on hover/focus.
  var root = document.querySelector('[data-rw]'); if (!root) return;
  var slides = $$('.rw-slide', root), picks = $$('[data-rw-pick]', root), list = $('.rw-list', root);
  var bar = $('[data-rw-bar]', root), curEl = $('[data-rw-cur]', root), n = slides.length, cur = 0;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(i, scroll) {
    cur = (i + n) % n;
    slides.forEach(function (s, k) { var on = k === cur; s.classList.toggle('on', on); s.setAttribute('aria-hidden', !on); });
    picks.forEach(function (p, k) { var on = k === cur; p.classList.toggle('on', on); p.setAttribute('aria-selected', on); });
    curEl.textContent = (cur < 9 ? '0' : '') + (cur + 1);
    var p = picks[cur];                                        // keep the active guest visible inside the list only
    if (scroll !== false) {
      if (list.scrollHeight > list.clientHeight) list.scrollTo({ top: p.offsetTop - list.clientHeight / 2 + p.offsetHeight / 2, behavior: 'smooth' });
      else list.scrollTo({ left: p.offsetLeft - list.clientWidth / 2 + p.offsetWidth / 2, behavior: 'smooth' });
    }
    bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
  }
  if (!still) bar.addEventListener('animationend', function () { show(cur + 1); });
  picks.forEach(function (p) { p.addEventListener('click', function () { show(+p.dataset.rwPick); }); });
  $('[data-rw-prev]', root).addEventListener('click', function () { show(cur - 1); });
  $('[data-rw-next]', root).addEventListener('click', function () { show(cur + 1); });
  ['mouseenter', 'focusin'].forEach(function (e) { root.addEventListener(e, function () { root.classList.add('hold'); }); });
  ['mouseleave', 'focusout'].forEach(function (e) { root.addEventListener(e, function () { root.classList.remove('hold'); }); });
  show(0, false);
})();

(function () {
  // Tour finder stepper: step states and the quick-pick chips
  var cat = $('#tf-cat'), tour = $('#tf-tour'); if (!cat || !$('.tf2')) return;
  var step1 = cat.closest('.tf2-step'), step2 = $('[data-tf-step2]'), quick = $$('[data-tf-quick]');
  function sync() {
    step1.classList.toggle('tf2-done', cat.value !== '');
    step2.classList.toggle('tf2-locked', cat.value === '');
    step2.classList.toggle('tf2-done', tour.value !== '');
    quick.forEach(function (b) { var on = b.dataset.tfQuick === cat.value; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  }
  cat.addEventListener('change', sync); tour.addEventListener('change', sync);
  quick.forEach(function (b) {
    b.addEventListener('click', function () { cat.value = cat.value === b.dataset.tfQuick ? '' : b.dataset.tfQuick; cat.dispatchEvent(new Event('change')); });
  });
  sync();
})();

(function () {
  // Guest reviews: filter by country, four per page (the first of each page is the lead card)
  var root = document.querySelector('[data-rc]'); if (!root) return;
  var cards = $$('.rc-card', root), chips = $$('[data-rc-c]', root), PER = 3, page = 0, country = '';
  var prev = $('[data-rc-prev]', root), next = $('[data-rc-next]', root), bar = $('[data-rc-bar]', root);
  function render() {
    var list = cards.filter(function (c) { return !country || c.dataset.rcPlace.indexOf(country) > -1; });
    var pages = Math.max(1, Math.ceil(list.length / PER)); page = Math.min(page, pages - 1);
    cards.forEach(function (c) { c.classList.add('is-hidden'); c.classList.remove('rc-lead'); });
    var shown = list.slice(page * PER, page * PER + PER);
    shown.forEach(function (c, i) { c.classList.remove('is-hidden'); c.classList.toggle('rc-lead', i === 0); });
    $('[data-rc-range]', root).textContent = list.length ? (page * PER + 1) + ' – ' + (page * PER + shown.length) : '0';
    $('[data-rc-total]', root).textContent = list.length;
    prev.disabled = page === 0; next.disabled = page >= pages - 1;
    bar.style.width = (100 / pages) + '%'; bar.style.left = (page * 100 / pages) + '%';
  }
  chips.forEach(function (b) {
    b.addEventListener('click', function () {
      country = b.dataset.rcC; page = 0;
      chips.forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
      render();
    });
  });
  prev.addEventListener('click', function () { page--; render(); });
  next.addEventListener('click', function () { page++; render(); });
  render();
})();

(function () {
  // Tour finder (sentence layout): filled-in states and the "Popular" chips
  var cat = $('#tf-cat'), tour = $('#tf-tour'); if (!cat || !$('.tf3')) return;
  var pick1 = cat.closest('.tf3-pick'), pick2 = $('[data-tf-step2]'), quick = $$('[data-tf-quick]');
  function sync() {
    pick1.classList.toggle('tf3-set', cat.value !== '');
    pick2.classList.toggle('tf3-locked', cat.value === '');
    pick2.classList.toggle('tf3-set', tour.value !== '');
    quick.forEach(function (b) { var on = b.dataset.tfQuick === cat.value; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  }
  cat.addEventListener('change', sync); tour.addEventListener('change', sync);
  quick.forEach(function (b) {
    b.addEventListener('click', function () { cat.value = cat.value === b.dataset.tfQuick ? '' : b.dataset.tfQuick; cat.dispatchEvent(new Event('change')); });
  });
  sync();
})();

(function () {
  // Tour finder (single bar): filled-in states and the "Popular" links
  var cat = $('#tf-cat'), tour = $('#tf-tour'); if (!cat || !$('.tf4')) return;
  var seg1 = cat.closest('.tf4-seg'), seg2 = $('[data-tf-step2]'), quick = $$('[data-tf-quick]');
  function sync() {
    seg1.classList.toggle('tf4-set', cat.value !== '');
    seg2.classList.toggle('tf4-locked', cat.value === '');
    seg2.classList.toggle('tf4-set', tour.value !== '');
    quick.forEach(function (b) { var on = b.dataset.tfQuick === cat.value; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  }
  cat.addEventListener('change', sync); tour.addEventListener('change', sync);
  quick.forEach(function (b) {
    b.addEventListener('click', function () { cat.value = cat.value === b.dataset.tfQuick ? '' : b.dataset.tfQuick; cat.dispatchEvent(new Event('change')); });
  });
  sync();
})();

(function () {
  // "ux" theme: sections and cards fade up as they scroll into view
  var frame = document.querySelector('#mk-frame.ux'); if (!frame || !('IntersectionObserver' in window)) return;
  var els = $$('.b-head, .bp-track, .bl, .tf4, .mp-grid, .cq, .pn-side, .pn-card, .rg, .dx, .g2-grid > *, .rc-side, .rc-main, .wn-media, .wn-copy, .fq-intro, .fq-list', frame);
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el) { el.classList.add('rv'); io.observe(el); });
})();

(function () {
  // Testimonials row: pauses on hover/focus (CSS) or with the Pause button
  var root = document.querySelector('#reviews.r1'); if (!root) return;
  var btn = $('.rm-pause', root), label = $('.rm-pause-t', root);
  btn.addEventListener('click', function () {
    var paused = root.classList.toggle('paused');
    btn.setAttribute('aria-pressed', paused);
    label.textContent = paused ? 'Play' : 'Pause';
  });
})();

(function () {
  // Hero: photo slider on the right; the active progress bar drives the timing
  var root = document.querySelector('.h5'); if (!root) return;
  var slides = $$('.h5-slide', root), bars = $$('[data-h5]', root), pauseBtn = $('[data-h5-pause]', root);
  var num = $('[data-h5-cur]', root), region = $('[data-h5-region]', root), place = $('[data-h5-place]', root), go = $('[data-h5-go]', root);
  var cur = 0, paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('on', k === cur); s.setAttribute('aria-hidden', k !== cur); });
    bars.forEach(function (b, k) {
      b.classList.toggle('on', k === cur); b.classList.toggle('done', k < cur); b.setAttribute('aria-selected', k === cur);
      var bar = b.firstElementChild; bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
    });
    var d = slides[cur].dataset;
    num.textContent = (cur < 9 ? '0' : '') + (cur + 1); region.textContent = d.region; place.textContent = d.place; go.href = d.href;
  }
  function setPaused(p) {
    paused = p; root.classList.toggle('paused', p);
    pauseBtn.setAttribute('aria-pressed', p); pauseBtn.setAttribute('aria-label', p ? 'Play slideshow' : 'Pause slideshow');
  }
  root.addEventListener('animationend', function (e) { if (e.animationName === 'h5bar') show(cur + 1); });
  bars.forEach(function (b) { b.addEventListener('click', function () { show(+b.dataset.h5); }); });
  $('[data-h5-prev]', root).addEventListener('click', function () { show(cur - 1); });
  $('[data-h5-next]', root).addEventListener('click', function () { show(cur + 1); });
  pauseBtn.addEventListener('click', function () { setPaused(!paused); });
  var media = $('.h5-media', root), x0 = null;
  media.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === 'ArrowLeft') show(cur - 1);
  });
  media.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  media.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  });
  // hover or keyboard focus on the photo holds the current slide
  ['mouseenter', 'focusin'].forEach(function (ev) { media.addEventListener(ev, function () { root.classList.add('hold'); }); });
  ['mouseleave', 'focusout'].forEach(function (ev) { media.addEventListener(ev, function () { root.classList.remove('hold'); }); });
  setPaused(paused);
  show(0);
})();

(function () {
  // Hero v3: full photo slider; one slim progress line at the foot of the photo drives the timing
  var root = document.querySelector('[data-hero]'); if (!root) return;
  var slides = $$('[data-slide]', root), bar = $('[data-h-bar]', root), pauseBtn = $('[data-h-pause]', root);
  var place = $('[data-h-place]', root), go = $('[data-h-go]', root);
  var cur = 0, paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('on', k === cur); s.setAttribute('aria-hidden', k !== cur); });
    bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
    var d = slides[cur].dataset;
    if (place) place.textContent = d.place;
    if (go) { go.href = d.href; go.setAttribute('aria-label', 'View tours: ' + d.place); }
  }
  function setPaused(p) {
    paused = p; root.classList.toggle('paused', p);
    if (pauseBtn) { pauseBtn.setAttribute('aria-pressed', p); pauseBtn.setAttribute('aria-label', p ? 'Play slideshow' : 'Pause slideshow'); }
  }
  root.addEventListener('animationend', function (e) { if (e.animationName === 'h8bar') show(cur + 1); });
  if (pauseBtn) pauseBtn.addEventListener('click', function () { setPaused(!paused); });
  root.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
  var x0 = null;
  root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  });
  ['mouseenter', 'focusin'].forEach(function (ev) { root.addEventListener(ev, function () { root.classList.add('hold'); }); });
  ['mouseleave', 'focusout'].forEach(function (ev) { root.addEventListener(ev, function () { root.classList.remove('hold'); }); });
  setPaused(paused);
  show(0);
})();


(function () {
  // Trip finder: a travel style opens that tour list; otherwise destination + duration filter all tours
  var f = document.querySelector('[data-tfx]'); if (!f) return;
  f.addEventListener('submit', function (e) {
    var style = $('[data-tfx-style]', f).value;
    if (style && !f.elements.q.value) { e.preventDefault(); location.href = style + (f.elements.nights.value ? '?nights=' + f.elements.nights.value : ''); return; }
    if (!f.elements.q.value) f.elements.q.disabled = true;
    if (!f.elements.nights.value) f.elements.nights.disabled = true;
  });
  window.addEventListener('pageshow', function () { f.elements.q.disabled = false; f.elements.nights.disabled = false; });
})();
