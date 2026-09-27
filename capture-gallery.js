const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\51144083-641f-4d46-b757-521cd9aea726';
const PORT = 3004;

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
          res.end('404');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function main() {
  const localServer = await startServer();
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--no-sandbox',
    '--window-size=1440,960'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch('http://127.0.0.1:9227/json/list');
  const targets = await listRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];

  const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);
  let msgId = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data);
      callbacks.delete(data.id);
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
  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  await send('Page.navigate', { url: `http://localhost:${PORT}/` });
  await new Promise(r => setTimeout(r, 3500));

  // 1. Initial Hero view
  const heroShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_hero.png'), Buffer.from(heroShot.data, 'base64'));

  // 2. Scrub Hero Fabric Bolt Unroll
  await send('Runtime.evaluate', {
    expression: `
      window.scrollTo({ top: 280, behavior: 'instant' });
      ScrollTrigger.update();
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  const heroUnrolledShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_hero_unrolled.png'), Buffer.from(heroUnrolledShot.data, 'base64'));

  // 3. Scroll to Shirt Assembly section and scrub into Stage 3
  await send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('shirt-assembly-section');
      el.scrollIntoView({ behavior: 'instant' });
      window.scrollBy(0, 750);
      ScrollTrigger.update();
    `
  });
  await new Promise(r => setTimeout(r, 1500));
  const shirtShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_shirt_assembly.png'), Buffer.from(shirtShot.data, 'base64'));

  // 4. Scroll to Duo Split section
  await send('Runtime.evaluate', {
    expression: `
      const duo = document.getElementById('duo-split-section');
      duo.scrollIntoView({ behavior: 'instant' });
      window.scrollBy(0, 500);
      ScrollTrigger.update();
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  const duoShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_duo_split.png'), Buffer.from(duoShot.data, 'base64'));

  // 5. Scroll to Collections Grid
  await send('Runtime.evaluate', {
    expression: `
      const collections = document.getElementById('collections');
      collections.scrollIntoView({ behavior: 'instant' });
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  const collShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_collections_grid.png'), Buffer.from(collShot.data, 'base64'));

  chromeProc.kill();
  localServer.close();
  console.log('All gallery screenshots updated successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
