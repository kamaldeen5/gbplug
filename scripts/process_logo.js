const sharp = require('sharp');
const path = require('path');

async function processLogo() {
  const inputPath = path.join(__dirname, '../public/logo.jpg');
  const outDark = path.join(__dirname, '../public/logo-dark.png');
  const outLight = path.join(__dirname, '../public/logo-light.png');

  console.log('Reading input:', inputPath);

  // Load raw pixel buffer
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { data, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 4 (RGBA)

  // Buffer for Dark mode (white + green on transparent)
  const darkBuf = Buffer.from(data);
  // Buffer for Light mode (dark slate + green on transparent)
  const lightBuf = Buffer.from(data);

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check if pixel is background (near black)
    const maxVal = Math.max(r, g, b);
    if (maxVal < 40) {
      // Fully transparent
      darkBuf[i + 3] = 0;
      lightBuf[i + 3] = 0;
    } else {
      // Smooth alpha for edge anti-aliasing
      const alpha = maxVal < 90 ? Math.round(((maxVal - 30) / 60) * 255) : 255;
      darkBuf[i + 3] = alpha;
      lightBuf[i + 3] = alpha;

      // Check if green (g is dominant and r, b are lower)
      const isGreen = g > 100 && g > r * 1.25 && g > b * 1.25;

      if (!isGreen) {
        // Pixel is part of the white text/symbol -> for light mode, make it slate-900 (#0F172A)
        const intensity = (r + g + b) / (3 * 255);
        lightBuf[i] = Math.round(15 * intensity);      // Red = 15
        lightBuf[i + 1] = Math.round(23 * intensity);  // Green = 23
        lightBuf[i + 2] = Math.round(42 * intensity);  // Blue = 42
      }
    }
  }

  // Trim excess black bounding box space
  await sharp(darkBuf, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 5 })
    .png({ quality: 100 })
    .toFile(outDark);

  await sharp(lightBuf, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 5 })
    .png({ quality: 100 })
    .toFile(outLight);

  console.log('Successfully generated transparent logo-dark.png and logo-light.png!');
}

processLogo().catch(console.error);
