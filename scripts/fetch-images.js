// Downloads every india-tourism.net image the site uses into public/images, so pages never load
// images from the live site. Safe to re-run: existing files are skipped.
//
//   node scripts/fetch-images.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'images');
const DATA = path.join(ROOT, 'data');

const wanted = new Set();
const add = p => {
  if (!p || /^https?:/i.test(p) && !/india-tourism\.net/i.test(p)) return;
  const rel = p.replace(/^https?:\/\/(www\.)?india-tourism\.net/i, '').replace(/^\/+/, '').replace(/^images\//, '');
  if (rel && !/^assets\//.test(rel)) wanted.add(rel.split('?')[0]);
};

const modules = ['contact.js', 'about.js', 'listings.js'].map(f => path.join(DATA, f));
for (const dir of ['tours', 'tour-lists', 'articles']) {
  const full = path.join(DATA, dir);
  if (fs.existsSync(full)) fs.readdirSync(full).filter(f => f.endsWith('.js')).forEach(f => modules.push(path.join(full, f)));
}
for (const m of modules) {
  const text = JSON.stringify(require(m));
  for (const x of text.matchAll(/"\/images\/([^"]+)"/g)) add(x[1]);                 // heroSrc, IMG(...)
  for (const x of text.matchAll(/src=\\"([^"\\]+)\\"/g)) add(x[1]);                 // images inside article HTML
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let got = 0, had = 0;
  const failed = [];
  const list = [...wanted];
  for (let i = 0; i < list.length; i += 8) {
    await Promise.all(list.slice(i, i + 8).map(async rel => {
      const dest = path.join(OUT, rel);
      if (fs.existsSync(dest)) { had++; return; }
      try {
        const r = await fetch('https://india-tourism.net/images/' + rel.split('/').map(encodeURIComponent).join('/'));
        if (r.status !== 200) throw new Error('HTTP ' + r.status);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
        got++;
      } catch (e) { failed.push(rel + ' (' + e.message + ')'); }
    }));
  }
  console.log(`images: ${list.length} used, ${got} downloaded, ${had} already here, ${failed.length} failed`);
  if (failed.length) console.log('  ' + failed.join('\n  '));
})();
