// CMS overrides (16 Oct 2026). The site's content stays in data/*.js as imported; what is changed in the admin panel
// is saved next to it as data/cms/<same path>.json and laid over the module when it loads:
//   data/tours/golden_triangle_packages.js  ←  data/cms/tours/golden_triangle_packages.json
//   data/home.js                            ←  data/cms/home.json
// Every part of the site that reads the data (pages, menus, lists, sitemap) therefore sees the edited version.
// install() hooks require once, at start-up; reload() forgets every data module so the next require reads fresh.
const fs = require('fs');
const path = require('path');
const Module = require('module');

const ROOT = path.join(__dirname, '..', '..');
const DATA = path.join(ROOT, 'data');
const CMS = path.join(DATA, 'cms');

// data/x/y.js → data/cms/x/y.json (only for files inside data/, not inside data/cms/)
function overridePath(file) {
  const rel = path.relative(DATA, file);
  if (rel.startsWith('..') || rel.startsWith('cms' + path.sep) || !rel.endsWith('.js')) return null;
  return path.join(CMS, rel.slice(0, -3) + '.json');
}

function readOverride(file) {
  const p = overridePath(file);
  if (!p || !fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.error('[cms] could not read ' + p + ': ' + e.message); return null; }
}

let installed = false;
function install() {
  if (installed) return;
  installed = true;
  const load = Module._extensions['.js'];
  Module._extensions['.js'] = function (mod, filename) {
    load(mod, filename);
    const o = readOverride(filename);
    if (o && mod.exports && typeof mod.exports === 'object') {
      for (const [k, v] of Object.entries(o)) if (k[0] !== '_') mod.exports[k] = v;   // "_meta" etc. are the CMS's own notes
    }
  };
}

// forget every module under data/ so the next require reads the files (and their overrides) again
function reload() {
  for (const id of Object.keys(require.cache)) if (id.startsWith(DATA + path.sep)) delete require.cache[id];
}

module.exports = { install, reload, overridePath, ROOT, DATA, CMS };
