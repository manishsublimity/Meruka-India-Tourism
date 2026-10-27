// Meruka admin: the start page's charts (26 Oct 2026) — enquiries over the chosen period, where they come from and where
// they stand, and the tours by region and length. Numbers from /admin/api/stats; drawn with the small chart kit.
(function () {
  const A = window.ADMIN, CH = window.CHARTS, DAY = 864e5;
  const $ = s => document.querySelector(s), c = n => $('[data-c="' + n + '"]'), k = n => $('[data-k="' + n + '"]');
  let S = null, days = 30;
  const countBy = (arr, key, order) => { const m = {}; arr.forEach(x => { m[x[key]] = (m[x[key]] || 0) + 1; }); const rows = Object.entries(m).map(([label, value]) => ({ label, value })); return order ? order.map(l => ({ label: l, value: m[l] || 0 })) : rows.sort((a, b) => b.value - a.value); };
  const top = (rows, n) => rows.length <= n ? rows : rows.slice(0, n - 1).concat([{ label: 'Other', value: rows.slice(n - 1).reduce((s, r) => s + r.value, 0) }]);
  function timeline(list) {
    const now = new Date(); now.setHours(23, 59, 59, 999);
    const first = list.length ? new Date(Math.min(...list.map(e => +new Date(e.at)))) : now;
    const start = days ? new Date(+now - days * DAY + 1) : first;
    const unit = !days || days > 120 ? 'month' : days > 31 ? 'week' : 'day';
    const keyOf = t => { const x = new Date(t); if (unit === 'month') return x.getFullYear() + '-' + x.getMonth(); if (unit === 'week') { x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); } return x.toDateString(); };
    const out = [], cur = new Date(start); cur.setHours(0, 0, 0, 0);
    if (unit === 'month') cur.setDate(1); if (unit === 'week') cur.setDate(cur.getDate() - ((cur.getDay() + 6) % 7));
    while (cur <= now && out.length < 400) {
      out.push({ key: keyOf(cur), label: cur.toLocaleDateString('en-GB', unit === 'month' ? { month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short' }), short: cur.toLocaleDateString('en-GB', unit === 'month' ? { month: 'short' } : { day: 'numeric', month: 'short' }), value: 0 });
      if (unit === 'month') cur.setMonth(cur.getMonth() + 1); else cur.setDate(cur.getDate() + (unit === 'week' ? 7 : 1));
    }
    const at = Object.fromEntries(out.map((b, i) => [b.key, i]));
    list.forEach(e => { const i = at[keyOf(e.at)]; if (i !== undefined) out[i].value++; });
    return { out, unit };
  }
  function draw() {
    if (c('time')) {
      const now = Date.now(), list = S.enquiries.filter(e => !days || now - new Date(e.at) <= days * DAY);
      k('count').textContent = list.length;
      const t = timeline(list);
      k('timeSub').textContent = 'Enquiries per ' + t.unit + (days ? ', last ' + (days === 365 ? '12 months' : days + ' days') : ', since the first one') + '.';
      const none = 'No enquiries in this period.', opt = h => ({ head: h, valueHead: 'Enquiries', unit: 'enquiries', total: list.length, totalLabel: 'enquiries', empty: none });
      CH.columns(c('time'), t.out, { head: t.unit, valueHead: 'Enquiries', unit: 'enquiries', empty: none, height: 170 });
      CH.bars(c('country'), top(countBy(list, 'country'), 6), opt('Country'));
      CH.bars(c('status'), countBy(list, 'status', ['New', 'Replied', 'Quote sent', 'Booked', 'Closed']), opt('Status'));
    }
    if (c('groups')) {
      CH.bars(c('groups'), S.toursByGroup, { head: 'Region', valueHead: 'Tours', unit: 'tours', total: S.totals.tours, totalLabel: 'tours' });
      if (c('tlength')) CH.columns(c('tlength'), S.toursByLength.map(r => Object.assign({ short: r.label.replace(' nights', '').replace('Up to ', '≤') }, r)), { head: 'Length', valueHead: 'Tours', unit: 'tours', height: 150 });
    }
  }
  document.querySelectorAll('[data-range] button').forEach(b => b.onclick = () => {
    document.querySelectorAll('[data-range] button').forEach(x => x.setAttribute('aria-pressed', x === b));
    days = +b.dataset.d; if (S) draw();
  });
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => S && draw(), 200); });
  if (c('time') || c('groups')) A.api('GET', '/admin/api/stats').then(j => { S = j; draw(); }).catch(e => A.toast(e.message, true));
})();
