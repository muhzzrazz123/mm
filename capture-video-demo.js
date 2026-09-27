const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\51144083-641f-4d46-b757-521cd9aea726';
const PORT = 3000;

async function run() {
  console.log('Testing running server at http://localhost:3000...');
  
  const res = await fetch(`http://127.0.0.1:${PORT}/index.html`);
  if (!res.ok) {
    throw new Error(`Server returned HTTP ${res.status}`);
  }
  console.log('Server is responding with HTTP 200 OK!');

  console.log('Launching Headless Chrome with WebGL enabled...');
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9232',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--no-sandbox',
    '--window-size=1440,900'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch('http://127.0.0.1:9232/json/list');
  const targets = await listRes.json();
  const pageTarget = targets[0];

  const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (evt) => {
    try {
      const d = JSON.parse(evt.data);
      if (d.method === 'Runtime.consoleAPICalled') {
        const text = d.params.args.map(a => a.value || a.description).join(' ');
        console.log(`[BROWSER CONSOLE] ${text}`);
      }
      if (d.id && callbacks.has(d.id)) {
        callbacks.get(d.id)(d);
        callbacks.delete(d.id);
      }
    } catch (e) {
      console.error('Error handling message:', e);
    }
  };

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const timer = setTimeout(() => {
      if (callbacks.has(curId)) {
        callbacks.delete(curId);
        reject(new Error(`Timeout waiting for CDP method ${method}`));
      }
    }, 10000);

    callbacks.set(curId, (d) => {
      clearTimeout(timer);
      if (d.error) reject(d.error);
      else resolve(d.result);
    });
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  console.log('Connected to Chrome DevTools Protocol');

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('Navigating to http://localhost:3000/...');
  await send('Page.navigate', { url: `http://localhost:${PORT}/` });

  // Wait for preloader to load 60 frames and fade
  console.log('Waiting for progressive preloader...');
  await new Promise(r => setTimeout(r, 4500));

  const checkStatus = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const loader = document.getElementById('preloader-screen');
        const canvas = document.getElementById('video-canvas');
        const arrivalsCount = document.querySelectorAll('#new-arrivals-json-grid .video-product-card').length;
        const productsCount = document.querySelectorAll('.product-card').length;
        return {
          loaderDisplay: loader ? loader.style.display : 'none',
          canvasWidth: canvas ? canvas.width : 0,
          canvasHeight: canvas ? canvas.height : 0,
          arrivalsCount,
          productsCount
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Page Status:', checkStatus.result.value);

  // 1. Capture Clip 1 (Hero)
  console.log('Capturing Clip 1: Hero entrance...');
  const shotClip1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'clip1_hero_scrub.png'), Buffer.from(shotClip1.data, 'base64'));
  console.log('Clip 1 saved.');

  // 2. Scroll to Clip 2: Gents Zone
  console.log('Scrolling to Clip 2: Gents Zone...');
  await send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('section-gents');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      ScrollTrigger.update();
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  const shotClip2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'clip2_gents_scrub.png'), Buffer.from(shotClip2.data, 'base64'));
  console.log('Clip 2 saved.');

  // 3. Scroll to Clip 3: Boys Zone
  console.log('Scrolling to Clip 3: Boys Zone...');
  await send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('section-boys');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      ScrollTrigger.update();
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  const shotClip3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'clip3_boys_scrub.png'), Buffer.from(shotClip3.data, 'base64'));
  console.log('Clip 3 saved.');

  // 4. Scroll to Clip 4: New Arrivals (JSON feed)
  console.log('Scrolling to Clip 4: New Arrivals...');
  await send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('section-new-arrivals');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
      ScrollTrigger.update();
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  const shotClip4 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'clip4_arrivals_scrub.png'), Buffer.from(shotClip4.data, 'base64'));
  console.log('Clip 4 saved.');

  // 5. Scroll to Clip 5: Counter & WhatsApp Order
  console.log('Scrolling to Clip 5: Counter & Order...');
  await send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('section-counter');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      ScrollTrigger.update();
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  const shotClip5 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'clip5_counter_scrub.png'), Buffer.from(shotClip5.data, 'base64'));
  console.log('Clip 5 saved.');

  // 6. Test Cart & WhatsApp flow
  console.log('Testing Add to Cart and opening Drawer...');
  const cartEval = await send('Runtime.evaluate', {
    expression: `
      (() => {
        // Add item from new arrivals
        const addBtn = document.querySelector('.btn-card-add');
        if (addBtn) addBtn.click();
        
        // Open Cart Drawer
        if (window.cartManager) {
          cartManager.toggleDrawer(true);
        }
        return {
          itemCount: window.cartManager ? cartManager.getItemCount() : 0,
          totalPrice: window.cartManager ? cartManager.getTotalPrice() : 0,
          whatsAppUrl: window.cartManager ? cartManager.generateWhatsAppUrl() : ''
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Cart Evaluation:', cartEval.result.value);

  await new Promise(r => setTimeout(r, 800));
  const shotCart = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_video_cart_drawer.png'), Buffer.from(shotCart.data, 'base64'));
  console.log('Cart drawer screenshot saved.');

  chromeProc.kill();
  console.log('All tests and captures completed successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error('Error during execution:', err);
  process.exit(1);
});
