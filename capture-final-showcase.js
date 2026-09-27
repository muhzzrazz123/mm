const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\ASUS\\.gemini\antigravity\\brain\\51144083-641f-4d46-b757-521cd9aea726';
const PORT = 3005;

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
        res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
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
    '--remote-debugging-port=9228',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--no-sandbox',
    '--window-size=1440,960'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch('http://127.0.0.1:9228/json/list');
  const targets = await listRes.json();
  const pageTarget = targets[0];

  const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((res, rej) => {
    const curId = id++;
    const handler = (evt) => {
      const d = JSON.parse(evt.data);
      if (d.id === curId) {
        ws.removeEventListener('message', handler);
        res(d.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');

  await send('Page.navigate', { url: `http://localhost:${PORT}/` });
  await new Promise(r => setTimeout(r, 3000));

  // 1. Scrub to Hero Bolt Unroll
  await send('Runtime.evaluate', {
    expression: `
      ThreeShowroom.scrubHeroFabric(0.7);
    `
  });
  await new Promise(r => setTimeout(r, 800));
  const heroShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_hero_unrolled.png'), Buffer.from(heroShot.data, 'base64'));

  // 2. Scroll to Shirt Assembly section and scrub to 0.88 (Fully assembled with buttons, collar, sleeves)
  await send('Runtime.evaluate', {
    expression: `
      const el = document.getElementById('shirt-assembly-section');
      el.scrollIntoView({ behavior: 'instant' });
      ThreeShowroom.scrubShirtAssembly(0.88);
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  const shirtShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_shirt_fully_assembled.png'), Buffer.from(shirtShot.data, 'base64'));
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_shirt_assembly.png'), Buffer.from(shirtShot.data, 'base64'));

  chromeProc.kill();
  localServer.close();
  console.log('Final showcase screenshots captured successfully!');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
