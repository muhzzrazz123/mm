const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const KEYFRAMES_DIR = path.join(__dirname, '..', 'assets', 'keyframes');
const FRAMES_DIR = path.join(__dirname, '..', 'frames');

// Clip configurations
const CLIPS = [
  {
    id: 'clip1',
    source: path.join(KEYFRAMES_DIR, 'clip1_hero.jpg'),
    frames: 12,
    // Camera dollying in as skater rolls toward camera
    transform: (t, width, height) => {
      // t goes 0 to 1
      const scale = 0.88 + t * 0.16; // zoom in from 0.88 to 1.04
      const cropW = Math.round(width / scale);
      const cropH = Math.round(height / scale);
      const left = Math.round((width - cropW) / 2);
      const top = Math.round((height - cropH) * 0.65); // track low on skater
      return { left: Math.max(0, left), top: Math.max(0, top), width: Math.min(width, cropW), height: Math.min(height, cropH) };
    }
  },
  {
    id: 'clip2',
    source: path.join(KEYFRAMES_DIR, 'clip2_gents.jpg'),
    frames: 12,
    // Lateral tracking pan from left to right as skater glides past suits
    transform: (t, width, height) => {
      const scale = 1.08;
      const cropW = Math.round(width / scale);
      const cropH = Math.round(height / scale);
      const maxPanX = width - cropW;
      const left = Math.round(maxPanX * (0.1 + t * 0.8)); // pan across rack
      const top = Math.round((height - cropH) * 0.5);
      return { left: Math.max(0, left), top: Math.max(0, top), width: Math.min(width, cropW), height: Math.min(height, cropH) };
    }
  },
  {
    id: 'clip3',
    source: path.join(KEYFRAMES_DIR, 'clip3_boys.jpg'),
    frames: 12,
    // Ollie vertical jump arch + slight forward tracking
    transform: (t, width, height) => {
      const scale = 1.05;
      const cropW = Math.round(width / scale);
      const cropH = Math.round(height / scale);
      // Parabolic jump arc: peak at t = 0.5
      const jumpArc = 4 * t * (1 - t);
      const left = Math.round((width - cropW) * (0.3 + t * 0.4));
      const top = Math.round((height - cropH) * (0.6 - jumpArc * 0.35));
      return { left: Math.max(0, left), top: Math.max(0, top), width: Math.min(width, cropW), height: Math.min(height, cropH) };
    }
  },
  {
    id: 'clip4',
    source: path.join(KEYFRAMES_DIR, 'clip4_arrivals.jpg'),
    frames: 12,
    // Slowing down and pushing in to the display wall
    transform: (t, width, height) => {
      // Ease out deceleration
      const easeOut = 1 - Math.pow(1 - t, 2.5);
      const scale = 0.92 + easeOut * 0.16;
      const cropW = Math.round(width / scale);
      const cropH = Math.round(height / scale);
      const left = Math.round((width - cropW) * (0.4 + easeOut * 0.3));
      const top = Math.round((height - cropH) * 0.5);
      return { left: Math.max(0, left), top: Math.max(0, top), width: Math.min(width, cropW), height: Math.min(height, cropH) };
    }
  },
  {
    id: 'clip5',
    source: path.join(KEYFRAMES_DIR, 'clip5_counter.jpg'),
    frames: 12,
    // Stepping off board at counter, camera settles & frames character smile
    transform: (t, width, height) => {
      const scale = 0.95 + t * 0.08;
      const cropW = Math.round(width / scale);
      const cropH = Math.round(height / scale);
      const left = Math.round((width - cropW) * 0.5);
      const top = Math.round((height - cropH) * (0.55 - t * 0.15));
      return { left: Math.max(0, left), top: Math.max(0, top), width: Math.min(width, cropW), height: Math.min(height, cropH) };
    }
  }
];

async function generateAllFrames() {
  console.log('Starting WebP frame generation...');

  // Target standard resolution: 1280x720 (crisp, lightweight, 60fps canvas performance)
  const TARGET_W = 1280;
  const TARGET_H = 720;
  // Mobile resolution: 640x360
  const MOBILE_W = 640;
  const MOBILE_H = 360;

  for (const clip of CLIPS) {
    const clipDir = path.join(FRAMES_DIR, clip.id);
    fs.mkdirSync(clipDir, { recursive: true });

    const metadata = await sharp(clip.source).metadata();
    const srcW = metadata.width;
    const srcH = metadata.height;
    console.log(`Processing ${clip.id} from ${clip.source} (${srcW}x${srcH})...`);

    for (let i = 1; i <= clip.frames; i++) {
      const t = (i - 1) / (clip.frames - 1);
      const crop = clip.transform(t, srcW, srcH);
      const frameName = `frame_${String(i).padStart(3, '0')}.webp`;
      const outPath = path.join(clipDir, frameName);

      // Desktop standard frame
      await sharp(clip.source)
        .extract(crop)
        .resize(TARGET_W, TARGET_H, { fit: 'cover' })
        .webp({ quality: 82, effort: 4 })
        .toFile(outPath);

      // Mobile low-bandwidth frame
      const mobileDir = path.join(FRAMES_DIR, 'mobile', clip.id);
      fs.mkdirSync(mobileDir, { recursive: true });
      const mobileOut = path.join(mobileDir, frameName);
      await sharp(clip.source)
        .extract(crop)
        .resize(MOBILE_W, MOBILE_H, { fit: 'cover' })
        .webp({ quality: 72, effort: 3 })
        .toFile(mobileOut);
    }
    console.log(`Done generating ${clip.frames} frames for ${clip.id}`);
  }

  // Generate poster fallback image
  console.log('Generating fallback poster...');
  const posterPath = path.join(FRAMES_DIR, 'poster.webp');
  await sharp(CLIPS[0].source)
    .resize(TARGET_W, TARGET_H, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(posterPath);

  console.log('All WebP frame sequences successfully generated!');
}

generateAllFrames().catch(err => {
  console.error('Frame generation failed:', err);
  process.exit(1);
});
