import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = './public';

// Select which concept to generate the final favicons for
const inputFile = path.join(publicDir, 'favicon.png'); // using the user's uploaded image

async function generateFavicons() {
  try {
    const inputBuffer = fs.readFileSync(inputFile);

    // 16x16
    await sharp(inputBuffer)
      .resize(16, 16)
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));
    console.log('Generated favicon-16x16.png');

    // 32x32
    await sharp(inputBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    console.log('Generated favicon-32x32.png');

    // 48x48
    await sharp(inputBuffer)
      .resize(48, 48)
      .png()
      .toFile(path.join(publicDir, 'favicon-48x48.png'));
    console.log('Generated favicon-48x48.png');

    // apple-touch-icon (180x180)
    await sharp(inputBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('Generated apple-touch-icon.png');

    // favicon.ico (We can copy the 32x32 png as .ico, browsers support this, 
    // but ideally you'd use a specific ICO builder. A 32x32 png renamed works universally today.)
    fs.copyFileSync(path.join(publicDir, 'favicon-32x32.png'), path.join(publicDir, 'favicon.ico'));
    console.log('Generated favicon.ico');

  } catch (err) {
    console.error('Error generating favicons:', err);
  }
}
generateFavicons();
