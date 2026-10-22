#!/usr/bin/env node
// Builds a one-page practice form (Letter size) with lines for a name, a date and a signature.
// Usage: node scripts/make-sign-form.js [out.pdf] [--title "Permission slip"] [--a4]

const fs = require('fs');

// PDF text strings: escape \, ( and ), keep plain Latin-1.
function pdfString(s) {
  return '(' + String(s).replace(/[\\()]/g, (c) => '\\' + c).replace(/[^\x20-\xff]/g, '?') + ')';
}

function makeForm({ title = 'Consent form', a4 = false } = {}) {
  const [w, h] = a4 ? [595, 842] : [612, 792];
  const left = 72, right = w - 72;
  const ops = [];
  const text = (x, y, size, s) => ops.push(`BT /F1 ${size} Tf ${x} ${y} Td ${pdfString(s)} Tj ET`);
  const line = (x1, y, x2) => ops.push(`${x1} ${y} m ${x2} ${y} l S`);

  text(left, h - 100, 22, title);
  text(left, h - 140, 11, 'I have read this document and agree to its terms.');
  text(left, h - 158, 11, 'Please fill in the fields below and return a signed copy.');

  ops.push('0.6 w');
  const fields = ['Full name', 'Date', 'Signature'];
  let y = h - 240;
  for (const label of fields) {
    line(left, y, right);
    text(left, y - 14, 9, label);
    y -= 80;
  }

  const content = ops.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
  ];

  let out = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(out, 'latin1'));
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out, 'latin1');
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) out += String(o).padStart(10, '0') + ' 00000 n \n';
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

module.exports = { makeForm };

if (require.main === module) {
  const args = process.argv.slice(2);
  let outFile = 'sign-form.pdf', title, a4 = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--title') title = args[++i];
    else if (args[i] === '--a4') a4 = true;
    else outFile = args[i];
  }
  fs.writeFileSync(outFile, makeForm({ title, a4 }));
  console.log(`${outFile}: practice form ready, open it in the signer and fill it in`);
}
