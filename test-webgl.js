const { spawn } = require('child_process');

async function testWebGL() {
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--no-sandbox',
    '--window-size=1440,960'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch('http://127.0.0.1:9226/json/list');
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
  await send('Page.navigate', { url: 'http://localhost:3001/' });
  await new Promise(r => setTimeout(r, 3500));

  const webglStatus = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const c = document.createElement('canvas');
        const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
        return {
          supported: !!gl,
          renderer: gl ? gl.getParameter(gl.RENDERER) : null,
          vendor: gl ? gl.getParameter(gl.VENDOR) : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Headless WebGL Support:', webglStatus.result.value);

  chromeProc.kill();
  process.exit(0);
}

testWebGL().catch(e => { console.error(e); process.exit(1); });
