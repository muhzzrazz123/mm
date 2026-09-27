const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\51144083-641f-4d46-b757-521cd9aea726';
const PORT = 3000;
const DEBUG_PORT = 9248;

async function run() {
  console.log('Spawning Chrome for section-by-section real person showcase...');
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--no-sandbox',
    '--window-size=1440,900'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
  const targets = await listRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];

  const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        callbacks.get(data.id)(data);
        callbacks.delete(data.id);
      }
    } catch (e) {}
  };

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const timer = setTimeout(() => {
      if (callbacks.has(curId)) {
        callbacks.delete(curId);
        reject(new Error(`Timeout on CDP ${method}`));
      }
    }, 15000);

    callbacks.set(curId, (res) => {
      clearTimeout(timer);
      if (res.error) reject(res.error);
      else resolve(res.result);
    });
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });

  console.log('Navigating to http://localhost:3000/ ...');
  await send('Page.navigate', { url: `http://localhost:${PORT}/` });

  await new Promise(r => setTimeout(r, 4500));

  const sections = [
    { id: 'section-hero', file: 'real_shot_clip1_hero.jpg', name: 'Clip 1 (Hero Roll-in)' },
    { id: 'section-gents', file: 'real_shot_clip2_gents.jpg', name: 'Clip 2 (Gents Zone)' },
    { id: 'section-boys', file: 'real_shot_clip3_boys.jpg', name: 'Clip 3 (Boys Zone)' },
    { id: 'section-new-arrivals', file: 'real_shot_clip4_arrivals.jpg', name: 'Clip 4 (New Arrivals Wall)' },
    { id: 'section-counter', file: 'real_shot_clip5_counter.jpg', name: 'Clip 5 (Counter Checkout)' }
  ];

  for (const sec of sections) {
    console.log(`Scrolling to ${sec.name} (${sec.id})...`);
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.getElementById('${sec.id}');
          if (el) {
            el.scrollIntoView({ behavior: 'instant', block: 'center' });
            if (window.ScrollTrigger) ScrollTrigger.update();
          }
        })()
      `
    });
    await new Promise(r => setTimeout(r, 800));

    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(ARTIFACT_DIR, sec.file), Buffer.from(shot.data, 'base64'));
    console.log(`Saved ${sec.file}`);
  }

  // Click Add to Bag on first item & Open Drawer
  console.log('Clicking Add to Bag button and opening Cart Drawer...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('.btn-card-add');
        if (btn) btn.click();
        setTimeout(() => {
          if (window.cartManager) {
            cartManager.toggleDrawer(true);
          }
        }, 300);
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  const cartShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'real_shot_cart_drawer.jpg'), Buffer.from(cartShot.data, 'base64'));
  console.log('Saved real_shot_cart_drawer.jpg with clicked item!');

  chromeProc.kill();
  console.log('Finished capturing section-bound showcase!');
  process.exit(0);
}

run().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
