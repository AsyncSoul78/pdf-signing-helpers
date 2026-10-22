// Run: npm test
const test = require('node:test');
const assert = require('node:assert');
const { makeForm } = require('../scripts/make-sign-form');
const { receipt, pageCount } = require('../scripts/signing-receipt');

test('practice form is a valid one-page PDF', () => {
  const pdf = makeForm({ title: 'Field trip (permission)' });
  const s = pdf.toString('latin1');
  assert.ok(s.startsWith('%PDF-1.4'));
  assert.ok(s.trimEnd().endsWith('%%EOF'));
  assert.strictEqual(pageCount(pdf), 1);
  assert.ok(s.includes('(Field trip \\(permission\\))'));
  for (const label of ['Full name', 'Date', 'Signature']) assert.ok(s.includes(`(${label})`));
});

test('xref offsets point at the objects', () => {
  const pdf = makeForm({ a4: true });
  const s = pdf.toString('latin1');
  assert.ok(s.includes('/MediaBox [0 0 595 842]'));
  const xrefAt = +s.match(/startxref\n(\d+)/)[1];
  assert.strictEqual(s.slice(xrefAt, xrefAt + 4), 'xref');
  const entries = [...s.slice(xrefAt).matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => +m[1]);
  assert.strictEqual(entries.length, 5);
  entries.forEach((off, i) => assert.ok(s.startsWith(`${i + 1} 0 obj`, off)));
});

test('receipt shows fingerprints and an appended save', () => {
  const original = makeForm();
  const signed = Buffer.concat([original, Buffer.from('6 0 obj\n<< >>\nendobj\n%%EOF\n', 'latin1')]);
  const r = receipt(original, signed, ['form.pdf', 'form-signed.pdf'], new Date('2026-10-22T10:00:00Z'));
  assert.strictEqual(r.created, '2026-10-22T10:00:00.000Z');
  assert.strictEqual(r.original.revisions, 1);
  assert.strictEqual(r.signed.revisions, 2);
  assert.match(r.signed.sha256, /^[0-9a-f]{64}$/);
  assert.notStrictEqual(r.original.sha256, r.signed.sha256);
  assert.deepStrictEqual(r.warnings, []);
});

test('pages packed in a compressed object stream are counted', () => {
  const packed = require('zlib').deflateSync(Buffer.from('<< /Type /Page >> << /Type /Page >>', 'latin1'));
  const pdf = Buffer.concat([
    Buffer.from('%PDF-1.7\n1 0 obj\n<< /Type /ObjStm /Filter /FlateDecode >>\nstream\n', 'latin1'),
    packed,
    Buffer.from('\nendstream\nendobj\n%%EOF\n', 'latin1'),
  ]);
  assert.strictEqual(pageCount(pdf), 2);
});

test('receipt warns when nothing was signed', () => {
  const pdf = makeForm();
  assert.strictEqual(receipt(pdf, pdf).warnings.length, 1);
});

test('non-PDF input is rejected', () => {
  assert.throws(() => receipt(Buffer.from('hello'), makeForm()), /not a PDF/);
});
