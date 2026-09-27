const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\51144083-641f-4d46-b757-521cd9aea726';
const PORT = 3003;

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
    '--remote-debugging-port=9225',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,960'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch('http://127.0.0.1:9225/json/list');
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

  // 1. Capture Father & Son Duo Split Section
  await send('Runtime.evaluate', {
    expression: `
      const duo = document.getElementById('duo-split-section');
      duo.scrollIntoView({ behavior: 'instant' });
      window.scrollBy(0, 300);
      ScrollTrigger.update();
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  const duoShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_father_son_split.png'), Buffer.from(duoShot.data, 'base64'));

  // 2. Capture 360 Studio Section
  await send('Runtime.evaluate', {
    expression: `
      const studio = document.getElementById('interactive-studio');
      studio.scrollIntoView({ behavior: 'instant' });
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  const studioShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_studio_360.png'), Buffer.from(studioShot.data, 'base64'));

  // 3. Capture Inside MOCCA Showroom Section
  await send('Runtime.evaluate', {
    expression: `
      const about = document.getElementById('about');
      about.scrollIntoView({ behavior: 'instant' });
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  const moccaShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_mocca_showroom.png'), Buffer.from(moccaShot.data, 'base64'));

  // 4. Capture Boys Collection filter clicked
  await send('Runtime.evaluate', {
    expression: `
      const collections = document.getElementById('collections');
      collections.scrollIntoView({ behavior: 'instant' });
      const boysBtn = document.querySelector('.filter-btn[data-filter="boys"]');
      if (boysBtn) boysBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  const boysShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_boys_collection.png'), Buffer.from(boysShot.data, 'base64'));

  chromeProc.kill();
  localServer.close();
  console.log('Detailed section views captured successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
