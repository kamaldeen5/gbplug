const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processPWAAssets() {
  const inputImg = 'C:/Users/DELL/.gemini/antigravity/brain/dce69228-f970-431f-988d-a5185e442cbc/.user_uploaded/media_1787604284780.jpg';
  const publicDir = path.join(__dirname, '../public');
  const appDir = path.join(__dirname, '../src/app');

  console.log('Processing PWA & Favicon icons from:', inputImg);

  // 1. App Icon / Favicon 512x512
  await sharp(inputImg)
    .resize(512, 512)
    .png()
    .toFile(path.join(appDir, 'icon.png'));

  // 2. Apple Touch Icon (180x180)
  await sharp(inputImg)
    .resize(180, 180)
    .png()
    .toFile(path.join(appDir, 'apple-icon.png'));

  // 3. Public icons for PWA Manifest
  await sharp(inputImg)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  await sharp(inputImg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  await sharp(inputImg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon.png'));

  // 4. Favicon ICO 32x32
  const ico32 = await sharp(inputImg)
    .resize(32, 32)
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico32);

  // 5. Maskable Icon 512x512 with safe area padding
  const innerLogo = await sharp(inputImg)
    .resize(410, 410)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 7, g: 13, b: 24, alpha: 1 }
    }
  })
  .composite([{ input: innerLogo, gravity: 'center' }])
  .png()
  .toFile(path.join(publicDir, 'maskable-icon.png'));

  console.log('All PWA and Favicon assets successfully generated!');
}

processPWAAssets().catch(console.error);
