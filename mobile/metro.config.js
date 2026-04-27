const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Serve web/index.html directly to prevent Expo's server from injecting
// `defer` onto the bundle script tag, which makes document.currentScript
// null and breaks Metro HMR's platform detection.
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      const url = req.url.split('?')[0];
      if (url === '/' || url === '/index.html') {
        const html = fs.readFileSync(path.join(__dirname, 'web/index.html'), 'utf8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html);
        return;
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
