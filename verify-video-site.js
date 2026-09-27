const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\51144083-641f-4d46-b757-521cd9aea726';
const PORT = 3000;
const DEBUG_PORT = 9235;

async function run() {
  console.log(`Checking site at http://localhost:${PORT}/ ...`);
  const checkRes = await fetch(`http://127.0.0.1:${PORT}/`);
  console.log('Site HTTP Status:', checkRes.status);

  console.log('Spawning Headless Chrome...');
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--no-sandbox',
    '--window-size=1440,960'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  const listRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
  const targets = await listRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  console.log('Found Chrome Target:', pageTarget.id, pageTarget.type, pageTarget.title);

  const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);
  let msgId = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        const msg = data.params.args.map(a => a.value || a.description).join(' ');
        console.log('[BROWSER LOG]', data.params.type, msg);
      }
      if (data.id && callbacks.has(data.id)) {
        callbacks.get(data.id)(data);
        callbacks.delete(data.id);
      }
    } catch (e) {
      console.error('Error parsing WS message:', e);
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const timer = setTimeout(() => {
        if (callbacks.has(id)) {
          callbacks.delete(id);
          reject(new Error(`Timeout on CDP ${method}`));
        }
      }, 15000);

      callbacks.set(id, (res) => {
        clearTimeout(timer);
        if (res.error) reject(res.error);
        else resolve(res.result);
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await new Promise(r => ws.onopen = r);
  console.log('Connected to CDP via WebSocket');

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });

  console.log('Navigating to http://localhost:3000/ ...');
  await send('Page.navigate', { url: `http://localhost:${PORT}/` });

  console.log('Waiting 5s for progressive frame loading and preloader fade-out...');
  await new Promise(r => setTimeout(r, 5000));

  // Evaluate site status
  const status = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const canvas = document.getElementById('video-canvas');
        const preloader = document.getElementById('preloader-screen');
        const arrivals = document.querySelectorAll('#new-arrivals-json-grid .video-product-card');
        const allCards = document.querySelectorAll('.video-product-card');
        return {
          preloaderDisplay: preloader ? (preloader.style.display || getComputedStyle(preloader).display) : 'none',
          preloaderOpacity: preloader ? getComputedStyle(preloader).opacity : '0',
          canvasWidth: canvas ? canvas.width : 0,
          canvasHeight: canvas ? canvas.height : 0,
          arrivalsRenderedCount: arrivals.length,
          totalCardsCount: allCards.length
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Site Evaluation:', status.result.value);

  // 1. Capture Clip 1 (Hero)
  console.log('Capturing Clip 1: Hero entrance...');
  await send('Runtime.evaluate', {
    expression: `
      if (window.ScrollVideoExperience) ScrollVideoExperience.drawFrame(0);
    `
  });
  await new Promise(r => setTimeout(r, 600));
  const heroShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'shot_clip1_hero.jpg'), Buffer.from(heroShot.data, 'base64'));
  console.log('Saved shot_clip1_hero.jpg');

  // 2. Scroll to Clip 2: Gents Zone
  console.log('Scrolling to Clip 2: Gents Zone...');
  await send('Runtime.evaluate', {
    expression: `
      if (window.ScrollVideoExperience && ScrollVideoExperience.lenis()) {
        ScrollVideoExperience.lenis().scrollTo('#section-gents', { immediate: true, offset: 40 });
        ScrollVideoExperience.drawFrame(16);
      } else {
        document.getElementById('section-gents').scrollIntoView();
      }
      ScrollTrigger.update();
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  const gentsShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'shot_clip2_gents.jpg'), Buffer.from(gentsShot.data, 'base64'));
  console.log('Saved shot_clip2_gents.jpg');

  // 3. Scroll to Clip 3: Boys Zone
  console.log('Scrolling to Clip 3: Boys Zone...');
  await send('Runtime.evaluate', {
    expression: `
      if (window.ScrollVideoExperience && ScrollVideoExperience.lenis()) {
        ScrollVideoExperience.lenis().scrollTo('#section-boys', { immediate: true, offset: -60 });
        ScrollVideoExperience.drawFrame(28);
      } else {
        document.getElementById('section-boys').scrollIntoView();
      }
      ScrollTrigger.update();
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  const boysShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'shot_clip3_boys.jpg'), Buffer.from(boysShot.data, 'base64'));
  console.log('Saved shot_clip3_boys.jpg');

  // 4. Scroll to Clip 4: New Arrivals
  console.log('Scrolling to Clip 4: New Arrivals...');
  await send('Runtime.evaluate', {
    expression: `
      if (window.ScrollVideoExperience && ScrollVideoExperience.lenis()) {
        ScrollVideoExperience.lenis().scrollTo('#section-new-arrivals', { immediate: true, offset: -60 });
        ScrollVideoExperience.drawFrame(40);
      } else {
        document.getElementById('section-new-arrivals').scrollIntoView();
      }
      ScrollTrigger.update();
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  const arrivalsShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'shot_clip4_arrivals.jpg'), Buffer.from(arrivalsShot.data, 'base64'));
  console.log('Saved shot_clip4_arrivals.jpg');

  // 5. Scroll to Clip 5: Counter
  console.log('Scrolling to Clip 5: Counter & Order...');
  await send('Runtime.evaluate', {
    expression: `
      if (window.ScrollVideoExperience && ScrollVideoExperience.lenis()) {
        ScrollVideoExperience.lenis().scrollTo('#section-counter', { immediate: true, offset: -60 });
        ScrollVideoExperience.drawFrame(56);
      } else {
        document.getElementById('section-counter').scrollIntoView();
      }
      ScrollTrigger.update();
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  const counterShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'shot_clip5_counter.jpg'), Buffer.from(counterShot.data, 'base64'));
  console.log('Saved shot_clip5_counter.jpg');

  // 6. Test Cart & WhatsApp Drawer
  console.log('Testing Cart add & WhatsApp drawer...');
  const cartInfo = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('.btn-card-add');
        if (btn) btn.click();
        if (window.cartManager) {
          cartManager.toggleDrawer(true);
        }
        return {
          itemCount: window.cartManager ? cartManager.getItemCount() : 0,
          totalValuation: window.cartManager ? cartManager.getTotalPrice() : 0,
          waUrl: window.cartManager ? cartManager.generateWhatsAppUrl() : ''
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Cart Status:', cartInfo.result.value);
  await new Promise(r => setTimeout(r, 1000));

  const cartShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'shot_cart_drawer.jpg'), Buffer.from(cartShot.data, 'base64'));
  console.log('Saved shot_cart_drawer.jpg');

  chromeProc.kill();
  console.log('Verification completed successfully!');
  process.exit(0);
}

run().catch(e => {
  console.error('Verification failed:', e);
  process.exit(1);
});
