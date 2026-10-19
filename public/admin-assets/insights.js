// Meruka admin: the Dashboard — stat tiles and charts from /admin/api/stats. The period buttons scope the enquiry
// section only (everything below them in that section); the website section is not tied to a period.
(function () {
  const A = window.ADMIN, CH = window.CHARTS;
  const $ = s => document.querySelector(s), k = n => $('[data-k="' + n + '"]'), c = n => $('[data-c="' + n + '"]');
  let S = null, days = 30;
  const DAY = 864e5;

  const countBy = (arr, key) => { const m = {}; arr.forEach(x => { m[x[key]] = (m[x[key]] || 0) + 1; }); return Object.entries(m).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value); };
  const topN = (rows, n) => rows.length <= n ? rows : rows.slice(0, n - 1).concat([{ label: 'Other', value: rows.slice(n - 1).reduce((s, r) => s + r.value, 0) }]);

  // enquiries per day / week / month across the period, empty buckets included
  function timeline(list, d) {
    const now = new Date(); now.setHours(23, 59, 59, 999);
    const first = list.length ? new Date(Math.min(...list.map(e => +new Date(e.at)))) : now;
    const start = d ? new Date(+now - d * DAY + 1) : first;
    const unit = !d || d > 120 ? 'month' : d > 31 ? 'week' : 'day';
    const keyOf = t => { const x = new Date(t); if (unit === 'month') return x.getFullYear() + '-' + x.getMonth(); if (unit === 'week') { const m = new Date(x); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return m.toDateString(); } return x.toDateString(); };
    const buckets = []; const cur = new Date(start); cur.setHours(0, 0, 0, 0);
    if (unit === 'month') cur.setDate(1); if (unit === 'week') cur.setDate(cur.getDate() - ((cur.getDay() + 6) % 7));
    while (cur <= now && buckets.length < 400) {
      const label = unit === 'month' ? cur.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : unit === 'week' ? 'Week of ' + cur.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : cur.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      const short = unit === 'month' ? cur.toLocaleDateString('en-GB', { month: 'short' }) : cur.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      buckets.push({ key: keyOf(cur), label, short, value: 0 });
      if (unit === 'month') cur.setMonth(cur.getMonth() + 1); else cur.setDate(cur.getDate() + (unit === 'week' ? 7 : 1));
    }
    const idx = Object.fromEntries(buckets.map((b, i) => [b.key, i]));
    list.forEach(e => { const i = idx[keyOf(e.at)]; if (i !== undefined) buckets[i].value++; });
    return { buckets, unit };
  }

  function renderEnquiries() {
    const now = Date.now();
    const inRange = e => !days || now - new Date(e.at) <= days * DAY;
    const prevRange = e => days && now - new Date(e.at) > days * DAY && now - new Date(e.at) <= 2 * days * DAY;
    const list = S.enquiries.filter(inRange), prev = S.enquiries.filter(prevRange);
    k('count').textContent = list.length;
    const dl = k('delta'); dl.className = 'delta';
    if (!days) dl.textContent = 'since the first enquiry';
    else { const diff = list.length - prev.length; dl.textContent = (diff > 0 ? '▲ +' : diff < 0 ? '▼ ' : '') + (diff || 'Same as') + (diff ? ' vs' : '') + ' the ' + days + ' days before'; if (diff) dl.classList.add(diff > 0 ? 'up' : 'down'); }
    k('unread').textContent = S.enquiries.filter(e => !e.read).length;
    const countries = countBy(list, 'country').filter(r => r.label !== 'Not said');
    k('country').textContent = countries[0] ? countries[0].label : '—'; k('countryN').textContent = countries[0] ? countries[0].value + ' enquir' + (countries[0].value === 1 ? 'y' : 'ies') : 'no country given yet';
    const lens = countBy(list, 'length').filter(r => r.label !== 'Not said');
    k('length').textContent = lens[0] ? lens[0].label : '—'; k('lengthN').textContent = lens[0] ? lens[0].value + ' enquir' + (lens[0].value === 1 ? 'y' : 'ies') : '';
    const t = timeline(list, days);
    k('timeSub').textContent = 'Number of enquiries per ' + t.unit + '.';
    const none = 'No enquiries in this period.';
    CH.columns(c('time'), t.buckets, { head: t.unit[0].toUpperCase() + t.unit.slice(1), valueHead: 'Enquiries', unit: 'enquiries', empty: none, height: 210 });
    const opt = (head) => ({ head, valueHead: 'Enquiries', unit: 'enquiries', total: list.length, totalLabel: 'enquiries in this period', empty: none });
    CH.bars(c('source'), countBy(list, 'source'), opt('Form'));
    CH.bars(c('country'), topN(countries.concat(countBy(list, 'country').filter(r => r.label === 'Not said')), 6), opt('Country'));
    CH.bars(c('length'), countBy(list, 'length'), opt('Trip length'));
    CH.bars(c('hotel'), countBy(list, 'hotel'), opt('Hotels'));
    document.querySelector('[data-enq]').style.opacity = 1;
  }

  function renderSite() {
    k('tours').textContent = S.totals.tours; k('lists').textContent = S.totals.lists; k('pages').textContent = S.totals.pages;
    const bad = S.seo.reduce((n, r) => n + r.bad, 0), all = S.seo.reduce((n, r) => n + r.good + r.ok + r.bad, 0);
    k('seoBad').textContent = bad;
    const st = k('seoSt'), lv = bad ? 'bad' : 'good';
    st.innerHTML = ''; const i = document.createElement('i'); i.style.background = CH.STATUS[lv].color; i.textContent = CH.STATUS[lv].icon;
    st.append(i, document.createTextNode(bad ? 'of ' + all + ' need attention' : 'all pages are fine'));
    CH.statusBars(c('seo'), S.seo);
    CH.bars(c('groups'), S.toursByGroup, { head: 'Region', valueHead: 'Tours', unit: 'tours', total: S.totals.tours, totalLabel: 'tours' });
    CH.columns(c('tlength'), S.toursByLength.map(r => Object.assign({ short: r.label.replace(' nights', '').replace('Up to ', '≤') }, r)), { head: 'Length', valueHead: 'Tours', unit: 'tours', height: 190 });
    CH.columns(c('price'), S.toursByPrice.filter(r => r.label !== 'On request' || r.value).map(r => Object.assign({ short: { 'Under USD 1,000': 'Under $1K', 'USD 1,000–1,999': '$1K–2K', 'USD 2,000–2,999': '$2K–3K', 'USD 3,000+': '$3K+' }[r.label] || r.label }, r)), { head: 'From price', valueHead: 'Tours', unit: 'tours', height: 190 });
    const box = c('recent'); box.innerHTML = '';
    if (!S.recent.length) { const p = document.createElement('p'); p.className = 'ch-empty'; p.textContent = 'Nothing changed in the panel yet.'; box.appendChild(p); }
    else {
      const t = document.createElement('table'); t.className = 'tbl recent'; t.style.border = '0';
      S.recent.forEach(r => { const tr = t.insertRow(); const a = document.createElement('a'); a.href = r.edit; a.textContent = r.name; const td = tr.insertCell(); td.appendChild(a); const w = document.createElement('div'); w.className = 'muted'; w.textContent = r.what; td.appendChild(w); const d = tr.insertCell(); d.className = 'muted'; d.style.textAlign = 'right'; d.textContent = new Date(r.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }); });
      box.appendChild(t);
    }
  }

  // period buttons: keep the frame while redrawing (no flash)
  document.querySelectorAll('[data-range] button').forEach(b => {
    b.onclick = () => {
      document.querySelectorAll('[data-range] button').forEach(x => x.setAttribute('aria-pressed', x === b));
      days = +b.dataset.d; document.querySelector('[data-enq]').style.opacity = .55; setTimeout(renderEnquiries, 0);
    };
  });
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (S) { renderEnquiries(); renderSite(); } }, 200); });

  A.api('GET', '/admin/api/stats').then(j => { S = j; renderEnquiries(); renderSite(); }).catch(e => A.toast(e.message, true));
})();
