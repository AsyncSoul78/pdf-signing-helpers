#!/usr/bin/env node
// Writes a short receipt for a signed document: fingerprints of the original and the signed copy,
// sizes, page counts and the time. Keep it next to the files to know exactly which version you signed.
// Usage: node scripts/signing-receipt.js original.pdf signed.pdf [receipt.json]

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

// Object streams hide page objects inside compressed data: unpack them so they can be counted too.
function unpackObjectStreams(s) {
  let extra = '';
  const re = /\/Type\s*\/ObjStm[^]*?stream\r?\n/g;
  let m;
  while ((m = re.exec(s))) {
    const start = m.index + m[0].length;
    const end = s.indexOf('endstream', start);
    if (end < 0) break;
    try { extra += '\n' + zlib.inflateSync(Buffer.from(s.slice(start, end), 'latin1')).toString('latin1'); } catch {}
  }
  return extra;
}

function pageCount(buf) {
  let s = buf.toString('latin1');
  s += unpackObjectStreams(s);
  const pages = (s.match(/\/Type\s*\/Page(?![a-zA-Z])/g) || []).length;
  if (pages) return pages;
  // Page objects packed away: fall back to the largest /Count of a page tree.
  const counts = [...s.matchAll(/\/Count\s+(\d+)/g)].map((m) => +m[1]);
  return counts.length ? Math.max(...counts) : 0;
}

function describe(buf, name) {
  if (buf.subarray(0, 5).toString('latin1') !== '%PDF-') throw new Error(`${name} is not a PDF`);
  return {
    file: name,
    bytes: buf.length,
    pages: pageCount(buf),
    // Each save that appends to a PDF adds one more end marker.
    revisions: (buf.toString('latin1').match(/%%EOF/g) || []).length,
    sha256: crypto.createHash('sha256').update(buf).digest('hex'),
  };
}

function receipt(original, signed, names = ['original.pdf', 'signed.pdf'], now = new Date()) {
  const a = describe(original, names[0]);
  const b = describe(signed, names[1]);
  const warnings = [];
  if (a.sha256 === b.sha256) warnings.push('the signed copy is identical to the original, nothing was added');
  if (a.pages !== b.pages) warnings.push(`page count changed: ${a.pages} -> ${b.pages}`);
  return { created: now.toISOString(), original: a, signed: b, warnings };
}

module.exports = { receipt, pageCount };

if (require.main === module) {
  const [orig, signed, out] = process.argv.slice(2);
  if (!orig || !signed) {
    console.error('Usage: node scripts/signing-receipt.js original.pdf signed.pdf [receipt.json]');
    process.exit(1);
  }
  const r = receipt(fs.readFileSync(orig), fs.readFileSync(signed), [path.basename(orig), path.basename(signed)]);
  const json = JSON.stringify(r, null, 2);
  if (out) fs.writeFileSync(out, json + '\n');
  console.log(json);
  if (r.warnings.length) process.exitCode = 2;
}
