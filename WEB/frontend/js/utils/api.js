/**
 * API Utilities - Handle all API communication
 */

(function () {
  function getConfig() {
    return window.APP_CONFIG || { apiBaseUrl: '../php/api.php', endpoints: {} };
  }

  function joinApiPath(baseUrl, path) {
    const normalizedBase = String(baseUrl || '').replace(/\/+$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  }

  async function apiRequest(path, options = {}) {
    const config = getConfig();
    const response = await fetch(joinApiPath(config.apiBaseUrl, path), {
      method: options.method || 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    let payload = null;

    if (text) {
      try {
        payload = JSON.parse(text);
      } catch (error) {
        payload = text;
      }
    }

    if (!response.ok) {
      const message = payload && payload.error && payload.error.message
        ? payload.error.message
        : `HTTP ${response.status}`;
      throw new Error(message);
    }

    return payload;
  }

  // Expose globally
  window.APP_API = {
    getConfig,
    joinApiPath,
    apiRequest,
  };
})();
