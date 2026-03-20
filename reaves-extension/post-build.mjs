/**
 * post-build.mjs — copies static extension files into dist/
 */
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const dist = join(__dir, 'dist');
mkdirSync(dist, { recursive: true });

const files = [
  ['manifest.json', 'manifest.json'],
  ['background.js', 'background.js'],
  ['content_script.js', 'content_script.js'],
  ['public/icon.svg', 'icon.svg'],
];

for (const [src, dest] of files) {
  const srcPath = join(__dir, src);
  const destPath = join(dist, dest);
  if (existsSync(srcPath)) {
    copyFileSync(srcPath, destPath);
    console.log(`✓ ${dest}`);
  } else {
    console.warn(`⚠  Missing: ${src}`);
  }
}

console.log('✅ Done. Load dist/ as unpacked extension.');
