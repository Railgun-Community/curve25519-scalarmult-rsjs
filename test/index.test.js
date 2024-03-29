const test = require('node:test');
const assert = require('node:assert');
const NobleEd25519 = require('@noble/ed25519');
const mod = require('../');

test('should have the correct module shape', (t) => {
  assert.equal(typeof mod, 'object', 'exports is an object');
  assert.equal(typeof mod.default, 'function', 'exports.default is a function');
  assert.equal(
    typeof mod.scalarMultiply,
    'function',
    'exports.scalarMultiply is a function',
  );
  assert.equal(mod.__esModule, true, 'exports.__esModule is true');
});

function bytesToHex(uint8) {
  return Array.from(uint8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function nobleScalarMultiply(point, scalar) {
  const pk = NobleEd25519.Point.fromHex(bytesToHex(point));
  const scalarBigInt = BigInt(`0x${bytesToHex(scalar)}`);
  return pk.multiply(scalarBigInt).toRawBytes();
}

test('should perform scalar multiplication', (t) => {
  const point = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xde, 0xad, 0xbe, 0xef,
    0xde, 0xad, 0xbe, 0xef, 0xde, 0xad, 0xbe, 0xef,
  ]);

  const scalar = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x8a, 0x91, 0x57, 0xcc, 0x50, 0x12, 0xde, 0x59, 0x15, 0x68, 0x08,
    0x0f, 0xf8, 0x10, 0x81, 0x02, 0xdd, 0xef, 0xa9,
  ]);

  const expected = new Uint8Array([
    0xdb, 0x93, 0xe6, 0x8c, 0x1b, 0xa1, 0x21, 0x28, 0x8d, 0x9a, 0xe8, 0x6d,
    0x10, 0x3f, 0x8a, 0xb3, 0xa1, 0x54, 0x52, 0x1f, 0x8c, 0xe9, 0xdd, 0x34,
    0xc5, 0x02, 0xfc, 0x00, 0x15, 0xf9, 0x0f, 0xa2,
  ]);

  const actual = mod.scalarMultiply(point, scalar);
  const nobleActual = nobleScalarMultiply(point, scalar);
  assert.deepEqual(actual, expected, 'should return the correct result');
  assert.deepEqual(actual, nobleActual, 'should match @noble/ed25519 result');
});

test('should throw JS error when y coordinate is invalid', (t) => {
  const point = new Uint8Array([
    122, 247, 122, 242, 41, 199, 22, 160, 168, 36, 83, 200, 250, 170, 208, 189,
    116, 82, 157, 77, 82, 192, 120, 42, 62, 13, 148, 15, 17, 141, 227, 22,
  ]);
  const scalar = new Uint8Array([
    12, 177, 1, 1, 172, 238, 74, 214, 245, 79, 225, 22, 8, 12, 161, 115, 116,
    29, 107, 71, 58, 253, 193, 109, 50, 81, 18, 42, 184, 239, 251, 172,
  ]);

  assert.throws(() => {
    nobleScalarMultiply(point, scalar);
  }, /invalid y coordinate/);
  assert.throws(() => {
    mod.scalarMultiply(point, scalar);
  }, /invalid y coordinate/);
});

test('should throw JS error when scalar byte size is invalid', (t) => {
  const point = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xde, 0xad, 0xbe, 0xef,
    0xde, 0xad, 0xbe, 0xef, 0xde, 0xad, 0xbe, 0xef,
  ]);
  const scalar = new Uint8Array([
    12, 177, 1,
  ]);

  assert.throws(() => {
    mod.scalarMultiply(point, scalar);
  }, /invalid scalar size/);
});

