// Activity log (23 Oct 2026): who changed what in the admin panel, and when. data/activity.json (not in git), newest
// last, the latest 2000 entries kept.
const fs = require('fs');
const path = require('path');
const { DATA } = require('./hook');

const FILE = path.join(DATA, 'activity.json');
const MAX = 2000;
const read = () => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) { return []; } };

// log(user, 'Published', 'Golden Triangle Tour', '/admin/tours/golden_triangle_packages')
function log(user, action, what, link) {
  const list = read();
  list.push({ at: new Date().toISOString(), by: user ? user.name : 'Someone', byId: user ? user.id : '', action, what: String(what || ''), link: link || '' });
  fs.writeFileSync(FILE, JSON.stringify(list.slice(-MAX), null, 1) + '\n');
}
// newest first
const recent = (n, filter) => read().reverse().filter(filter || (() => true)).slice(0, n || 50);

module.exports = { log, recent };
