// Meruka admin: a small chart kit for the Dashboard (16 Oct 2026), following the data-viz method:
// one series = one colour (the validated brand blue #256abf), thin marks with a 4px rounded data-end and a square
// baseline, a 2px surface gap between touching marks, solid hairline grid, values labelled selectively, a tooltip on
// hover AND keyboard focus (values lead, labels follow), and a table view for every chart. Labels go in with
// textContent only. No library.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const C = { mark: '#256abf', markHover: '#1c5cab', grid: '#E9EDF3', axis: '#C9D3E0', ink: '#1B2A3D', ink2: '#52606F', muted: '#7A8798', surface: '#ffffff' };
  const STATUS = { good: { color: '#0ca30c', icon: '✓', label: 'Good' }, ok: { color: '#fab219', icon: '!', label: 'Could be better' }, bad: { color: '#d03b3b', icon: '✕', label: 'Needs attention' } };
  const fmt = n => n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'K' : String(n);
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const txt = (tag, attrs, text, parent) => { const e = el(tag, attrs, parent); e.textContent = text; return e; };
  // a bar with only its data-end rounded (4px), square at the baseline
  const hbarPath = (x, y, w, h, r) => { r = Math.min(r, w, h / 2); return w <= 0 ? '' : `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`; };
  const vbarPath = (x, y, w, h, r) => { r = Math.min(r, h, w / 2); return h <= 0 ? '' : `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`; };
  const niceMax = m => { if (m <= 4) return Math.max(1, m); const p = Math.pow(10, Math.floor(Math.log10(m))); const s = [1, 2, 2.5, 5, 10].find(s => s * p >= m / 4) * p; return Math.ceil(m / s) * s; };

  // ---- one shared tooltip ----
  let tip;
  function showTip(evt, value, label, sub) {
    if (!tip) { tip = document.createElement('div'); tip.className = 'ch-tip'; tip.setAttribute('role', 'tooltip'); document.body.appendChild(tip); }
    tip.innerHTML = ''; const v = document.createElement('b'); v.textContent = value; const l = document.createElement('span'); l.textContent = label; tip.append(v, l);
    if (sub) { const s = document.createElement('small'); s.textContent = sub; tip.appendChild(s); }
    tip.style.display = 'block';
    const r = evt.target.getBoundingClientRect ? evt.target.getBoundingClientRect() : { left: 0, top: 0, width: 0 };
    const x = evt.clientX || r.left + r.width / 2, y = evt.clientY || r.top;
    tip.style.left = Math.min(window.innerWidth - tip.offsetWidth - 8, Math.max(8, x + 12)) + 'px';
    tip.style.top = Math.max(8, y - tip.offsetHeight - 10) + window.scrollY + 'px';
  }
  const hideTip = () => { if (tip) tip.style.display = 'none'; };
  function hover(mark, hit, value, label, sub) {
    hit.setAttribute('tabindex', '0'); hit.setAttribute('role', 'img'); hit.setAttribute('aria-label', label + ': ' + value);
    const on = e => { mark.setAttribute('fill', mark.dataset.hover || C.markHover); showTip(e, value, label, sub); };
    const off = () => { mark.setAttribute('fill', mark.dataset.base || C.mark); hideTip(); };
    hit.addEventListener('pointermove', on); hit.addEventListener('pointerleave', off);
    hit.addEventListener('focus', on); hit.addEventListener('blur', off);
  }

  // ---- table view (every chart has one) ----
  function tableView(box, head, rows) {
    const d = document.createElement('details'); d.className = 'ch-table';
    const s = document.createElement('summary'); s.textContent = 'Show as table'; d.appendChild(s);
    const t = document.createElement('table'); const tr = t.insertRow();
    head.forEach(h => { const th = document.createElement('th'); th.textContent = h; tr.appendChild(th); });
    rows.forEach(r => { const row = t.insertRow(); r.forEach((c, i) => { const td = row.insertCell(); td.textContent = c; if (i) td.className = 'num'; }); });
    d.appendChild(t); box.appendChild(d);
  }
  const empty = (box, msg) => { const p = document.createElement('p'); p.className = 'ch-empty'; p.textContent = msg; box.appendChild(p); };

  // ---- horizontal bars: compare categories (one colour); value at each bar's tip ----
  function bars(box, rows, o) {
    box.innerHTML = ''; o = o || {};
    if (!rows.length || rows.every(r => !r.value)) { empty(box, o.empty || 'No data yet.'); return; }
    const W = Math.max(280, box.clientWidth || 480), labelW = Math.min(170, W * 0.38), valW = 44, bh = 18, gap = 12;
    const H = rows.length * (bh + gap) - gap + 4, max = Math.max(...rows.map(r => r.value)), plot = W - labelW - valW;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: H, class: 'ch' }, box);
    el('line', { x1: labelW, x2: labelW, y1: 0, y2: H, stroke: C.axis, 'stroke-width': 1 }, svg);
    rows.forEach((r, i) => {
      const y = i * (bh + gap) + 2, w = max ? plot * r.value / max : 0;
      txt('text', { x: labelW - 10, y: y + bh / 2 + 4, 'text-anchor': 'end', fill: C.ink2, 'font-size': 12.5 }, r.label, svg);
      const m = el('path', { d: hbarPath(labelW, y, Math.max(w, r.value ? 2 : 0), bh, 4), fill: C.mark }, svg);
      txt('text', { x: labelW + w + 6, y: y + bh / 2 + 4, fill: C.ink, 'font-size': 12.5, 'font-weight': 700 }, fmt(r.value), svg);
      const hit = el('rect', { x: 0, y: y - gap / 2, width: W, height: bh + gap, fill: 'transparent' }, svg);
      hover(m, hit, (o.unit ? r.value + ' ' + o.unit : String(r.value)), r.label, o.total ? Math.round(100 * r.value / o.total) + '% of ' + o.totalLabel : '');
    });
    tableView(box, [o.head || 'Item', o.valueHead || 'Number'], rows.map(r => [r.label, r.value]));
  }

  // ---- columns: magnitude over an ordered axis (time, nights, price bands); label only the highest ----
  function columns(box, rows, o) {
    box.innerHTML = ''; o = o || {};
    if (!rows.length || rows.every(r => !r.value)) { empty(box, o.empty || 'No data yet.'); return; }
    const W = Math.max(280, box.clientWidth || 480), H = o.height || 200, padL = 30, padB = 28, padT = 18;
    const max = niceMax(Math.max(...rows.map(r => r.value))), plotH = H - padB - padT, plotW = W - padL - 4;
    const step = plotW / rows.length, bw = Math.min(24, step - 2);
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: H, class: 'ch' }, box);
    const ticks = max <= 4 ? Array.from({ length: max + 1 }, (_, i) => i) : [0, max / 4, max / 2, 3 * max / 4, max];
    ticks.forEach(t => {
      const y = padT + plotH - plotH * t / max;
      el('line', { x1: padL, x2: W, y1: y, y2: y, stroke: t ? C.grid : C.axis, 'stroke-width': 1 }, svg);
      txt('text', { x: padL - 6, y: y + 4, 'text-anchor': 'end', fill: C.muted, 'font-size': 11, class: 'tnum' }, fmt(t), svg);
    });
    const top = rows.reduce((a, r, i) => r.value > rows[a].value ? i : a, 0);
    const every = Math.ceil(rows.length / Math.max(1, Math.floor(plotW / 64)));   // thin the x labels so they never collide
    rows.forEach((r, i) => {
      const x = padL + step * i + (step - bw) / 2, h = plotH * r.value / max, y = padT + plotH - h;
      const m = el('path', { d: vbarPath(x, y, bw, Math.max(h, r.value ? 2 : 0), 4), fill: o.highlight === i ? C.markHover : C.mark }, svg);
      if (i % every === 0 || i === rows.length - 1) txt('text', { x: x + bw / 2, y: H - 9, 'text-anchor': 'middle', fill: C.muted, 'font-size': 11 }, r.short || r.label, svg);
      if (i === top && r.value) txt('text', { x: x + bw / 2, y: y - 5, 'text-anchor': 'middle', fill: C.ink, 'font-size': 12, 'font-weight': 700 }, fmt(r.value), svg);
      const hit = el('rect', { x: padL + step * i, y: padT, width: step, height: plotH, fill: 'transparent' }, svg);
      hover(m, hit, (o.unit ? r.value + ' ' + o.unit : String(r.value)), r.label);
    });
    tableView(box, [o.head || 'Period', o.valueHead || 'Number'], rows.map(r => [r.label, r.value]));
  }

  // ---- 100% stacked bars for status (good / could be better / needs attention), legend with icon + label ----
  function statusBars(box, rows, o) {
    box.innerHTML = ''; o = o || {};
    const keys = ['good', 'ok', 'bad'];
    const leg = document.createElement('div'); leg.className = 'ch-legend';
    keys.forEach(k => { const s = document.createElement('span'); const sw = document.createElement('i'); sw.style.background = STATUS[k].color; sw.textContent = STATUS[k].icon; s.append(sw, document.createTextNode(STATUS[k].label)); leg.appendChild(s); });
    box.appendChild(leg);
    const W = Math.max(280, box.clientWidth || 480), labelW = Math.min(170, W * 0.36), bh = 20, gap = 16;
    const H = rows.length * (bh + gap + 14) - gap + 4, plot = W - labelW - 4;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: H, class: 'ch' }, box);
    rows.forEach((r, i) => {
      const total = keys.reduce((n, k) => n + r[k], 0) || 1, y = i * (bh + gap + 14) + 2;
      txt('text', { x: labelW - 10, y: y + bh / 2 + 4, 'text-anchor': 'end', fill: C.ink2, 'font-size': 12.5 }, r.label, svg);
      txt('text', { x: labelW, y: y + bh + 13, fill: C.muted, 'font-size': 11 }, total + ' pages', svg);
      let x = labelW; const parts = keys.filter(k => r[k]);
      parts.forEach((k, j) => {
        const w = plot * r[k] / total - (j < parts.length - 1 ? 2 : 0);   // 2px surface gap between segments
        const last = j === parts.length - 1;
        const m = el('path', { d: last ? hbarPath(x, y, w, bh, 4) : `M${x},${y}h${w}v${bh}h${-w}Z`, fill: STATUS[k].color }, svg);
        m.dataset.base = STATUS[k].color; m.dataset.hover = STATUS[k].color;
        const pct = Math.round(100 * r[k] / total);
        if (w > 34) txt('text', { x: x + w / 2, y: y + bh / 2 + 4, 'text-anchor': 'middle', fill: k === 'ok' ? C.ink : '#fff', 'font-size': 11.5, 'font-weight': 700 }, pct + '%', svg);
        const hit = el('rect', { x, y: y - 4, width: Math.max(w, 6), height: bh + 8, fill: 'transparent' }, svg);
        hover(m, hit, r[k] + ' pages (' + pct + '%)', r.label + ' — ' + STATUS[k].label);
        x += w + 2;
      });
    });
    tableView(box, ['Section', 'Good', 'Could be better', 'Needs attention'], rows.map(r => [r.label, r.good, r.ok, r.bad]));
  }

  window.CHARTS = { bars, columns, statusBars, fmt, STATUS };
})();
