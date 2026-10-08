// Picks a photo (from public/photos, copied from the design folder) for a page or a tour
// by matching keywords in its URL, title or route. The first matching rule wins; when a
// rule has several photos, the choice is stable per page so neighbouring cards vary.
const P = f => '/photos/' + f;

const RULES = [
  [/ladakh|\bleh\b|nubra|zanskar/i, ['ladakh-nubra.avif', 'ladakh.jpg', 'ladakh-shanti-stupa.webp']],
  [/pushkar/i, ['pushkar-fair.jpg']],
  [/onam/i, ['onam.jpg']],
  [/diwali|holi|dussera|dusshera|festival|fair|pongal|gangaur/i, ['diwali.jpg', 'pushkar-fair.jpg']],
  [/tiger|wildlife|widllife|willdife|corbett|ranthambhore|bandhavgarh|bhadhavgarh|kanha|kaziranga|sariska|\bgir\b|safari|nagarhole|bharatpur|sundarban|sunderban/i, ['tiger.jpg', 'bengal-tiger.jpg', 'maharashtra.jpg']],
  [/yoga|ayurveda|meditation|wellness/i, ['yoga-ayurveda.jpg']],
  [/buddh|bodhgaya|sarnath|kushinagar|lumbini|sanchi/i, ['ladakh-shanti-stupa.webp']],
  [/kerala|backwater|alleppey|munnar|cochin|kochi|kovalam|kumarakom/i, ['kerala-houseboat.webp', 'kerala-backwaters.jpg', 'south-india.jpg']],
  [/goa|beach|andaman|lakshadweep/i, ['goa-beach.jpg', 'west-india-beach.jpg']],
  [/jaisalmer|desert|\bthar\b|dune/i, ['jaisalmer-dunes.webp', 'jaisalmer-fort-night.jpg', 'jaisalmer-dunes-wide.jpg']],
  [/udaipur/i, ['udaipur-lake-pichola.jpg']],
  [/jodhpur/i, ['jodhpur-umaid-bhawan.jpg', 'jodhpur-jaswant-thada.jpg']],
  [/bikaner/i, ['bikaner-junagarh-fort.jpg']],
  [/golden.?triangle|\btaj\b|agra/i, ['taj-mahal-feature.webp', 'north-india.jpg', 'north-india-b.webp']],
  [/jaipur/i, ['jaipur-amber-fort.jpg', 'jaipur-city-palace.jpg', 'jaipur-hawa-mahal.webp']],
  [/rajasthan|rajsthan|mount.?abu|chittor|kota|bundi|shekhawati|mandawa|ranakpur/i, ['rajasthan-forts.jpg', 'jaipur-hawa-mahal.webp', 'jodhpur-umaid-bhawan.jpg', 'jaisalmer-fort-night.jpg', 'jaipur-city-palace.jpg']],
  [/sikkim|darjeeling|gangtok/i, ['darjeeling.jpg']],
  [/nagaland|manipur|mizoram|meghalaya|tripura|arunachal|assam|north.?east|seven.?sisters/i, ['nagaland-festival.webp', 'east-india.avif']],
  [/himachal|manali|shimla|dharamshala|kashmir|jammu|srinagar|uttaranchal|uttarakhand|uttarachal|mussoorie|nainital|dehradun|almora|raniket|hill.?station|himalaya/i, ['manali-balloon.jpg', 'east-india.avif']],
  [/varanasi|benares|ganga|ganges|haridwar|rishikesh|kedarnath|badrinath|gangotri|pilgrim|pilgirm|pigriamge|spiritual|temple|religious|mathura|vrindavan|uttar.?pradesh/i, ['varanasi-ghats.jpg', 'taj-mahal-wide.jpg']],
  [/tamil|madurai|chennai|mahabalipuram|pondicherry|rameshwaram|kanyakumari|thanjavur/i, ['madurai.webp', 'south-india-b.jpg']],
  [/karnataka|mysore|hampi|bangalore|coorg/i, ['mysore-palace.jpg', 'south-india-b.jpg']],
  [/andhra|telangana|telangna|hyderabad/i, ['south-india-b.jpg']],
  [/south.?india|southindia/i, ['south-india-b.jpg', 'south-india.jpg', 'madurai.webp']],
  [/gujarat|gujrat|kutch|ahmedabad/i, ['gujarat.jpg']],
  [/maharashtra|mumbai|ajanta|ellora|aurangabad/i, ['west-india-beach.jpg', 'west-india.jpg']],
  [/west.?india|westindia|madhya|khajuraho|gwalior|orccha|orchha|bhopal/i, ['west-india.jpg', 'rajasthan-forts.jpg']],
  [/orissa|odisha|bengal|kolkata|bihar|jharkhand|east.?india|eastindia|puri|konark/i, ['east-india.avif', 'darjeeling.jpg']],
  [/delhi/i, ['delhi-red-fort.jpg']],
  [/north.?india|northindia/i, ['north-india.jpg', 'north-india-b.webp']],
  [/weather|geography|history|culture|art\b|music|dance|cuisine|shopping|tradition|custom|communication|visa|embass|maps?\b|guide|currency|phone|travel/i, ['travel-guide.webp']]
];
const FALLBACK = ['taj-mahal-feature.webp', 'india-main.jpg', 'north-india.jpg'];

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

module.exports = { photoFor, photoForCard, photoChoices };
