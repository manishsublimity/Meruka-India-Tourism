// The short description under a tour's name (moved out of views/tour-detail-v2.ejs, 2 Nov 2026): written by hand for
// some tours, otherwise built from the route and the sights named in bold in the days. The tour page shows it when the
// tour has no description of its own; the admin panel shows it in the description editor, ready to change.
const TD_DESC = {
  '/rajasthan_holiday_tour_packages': 'A private 11-day journey from Delhi to the Taj Mahal at Agra and on through the royal cities of Rajasthan — Jaipur, Pushkar, Jodhpur and Udaipur — with forts, palaces, lakes and temples along the way, and the great fort of Chittorgarh on the last day.'
};

module.exports = function autoDesc(d) {
  const stops = String(d.route || '').split(/\s+([-–])\s+/).filter((x, i) => i % 2 === 0);
  const days = d.days || [];
  const tdMid = [...new Set(stops.slice(1, -1).map(x => x.replace(/\(.*?\)/g, '').trim()).filter(x => x && !/home\s*town/i.test(x) && x !== stops[0] && x !== stops[stops.length - 1]))];
  const tdList = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : (a[0] || '');
  const tdReal = stops.filter(x => !/home\s*town/i.test(x));
  const tdEnd = tdReal[tdReal.length - 1], tdStart = tdReal[0];
  if (tdMid[tdMid.length - 1] === tdEnd) tdMid.pop();
  // highlights: the sights named in bold in the day texts (a couple per day, spread over the tour)
  const tdStopRe = new RegExp('^(' + stops.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')$', 'i');
  const tdSkip = /home ?town|airport|railway|station|hotel|emporium|show|mohabbat|market|bazaar|^old and new|cruise|flight|ride|^day\b|resort/i;
  // one sight per day, then up to seven spread evenly over the whole tour
  const tdPer = days.map(day => { for (const p of (day.paras || [])) for (const seg of (Array.isArray(p) ? p : [])) {
      const t = String(seg.text || '').replace(/\s+/g, ' ').trim().replace(/[,.:;]+$/, '');
      if (seg.bold && t.length >= 4 && t.length <= 40 && !tdSkip.test(t) && !tdStopRe.test(t)) return t; } return null; }).filter(Boolean)
    .filter((x, i, arr) => arr.indexOf(x) === i);
  const tdHl = tdPer.length > 7 ? [0, 1, 2, 3, 4, 5, 6].map(i => tdPer[Math.round(i * (tdPer.length - 1) / 6)]) : tdPer;
  const tdLead = TD_DESC[d.url] || ('A private ' + days.length + '-day tour from ' + tdStart
      + (tdMid.length ? ' through ' + tdList(tdMid.slice(0, 6)) + (tdMid.length > 6 ? ' and more' : '') : '')
      + (tdEnd && tdEnd !== tdStart ? ', ending in ' + tdEnd : (tdEnd ? ' and back to ' + tdEnd : '')) + '.');
  const tdTail = ' You travel in your own air-conditioned car with an English-speaking driver, stay in hand-picked hotels, and every part of the plan can be changed to suit you.';
  // two to three lines on a laptop: fewer highlights when the lead is long
  for (let k = Math.min(7, tdHl.length); k >= 3; k--) {
    const pick = k === tdHl.length ? tdHl : [...Array(k).keys()].map(i => tdHl[Math.round(i * (tdHl.length - 1) / (k - 1))]);
    const t = tdLead + ' Highlights include ' + tdList(pick) + '.' + tdTail;
    if (t.length <= 440) return t;
  }
  return tdLead + tdTail;
};
