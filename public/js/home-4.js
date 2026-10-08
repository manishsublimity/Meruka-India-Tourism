(function () {
  // Hero: the headline changes with the photo — three lines, in turn
  var head = document.querySelector('[data-h4-head]'); if (!head) return;
  // Client (6 Oct 2026): one headline on every picture
  var HEADS = ['One Country<br><span class="h4-l2">Many Worlds...</span>'];
  var slides = [].slice.call(document.querySelectorAll('[data-slide]')), last = 0;
  function sync() {
    var i = slides.findIndex(function (s) { return s.classList.contains('on'); });
    if (i < 0 || i === last) return;
    last = i;
    head.classList.add('swap');
    setTimeout(function () { head.innerHTML = HEADS[i % HEADS.length]; head.classList.remove('swap'); }, 250);
  }
  slides.forEach(function (s) { new MutationObserver(sync).observe(s, { attributes: true, attributeFilter: ['class'] }); });
})();

(function () {
  // Popular tours: "+N more" shows the rest of a tour's destinations (works for cards the finder adds later too)
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-pq-more]'); if (!b) return;
    var open = b.getAttribute('aria-expanded') !== 'true';
    [].forEach.call(b.parentNode.querySelectorAll('.pq-more-x'), function (x) { x.hidden = !open; });
    b.setAttribute('aria-expanded', open);
    b.textContent = open ? 'Show less' : b.dataset.label;
  });
  [].forEach.call(document.querySelectorAll('[data-pq-more]'), function (b) { b.dataset.label = b.textContent; });
})();

(function () {
  // Features card: numbers count up once when the card comes into view
  var nums = [].slice.call(document.querySelectorAll('[data-count]'));
  if (!nums.length || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  nums.forEach(function (b) {
    var end = +b.dataset.count, txt = b.firstChild;
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; io.disconnect();
      var t0 = performance.now();
      (function step(t) {
        var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
        txt.nodeValue = Math.round(end * e);
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }, { threshold: .6 });
    io.observe(b);
  });
})();

(function () {
  // Hero arrows: previous / next photo (the slider listens for the arrow keys)
  var hero = document.querySelector('[data-hero]'); if (!hero) return;
  var go = function (key) { hero.dispatchEvent(new KeyboardEvent('keydown', { key: key })); };
  var p = hero.querySelector('[data-h4-prev]'), n = hero.querySelector('[data-h4-next]');
  if (p) p.addEventListener('click', function () { go('ArrowLeft'); });
  if (n) n.addEventListener('click', function () { go('ArrowRight'); });
})();

(function () {
  // Popular tours: show as many stops as fit on the line; the rest go behind "+N more"
  var grid = document.getElementById('tf-grid'); if (!grid) return;
  function fit(p) {
    var btn = p.querySelector('[data-pq-more]'); if (!btn || btn.getAttribute('aria-expanded') === 'true') return;
    var spans = [].slice.call(p.querySelectorAll('span'));
    spans.forEach(function (s) { s.hidden = false; s.classList.remove('pq-more-x'); });
    btn.hidden = true;
    var hidden = 0;
    while (p.scrollWidth > p.clientWidth + 1 && spans.length - hidden > 1) {
      hidden++; spans[spans.length - hidden].hidden = true; spans[spans.length - hidden].classList.add('pq-more-x'); btn.hidden = false;
      btn.textContent = btn.dataset.label = '+' + hidden + ' more';
    }
  }
  function fitAll() { [].forEach.call(grid.querySelectorAll('.pq-stops'), fit); }
  new MutationObserver(fitAll).observe(grid, { childList: true });
  window.addEventListener('resize', fitAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  fitAll();
})();
