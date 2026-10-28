#!/usr/bin/env node
// Convert Figma SVG exports into recolorable illustrations.
// Usage: node convert-illustrations.mjs <input-dir> <output-dir>
//
// Every color from the Figma "Illustration" variables becomes a class
// (illu-fill-*, illu-stroke-*, illu-stop-*). A small <style> block inside each
// SVG holds the defaults, so the file renders correctly on its own (as <img>)
// and recolors when inlined on a page that sets --illu-primary.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';

export const HEX2TOKEN = {
  '#0acf83': 'primary', '#afebc7': 'primary-light', '#036e43': 'primary-dark',
  '#d9d9d9': 'grey-light', '#909090': 'grey-mid', '#605e5e': 'grey-dark', '#484646': 'grey-darker',
  '#000000': 'black', '#ffffff': 'white',
};
const DEFAULTS = {
  'primary': 'var(--illu-primary,#0acf83)',
  'primary-light': 'var(--illu-primary-light,color-mix(in oklch,var(--illu-primary,#0acf83),white 55%))',
  'primary-dark': 'var(--illu-primary-dark,color-mix(in oklch,var(--illu-primary,#0acf83),black 37%))',
  'grey-light': 'var(--illu-grey-light,#d9d9d9)', 'grey-mid': 'var(--illu-grey-mid,#909090)',
  'grey-dark': 'var(--illu-grey-dark,#605e5e)', 'grey-darker': 'var(--illu-grey-darker,#484646)',
  'black': 'var(--illu-black,#000000)', 'white': 'var(--illu-white,#ffffff)',
};
const PROP = { 'fill': 'fill', 'stroke': 'stroke', 'stop-color': 'stop' };
const CSSPROP = { fill: 'fill', stroke: 'stroke', stop: 'stop-color', flood: 'flood-color' };

// Shadow/glow colors: Figma bakes them into feColorMatrix numbers, which CSS can't reach.
// Green ones are rewritten to feFlood + feComposite so their color comes from a class.
const lin = c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
function oklab(r, g, b) {
  [r, g, b] = [r, g, b].map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return { L, C: Math.hypot(A, B) };
}
const PRIMARY_L = oklab(10 / 255, 207 / 255, 131 / 255).L;
function shadowToken(r, g, b) {
  const { L, C } = oklab(r, g, b);
  if (C < 0.06) return null; // neutral shadows (black, white, grey) stay as they are
  if (Math.abs(L - PRIMARY_L) < 0.005) return 'primary';
  return L > PRIMARY_L ? 'primary-light' : 'primary-dark';
}
function convertShadows(svg, used) {
  let n = 0, count = 0;
  const out = svg.replace(/<(fe[A-Za-z]+)([^<>]*?)\/>(\s*)<feColorMatrix type="matrix" values="0 0 0 0 ([\d.]+) 0 0 0 0 ([\d.]+) 0 0 0 0 ([\d.]+) 0 0 0 ([\d.]+) 0"\/>/g,
    (m, prevName, prevAttrs, ws, r, g, b, a) => {
      const t = shadowToken(+r, +g, +b); if (!t) return m;
      let res = (prevAttrs.match(/\sresult="([^"]+)"/) || [])[1];
      if (!res) { res = `illuShadow${n++}`; prevAttrs += ` result="${res}"`; }
      const cls = `illu-flood-${t}`; used.add(cls); count++;
      return `<${prevName}${prevAttrs}/>${ws}<feFlood class="${cls}" flood-opacity="${a}"/>${ws}<feComposite in2="${res}" operator="in"/>`;
    });
  return { out, count };
}

function normColor(v) {
  v = v.trim().toLowerCase();
  if (v === 'white') return '#ffffff';
  if (v === 'black') return '#000000';
  if (/^#[0-9a-f]{3}$/.test(v)) v = '#' + [...v.slice(1)].map(c => c + c).join('');
  return v;
}

export function convert(svg, slug) {
  const unknown = {}; const used = new Set(); let mapped = 0, skipDepth = 0, rootDone = false;
  const SKIP = new Set(['mask', 'clippath', 'filter']);
  svg = svg.replace(/<\?xml[^>]*>\s*/i, '');
  const sh = convertShadows(svg, used); svg = sh.out; mapped += sh.count;
  let out = svg.replace(/<(\/?)([a-zA-Z][\w:.-]*)([^<>]*?)(\/?)>/g, (m, close, name, attrs, self) => {
    const ln = name.toLowerCase();
    if (close) { if (SKIP.has(ln)) skipDepth = Math.max(0, skipDepth - 1); return m; }
    if (SKIP.has(ln)) { if (!self) skipDepth++; return m; }
    if (skipDepth > 0) return m;
    const classes = [];
    attrs = attrs.replace(/\s(fill|stroke|stop-color)="([^"]*)"/g, (a, prop, val) => {
      const n = normColor(val), t = HEX2TOKEN[n];
      if (t) { const c = `illu-${PROP[prop]}-${t}`; classes.push(c); used.add(c); mapped++; return ''; }
      if (/^#[0-9a-f]{6}$/.test(n)) unknown[n] = (unknown[n] || 0) + 1;
      return a;
    });
    let extra = '';
    if (ln === 'svg' && !rootDone) {
      rootDone = true; classes.unshift('illu');
      if (!/\srole=/.test(attrs)) attrs += ` role="img" aria-label="${slug.replace(/-/g, ' ')}"`;
      extra = '\n<style>__ILLU_STYLE__</style>';
    }
    if (classes.length) {
      if (/\sclass="/.test(attrs)) attrs = attrs.replace(/\sclass="([^"]*)"/, (a, c) => ` class="${c} ${classes.join(' ')}"`);
      else attrs += ` class="${classes.join(' ')}"`;
    }
    return `<${name}${attrs}${self}>${extra}`;
  });
  const css = [...used].sort().map(c => { const [, p, t] = c.match(/^illu-(fill|stroke|stop|flood)-(.+)$/); return `.${c}{${CSSPROP[p]}:${DEFAULTS[t]}}`; }).join('');
  out = out.replace('__ILLU_STYLE__', css);
  // Prefix ids so several illustrations can be inlined on one page
  const ids = new Set(); out.replace(/\sid="([^"]+)"/g, (m, id) => ids.add(id));
  if (ids.size) {
    const pre = id => ids.has(id) ? `${slug}__${id}` : id;
    out = out.replace(/(\sid=")([^"]+)"/g, (m, a, id) => `${a}${pre(id)}"`)
             .replace(/url\(#([^)]+)\)/g, (m, id) => `url(#${pre(id)})`)
             .replace(/(href=")#([^"]+)"/g, (m, a, id) => `${a}#${pre(id)}"`);
  }
  return { svg: out.trim() + '\n', mapped, unknown };
}

if (process.argv[1] && basename(process.argv[1]) === 'convert-illustrations.mjs') {
  const [inDir, outDir] = process.argv.slice(2);
  if (!inDir || !outDir) { console.error('Usage: node convert-illustrations.mjs <input-dir> <output-dir>'); process.exit(1); }
  mkdirSync(outDir, { recursive: true });
  let total = 0;
  for (const f of readdirSync(inDir).filter(f => f.endsWith('.svg') && !f.startsWith('._'))) {
    const slug = f.replace(/\.svg$/, '');
    const r = convert(readFileSync(join(inDir, f), 'utf8'), slug);
    writeFileSync(join(outDir, f), r.svg);
    total++;
    const u = Object.keys(r.unknown);
    console.log(`${slug}: ${r.mapped} colors${u.length ? `, left as is: ${u.join(' ')}` : ''}`);
  }
  console.log(`Converted ${total} files.`);
}
