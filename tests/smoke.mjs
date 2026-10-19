import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const html = read('index.html');
const errors = [];
const exists = path => existsSync(resolve(root, path));
const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)].map(x => x[1]);
const styles = [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)]
  .map(x => x[0].match(/\bhref="([^"]+)"/)?.[1]).filter(Boolean);
for (const url of [...styles, ...scripts]) {
  if (!url.startsWith('./')) continue;
  const path = url.slice(2);
  if (!exists(path)) errors.push('Missing HTML resource: ' + path);
}
for (const path of ['js/poster.js', 'js/game.js']) {
  if (!exists(path)) { errors.push('Missing JavaScript: ' + path); continue; }
  try { new vm.Script(read(path), { filename: path }); }
  catch (e) { errors.push('JS parse error: ' + path + ' — ' + e.message); }
}
if (scripts.indexOf('./js/poster.js') < 0 || scripts.indexOf('./js/game.js') < 0 ||
    scripts.indexOf('./js/poster.js') >= scripts.indexOf('./js/game.js')) {
  errors.push('Script order requires js/poster.js before js/game.js');
}
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x => x[1]));
for (const id of ['playerPosterMount', 'log', 'action', 'choiceDialog', 'confirm', 'resetGame']) {
  if (!ids.has(id)) errors.push('Missing DOM ID: ' + id);
}
if (exists('js/game.js')) {
  const game = read('js/game.js');
  for (const [, , id] of game.matchAll(/\$\(\s*(['"])([^'"]+)\1\s*\)/g)) {
    if (!ids.has(id)) errors.push('JS references missing DOM ID: ' + id);
  }
  for (const integration of ['GukminPoster', 'callOfgukmin__playable__v1']) {
    if (!game.includes(integration)) errors.push('Missing integration: ' + integration);
  }
}
if (errors.length) {
  console.error('Smoke failed:\n- ' + [...new Set(errors)].join('\n- '));
  process.exitCode = 1;
} else console.log('Smoke OK: static resources, script order, JS syntax, DOM IDs, save key.');
