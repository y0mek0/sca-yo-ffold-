const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PORT = Number(process.env.DEMO_WEB_PORT || 4173);
const TOPIC = '0.0.10426202';

function send(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname === '/favicon.ico') return send(res, 204, 'image/x-icon', '');
  if (url.pathname.startsWith('/mirror/')) {
    const sequence = url.pathname.split('/').pop();
    if (!/^\d+$/.test(sequence)) return send(res, 400, 'text/plain; charset=utf-8', 'Invalid sequence');
    try {
      const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/topics/${TOPIC}/messages/${sequence}`);
      send(res, response.status, 'application/json; charset=utf-8', await response.text());
    } catch (error) {
      send(res, 502, 'application/json; charset=utf-8', JSON.stringify({ error: error.message }));
    }
    return;
  }
  const file = url.pathname === '/' ? 'infographic.html' : url.pathname.slice(1);
  const safe = path.resolve(ROOT, file);
  if (!safe.startsWith(path.resolve(ROOT))) return send(res, 403, 'text/plain; charset=utf-8', 'Forbidden');
  if (!fs.existsSync(safe)) return send(res, 404, 'text/plain; charset=utf-8', 'Not found');
  const ext = path.extname(safe).toLowerCase();
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.cjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  send(res, 200, mime[ext] || 'application/octet-stream', fs.readFileSync(safe));
});

server.listen(PORT, '127.0.0.1', () => console.log(`Demo browser server listening on http://127.0.0.1:${PORT}`));
