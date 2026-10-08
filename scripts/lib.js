// Helpers shared by the scripts/import-*.js importers.
const fs = require('fs');
const path = require('path');

const dec = s => s
  .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&#039;/g, "'").replace(/&#8217;|&rsquo;/g, '’')
  .replace(/&#8216;|&lsquo;/g, '‘').replace(/&#8220;|&ldquo;/g, '“').replace(/&#8221;|&rdquo;/g, '”').replace(/&#8211;|&ndash;/g, '–')
  .replace(/&#8212;|&mdash;/g, '—').replace(/&#160;/g, ' ').replace(/&amp;/g, '&');
const ws = s => s.replace(/\s+/g, ' ');
const txt = s => ws(dec(String(s).replace(/<[^>]+>/g, ''))).trim();

// Text with bold parts kept, as [{ text, bold }]
const seg = html => {
  const out = [];
  html.trim().split(/(<(?:strong|b)>[\s\S]*?<\/(?:strong|b)>)/).forEach(p => {
    if (!p) return;
    const t = ws(dec(p.replace(/<[^>]+>/g, '')));
    if (t) out.push({ text: t, bold: /^<(strong|b)>/.test(p) });
  });
  if (out.length) { out[0].text = out[0].text.replace(/^ /, ''); out[out.length - 1].text = out[out.length - 1].text.replace(/ $/, ''); }
  return out;
};

const need = (m, what) => { if (!m) throw new Error('no ' + what); return m[1]; };
const meta = (h, n) => { const m = h.match(new RegExp('<meta name="' + n + '" content="([^"]*)"', 'i')); return m ? dec(m[1]) : ''; };

// Page-level pieces every original page has
function pageInfo(h) {
  const bc = need(h.match(/<div class="breadcrumb">[\s\S]*?<p>([\s\S]*?)<\/p>/), 'breadcrumb');
  const crumbs = bc.split(/\s+(?:>|&gt;)\s+/).map(c => {
    const a = c.match(/href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    return a ? { label: txt(a[2]), file: a[1] } : { label: txt(c) };
  }).filter(c => c.label);
  const hero = h.match(/id="innerpagetopimg"[\s\S]*?<img[^>]*src="([^"]+)"[^>]*?(?:alt="([^"]*)")?/);
  const title = h.match(/<title>([^<]*)<\/title>/i);
  const h1 = h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return {
    title: title ? txt(title[1]) : (h1 ? txt(h1[1]) : ''),
    description: meta(h, 'description'),
    keywords: meta(h, 'keywords'),
    breadcrumb: crumbs,
    breadcrumbText: txt(bc),
    heading: h1 ? txt(h1[1]) : '',
    hero: hero ? hero[1].replace(/^\/?images\//, '') : 'india-tours-main.jpg',
    heroAlt: hero && hero[2] ? dec(hero[2]) : ''
  };
}

// The page's main column, without the sidebar and the shared blocks below it
function mainColumn(h) {
  const a = h.indexOf('touritneraryblock');
  if (a < 0) throw new Error('no main column');
  let b = h.length;
  for (const t of ['touritneraryright', 'class="max-container"', 'class="cta-section"', 'class="specialdivider"', 'indiatourpack', 'class="row tourismguide"']) {
    const i = h.indexOf(t, a);
    if (i > 0 && i < b) b = i;
  }
  return h.slice(h.indexOf('>', a) + 1, b);
}

const J = v => JSON.stringify(v, null, 2).replace(/\n/g, '\n  ');
const crumbsJs = crumbs => crumbs.map(c => c.file
  ? `    { label: ${JSON.stringify(c.label)}, href: site.link(${JSON.stringify(c.file)}) }`
  : `    { label: ${JSON.stringify(c.label)} }`).join(',\n');

// CLI: node scripts/import-x.js [--dir folder] page.html ...
async function run(parseAndWrite) {
  const args = process.argv.slice(2);
  let dir = null;
  if (args[0] === '--dir') { dir = args[1]; args.splice(0, 2); }
  if (!args.length) { console.error('usage: node ' + path.basename(process.argv[1]) + ' [--dir folder] <page.html> ...'); process.exit(1); }
  let failed = 0;
  for (const file of args) {
    try {
      const html = dir ? fs.readFileSync(path.join(dir, file), 'utf8') : await (await fetch('https://india-tourism.net/' + file)).text();
      parseAndWrite(file, html);
    } catch (e) { failed++; console.error('FAILED ' + file + ': ' + e.message); }
  }
  if (failed) process.exit(1);
}

module.exports = { dec, ws, txt, seg, need, meta, pageInfo, mainColumn, J, crumbsJs, run };
