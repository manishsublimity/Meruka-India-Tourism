// Put the blog posts into MySQL (5 Nov 2026, client: "all the data should be in SQL").
//   npm run db:blog
// Each data/posts/<id>.js goes into the cms_items table, like a post added in the admin panel. From then on MySQL is the
// source: at start-up the site writes the file back from the table (lib/db writeItemFiles), and deleting the post in the
// panel removes it from the table. A post already in the table is left as it is. Restart the site afterwards.
const fs = require('fs');
const path = require('path');
const db = require('../lib/db');

(async () => {
  await db.init();
  const dir = path.join(__dirname, '..', 'data', 'posts');
  const done = [], kept = [];
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.js'))) {
    const id = f.slice(0, -3);
    if (db.items.has('posts', id)) { kept.push(id); continue; }
    db.items.put('posts', id, fs.readFileSync(path.join(dir, f), 'utf8'));
    done.push(id);
  }
  await db.flush();
  await db.close();
  console.log('Put in MySQL: ' + (done.join(', ') || 'none') + (kept.length ? ' · already there: ' + kept.join(', ') : ''));
})().catch(e => { console.error('Failed:', e.message); process.exit(1); });
