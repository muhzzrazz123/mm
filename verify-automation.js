const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\51144083-641f-4d46-b757-521cd9aea726';
const PORT = 3001;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(__dirname, reqPath);

      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
      });
    });

    server.listen(PORT, () => {
      console.log(`Internal static server listening on http://localhost:${PORT}/`);
      resolve(server);
    });
  });
}

async function main() {
  const localServer = await startServer();

  console.log('Launching headless Chrome with remote debugging on port 9223...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-extensions',
    '--window-size=1440,960'
  ]);

  // Wait for Chrome to initialize
  await new Promise(r => setTimeout(r, 2000));

  const listRes = await fetch('http://127.0.0.1:9223/json/list');
  const targets = await listRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  console.log('Connected to Chrome target:', pageTarget.id);

  const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);

  let msgId = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data);
      callbacks.delete(data.id);
    }
    if (data.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER CONSOLE]', data.params.type, data.params.args.map(a => a.value || a.description).join(' '));
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      callbacks.set(id, (res) => {
        if (res.error) reject(res.error);
        else resolve(res.result);
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await new Promise(r => ws.onopen = r);
  console.log('CDP WebSocket connected!');

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  console.log(`Navigating to http://localhost:${PORT}/ ...`);
  await send('Page.navigate', { url: `http://localhost:${PORT}/` });
  
  // Wait for network and assets to settle
  await new Promise(r => setTimeout(r, 4000));

  // Capture Hero Screenshot
  console.log('Capturing Hero screenshot...');
  const heroShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_hero.png'), Buffer.from(heroShot.data, 'base64'));
  fs.writeFileSync(path.join(__dirname, 'screenshot_hero.png'), Buffer.from(heroShot.data, 'base64'));
  console.log('Hero screenshot saved!');

  // Scroll to unroll the fabric bolt partially
  console.log('Scrubbing hero scroll...');
  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo({ top: 300, behavior: 'instant' });
      ScrollTrigger.update();
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  // Scroll to Shirt Assembly section and scrub
  console.log('Scrolling to Shirt Assembly section...');
  await send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('shirt-assembly-section');
      el.scrollIntoView({ behavior: 'instant' });
      window.scrollBy(0, 500); // Scrub midway
      ScrollTrigger.update();
    `
  });
  await new Promise(r => setTimeout(r, 2000));

  const assemblyStatus = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const triggers = ScrollTrigger.getAll();
        const activeCard = document.querySelector('.assembly-stage-card.active');
        const meter = document.querySelector('.assembly-meter-fill');
        return {
          totalTriggers: triggers.length,
          activeStage: activeCard ? activeCard.querySelector('.stage-step-title').textContent : 'None',
          meterHeight: meter ? meter.style.height : '0%'
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Assembly Scrubbing Status:', assemblyStatus.result.value);

  // Capture Shirt Assembly Screenshot
  console.log('Capturing Shirt Assembly screenshot...');
  const shirtShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_shirt_assembly.png'), Buffer.from(shirtShot.data, 'base64'));
  fs.writeFileSync(path.join(__dirname, 'screenshot_shirt_assembly.png'), Buffer.from(shirtShot.data, 'base64'));
  console.log('Shirt Assembly screenshot saved!');

  // Test Add-to-Cart
  console.log('Testing Add-to-Cart end-to-end...');
  const cartTest = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('.btn-add-cart');
        if (btn) btn.click();
        const count = cartManager.getItemCount();
        const total = cartManager.getTotalPrice();
        const url = cartManager.generateWhatsAppUrl();
        return {
          itemCount: count,
          totalValuation: total,
          whatsAppUrl: url
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Cart Test Result:', cartTest.result.value);

  // Open Cart Drawer and Screenshot
  await send('Runtime.evaluate', { expression: `cartManager.toggleDrawer(true);` });
  await new Promise(r => setTimeout(r, 800));

  const cartShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_cart_drawer.png'), Buffer.from(cartShot.data, 'base64'));
  fs.writeFileSync(path.join(__dirname, 'screenshot_cart_drawer.png'), Buffer.from(cartShot.data, 'base64'));
  console.log('Cart Drawer screenshot saved!');

  // Clean up
  chromeProc.kill();
  localServer.close();
  console.log('Verification finished successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error('Error in verification:', err);
  process.exit(1);
});
