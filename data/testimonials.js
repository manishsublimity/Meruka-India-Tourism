// Guest testimonials, taken word for word from the imported Testimonials page
// (data/articles/testimonials.js, from https://india-tourism.net/testimonials.htm).
// Each <li> there holds: <h4>tour</h4> <p>route<br>(duration)</p> <p>"quote"</p> <h3>name<br>(country)…</h3>
const page = require('./articles/testimonials');

const text = html => html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, '’').replace(/&nbsp;/g, ' ')
  .split('\n').map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
const unwrap = s => /^\(.*\)$/.test(s) ? s.slice(1, -1).trim() : s;      // "(Malaysia)" → "Malaysia"
const initials = name => name.replace(/^(Mr|Mrs|Ms|Dr|Pt)\.?\s+/i, '').split(/\s+/).filter(w => /^[A-Za-z]/.test(w))
  .slice(0, 2).map(w => w[0].toUpperCase()).join('');

const html = page.html;
const ulStart = html.search(/<ul>/i), ulEnd = html.lastIndexOf('</ul>');

const items = [];
for (const li of html.slice(ulStart, ulEnd).split(/<li>/i).slice(1)) {
  const tour = (li.match(/<h4>([\s\S]*?)<\/h4>/i) || [])[1];
  const who = (li.match(/<h3>([\s\S]*?)<\/h3>/i) || [])[1];
  const paras = [...li.matchAll(/<p>([\s\S]*?)<\/p>/gi)].map(m => m[1]);
  if (!tour || !who || paras.length < 2) continue;
  const routeLines = text(paras[0]);
  const duration = unwrap(routeLines.find(l => /^\(.*\)$/.test(l)) || '');
  const route = routeLines.filter(l => !/^\(.*\)$/.test(l)).join(' ');
  const quote = paras.slice(1).map(p => text(p).join(' ')).join(' ').trim().replace(/^["“]\s*|\s*["”]$/g, '');
  const [name, ...rest] = text(who);
  if (!quote || !name) continue;
  const details = rest.map(unwrap);                              // every line under the name, in order
  items.push({ tour: text(tour).join(' '), route, duration, quote, name, details, country: details.join(' · '), initials: initials(name) || name[0] });
}

module.exports = {
  all: items,
  href: page.url,
  heading: page.heading,
  intro: text(html.slice(0, ulStart)).join(' '),
  closing: text(html.slice(ulEnd + 5).replace(/<div[\s\S]*$/i, '')).join(' ').replace(/^["“]\s*|\s*["”]$/g, '')
};
