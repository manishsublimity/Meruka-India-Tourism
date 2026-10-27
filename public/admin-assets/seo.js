// Meruka admin: the Google & SEO check — search and filter the pages
(function () {
  const q = document.querySelector('[data-q]'), lv = document.querySelector('[data-lv]'), count = document.querySelector('[data-count]');
  const rows = [...document.querySelectorAll('[data-row]')];
  // (23 Oct 2026) 20 to a page
  const pager = window.ADMIN.pager(rows, rows[0] ? rows[0].closest('table') : q);
  const run = () => {
    const v = q.value.trim().toLowerCase(), l = lv.value; let n = 0;
    rows.forEach(r => { const show = (!v || r.dataset.s.includes(v)) && (!l || r.dataset.lv === l); r.dataset.out = show ? '' : '1'; if (show) n++; });
    count.textContent = n + ' pages';
    pager.update(true);
  };
  q.oninput = run; lv.onchange = run;
  if (location.hash === '#fix') { lv.value = 'bad'; }
  run();
})();
