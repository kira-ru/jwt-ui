const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || 'https://api.example.com';
const DIST_DIR = path.join(__dirname, 'dist', 'jwt-ui', 'browser');

http.createServer((req, res) => {
    // simple proxy for api
    if (req.url.startsWith('/api')) {
        const targetUrl = API_URL + req.url.replace('/api', '');

        https.get(targetUrl, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        }).on('error', (err) => {
            res.writeHead(500);
            res.end('Proxy error: ' + err.message);
        });
        return;
    }

    let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);

    if (!fs.existsSync(filePath)) {
        filePath = path.join(DIST_DIR, 'index.html');
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200);
            res.end(content);
        }
    });
}).listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`API_URL: ${API_URL}`);
});
