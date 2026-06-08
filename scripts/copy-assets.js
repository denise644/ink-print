import { promises as fs } from 'fs';
import path from 'path';

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  const src = 'src/assets/images';
  const dest = 'public/assets/images';

  try {
    const srcExists = await fs.stat(src).then(() => true).catch(() => false);
    if (srcExists) {
      console.log(`Copying ${src} to ${dest}...`);
      await copyDir(src, dest);
      console.log('Copying completed successfully!');
    } else {
      console.log(`Source directory ${src} does not exist, skipping.`);
    }
  } catch (err) {
    console.error('Error in asset copy script:', err);
    process.exit(1);
  }
}

main();
