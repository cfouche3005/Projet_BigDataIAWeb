(function (global) {
  const defaultApiBaseUrl = '../php/api.php';

  global.APP_CONFIG = Object.assign(
    {
      apiBaseUrl: defaultApiBaseUrl,
      mapbox: {
        accessToken: '',
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [3.287, 49.847],
        zoom: 14,
      },
      endpoints: {
        predictions: '/predictions',
        arbres: '/arbres',
        especes: '/especes',
        etats: '/etats',
        stadesDeveloppement: '/stades-developpement',
        typesPort: '/types-port',
        typesPied: '/types-pied',
      },
    },
    global.APP_CONFIG || {}
  );
})(window);
