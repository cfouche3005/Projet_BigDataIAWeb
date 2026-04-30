(function (global) {
  const defaultApiBaseUrl = 'http://localhost:3000/WEB/php/api.php';

  global.APP_CONFIG = Object.assign(
    {
      apiBaseUrl: defaultApiBaseUrl,
      endpoints: {
        predictions: '/predictions',
        arbres: '/arbres',
        especes: '/especes',
        etats: '/etats',
        stadesDeveloppement: '/stades-developpement',
        typesPort: '/types-port',
        typesPied: '/types-pied',
        predictClusters: '/predict_clusters',
      },
    },
    global.APP_CONFIG || {}
  );
})(window);
