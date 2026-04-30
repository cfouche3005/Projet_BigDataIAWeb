/**
 * Data Utilities - Handle data transformation and extraction
 */

(function () {
  function asArray(payload) {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && Array.isArray(payload.data)) {
      return payload.data;
    }

    if (payload && Array.isArray(payload.items)) {
      return payload.items;
    }

    if (payload && Array.isArray(payload.results)) {
      return payload.results;
    }

    return [];
  }

  function getValue(item, keys) {
    for (const key of keys) {
      if (item && item[key] !== undefined && item[key] !== null && item[key] !== '') {
        return item[key];
      }
    }

    return '';
  }

  function buildReferenceMaps(referencePayloads) {
    return {
      especes: asArray(referencePayloads.especes),
      etats: asArray(referencePayloads.etats),
      stadesDeveloppement: asArray(referencePayloads.stadesDeveloppement),
      typesPort: asArray(referencePayloads.typesPort),
      typesPied: asArray(referencePayloads.typesPied),
    };
  }

  async function loadReferences() {
    const config = window.APP_API.getConfig();
    const endpoints = config.endpoints;

    const [especes, etats, stadesDeveloppement, typesPort, typesPied] = await Promise.all([
      window.APP_API.apiRequest(endpoints.especes),
      window.APP_API.apiRequest(endpoints.etats),
      window.APP_API.apiRequest(endpoints.stadesDeveloppement),
      window.APP_API.apiRequest(endpoints.typesPort),
      window.APP_API.apiRequest(endpoints.typesPied),
    ]);

    return buildReferenceMaps({
      especes,
      etats,
      stadesDeveloppement,
      typesPort,
      typesPied,
    });
  }

  // Expose globally
  window.APP_DATA = {
    asArray,
    getValue,
    buildReferenceMaps,
    loadReferences,
  };
})();
