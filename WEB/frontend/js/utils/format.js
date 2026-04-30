/**
 * Format Utilities - Handle value formatting for display
 */

(function () {
  function formatLabelFromLookup(item) {
    return window.APP_DATA.getValue(item, ['nom_commun', 'libelle', 'name', 'label']);
  }

  function formatTreeValue(value) {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    if (typeof value === 'number') {
      return Number.isInteger(value) ? String(value) : value.toFixed(2);
    }

    return String(value);
  }

  function formatCoordinateValue(value) {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    return String(value);
  }

  function parsePredictionAge(payload) {
    const result = payload && payload.result ? payload.result : payload;
    const age = window.APP_DATA.getValue(result, ['predicted_age', 'age', 'age_brut']);
    return age === '' ? '—' : age;
  }

  // Expose globally
  window.APP_FORMAT = {
    formatLabelFromLookup,
    formatTreeValue,
    formatCoordinateValue,
    parsePredictionAge,
  };
})();
