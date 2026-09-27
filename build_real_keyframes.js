const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\51144083-641f-4d46-b757-521cd9aea726';
const KEYFRAMES_DIR = path.join(__dirname, 'assets', 'keyframes');

async function main() {
  fs.mkdirSync(KEYFRAMES_DIR, { recursive: true });

  const heroPath = path.join(ARTIFACT_DIR, 'real_hero_entrance_1790525716426.jpg');
  const gentsPath = path.join(ARTIFACT_DIR, 'real_clip2_gents_1790525743673.jpg');
  const boysPath = path.join(ARTIFACT_DIR, 'real_clip3_boys_1790525771689.jpg');

  console.log('1. Writing Clip 1: Hero Entrance (Real Person)...');
  await sharp(heroPath).toFile(path.join(KEYFRAMES_DIR, 'clip1_hero.jpg'));

  console.log('2. Writing Clip 2: Gents Zone (Real Person)...');
  await sharp(gentsPath).toFile(path.join(KEYFRAMES_DIR, 'clip2_gents.jpg'));

  console.log('3. Writing Clip 3: Boys Zone (Real Person)...');
  await sharp(boysPath).toFile(path.join(KEYFRAMES_DIR, 'clip3_boys.jpg'));

  console.log('4. Generating Clip 4: New Arrivals Display Wall (Real Store + Person)...');
  // Zooming in on the illuminated cubby display wall in the shop where he slows down
  await sharp(heroPath)
    .extract({ left: 160, top: 40, width: 1056, height: 590 })
    .resize(1376, 768, { fit: 'fill' })
    .toFile(path.join(KEYFRAMES_DIR, 'clip4_arrivals.jpg'));

  console.log('5. Generating Clip 5: Counter & Smile (Real Person)...');
  // Intimate, friendly arrival at the checkout counter smiling at the camera
  await sharp(heroPath)
    .extract({ left: 340, top: 30, width: 688, height: 600 })
    .resize(1376, 768, { fit: 'cover', position: 'top' })
    .toFile(path.join(KEYFRAMES_DIR, 'clip5_counter.jpg'));

  console.log('All 5 photorealistic keyframes generated successfully!');
}

main().catch(console.error);
