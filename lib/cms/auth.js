// Admin login (16 Oct 2026): one admin, set in the environment (or a .env file next to server.js):
//   ADMIN_USER=…  ADMIN_PASSWORD=…  SESSION_SECRET=<long random text>
// The session is a signed cookie (HMAC-SHA256), HttpOnly and SameSite=Strict, valid for 12 hours.
// Without ADMIN_PASSWORD the admin panel stays closed.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// a tiny .env reader (KEY=value per line, # comments) — values already in the environment win
(function loadEnv() {
  const f = path.join(__dirname, '..', '..', '.env');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
})();

const COOKIE = 'mk_admin';
const TTL = 12 * 60 * 60 * 1000;
const enabled = () => !!process.env.ADMIN_PASSWORD;
const secret = () => process.env.SESSION_SECRET || crypto.createHash('sha256').update('mk|' + (process.env.ADMIN_PASSWORD || '')).digest('hex');
const sign = v => crypto.createHmac('sha256', secret()).update(v).digest('base64url');
const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };

function cookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) { const i = part.indexOf('='); if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim()); }
  return out;
}
function session(req) {
  const raw = cookies(req)[COOKIE]; if (!raw) return null;
  const [body, mac] = raw.split('.');
  if (!body || !mac || !same(sign(body), mac)) return null;
  try { const s = JSON.parse(Buffer.from(body, 'base64url').toString()); return s.exp > Date.now() ? s : null; } catch (e) { return null; }
}
function setSession(res, req, user) {
  const body = Buffer.from(JSON.stringify({ u: user, exp: Date.now() + TTL })).toString('base64url');
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', `${COOKIE}=${body}.${sign(body)}; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=${TTL / 1000}${secure ? '; Secure' : ''}`);
}
const clearSession = res => res.setHeader('Set-Cookie', `${COOKIE}=; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=0`);

// five wrong tries from one address → wait 15 minutes
const tries = new Map();
function check(ip, user, pass) {
  const t = tries.get(ip) || { n: 0, until: 0 };
  if (t.until > Date.now()) return { ok: false, error: 'Too many tries. Please wait 15 minutes.' };
  const ok = same(user, process.env.ADMIN_USER || 'admin') && same(pass, process.env.ADMIN_PASSWORD || '');
  if (ok) { tries.delete(ip); return { ok: true }; }
  t.n += 1; if (t.n >= 5) { t.until = Date.now() + 15 * 60 * 1000; t.n = 0; }
  tries.set(ip, t);
  return { ok: false, error: 'Wrong username or password.' };
}

// pages: send to the login form; API calls: 401
function requireAdmin(req, res, next) {
  const s = session(req);
  if (s) { req.admin = s.u; return next(); }
  if (req.path.startsWith('/api/')) return res.status(401).json({ ok: false, error: 'Please log in again.' });
  res.redirect('/admin/login?next=' + encodeURIComponent(req.originalUrl));
}
// changes only from the admin's own pages (blocks cross-site form posts)
function sameOrigin(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  const o = req.headers.origin || req.headers.referer || '';
  const host = req.get('host');
  if (o && new URL(o, 'http://x').host === host) return next();
  res.status(403).json({ ok: false, error: 'Request blocked.' });
}

module.exports = { enabled, session, setSession, clearSession, check, requireAdmin, sameOrigin };
