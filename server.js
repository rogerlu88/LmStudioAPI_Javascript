const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Enable CORS with specific options
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Serve static files
app.use(express.static(__dirname));

// Configure proxy middleware
const proxyOptions = {
    target: 'http://localhost:8080',
    changeOrigin: true,
    pathRewrite: {
        '^/v1': '/v1'  // keep the /v1 prefix
    },
    onProxyReq: (proxyReq, req, res) => {
        // Log the outgoing request
        console.log('Proxying request:', {
            method: proxyReq.method,
            path: proxyReq.path,
            headers: proxyReq.getHeaders()
        });
    },
    onProxyRes: (proxyRes, req, res) => {
        // Add CORS headers
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        
        // Log the response
        console.log('Received response:', {
            status: proxyRes.statusCode,
            headers: proxyRes.headers
        });
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({ error: 'Proxy Error', message: err.message });
    }
};

// Handle OPTIONS requests explicitly
app.options('/v1/*', cors());

// Use proxy for all /v1/* routes
app.use('/v1', createProxyMiddleware(proxyOptions));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Proxying requests to LM Studio at http://localhost:8080`);
});
