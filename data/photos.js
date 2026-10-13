// Picks a photo (from public/photos, copied from the design folder) for a page or a tour
// by matching keywords in its URL, title or route. The first matching rule wins; when a
// rule has several photos, the choice is stable per page so neighbouring cards vary.
const P = f => '/photos/' + f;

const RULES = [
  [/ladakh|\bleh\b|nubra|zanskar/i, ['ladakh-nubra.webp', 'ladakh.webp', 'ladakh-shanti-stupa.webp']],
  [/pushkar/i, ['pushkar-fair.webp']],
  [/onam/i, ['onam.webp']],
  [/diwali|holi|dussera|dusshera|festival|fair|pongal|gangaur/i, ['diwali.webp', 'pushkar-fair.webp']],
  [/tiger|wildlife|widllife|willdife|corbett|ranthambhore|bandhavgarh|bhadhavgarh|kanha|kaziranga|sariska|\bgir\b|safari|nagarhole|bharatpur|sundarban|sunderban/i, ['tiger.webp', 'bengal-tiger.webp', 'maharashtra.webp']],
  [/yoga|ayurveda|meditation|wellness/i, ['yoga-ayurveda.webp']],
  [/buddh|bodhgaya|sarnath|kushinagar|lumbini|sanchi/i, ['ladakh-shanti-stupa.webp']],
  [/kerala|backwater|alleppey|munnar|cochin|kochi|kovalam|kumarakom/i, ['kerala-houseboat.webp', 'kerala-backwaters.webp', 'south-india.webp']],
  [/goa|beach|andaman|lakshadweep/i, ['goa-beach.webp', 'west-india-beach.webp']],
  [/jaisalmer|desert|\bthar\b|dune/i, ['jaisalmer-dunes.webp', 'jaisalmer-fort-night.webp', 'jaisalmer-dunes-wide.webp']],
  [/udaipur/i, ['udaipur-lake-pichola.webp']],
  [/jodhpur/i, ['jodhpur-umaid-bhawan.webp', 'jodhpur-jaswant-thada.webp']],
  [/bikaner/i, ['bikaner-junagarh-fort.webp']],
  [/golden.?triangle|\btaj\b|agra/i, ['taj-mahal-feature.webp', 'north-india.webp', 'north-india-b.webp']],
  [/jaipur/i, ['jaipur-amber-fort.webp', 'jaipur-city-palace.webp', 'jaipur-hawa-mahal.webp']],
  [/rajasthan|rajsthan|mount.?abu|chittor|kota|bundi|shekhawati|mandawa|ranakpur/i, ['rajasthan-forts.webp', 'jaipur-hawa-mahal.webp', 'jodhpur-umaid-bhawan.webp', 'jaisalmer-fort-night.webp', 'jaipur-city-palace.webp']],
  [/sikkim|darjeeling|gangtok/i, ['darjeeling.webp']],
  [/nagaland|manipur|mizoram|meghalaya|tripura|arunachal|assam|north.?east|seven.?sisters/i, ['nagaland-festival.webp', 'east-india.webp']],
  [/himachal|manali|shimla|dharamshala|kashmir|jammu|srinagar|uttaranchal|uttarakhand|uttarachal|mussoorie|nainital|dehradun|almora|raniket|hill.?station|himalaya/i, ['manali-balloon.webp', 'east-india.webp']],
  [/varanasi|benares|ganga|ganges|haridwar|rishikesh|kedarnath|badrinath|gangotri|pilgrim|pilgirm|pigriamge|spiritual|temple|religious|mathura|vrindavan|uttar.?pradesh/i, ['varanasi-ghats.webp', 'taj-mahal-wide.webp']],
  [/tamil|madurai|chennai|mahabalipuram|pondicherry|rameshwaram|kanyakumari|thanjavur/i, ['madurai.webp', 'south-india-b.webp']],
  [/karnataka|mysore|hampi|bangalore|coorg/i, ['mysore-palace.webp', 'south-india-b.webp']],
  [/andhra|telangana|telangna|hyderabad/i, ['south-india-b.webp']],
  [/south.?india|southindia/i, ['south-india-b.webp', 'south-india.webp', 'madurai.webp']],
  [/gujarat|gujrat|kutch|ahmedabad/i, ['gujarat.webp']],
  [/maharashtra|mumbai|ajanta|ellora|aurangabad/i, ['west-india-beach.webp', 'west-india.webp']],
  [/west.?india|westindia|madhya|khajuraho|gwalior|orccha|orchha|bhopal/i, ['west-india.webp', 'rajasthan-forts.webp']],
  [/orissa|odisha|bengal|kolkata|bihar|jharkhand|east.?india|eastindia|puri|konark/i, ['east-india.webp', 'darjeeling.webp']],
  [/delhi/i, ['delhi-red-fort.webp']],
  [/north.?india|northindia/i, ['north-india.webp', 'north-india-b.webp']],
  [/weather|geography|history|culture|art\b|music|dance|cuisine|shopping|tradition|custom|communication|visa|embass|maps?\b|guide|currency|phone|travel/i, ['travel-guide.webp']]
];
const FALLBACK = ['taj-mahal-feature.webp', 'india-main.webp', 'north-india.webp'];

const hash = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

// photoFor(texts, seed?) → '/photos/…'. `texts` is a string or a list tried in order (e.g. title,
// then route); within one text the keyword that appears first wins. `seed` varies the pick.
function photoFor(texts, seed) {
  const list = [].concat(texts).filter(Boolean);
  for (const text of list) {
    let best = null, at = Infinity;
    RULES.forEach(rule => { const m = rule[0].exec(text); if (m && m.index < at) { at = m.index; best = rule; } });
    if (best) return P(best[1][hash(seed == null ? list.join(' ') : seed) % best[1].length]);
  }
  return P(FALLBACK[hash(seed == null ? list.join(' ') : seed) % FALLBACK.length]);
}

// For a tour card on a listing page: ignore the keyword the whole page is about (e.g. "Golden
// Triangle" on the Golden Triangle list), so "Golden Triangle & Goa" shows Goa, not the Taj again.
function photoForCard(name, route, pageText) {
  let pageRule = null, at = Infinity;
  RULES.forEach(rule => { const m = rule[0].exec(pageText || ''); if (m && m.index < at) { at = m.index; pageRule = rule; } });
  const stripped = pageRule ? String(name).replace(new RegExp(pageRule[0].source, 'gi'), ' ') : '';
  return photoFor([stripped, name, route], name);
}

// Every photo for the first keyword found in `text` (no fallback), for a single itinerary day.
// Stricter than the card rules: a Taj photo only for a day that names the Taj or Agra.
const DAY_RULES = [[/tirupati|tirumala|lepakshi|srirangam|rameshwaram|kanchipuram|meenakshi/i, ['madurai.webp']]].concat(RULES);
function photoChoices(text) {
  let best = null, at = Infinity;
  DAY_RULES.forEach(rule => { const m = rule[0].exec(text || ''); if (m && m.index < at) { at = m.index; best = rule; } });
  if (!best) return [];
  return best[1].filter(f => !/^taj-/.test(f) || /taj|agra/i.test(text)).map(P);
}

// Every photo whose keyword appears in `text`, earliest keyword first (then the fallbacks), so a page
// can hand out a different picture to each card.
function photoCandidates(text) {
  const hits = [];
  RULES.forEach(rule => { const m = rule[0].exec(text || ''); if (m) hits.push([m.index, rule[1]]); });
  hits.sort((a, b) => a[0] - b[0]);
  return [...new Set(hits.flatMap(h => h[1]).concat(FALLBACK))].map(P);
}

module.exports = { photoFor, photoForCard, photoChoices, photoCandidates };
