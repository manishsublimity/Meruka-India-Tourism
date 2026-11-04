// Meruka admin: import a tour's itinerary from a file (3 Nov 2026, client) — a Word file (.docx), a PDF, a text file
// (.txt / .md) or pasted text, written in the usual way of an itinerary:
//
//   Golden Triangle Tour                        ← the title (left as it is: the tour keeps its own name)
//   A short description …                       ← the text before Day 1 is the tour's description
//   Day 1: Arrival in Delhi (25 km)             ← each day: "Day 1:", "Day 01 -", "01 Day" …; a distance in brackets
//   The text of the day …
//   Note: The Taj Mahal is closed on Fridays.   ← the day's note
//   Tour Pricing / Price                        ← after the days, the parts by their headings:
//   3-Star: $85 - $100 per person per day          prices (one line per hotel class),
//   This Tour Includes / Inclusions                what is included,
//   This Tour Excludes / Exclusions                what is excluded,
//   Important Notes                                the notes (one point per line)
//
// window.ITIN.read(file) → paragraphs ([{ text, bold }] pieces); ITIN.parse(paragraphs) → the parts found;
// ITIN.merge(tourData, parts, keepDays) → the tour's data with the parts filled in.
(function () {
  // ---------- reading the file ----------
  async function docxXml(buf) {
    const dv = new DataView(buf), u8 = new Uint8Array(buf), dec = new TextDecoder();
    let e = u8.length - 22; while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
    if (e < 0) throw new Error('This is not a Word file (.docx). In Word use “Save as” → Word Document (.docx).');
    let p = dv.getUint32(e + 16, true);
    for (let i = 0, n = dv.getUint16(e + 10, true); i < n; i++) {
      const method = dv.getUint16(p + 10, true), size = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
      if (dec.decode(u8.subarray(p + 46, p + 46 + nl)) === 'word/document.xml') {
        const start = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true), data = u8.subarray(start, start + size);
        const raw = method === 0 ? data : new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
        return dec.decode(raw);
      }
      p += 46 + nl + xl + cl;
    }
    throw new Error('No text found in this Word file.');
  }
  const docxParas = xml => [...new DOMParser().parseFromString(xml, 'application/xml').getElementsByTagName('w:p')].map(p => {
    const segs = [];
    [...p.getElementsByTagName('w:r')].forEach(r => {
      const b = r.getElementsByTagName('w:b')[0], bold = !!b && !/^(0|false)$/.test(b.getAttribute('w:val') || '');
      const text = [...r.childNodes].map(n => n.nodeName === 'w:t' ? n.textContent : /^w:(tab|br)$/.test(n.nodeName) ? ' ' : '').join('');
      if (!text) return;
      const last = segs[segs.length - 1]; if (last && last.bold === bold) last.text += text; else segs.push({ text, bold });
    });
    return segs;
  }).filter(s => s.some(x => x.text.trim()));
  const textParas = t => String(t || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => [{ text: l, bold: false }]);
  // a PDF: read with pdf.js (loaded the first time a PDF is chosen); its lines are put back together into paragraphs
  let pdfLib = null;
  const loadPdf = () => pdfLib || (pdfLib = new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; ok(window.pdfjsLib); };
    s.onerror = () => { pdfLib = null; no(new Error('The PDF reader could not be loaded. Check the internet connection, or copy the text of the PDF and paste it.')); };
    document.head.appendChild(s);
  }));
  async function pdfParas(buf) {
    const lib = await loadPdf(), doc = await lib.getDocument({ data: buf }).promise, out = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n), tc = await page.getTextContent(), lines = [];
      tc.items.forEach(it => {
        if (!it.str) return;
        const y = Math.round(it.transform[5]), h = Math.abs(it.transform[3]) || 10, bold = /bold|black|heavy/i.test((tc.styles[it.fontName] || {}).fontFamily || '') || /bold/i.test(it.fontName || '');
        let l = lines.find(x => Math.abs(x.y - y) < h * 0.4);
        if (!l) { l = { y, h, parts: [] }; lines.push(l); }
        l.parts.push({ x: it.transform[4], text: it.str, bold });
      });
      lines.sort((a, b) => b.y - a.y);
      let prev = null, para = null;
      lines.forEach(l => {
        const segs = []; l.parts.sort((a, b) => a.x - b.x).forEach(p => { const last = segs[segs.length - 1]; if (last && last.bold === p.bold) last.text += (/\s$/.test(last.text) || /^\s/.test(p.text) ? '' : ' ') + p.text; else segs.push({ text: (last ? ' ' : '') + p.text, bold: p.bold }); });
        const text = segs.map(x => x.text).join('').trim(); if (!text) return;
        // a new paragraph after a gap; at a day, a heading, a point of a list, a price line or "Note:"; after a day or a
        // heading line; where the line turns bold or plain; after a full stop when the next line starts a sentence
        const allBold = segs.every(x => x.bold || !x.text.trim()), prevText = para ? para.map(x => x.text).join('').trim() : '';
        const gap = prev ? prev.y - l.y > Math.max(prev.h, l.h) * 1.6 : true;
        const starts = DAY_RE.test(text) || HEAD_RE.test(text) || /^[•\-*–·▪●]/.test(text) || /^note\s*[:\-–]/i.test(text) || /^[^:$]{2,40}:\s*.*(\$|usd)/i.test(text);
        const after = prev && (prev.head || prev.bold !== allBold || Math.abs(prev.h - l.h) > Math.max(prev.h, l.h) * 0.2 || /[:.!?]$/.test(prevText) && /^[A-Z0-9]/.test(text));
        if (!para || gap || starts || after) { para = segs; out.push(para); }
        else para.push({ text: ' ', bold: false }, ...segs);
        prev = Object.assign(l, { bold: allBold, head: DAY_RE.test(text) || HEAD_RE.test(text) || (allBold && text.length < 90) });
      });
    }
    return out;
  }
  async function read(file) {
    const name = file.name || '';
    if (/\.docx$/i.test(name)) return docxParas(await docxXml(await file.arrayBuffer()));
    if (/\.pdf$/i.test(name) || file.type === 'application/pdf') return pdfParas(await file.arrayBuffer());
    if (/\.(txt|md|text)$/i.test(name) || /^text\//.test(file.type)) return textParas(await file.text());
    if (/\.doc$/i.test(name)) throw new Error('An old Word file (.doc) cannot be read. In Word use “Save as” → Word Document (.docx), or save it as PDF.');
    throw new Error('Choose a Word file (.docx), a PDF or a text file (.txt).');
  }

  // ---------- understanding it ----------
  const DAY_RE = /^\s*(?:day\s*[-–:.]?\s*(\d{1,2})|(\d{1,2})\s*(?:st|nd|rd|th)?\s*day)\b\s*[:.\-–—)]*\s*(.*)$/i;
  const HEAD_RE = /^\s*(?:(?:tour\s+)?pric(?:e|es|ing)(?:\s+details)?|cost(?:\s+of\s+the\s+tour)?|(?:this\s+)?tour\s+includes?|(?:the\s+)?inclusions?|(?:price|package|tour)?\s*includes?|what'?s\s+included|(?:this\s+)?tour\s+excludes?|(?:the\s+)?exclusions?|(?:price|package|tour)?\s*excludes?|what'?s\s+(?:not\s+included|excluded)|(?:important\s+)?notes?|terms(?:\s+and\s+conditions)?|please\s+note)\s*:?\s*$/i;
  const kindOf = line => /pric|cost/i.test(line) ? 'price' : /exclu|not included/i.test(line) ? 'exc' : /inclu/i.test(line) ? 'inc' : 'note';
  const two = n => String(n).padStart(2, '0');
  const strip = s => s.replace(/^[•\-*–·▪●]\s*/, '').trim();
  function parse(paras) {
    const days = [], lists = { price: [], inc: [], exc: [], note: [] }, intro = [];
    let part = 'intro', title = '';
    paras.forEach(segs => {
      const line = segs.map(x => x.text).join('').replace(/\s+/g, ' ').trim();
      if (!line) return;
      const m = DAY_RE.exec(line);
      if (m && line.length < 160 && part !== 'price') {
        let t = (m[3] || '').trim(), eta = '';
        const km = /\(([^)]*\b(?:km|kms|hrs?|hours?|miles?)\b[^)]*)\)\s*$/i.exec(t); if (km) { eta = km[1].trim(); t = t.slice(0, km.index).trim(); }
        days.push({ day: two(+(m[1] || m[2])) + ' Day', title: t, eta, photo: '', paras: [], note: '' }); part = 'day'; return;
      }
      if (HEAD_RE.test(line) && line.length < 60) { part = kindOf(line); return; }
      if (part === 'intro') { if (!title && !intro.length && line.length < 90 && !/[.!?]$/.test(line)) title = line; else intro.push(segs); return; }
      if (part === 'day') {
        const d = days[days.length - 1];
        if (/^note\s*[:\-–]/i.test(line)) d.note = (d.note ? d.note + ' ' : '') + line.replace(/^note\s*[:\-–]\s*/i, '');
        else d.paras.push(segs.map(x => ({ text: x.text, bold: !!x.bold })));
        return;
      }
      lists[part].push(strip(line));
    });
    days.forEach(d => { if (!d.paras.length) d.paras = [[{ text: '', bold: false }]]; });
    // price lines: "3-Star: $85 - $100 per person per day"; other lines of that part are its text
    const prices = [], priceText = [];
    lists.price.forEach(l => { const m = /^([^:$]{2,40}):\s*(.*\d.*)$/.exec(l); if (m && /\$|usd|rs|inr|€|£/i.test(m[2])) prices.push([{ text: m[1].trim() + ':', bold: true }, { text: ' ' + m[2].trim(), bold: false }]); else priceText.push(l); });
    return { title, intro, days, prices, priceText: priceText.join(' '), inc: lists.inc, exc: lists.exc, note: lists.note };
  }

  // ---------- into the tour ----------
  const DROP = /(arrival|arrive|departure|depart|sightseeing|sight seeing|local|excursion|drive|hometown|home town|onward|journey|full day|half day|day|tour|by air|by train|by road|fly|flight|train|via)/gi;
  const routeOf = days => { const out = []; days.forEach(d => String(d.title || '').split(/\s*[–—-]\s*|\s+to\s+|,|\//i).forEach(p => { const n = p.replace(/\(.*?(\)|$)/g, '').replace(DROP, ' ').replace(/\s+/g, ' ').trim().replace(/^(in|at|to|from|and|of)\s+/i, ''); if (n && /[a-z]/i.test(n) && (!out.length || out[out.length - 1].toLowerCase() !== n.toLowerCase())) out.push(n); })); return out.join(' - '); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const segHtml = segs => segs.map(x => x.bold ? '<b>' + esc(x.text) + '</b>' : esc(x.text)).join('');
  function merge(data, p, keepDays) {
    const out = JSON.parse(JSON.stringify(data || {}));
    if (p.days.length) {
      const now = keepDays ? (out.days || []).filter(d => d.title || (d.paras || []).some(x => (Array.isArray(x) ? x : []).some(s => (s.text || '').trim()))) : [];
      out.days = now.concat(p.days).map((d, i) => Object.assign({}, d, { day: two(i + 1) + ' Day' }));
      out.duration = two(out.days.length - 1) + ' Nights · ' + two(out.days.length) + ' Days';
      const r = routeOf(out.days); if (r) out.route = r;
    }
    if (p.intro.length) out.summary = p.intro.map(s => '<p>' + segHtml(s) + '</p>').join('');
    const blocks = Array.isArray(out.details) ? out.details : [];
    const put = (re, title, items, text) => {
      if (!items.length && !text) return;
      let b = blocks.find(x => re.test(x.title || ''));
      if (!b) { b = { title, text: '', items: [] }; blocks.push(b); }
      if (items.length) b.items = items;
      if (text) b.text = text;
    };
    put(/pric|cost/i, 'Tour Pricing Details', p.prices, p.priceText);
    put(/includ/i, 'This Tour Includes', p.inc.map(t => [{ text: t, bold: false }]));
    put(/exclud/i, 'This Tour Excludes', p.exc.map(t => [{ text: t, bold: false }]));
    put(/note/i, 'Important Notes', p.note.map(t => [{ text: t, bold: false }]));
    out.details = blocks;
    return out;
  }
  // a short line of what was found, for the popup
  const found = p => [p.days.length && p.days.length + ' days', p.prices.length && p.prices.length + ' prices', p.inc.length && p.inc.length + ' included', p.exc.length && p.exc.length + ' excluded', p.note.length && p.note.length + ' notes', p.intro.length && 'a description'].filter(Boolean).join(' · ');
  window.ITIN = { read, parse, merge, found, textParas };
})();
