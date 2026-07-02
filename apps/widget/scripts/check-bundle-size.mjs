import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

const LIMITS = {
  'trakr-widget.js': 80 * 1024,
};

function gzipSize(filePath) {
  const content = fs.readFileSync(filePath);
  return zlib.gzipSync(content).length;
}

let failed = false;

for (const [fileName, maxBytes] of Object.entries(LIMITS)) {
  const filePath = path.join(distDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.error(`Missing bundle: ${fileName}`);
    failed = true;
    continue;
  }

  const size = gzipSize(filePath);
  const maxKb = (maxBytes / 1024).toFixed(1);
  const sizeKb = (size / 1024).toFixed(1);

  if (size > maxBytes) {
    console.error(
      `${fileName}: ${sizeKb} KB gzip exceeds ${maxKb} KB budget`,
    );
    failed = true;
  } else {
    console.log(`${fileName}: ${sizeKb} KB gzip (budget ${maxKb} KB)`);
  }
}

if (failed) {
  process.exit(1);
}
