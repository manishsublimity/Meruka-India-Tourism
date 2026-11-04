// Meruka admin: the text editor (3 Nov 2026, moved out of editor.js so every page of the panel uses the same one):
// the toolbar (paragraph / headings, size, line spacing, bold, italic, underline, strikethrough, colour, highlight,
// alignment, lists, indents, quote, divider, table, links, photos, undo / redo, clear, HTML code, full screen, shortcuts),
// the link popup with the website's pages, the photo bar and the table bar.
// window.MKRTE.rte(html, { list, min }) → { el, get, html }; setTouch(fn) is called on every change.
(function () {
  const A = window.ADMIN;
  let touch = () => {};
  // ---------- (26 Oct 2026, client video II) a proper text editor: a toolbar with icons, as in Word / WordPress ----------
  const TB_ICON = {
    bold: '<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>', italic: '<path d="M14 5h-4M14 19h-4M14 5l-4 14"/>',
    underline: '<path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14"/>', link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    unlink: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/><path d="M4 4l16 16"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>', redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
    clear: '<path d="M6 5h12M12 5l-4 14M4 20h8"/><path d="m15 14 5 5M20 14l-5 5"/>', ul: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    ol: '<path d="M10 6h10M10 12h10M10 18h10M4 4.5h1.5V9M4 9h3M4 14.5c.5-1 3-1 3 .5S4 17 4 19h3"/>', h2: '<path d="M4 5v14M12 5v14M4 12h8"/><path d="M15 9c.5-1.5 5-1.5 5 1s-5 4-5 7h5"/>',
    h3: '<path d="M4 5v14M12 5v14M4 12h8"/><path d="M15 8h5l-3 4c2 0 3 1 3 3s-3 3-5 1"/>', p: '<path d="M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>',
    quote: '<path d="M7 7h4v4c0 3-2 5-4 6M15 7h4v4c0 3-2 5-4 6"/>', img: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 8"/>',
    src: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    left: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>', center: '<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>', right: '<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>',
    justify: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>', strike: '<path d="M5 12h14"/><path d="M16 6.5C15 5 13.6 4.5 12 4.5c-2.5 0-4 1.3-4 3 0 1.3.8 2.2 2.5 2.8M8 17.5c1 1.4 2.4 2 4 2 2.6 0 4.2-1.3 4.2-3.2 0-.8-.3-1.5-.9-2"/>',
    color: '<path d="m7 16 5-12 5 12M9 11.5h6"/><path d="M4 20h16" stroke-width="3" stroke="#3278BD"/>', mark: '<path d="m9 11-4 4v3h3l4-4M14 6l4 4M8 15l7-7 3 3-7 7"/><path d="M3 21h8" stroke-width="3" stroke="#F2C94C"/>',
    outdent: '<path d="M21 6H11M21 12H11M21 18H11M7 9l-3 3 3 3"/>', indent: '<path d="M21 6H11M21 12H11M21 18H11M4 9l3 3-3 3"/>', hr: '<path d="M3 12h18"/><path d="M8 6h8M8 18h8" opacity=".45"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/>', full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', keys: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>'
  };
  const TB_TITLE = { bold: 'Bold (Ctrl+B)', italic: 'Italic (Ctrl+I)', underline: 'Underline (Ctrl+U)', link: 'Link (Ctrl+K): select words, then press', unlink: 'Remove the link', undo: 'Undo (Ctrl+Z)', redo: 'Redo (Ctrl+Y)',
    clear: 'Remove the formatting of the selected words (Ctrl+\\)', ul: 'Bullet list (Ctrl+Shift+8)', ol: 'Numbered list (Ctrl+Shift+7)', h2: 'Heading (Ctrl+Alt+2)', h3: 'Small heading (Ctrl+Alt+3)', p: 'Normal text (Ctrl+Alt+0)', quote: 'Quote', img: 'Add a photo', src: 'Show the HTML code',
    left: 'Align left (Ctrl+Shift+L)', center: 'Align centre (Ctrl+Shift+E)', right: 'Align right (Ctrl+Shift+R)', justify: 'Justify (Ctrl+Shift+J)', keys: 'Keyboard shortcuts', strike: 'Strikethrough (Ctrl+Shift+X)', color: 'Text colour', mark: 'Highlight the selected words',
    outdent: 'Move out (Shift+Tab in a list)', indent: 'Move in (Tab in a list)', hr: 'Divider line', table: 'Add a table', full: 'Full screen (Esc to leave)' };
  // (2 Nov 2026, client) the keyboard shortcuts of the text editor, as in Word
  const KEYS = [['Ctrl+B', 'Bold'], ['Ctrl+I', 'Italic'], ['Ctrl+U', 'Underline'], ['Ctrl+K', 'Link'], ['Ctrl+Shift+L / E / R / J', 'Align left / centre / right / justify'],
    ['Ctrl+Shift+8', 'Bullet list'], ['Ctrl+Shift+7', 'Numbered list'], ['Tab / Shift+Tab', 'In a list: move the point in / out'], ['Ctrl+Alt+2 / 3', 'Heading / small heading'], ['Ctrl+Alt+0', 'Normal text'],
    ['Ctrl+Shift+X', 'Strikethrough'], ['Ctrl+Alt+1 / 4', 'Heading 1 / heading 4'], ['Ctrl+\\', 'Remove the formatting'], ['Ctrl+Z / Ctrl+Y', 'Undo / redo'], ['Ctrl+S', 'Save draft']];
  const keyHelp = () => A.dialog({ title: 'Keyboard shortcuts', ok: 'OK', cancel: false, html: '<table class="kb-t">' + KEYS.map(([k, w]) => '<tr><td><kbd>' + A.esc(k).split(' / ').join('</kbd> / <kbd>') + '</kbd></td><td>' + A.esc(w) + '</td></tr>').join('') + '</table><p class="hint">On a Mac use ⌘ instead of Ctrl.</p>' });
  // the shortcut a key press asks for (or '')
  const keyCmd = e => {
    if (!(e.ctrlKey || e.metaKey)) return '';
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key, c = e.code || '';
    if (e.altKey && !e.shiftKey) return { Digit1: 'h1', Digit2: 'h2', Digit3: 'h3', Digit4: 'h4', Digit0: 'p' }[c] || '';
    if (e.shiftKey) return { KeyL: 'left', KeyE: 'center', KeyR: 'right', KeyJ: 'justify', Digit8: 'ul', Digit7: 'ol', KeyX: 'strike' }[c] || '';
    return { b: 'bold', i: 'italic', u: 'underline', k: 'link', '\\': 'clear' }[k] || '';
  };
  // a toolbar: groups of buttons, separated by thin lines
  function toolbar(groups) {
    const bar = document.createElement('div'); bar.className = 'tb';
    bar.innerHTML = groups.map(g => '<span class="tb-g">' + g.map(c => '<button type="button" data-c="' + c + '" title="' + TB_TITLE[c] + '" aria-label="' + TB_TITLE[c] + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + TB_ICON[c] + '</svg></button>').join('') + '</span>').join('');
    bar.onmousedown = e => { if (e.target.closest('button')) e.preventDefault(); };   // keep the selection in the text
    return bar;
  }
  const tbState = (bar, ed) => {   // light up B / I / U, the lists, the alignment and the kind of line where the cursor is
    const ST = { bold: 'bold', italic: 'italic', underline: 'underline', ul: 'insertUnorderedList', ol: 'insertOrderedList', left: 'justifyLeft', center: 'justifyCenter', right: 'justifyRight', justify: 'justifyFull' };
    const upd = () => {
      const sel = document.getSelection(); if (!sel.anchorNode || !ed.contains(sel.anchorNode)) return;
      Object.entries(ST).forEach(([c, q]) => { const b = bar.querySelector('[data-c="' + c + '"]'); if (b) { let on = false; try { on = document.queryCommandState(q); } catch (e) {} b.classList.toggle('on', on); } });
      let blk = ''; try { blk = String(document.queryCommandValue('formatBlock') || '').toLowerCase(); } catch (e) {}
      ['h2', 'h3', 'quote'].forEach(c => { const b = bar.querySelector('[data-c="' + c + '"]'); if (b) b.classList.toggle('on', blk === (c === 'quote' ? 'blockquote' : c)); });
      const lk = bar.querySelector('[data-c="link"]'); if (lk) { const n = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentNode; lk.classList.toggle('on', !!(n && n.closest && n.closest('a') && ed.contains(n.closest('a')))); }
    };
    document.addEventListener('selectionchange', upd);
    ed.addEventListener('keyup', upd); ed.addEventListener('mouseup', upd);
    return upd;
  };
  // (2 Nov 2026, client) the link popup: the search, the website's pages and the address in the popup itself (no list
  // floating over it), ready at once; click a page to pick it, double-click to add it straight away
  const askLink = async (current, words, tab) => {
    const box = await A.dialog({ title: current ? 'Change the link' : 'Add a link', ok: current ? 'Save link' : 'Add link',
      html: (words ? '<p class="lk-words">Words: <b>' + A.esc(words.slice(0, 80)) + '</b></p>' : '') +
        '<label class="lb">Search a page of this website</label><input class="in" type="search" data-q placeholder="e.g. Rajasthan, Golden Triangle, visa" autocomplete="off">' +
        '<div class="subtabs lk-tabs">' + LK.map(([k, l], i) => '<button type="button" data-k="' + k + '"' + (i ? '' : ' class="on"') + '>' + l + '</button>').join('') + '</div>' +
        '<div class="lk-list lk-dlg" role="listbox"><p class="hint" style="padding:10px">Loading the pages…</p></div>' +
        '<label class="lb" style="margin-top:12px">Link to</label><input class="in" data-l placeholder="Pick a page above, or paste an address: https://…" autocomplete="off"><p class="lk-picked hint"></p>' +
        (tab === undefined ? '' : '<label class="lk-tab"><input type="checkbox" data-tab' + (tab ? ' checked' : '') + '><span>Open the link in a new tab</span></label>'),
      onOpen: b => {
        const q = b.querySelector('[data-q]'), l = b.querySelector('[data-l]'), list = b.querySelector('.lk-list'), picked = b.querySelector('.lk-picked');
        let k = '', items = [];
        l.value = current || '';
        const name = () => { const v = l.value.trim(), it = items.find(x => x.url === v); picked.innerHTML = !v ? '' : it ? 'Opens: <b>' + A.esc(lkName(it)) + '</b>' : /^https?:/.test(v) ? 'Opens another website' : ''; };
        const draw = () => {
          const v = q.value.trim().toLowerCase();
          const hit = items.filter(it => (!k || lkKind(it) === k) && (!v || (it.name + ' ' + it.url).toLowerCase().includes(v))).slice(0, 120);
          list.innerHTML = hit.map(it => '<button type="button" role="option" data-u="' + A.esc(it.url) + '"' + (it.url === l.value.trim() ? ' class="on"' : '') + '><b>' + A.esc(lkName(it)) + '</b><small>' + A.esc(it.url) + '</small></button>').join('') || '<p class="hint" style="padding:10px">No page found. You can paste the address in “Link to”.</p>';
          name();
        };
        b.querySelectorAll('[data-k]').forEach(t => t.onclick = () => { k = t.dataset.k; b.querySelectorAll('[data-k]').forEach(x => x.classList.toggle('on', x === t)); draw(); });
        list.onclick = e => { const it = e.target.closest('[data-u]'); if (!it) return; l.value = it.dataset.u; list.querySelectorAll('[data-u]').forEach(x => x.classList.toggle('on', x === it)); name(); };
        list.ondblclick = e => { if (e.target.closest('[data-u]')) b.querySelector('[data-ok]').click(); };
        q.oninput = draw; l.oninput = name;
        // Enter in the search picks the first page (a second Enter adds the link)
        q.addEventListener('keydown', e => { if (e.key === 'Enter' && !l.value.trim()) { const f = list.querySelector('[data-u]'); if (f) { e.preventDefault(); e.stopPropagation(); f.click(); } } });
        loadLinks().then(x => { items = x; draw(); });
        setTimeout(() => q.focus(), 0);
      },
      validate: b => b.querySelector('[data-l]').value.trim() ? '' : 'Pick a page in the list, or paste an address.' });
    if (!box) return tab === undefined ? '' : null;
    const url = box.querySelector('[data-l]').value.trim();
    return tab === undefined ? url : { url, tab: box.querySelector('[data-tab]').checked };
  };
  // the link around the cursor (or the selection), inside the editor
  const linkAt = ed => { const s = getSelection(); if (!s.rangeCount) return null; const n = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentNode); const a = n && n.closest && n.closest('a'); return a && ed.contains(a) ? a : null; };

  let linkIndex = null;
  const loadLinks = () => linkIndex || (linkIndex = A.api('GET', '/admin/api/link-index').then(r => r.items || []).catch(() => []));
  setTimeout(loadLinks, 400);   // ready before the first link popup opens
  const LK = [['', 'All'], ['main', 'Main pages'], ['Category', 'Categories'], ['Tour', 'Tours'], ['Page', 'Pages']];
  const lkKind = it => (/^(Category|Tour|Page|Blog): /.exec(it.name) || [, 'main'])[1];
  const lkName = it => it.name.replace(/^(Category|Tour|Page|Blog): /, '');
  // a simple word processor for page text (HTML), with a switch to edit the HTML itself
  // a page's whole text (HTML): the same toolbar, plus headings, lists, quote, photo and the HTML code
  // (2 Nov 2026, client) a full word processor, as in WordPress: the kind of line (paragraph, H1–H4), size, bold, italic,
  // underline, strikethrough, colour, highlight, alignment, lists and indents, quote, divider, table, links (in a new tab
  // if wanted), photos, line spacing, undo / redo, clear formatting, the HTML code and a full-screen mode
  const BLOCKS = [['P', 'Paragraph'], ['H1', 'Heading 1'], ['H2', 'Heading 2'], ['H3', 'Heading 3'], ['H4', 'Heading 4']];
  const SIZES = [['', 'Size'], ['2', 'Small'], ['3', 'Normal'], ['4', 'Large'], ['5', 'Larger'], ['6', 'Huge']];
  const SPACING = [['', 'Line spacing'], ['1.4', 'Single'], ['1.8', '1.5 lines'], ['2.2', 'Double']];
  function rte(html, opts) {
    opts = opts || {};
    const el = document.createElement('div'); el.className = 'rt rt-full' + (opts.list ? ' rt-list' : '');
    const bar = toolbar([['bold', 'italic', 'underline', 'strike'], ['color', 'mark'], ['left', 'center', 'right', 'justify'], ['ul', 'ol', 'outdent', 'indent'], ['quote', 'hr', 'table'], ['link', 'unlink', 'img'], ['undo', 'redo', 'clear'], ['src', 'full', 'keys']]);
    const sel = (cls, opts, title) => '<select class="tb-sel ' + cls + '" title="' + title + '" aria-label="' + title + '">' + opts.map(([v, l]) => '<option value="' + v + '">' + l + '</option>').join('') + '</select>';
    bar.insertAdjacentHTML('afterbegin', '<span class="tb-g">' + sel('tb-block', BLOCKS, 'Kind of line (paragraph or heading)') + sel('tb-size', SIZES, 'Text size') + sel('tb-space', SPACING, 'Line spacing') + '</span>');
    bar.insertAdjacentHTML('beforeend', '<input type="color" class="tb-pick" data-pick="fore" value="#3278BD" tabindex="-1" aria-hidden="true">');
    const ed = document.createElement('div'); ed.className = 'rte'; ed.contentEditable = 'true';
    const raw = document.createElement('textarea'); raw.className = 'in rte-src'; raw.rows = 18; raw.hidden = true;
    el.append(bar, ed, raw);
    // (4 Nov 2026, site check) photos imported with an address without its leading "/" ("images/delhi-state.webp") point
    // from the site's root, as the website reads them — not from the panel's page (where they did not load)
    html = String(html == null ? '' : html).replace(/(<img\b[^>]*\bsrc=")(?!\/|https?:|data:|blob:)([^"]+")/gi, '$1/$2');
    ed.innerHTML = html; ed.oninput = () => touch(); raw.oninput = () => touch();
    // a list of points: the text is always one bulleted list (Enter makes the next point)
    if (opts.list) {
      const keepList = () => { if (!ed.querySelector('ul,ol')) { const t = ed.innerHTML.trim(); ed.innerHTML = '<ul><li>' + (t && !/^<(p|div|br)/i.test(t) ? t : '<br>') + '</li></ul>'; } };
      if (!/<li[\s>]/i.test(html || '')) ed.innerHTML = '<ul>' + (String(html || '').trim() ? '<li>' + html + '</li>' : '<li><br></li>') + '</ul>';
      ed.addEventListener('input', keepList); ed.addEventListener('blur', keepList);
    }
    if (opts.min) ed.style.minHeight = opts.min + 'px';
    const stBase = tbState(bar, ed), blockSel = bar.querySelector('.tb-block');
    const st = () => { stBase(); let v = ''; try { v = String(document.queryCommandValue('formatBlock') || '').toUpperCase(); } catch (e) {} blockSel.value = /^H[1-4]$/.test(v) ? v : 'P'; let x = false; try { x = document.queryCommandState('strikeThrough'); } catch (e) {} const sb = bar.querySelector('[data-c="strike"]'); if (sb) sb.classList.toggle('on', x); };
    document.addEventListener('selectionchange', () => { if (ed.contains((getSelection() || {}).anchorNode)) st(); });
    let saved = null;   // the selection, kept while a menu of the toolbar has the focus
    const keep = () => { const s = getSelection(); if (s.rangeCount && ed.contains(s.anchorNode)) saved = s.getRangeAt(0).cloneRange(); };
    const back = () => { ed.focus(); if (saved) { const s = getSelection(); s.removeAllRanges(); s.addRange(saved); } };
    ed.addEventListener('keyup', keep); ed.addEventListener('mouseup', keep); ed.addEventListener('blur', keep);
    const cmd = (c, v, css) => { back(); if (css) document.execCommand('styleWithCSS', false, true); document.execCommand(c, false, v); if (css) document.execCommand('styleWithCSS', false, false); keep(); touch(); setTimeout(st, 0); };
    // the blocks (paragraphs, headings, points) the selection touches
    const blocksIn = () => { const s = getSelection(); if (!s.rangeCount) return []; const r = s.getRangeAt(0); const out = [...ed.querySelectorAll('p,h1,h2,h3,h4,li,blockquote,div:not(.rte-cards)')].filter(n => r.intersectsNode(n) && !n.querySelector('p,h1,h2,h3,h4,li')); if (!out.length) { const n = r.startContainer.nodeType === 1 ? r.startContainer : r.startContainer.parentNode; const b = n.closest && n.closest('p,h1,h2,h3,h4,li,blockquote'); if (b && ed.contains(b)) out.push(b); } return out; };
    blockSel.onchange = () => { cmd('formatBlock', blockSel.value); };
    bar.querySelector('.tb-size').onchange = e => { const v = e.target.value; e.target.value = ''; if (v) cmd('fontSize', v, true); };
    bar.querySelector('.tb-space').onchange = e => { const v = e.target.value; e.target.value = ''; back(); const bs = blocksIn(); if (!bs.length) return A.toast('Put the cursor in the text first'); bs.forEach(n => { n.style.lineHeight = v; }); touch(); };
    const pick = bar.querySelector('[data-pick]');
    pick.oninput = () => cmd(pick.dataset.pick === 'fore' ? 'foreColor' : 'hiliteColor', pick.value, true);
    // (2 Nov 2026, client) the shortcuts work as in Word, and Tab moves a point of a list in or out (else it adds a space)
    ed.addEventListener('keydown', e => {
      if (e.key === 'Tab' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        const s = getSelection(), n = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentNode);
        if (n && n.closest('li')) cmd(e.shiftKey ? 'outdent' : 'indent'); else if (!e.shiftKey) cmd('insertText', '    ');
        return;
      }
      if (e.key === 'Escape' && el.classList.contains('rt-fs')) { el.classList.remove('rt-fs'); document.body.classList.remove('rt-fs-on'); return; }
      const c = keyCmd(e); if (!c) return;
      e.preventDefault(); keep();
      if (/^h[1-4]$|^p$/.test(c)) { blockSel.value = c.toUpperCase(); blockSel.onchange(); return; }
      const b = bar.querySelector('[data-c="' + c + '"]'); if (b) b.click();
    });
    const unmark = imageBar(ed), untable = tableBar(ed, () => touch());
    bar.onclick = async e => {
      const b = e.target.closest('button'); if (!b) return;
      const c = b.dataset.c;
      if (c === 'src') { if (raw.hidden) { untable(); unmark(); raw.value = ed.innerHTML; raw.hidden = false; ed.hidden = true; b.classList.add('on'); } else { ed.innerHTML = raw.value; raw.hidden = true; ed.hidden = false; b.classList.remove('on'); } return; }
      if (c === 'full') { const on = el.classList.toggle('rt-fs'); document.body.classList.toggle('rt-fs-on', on); b.classList.toggle('on', on); b.title = on ? 'Leave full screen (Esc)' : TB_TITLE.full; return; }
      if (c === 'keys') return keyHelp();
      if (!raw.hidden) return A.toast('Press the </> button again to go back to the normal view');
      if (['bold', 'italic', 'underline', 'unlink', 'undo', 'redo', 'indent', 'outdent'].includes(c)) cmd(c);
      else if (c === 'strike') cmd('strikeThrough');
      else if (c === 'left' || c === 'center' || c === 'right') cmd('justify' + c[0].toUpperCase() + c.slice(1));
      else if (c === 'justify') cmd('justifyFull');
      else if (c === 'clear') { cmd('removeFormat'); blocksIn().forEach(n => { n.style.lineHeight = ''; if (!n.getAttribute('style')) n.removeAttribute('style'); }); }
      else if (c === 'h2' || c === 'h3' || c === 'p') cmd('formatBlock', c.toUpperCase());
      else if (c === 'quote') cmd('formatBlock', 'BLOCKQUOTE');
      else if (c === 'ul') cmd('insertUnorderedList');
      else if (c === 'ol') cmd('insertOrderedList');
      else if (c === 'hr') cmd('insertHorizontalRule');
      else if (c === 'color') { keep(); pick.dataset.pick = 'fore'; pick.value = '#3278BD'; pick.click(); }
      else if (c === 'mark') { keep(); const s = getSelection(); if (!s.rangeCount || s.isCollapsed) return A.toast('First select the words to highlight'); cmd('hiliteColor', '#FFF1A8', true); }
      else if (c === 'table') {
        keep();
        const box = await A.dialog({ title: 'Add a table', ok: 'Add table', html: '<div class="u-row"><div class="f"><label class="lb">Rows</label><input class="in" type="number" min="1" max="30" value="3" data-r></div><div class="f"><label class="lb">Columns</label><input class="in" type="number" min="1" max="8" value="3" data-c></div></div><label class="f-chk f"><input type="checkbox" data-h checked><span>The first row is a heading row</span></label>' });
        if (!box) return;
        const r = Math.max(1, Math.min(30, +box.querySelector('[data-r]').value || 3)), n = Math.max(1, Math.min(8, +box.querySelector('[data-c]').value || 3)), head = box.querySelector('[data-h]').checked;
        const row = tag => '<tr>' + Array(n).fill('<' + tag + '><br></' + tag + '>').join('') + '</tr>';
        cmd('insertHTML', '<table class="rte-table">' + (head ? '<thead>' + row('th') + '</thead>' : '') + '<tbody>' + Array(head ? Math.max(1, r - 1) : r).fill(row('td')).join('') + '</tbody></table><p><br></p>');
      }
      else if (c === 'link') {
        const a = linkAt(ed);
        if (a) { const r = await askLink(a.getAttribute('href') || '', a.textContent, a.target === '_blank'); if (r) { a.setAttribute('href', r.url); if (r.tab) { a.target = '_blank'; a.rel = 'noopener'; } else { a.removeAttribute('target'); a.removeAttribute('rel'); } touch(); } return; }
        const s = window.getSelection(), range = s.rangeCount ? s.getRangeAt(0).cloneRange() : null;
        if (!range || range.collapsed || !ed.contains(range.commonAncestorContainer)) return A.toast('First select the words to turn into a link');
        const r = await askLink('', range.toString(), false);
        if (r) { ed.focus(); s.removeAllRanges(); s.addRange(range); cmd('createLink', r.url); const na = linkAt(ed) || [...ed.querySelectorAll('a')].find(x => x.getAttribute('href') === r.url); if (na && r.tab) { na.target = '_blank'; na.rel = 'noopener'; } }
      }
      else if (c === 'img') { const s = window.getSelection(), range = s.rangeCount && ed.contains(s.anchorNode) ? s.getRangeAt(0).cloneRange() : null; const src = await A.pickImage(); if (src) { ed.focus(); if (range) { s.removeAllRanges(); s.addRange(range); } cmd('insertHTML', '<img src="' + A.esc(src) + '" alt="" class="im-full">'); } }
    };
    const html_ = () => { unmark(); untable(); return (raw.hidden ? ed.innerHTML : raw.value).trim(); };
    // the points of a list: the html of each point, empty ones left out
    const points = () => { const t = document.createElement('div'); t.innerHTML = html_(); return [...t.querySelectorAll('li')].map(li => li.innerHTML.replace(/<br\s*\/?>\s*$/i, '').trim()).filter(x => x.replace(/<[^>]+>|&nbsp;/g, '').trim()); };
    return { el, get: opts.list ? points : html_, html: html_ };
  }
  // (2 Nov 2026, client) a table in the text: with the cursor in a cell, a small bar adds or takes out rows and columns
  function tableBar(ed, changed) {
    const bar = document.createElement('div'); bar.className = 'im-bar tb-tbl'; bar.hidden = true;
    bar.innerHTML = '<span class="im-g"><em>Row</em><button type="button" data-t="ra">+ Above</button><button type="button" data-t="rb">+ Below</button><button type="button" data-t="rx" class="x">Remove</button></span>' +
      '<span class="im-g"><em>Column</em><button type="button" data-t="cl">+ Left</button><button type="button" data-t="cr">+ Right</button><button type="button" data-t="cx" class="x">Remove</button></span>' +
      '<span class="im-g"><button type="button" data-t="tx" class="x">Delete table</button></span>';
    document.body.appendChild(bar);
    let cell = null;
    const place = () => { const t = cell && cell.isConnected && cell.closest('table'); if (!t) { bar.hidden = true; return; } const r = t.getBoundingClientRect(); bar.style.top = Math.max(8, r.top + scrollY - bar.offsetHeight - 6) + 'px'; bar.style.left = Math.max(8, Math.min(r.left + scrollX, scrollX + innerWidth - bar.offsetWidth - 8)) + 'px'; };
    const check = () => { const s = getSelection(), n = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentNode), c = n && n.closest && n.closest('td,th'); if (c && ed.contains(c)) { cell = c; bar.hidden = false; place(); } else if (!bar.contains(document.activeElement)) { cell = null; bar.hidden = true; } };
    document.addEventListener('selectionchange', check);
    addEventListener('scroll', place, true); addEventListener('resize', place);
    bar.onmousedown = e => e.preventDefault();
    bar.onclick = e => {
      const b = e.target.closest('[data-t]'); if (!b || !cell) return;
      const tr = cell.parentNode, table = cell.closest('table'), i = [...tr.children].indexOf(cell), t = b.dataset.t;
      const blankRow = like => { const r = document.createElement('tr'); [...like.children].forEach(() => { const c = document.createElement('td'); c.innerHTML = '<br>'; r.appendChild(c); }); return r; };
      if (t === 'ra' || t === 'rb') { const r = blankRow(tr); if (tr.parentNode.tagName === 'THEAD') { const tb = table.tBodies[0] || table.appendChild(document.createElement('tbody')); tb.prepend(r); } else tr.parentNode.insertBefore(r, t === 'ra' ? tr : tr.nextSibling); }
      else if (t === 'rx') { const next = tr.nextElementSibling || tr.previousElementSibling; tr.remove(); if (!table.querySelector('tr')) table.remove(); cell = next ? next.children[Math.min(i, next.children.length - 1)] : null; }
      else if (t === 'cl' || t === 'cr') table.querySelectorAll('tr').forEach(r => { const ref = r.children[i], c = document.createElement(ref && ref.tagName === 'TH' ? 'th' : 'td'); c.innerHTML = '<br>'; r.insertBefore(c, t === 'cl' ? ref : ref ? ref.nextSibling : null); });
      else if (t === 'cx') { table.querySelectorAll('tr').forEach(r => { if (r.children[i]) r.children[i].remove(); }); if (!table.querySelector('td,th')) table.remove(); cell = null; }
      else if (t === 'tx') { table.remove(); cell = null; }
      changed(); if (!cell || !cell.isConnected) bar.hidden = true; else place();
    };
    return () => {};
  }

  // (2 Nov 2026, client) a photo in the page text: click it for its own small bar — where it sits (left with the text
  // around it, centre, right, full width), its size, its description, change it or take it out
  const IM_POS = [['im-left', 'Left'], ['im-center', 'Centre'], ['im-right', 'Right'], ['im-full', 'Full width']], IM_SIZE = [['33', 'S'], ['50', 'M'], ['75', 'L'], ['', 'Auto']];
  function imageBar(ed) {
    const bar = document.createElement('div'); bar.className = 'im-bar'; bar.hidden = true;
    bar.innerHTML = '<span class="im-g">' + IM_POS.map(([c, l]) => '<button type="button" data-pos="' + c + '">' + l + '</button>').join('') + '</span>' +
      '<span class="im-g"><em>Size</em>' + IM_SIZE.map(([w, l]) => '<button type="button" data-w="' + w + '" title="' + (w ? w + '% of the text width' : 'its own size') + '">' + l + '</button>').join('') + '</span>' +
      '<span class="im-g"><button type="button" data-alt>Description</button><button type="button" data-swap>Change</button><button type="button" data-rm class="x">Remove</button></span>';
    document.body.appendChild(bar);
    let img = null;
    const place = () => { if (!img || !img.isConnected) { bar.hidden = true; return; } const r = img.getBoundingClientRect(); bar.style.top = Math.max(8, r.top + scrollY - bar.offsetHeight - 6) + 'px'; bar.style.left = Math.max(8, Math.min(r.left + scrollX, scrollX + innerWidth - bar.offsetWidth - 8)) + 'px'; };
    const mark = () => {
      if (!img) return;
      bar.querySelectorAll('[data-pos]').forEach(b => b.classList.toggle('on', img.classList.contains(b.dataset.pos)));
      const w = (/(\d+)%/.exec(img.style.width || '') || [])[1] || ''; bar.querySelectorAll('[data-w]').forEach(b => b.classList.toggle('on', b.dataset.w === w));
    };
    const pickImg = el => { ed.querySelectorAll('img.im-sel').forEach(x => x.classList.remove('im-sel')); img = el; if (el) { el.classList.add('im-sel'); bar.hidden = false; mark(); place(); } else bar.hidden = true; };
    ed.addEventListener('click', e => pickImg(e.target.tagName === 'IMG' ? e.target : null));
    document.addEventListener('mousedown', e => { if (img && !bar.contains(e.target) && e.target !== img) pickImg(null); });
    addEventListener('scroll', place, true); addEventListener('resize', place);
    bar.onmousedown = e => e.preventDefault();
    bar.onclick = async e => {
      const b = e.target.closest('button'); if (!b || !img) return;
      if (b.dataset.pos) { IM_POS.forEach(([c]) => img.classList.remove(c)); img.classList.add(b.dataset.pos); }
      else if (b.dataset.w !== undefined) { img.style.width = b.dataset.w ? b.dataset.w + '%' : ''; img.style.height = ''; img.removeAttribute('width'); img.removeAttribute('height'); if (!img.getAttribute('style')) img.removeAttribute('style'); }
      else if (b.hasAttribute('data-alt')) { const box = await A.dialog({ title: 'Photo description', ok: 'Save', html: '<label class="lb">What the photo shows (for Google and for blind readers)</label><input class="in" data-a>', onOpen: x => { x.querySelector('[data-a]').value = img.getAttribute('alt') || ''; } }); if (box) img.setAttribute('alt', box.querySelector('[data-a]').value.trim()); }
      else if (b.hasAttribute('data-swap')) { const src = await A.pickImage(); if (src) img.setAttribute('src', src); }
      else if (b.hasAttribute('data-rm')) { img.remove(); pickImg(null); touch(); return; }
      touch(); mark(); setTimeout(place, 30);
    };
    // the "selected" mark never goes into the saved text
    return () => ed.querySelectorAll('img.im-sel').forEach(x => { x.classList.remove('im-sel'); if (!x.className) x.removeAttribute('class'); });
  }


  // a point (html) as the website's pieces of text: [{ text, bold, italic?, underline?, href? }]
  const segs = html => {
    const t = document.createElement('div'); t.innerHTML = html; const out = [];
    const walk = (n, st) => n.childNodes.forEach(c => {
      if (c.nodeType === 3) { if (!c.textContent) return; const x = { text: c.textContent, bold: !!st.b }; if (st.i) x.italic = true; if (st.u) x.underline = true; if (st.a) x.href = st.a; const l = out[out.length - 1]; if (l && l.bold === x.bold && !!l.italic === !!x.italic && !!l.underline === !!x.underline && (l.href || '') === (x.href || '')) l.text += x.text; else out.push(x); return; }
      if (c.nodeType !== 1) return; const nm = c.nodeName;
      walk(c, { b: st.b || /^(B|STRONG)$/.test(nm) || +c.style.fontWeight >= 600, i: st.i || /^(I|EM)$/.test(nm), u: st.u || nm === 'U', a: nm === 'A' ? c.getAttribute('href') : st.a });
    });
    walk(t, {}); if (out.length) { out[0].text = out[0].text.replace(/^\s+/, ''); out[out.length - 1].text = out[out.length - 1].text.replace(/\s+$/, ''); }
    return out.filter(x => x.text);
  };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const segHtml = it => (Array.isArray(it) ? it : [{ text: String(it || '') }]).map(x => { let h = esc(x.text || ''); if (x.italic) h = '<i>' + h + '</i>'; if (x.underline) h = '<u>' + h + '</u>'; if (x.bold) h = '<b>' + h + '</b>'; if (x.href) h = '<a href="' + esc(x.href) + '">' + h + '</a>'; return h; }).join('');
  window.MKRTE = { setTouch: f => { touch = f; }, rte, toolbar, tbState, keyCmd, askLink, linkAt, loadLinks, LK, lkKind, lkName, TB_TITLE, keyHelp, segs, segHtml };
})();
