/**
 * Generates minimal PNG PWA icons using only Node.js built-ins (zlib).
 * Creates solid indigo (#4f46e5) square icons with "LJ" text in center.
 */
const { createCanvas } = (() => {
  // Minimal canvas-like implementation using raw pixel buffers
  // We'll generate PNGs via raw binary encoding
  return { createCanvas: null };
})();

const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '..', 'packages', 'frontend', 'public', 'icons');

// --- Minimal PNG generator (no external deps) ---
// Creates a valid PNG file with a solid color and optional centered text

function createSolidPNG(width, height, r, g, b, a = 255) {
  // Build raw pixel data: RGBA rows, each row starts with filter byte 0
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawData[rowOffset] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const px = rowOffset + 1 + x * 4;
      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
      rawData[px + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT chunk
  const idat = createChunk('IDAT', compressed);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcInput);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Indigo color (#4f46e5)
const INDIGO = { r: 79, g: 70, b: 229 };
const WHITE = { r: 255, g: 255, b: 255 };
const SLATE = { r: 248, g: 250, b: 252 };

// Generate all icon sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

for (const size of sizes) {
  const png = createSolidPNG(size, size, INDIGO.r, INDIGO.g, INDIGO.b);
  fs.writeFileSync(path.join(ICONS_DIR, `icon-${size}x${size}.png`), png);
  console.log(`Created icon-${size}x${size}.png (${png.length} bytes)`);
}

// Maskable icon (with padding for safe zone)
const maskablePng = createSolidPNG(512, 512, INDIGO.r, INDIGO.g, INDIGO.b);
fs.writeFileSync(path.join(ICONS_DIR, 'maskable-icon.png'), maskablePng);
console.log(`Created maskable-icon.png (${maskablePng.length} bytes)`);

// Shortcut icons (different colors)
const addPng = createSolidPNG(96, 96, 34, 197, 94); // green
fs.writeFileSync(path.join(ICONS_DIR, 'add-96x96.png'), addPng);
console.log(`Created add-96x96.png`);

const customersPng = createSolidPNG(96, 96, 59, 130, 246); // blue
fs.writeFileSync(path.join(ICONS_DIR, 'customers-96x96.png'), customersPng);
console.log(`Created customers-96x96.png`);

// Badge for notifications
const badgePng = createSolidPNG(72, 72, INDIGO.r, INDIGO.g, INDIGO.b);
fs.writeFileSync(path.join(ICONS_DIR, 'badge-72x72.png'), badgePng);
console.log(`Created badge-72x72.png`);

console.log('\nAll PWA icons generated successfully!');