// Security code for the Plan My Trip form (23 Oct 2026, client: "captcha as on the old site").
// A five-character code drawn as a slightly scrambled SVG picture. Nothing is kept on the server: the form carries a
// signed token (expiry + HMAC of the code), checked when the enquiry arrives; each token works once, for 30 minutes.
const crypto = require('crypto');

const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';   // no 0/O, 1/I/L look-alikes
const TTL = 30 * 60 * 1000;
const secret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const sign = s => crypto.createHmac('sha256', secret).update('captcha|' + s).digest('base64url');
const used = new Map();   // token → expiry, so a solved code cannot be sent twice

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = list => list[Math.floor(Math.random() * list.length)];

function picture(code) {
  const W = 150, H = 46, colors = ['#123F6D', '#336699', '#264C73', '#8A5A00', '#2E3440'];
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Security code picture">`;
  out += `<rect width="${W}" height="${H}" fill="#F3F7FB"/>`;
  for (let i = 0; i < 5; i++) {
    out += `<path d="M${rnd(0, 20).toFixed(1)} ${rnd(5, H - 5).toFixed(1)} Q${rnd(40, 110).toFixed(1)} ${rnd(0, H).toFixed(1)} ${rnd(130, W).toFixed(1)} ${rnd(5, H - 5).toFixed(1)}" stroke="${pick(['#B8CDE2', '#D9C38F', '#9FB4CC'])}" stroke-width="${rnd(1, 2).toFixed(1)}" fill="none"/>`;
  }
  for (let i = 0; i < 28; i++) out += `<circle cx="${rnd(0, W).toFixed(1)}" cy="${rnd(0, H).toFixed(1)}" r="${rnd(.6, 1.6).toFixed(1)}" fill="#9FB4CC"/>`;
  [...code].forEach((ch, i) => {
    const x = 18 + i * 27 + rnd(-3, 3), y = 32 + rnd(-4, 4), r = rnd(-22, 22).toFixed(1);
    out += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${r} ${x.toFixed(1)} ${y.toFixed(1)})" font-family="Georgia,serif" font-size="${rnd(24, 29).toFixed(1)}" font-weight="700" fill="${pick(colors)}">${ch}</text>`;
  });
  return out + '</svg>';
}

// a new code: its picture and the token the form sends back
function create() {
  const code = Array.from({ length: 5 }, () => pick(CHARS)).join('');
  const exp = Date.now() + TTL;
  return { svg: picture(code), token: exp + '.' + sign(code + '|' + exp) };
}

// true when the typed code belongs to the token, the token has not expired and was not used before
function check(answer, token) {
  const now = Date.now();
  for (const [t, e] of used) if (e < now) used.delete(t);
  const [exp, mac] = String(token || '').split('.');
  if (!exp || !mac || +exp < now || used.has(token)) return false;
  const want = Buffer.from(sign(String(answer || '').trim().toUpperCase() + '|' + exp)), got = Buffer.from(mac);
  if (want.length !== got.length || !crypto.timingSafeEqual(want, got)) return false;
  used.set(token, +exp);
  return true;
}

module.exports = { create, check };
