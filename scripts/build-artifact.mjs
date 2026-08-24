// Builds the single-file, self-contained version of the library site for
// publishing (Claude artifact / email / anywhere without the assets folder):
// inlines both stylesheets and both scripts, and converts every assets/…
// reference — in the HTML and inside the JS lockup strings — to a data: URI.
// The artifact host wraps content in its own <html>/<head>/<body>, so the
// doctype/head/body shells are stripped; <title>, the Google Fonts link,
// styles and scripts all travel as body content.
//
//   node scripts/build-artifact.mjs   →  dist/group-design-system.html
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

const MIME = { '.svg': 'image/svg+xml', '.png': 'image/png' };
const dataUri = (p) => {
  const buf = readFileSync(join(ROOT, p));
  return `data:${MIME[extname(p)]};base64,${buf.toString('base64')}`;
};

let html = read('index.html');

// strip the document shell — keep everything from <title> through </body>
html = html
  .replace(/^[\s\S]*?<head>/, '')
  .replace(/<\/head>\s*<body>/, '')
  .replace(/<\/body>\s*<\/html>\s*$/, '')
  .replace(/<meta[^>]*>\s*/g, '');

// inline the stylesheets and scripts
html = html.replace(/<link rel="stylesheet" href="css\/tokens.css" \/>/, () => `<style>\n${read('css/tokens.css')}\n</style>`);
html = html.replace(/<link rel="stylesheet" href="css\/components.css" \/>/, () => `<style>\n${read('css/components.css')}\n</style>`);
html = html.replace(/<script src="js\/ds-icons.js"><\/script>/, () => `<script>\n${read('js/ds-icons.js')}\n</script>`);
html = html.replace(/<script src="js\/library.js"><\/script>/, () => `<script>\n${read('js/library.js')}\n</script>`);

// every asset reference → data URI (covers src="assets/…" in HTML and
// 'assets/…' strings inside the inlined library.js)
const seen = new Map();
html = html.replace(/(["'])(assets\/[A-Za-z0-9/_.-]+\.(?:svg|png))\1/g, (m, q, p) => {
  if (!seen.has(p)) seen.set(p, dataUri(p));
  return q + seen.get(p) + q;
});

// library.js builds the wordmark path dynamically ('assets/logos/' + id) —
// swap that for a baked map of data URIs so nothing fetches at runtime
const LOGO_IDS = ['plt', 'debenhams', 'boohoo', 'boohooman', 'karenmillen'];
const logoMap = Object.fromEntries(LOGO_IDS.map((id) => [id, dataUri(`assets/logos/${id}.svg`)]));
html = html.replace(
  "document.getElementById('brand-logo').src = 'assets/logos/' + id + '.svg';",
  `document.getElementById('brand-logo').src = (${JSON.stringify(logoMap)})[id];`
);

// the artifact's own page must still set the initial brand before JS runs so
// tokens resolve on first paint — library.js re-stamps it at init anyway
html = `<script>document.documentElement.setAttribute('data-brand','plt');</script>\n` + html;

mkdirSync(join(ROOT, 'dist'), { recursive: true });
writeFileSync(join(ROOT, 'dist', 'group-design-system.html'), html);
console.log(
  'dist/group-design-system.html:',
  (html.length / 1024).toFixed(0) + 'KB,',
  seen.size,
  'assets inlined'
);
const left = [...html.matchAll(/["']assets\//g)].length;
console.log('unresolved asset refs:', left);
