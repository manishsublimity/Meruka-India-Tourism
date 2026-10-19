// Meruka admin: the Google & SEO check — search and filter the pages
(function () {
  const q = document.querySelector('[data-q]'), lv = document.querySelector('[data-lv]'), count = document.querySelector('[data-count]');
  const rows = [...document.querySelectorAll('[data-row]')];
  const run = () => {
    const v = q.value.trim().toLowerCase(), l = lv.value; let n = 0;
    rows.forEach(r => { const show = (!v || r.dataset.s.includes(v)) && (!l || r.dataset.lv === l); r.hidden = !show; if (show) n++; });
    count.textContent = n + ' pages';
  };
  q.oninput = run; lv.onchange = run;
  if (location.hash === '#fix') { lv.value = 'bad'; }
  run();
})();
