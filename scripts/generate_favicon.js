const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateFavicon() {
  const logoDark = path.join(__dirname, '../public/logo-dark.png');
  const appIcon = path.join(__dirname, '../src/app/icon.png');
  const appAppleIcon = path.join(__dirname, '../src/app/apple-icon.png');
  const publicFaviconPng = path.join(__dirname, '../public/icon.png');
  const publicFaviconIco = path.join(__dirname, '../public/favicon.ico');

  console.log('Generating favicon from:', logoDark);

  // Create a 512x512 canvas with dark background circle or square, or transparent with green glow
  // Let's create high resolution icon (512x512) containing the logo centered with padding
  const logoBuffer = await sharp(logoDark)
    .resize({ width: 420, height: 420, fit: 'inside' })
    .toBuffer();

  const baseIcon = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 7, g: 13, b: 24, alpha: 1 } // #070D18 brand background
    }
  })
  .composite([{
    input: logoBuffer,
    gravity: 'center'
  }])
  .png();

  await baseIcon.toFile(appIcon);
  await baseIcon.toFile(appAppleIcon);
  await baseIcon.toFile(publicFaviconPng);

  // Also generate standard 32x32 / 48x48 icon for public/favicon.ico
  const ico32 = await sharp(appIcon)
    .resize(32, 32)
    .png()
    .toBuffer();

  fs.writeFileSync(publicFaviconIco, ico32);

  console.log('Favicons generated successfully at src/app/icon.png, src/app/apple-icon.png, public/favicon.ico, and public/icon.png!');
}

generateFavicon().catch(console.error);
