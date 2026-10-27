// Admin users and roles (23 Oct 2026). Each person has an own login (email + password) and a role that decides what they
// may do. Users live in data/users.json (not in git): passwords are kept only as salted scrypt hashes.
// The login in the .env file (ADMIN_USER / ADMIN_PASSWORD) always works as the main Owner, so the panel can never be
// locked out.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DATA } = require('./hook');

const FILE = path.join(DATA, 'users.json');

// what each role may do; '*' is everything
const ROLES = {
  owner: { label: 'Owner', help: 'Everything, including users, Google settings and contact details.', can: ['*'] },
  editor: { label: 'Editor', help: 'Tours, categories, pages, blog, reviews, header and footer: edit, publish and delete. Enquiries.',
    can: ['content', 'publish', 'delete', 'menus', 'reviews', 'enquiries'] },
  writer: { label: 'Writer', help: 'Writes and changes tours, pages and blog posts as drafts. An Owner or Editor publishes them.', can: ['content'] },
  sales: { label: 'Sales', help: 'Enquiries only: reads them, notes, status and who handles them.', can: ['enquiries'] }
};
// (26 Oct 2026, client) each thing a person may do, ticked one by one; a role is a ready-made set of ticks, and the ticks
// can be changed for one person (then their list is kept with them)
const PERMS = [
  ['content', 'Write and change tours, categories, pages and blog posts (as drafts)'],
  ['publish', 'Publish changes to the website'],
  ['delete', 'Delete tours, pages and posts'],
  ['menus', 'Header & footer menus'],
  ['reviews', 'Guest reviews'],
  ['enquiries', 'Enquiries: read them, notes, status, download'],
  ['settings', 'Site settings: contact details, social media, Google, Plan My Trip form'],
  ['users', 'Users, roles and the activity log']
];
const PERM_IDS = PERMS.map(p => p[0]);
const permsOf = user => {
  if (!user || !ROLES[user.role]) return [];
  if (ROLES[user.role].can.includes('*')) return PERM_IDS.slice();
  return Array.isArray(user.perms) ? user.perms.filter(p => PERM_IDS.includes(p)) : ROLES[user.role].can.slice();
};
const can = (user, perm) => !!user && !!ROLES[user.role] && (ROLES[user.role].can.includes('*') || permsOf(user).includes(perm));
const cleanPerms = (role, perms) => {
  if (!Array.isArray(perms) || !ROLES[role] || ROLES[role].can.includes('*')) return undefined;
  const list = PERM_IDS.filter(p => perms.includes(p));
  const def = ROLES[role].can;
  return list.length === def.length && list.every(p => def.includes(p)) ? undefined : list;   // same as the role: nothing to keep
};

const ENV_ID = 'owner';
// (26 Oct 2026) the main owner can choose the name shown in the panel (kept in data/owner-profile.json, not in git)
const PROFILE = path.join(DATA, 'owner-profile.json');
const ownerName = () => { try { return JSON.parse(fs.readFileSync(PROFILE, 'utf8')).name || ''; } catch (e) { return ''; } };
const envUser = () => { const u = { id: ENV_ID, name: ownerName() || process.env.ADMIN_NAME || 'Main owner', email: process.env.ADMIN_USER || 'admin', role: 'owner', active: true, env: true }; u.perms = permsOf(u); u.custom = false; return u; };

const read = () => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) { return []; } };
const write = list => fs.writeFileSync(FILE, JSON.stringify(list, null, 2) + '\n');
const hash = (password, salt) => crypto.scryptSync(String(password), salt, 64).toString('hex');
const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const publicOf = u => ({ id: u.id, name: u.name, email: u.email, role: u.role, perms: permsOf(u), custom: Array.isArray(u.perms), active: u.active !== false, env: !!u.env, createdAt: u.createdAt || '', lastLogin: u.lastLogin || '' });
const bad = (msg, status) => Object.assign(new Error(msg), { status: status || 400 });

function all() { return [envUser()].concat(read().map(publicOf)); }
function byId(id) {
  if (id === ENV_ID) return envUser();
  const u = read().find(x => x.id === id);
  return u && u.active !== false ? publicOf(u) : null;
}
// the login form: an email (or the .env user name) and a password → the user, or null
function login(email, password) {
  email = String(email || '').trim().toLowerCase();
  if (process.env.ADMIN_PASSWORD && same(email, String(process.env.ADMIN_USER || 'admin').toLowerCase()) && same(password, process.env.ADMIN_PASSWORD)) return envUser();
  const list = read(), u = list.find(x => x.email.toLowerCase() === email && x.active !== false);
  if (!u || !same(hash(password, u.salt), u.hash)) return null;
  u.lastLogin = new Date().toISOString(); write(list);
  return publicOf(u);
}
const checkPassword = p => { if (String(p || '').length < 8) throw bad('The password needs at least 8 characters.'); };
const checkEmail = e => { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw bad('Enter a valid email address.'); };

function create({ name, email, role, password, perms }) {
  name = String(name || '').trim(); email = String(email || '').trim().toLowerCase();
  if (!name) throw bad('Enter a name.');
  checkEmail(email); checkPassword(password);
  if (!ROLES[role]) throw bad('Choose a role.');
  const list = read();
  if (list.some(x => x.email.toLowerCase() === email) || email === String(process.env.ADMIN_USER || '').toLowerCase()) throw bad('Someone already uses that email.', 409);
  const salt = crypto.randomBytes(16).toString('hex');
  const u = { id: crypto.randomBytes(8).toString('hex'), name, email, role, salt, hash: hash(password, salt), active: true, createdAt: new Date().toISOString() };
  const own = cleanPerms(role, perms); if (own) u.perms = own;
  list.push(u); write(list);
  return publicOf(u);
}
// change a user's name, email, role, active state and (optionally) password; an Owner can never remove the last Owner
function update(id, changes, by) {
  if (id === ENV_ID) throw bad('The main owner is set in the .env file on the server.');
  const list = read(), u = list.find(x => x.id === id);
  if (!u) throw bad('User not found', 404);
  if (changes.name !== undefined) { const n = String(changes.name).trim(); if (!n) throw bad('Enter a name.'); u.name = n; }
  if (changes.email !== undefined) {
    const e = String(changes.email).trim().toLowerCase(); checkEmail(e);
    if (list.some(x => x !== u && x.email.toLowerCase() === e)) throw bad('Someone already uses that email.', 409);
    u.email = e;
  }
  if (changes.role !== undefined) { if (!ROLES[changes.role]) throw bad('Choose a role.'); u.role = changes.role; }
  if (changes.perms !== undefined || changes.role !== undefined) { const own = cleanPerms(u.role, changes.perms !== undefined ? changes.perms : u.perms); if (own) u.perms = own; else delete u.perms; }
  if (changes.active !== undefined) {
    if (by && by.id === id && !changes.active) throw bad('You cannot switch off your own account.');
    u.active = !!changes.active;
  }
  if (changes.password) { checkPassword(changes.password); u.salt = crypto.randomBytes(16).toString('hex'); u.hash = hash(changes.password, u.salt); }
  write(list);
  return publicOf(u);
}
function remove(id, by) {
  if (id === ENV_ID) throw bad('The main owner is set in the .env file on the server.');
  if (by && by.id === id) throw bad('You cannot delete your own account.');
  const list = read(), i = list.findIndex(x => x.id === id);
  if (i < 0) throw bad('User not found', 404);
  const [gone] = list.splice(i, 1); write(list);
  return publicOf(gone);
}
// a person changes their own password (the .env owner changes theirs in the .env file)
function changeOwnPassword(id, current, next) {
  if (id === ENV_ID) throw bad('The main owner\'s password is set in the .env file on the server.');
  const list = read(), u = list.find(x => x.id === id);
  if (!u || !same(hash(current, u.salt), u.hash)) throw bad('Your current password is not right.');
  checkPassword(next);
  u.salt = crypto.randomBytes(16).toString('hex'); u.hash = hash(next, u.salt); write(list);
}

// a person changes the name shown for them
function setOwnName(id, name) {
  name = String(name || '').trim().slice(0, 60);
  if (!name) throw bad('Enter a name.');
  if (id === ENV_ID) { fs.writeFileSync(PROFILE, JSON.stringify({ name }, null, 2)); return envUser(); }
  const list = read(), u = list.find(x => x.id === id); if (!u) throw bad('User not found', 404);
  u.name = name; write(list); return publicOf(u);
}
module.exports = { setOwnName, PERMS, permsOf, ROLES, can, all, byId, login, create, update, remove, changeOwnPassword, ENV_ID };
