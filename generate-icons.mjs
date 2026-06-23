// Genera iconos PNG placeholder para PWA (192x192 y 512x512)
// Cuando tengan el logo final, reemplazar los archivos generados.
// Uso: node generate-icons.mjs

import { createHash } from 'crypto';
import { deflateSync } from 'zlib';
import { writeFileSync } from 'fs';

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const byte of buf) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n);
  return b;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const crcInput = Buffer.concat([t, d]);
  return Buffer.concat([u32(d.length), t, d, u32(crc32(crcInput))]);
}

function makePNG(size) {
  // Colores: fondo verde oscuro #0d1f12, flecha/diamante verde #22c55e
  const BG  = [13, 31, 18];   // #0d1f12
  const FG  = [34, 197, 94];  // #22c55e

  const pixels = Buffer.alloc(size * size * 3);

  // Rellenar fondo
  for (let i = 0; i < size * size; i++) {
    pixels[i*3]   = BG[0];
    pixels[i*3+1] = BG[1];
    pixels[i*3+2] = BG[2];
  }

  // Dibujar un diamante (rombo) centrado — referencia al ícono de la app
  const cx = size / 2, cy = size / 2;
  const r  = size * 0.38;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = Math.abs(x - cx) / r;
      const dy = Math.abs(y - cy) / r;
      if (dx + dy < 1) {
        pixels[(y * size + x) * 3]     = FG[0];
        pixels[(y * size + x) * 3 + 1] = FG[1];
        pixels[(y * size + x) * 3 + 2] = FG[2];
      }
    }
  }

  // Borde interior del diamante (hueco)
  const ri = r * 0.55;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = Math.abs(x - cx) / ri;
      const dy = Math.abs(y - cy) / ri;
      if (dx + dy < 1) {
        pixels[(y * size + x) * 3]     = BG[0];
        pixels[(y * size + x) * 3 + 1] = BG[1];
        pixels[(y * size + x) * 3 + 2] = BG[2];
      }
    }
  }

  // Construir scanlines (filter byte 0 por fila)
  const rows = [];
  for (let y = 0; y < size; y++) {
    rows.push(Buffer.from([0]));               // filter type None
    rows.push(pixels.subarray(y * size * 3, (y + 1) * size * 3));
  }
  const raw  = Buffer.concat(rows);
  const idat = deflateSync(raw, { level: 6 });

  const sig  = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = chunk('IHDR', Buffer.concat([
    u32(size), u32(size),
    Buffer.from([8, 2, 0, 0, 0]),  // 8-bit RGB, no interlace
  ]));
  const idatChunk = chunk('IDAT', idat);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idatChunk, iend]);
}

for (const size of [192, 512]) {
  const out = `public/icon-${size}.png`;
  writeFileSync(out, makePNG(size));
  console.log(`✓ ${out}`);
}

console.log('\nCuando tengas el logo final:');
console.log('  Reemplazá public/icon-192.png y public/icon-512.png');
console.log('  con tu logo en PNG (fondo sólido, sin transparencia para Android)');
