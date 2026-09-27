const { spawn } = require('child_process');

async function run() {
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9245',
    '--no-sandbox',
    '--window-size=1440,900'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch('http://127.0.0.1:9245/json/list');
  const targets = await listRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];

  const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const handler = (evt) => {
      const d = JSON.parse(evt.data);
      if (d.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(d.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 4000));

  const metrics = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const sections = ['section-hero', 'section-gents', 'section-boys', 'section-new-arrivals', 'section-counter'];
        const docH = document.documentElement.scrollHeight;
        const winH = window.innerHeight;
        const maxScroll = docH - winH;
        return sections.map(id => {
          const el = document.getElementById(id);
          return {
            id,
            offsetTop: el ? el.offsetTop : 0,
            clientHeight: el ? el.clientHeight : 0,
            targetScrollY: el ? el.offsetTop - 70 : 0,
            progress: el ? (el.offsetTop - 70) / maxScroll : 0,
            frameIdx: Math.floor(((el.offsetTop - 70) / maxScroll) * 60)
          };
        });
      })()
    `,
    returnByValue: true
  });
  console.log('Section Metrics:', JSON.stringify(metrics.result.value, null, 2));
  chromeProc.kill();
  process.exit(0);
}
run();
