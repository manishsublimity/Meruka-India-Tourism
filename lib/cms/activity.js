// Activity log (23 Oct 2026): who changed what in the admin panel, and when. (5 Nov 2026) MySQL table activity_log,
// newest last, the latest 2000 entries kept.
const db = require('../db');
const read = () => db.activity.all();

// log(user, 'Published', 'Golden Triangle Tour', '/admin/tours/golden_triangle_packages')
function log(user, action, what, link) {
  db.activity.add({ at: new Date().toISOString(), by: user ? user.name : 'Someone', byId: user ? user.id : '', action, what: String(what || ''), link: link || '' });
}
// newest first
const recent = (n, filter) => read().reverse().filter(filter || (() => true)).slice(0, n || 50);

module.exports = { log, recent };
