// Extends app.json. WEB_BASE_URL lets the web build live under a sub-path
// (for example /Project-Management on GitHub Pages).
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.WEB_BASE_URL ? { baseUrl: process.env.WEB_BASE_URL } : {}),
  },
});
