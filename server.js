const http = require('http');
const port = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
  if (req.url === '/health') { res.writeHead(200, {'Content-Type':'application/json'}); return res.end(JSON.stringify({ok:true, service:'render-free-test-sam', time:new Date().toISOString()})); }
  res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
  res.end(`<!doctype html><html><head><title>Render Free Test - Sam</title><style>body{font-family:system-ui;background:#12131B;color:#E6E9F5;display:grid;place-items:center;height:100vh;margin:0}.card{text-align:center;padding:32px;border:1px solid #8B7CF6;border-radius:16px}h1{color:#8B7CF6}</style></head><body><div class="card"><h1>Render Free Test Live hai!</h1><p>GitHub se auto deploy hua hai, Nobi Bot ne banaya hai Sam ke liye.</p></div></body></html>`);
});
server.listen(port, '0.0.0.0', () => console.log('Listening on '+port));
