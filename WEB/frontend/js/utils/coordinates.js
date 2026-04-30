/**
 * Coordinate Utilities - Handle coordinate validation and extraction
 */

(function () {
  function isCoordinateValue(value) {
    return /^-?[0-9]+(?:\.[0-9]{1,64})?$/.test(String(value).trim());
  }

  function getInputValueAsCoordinateString(form, name) {
    const element = form.elements.namedItem(name);

    if (!element || element.value.trim() === '') {
      return null;
    }

    const value = element.value.trim();
    return isCoordinateValue(value) ? value : null;
  }

  function getSelectValueAsNumber(form, name) {
    const element = form.elements.namedItem(name);

    if (!element || !element.value) {
      return null;
    }

    const parsed = Number(element.value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function getInputValueAsNumber(form, name) {
    const element = form.elements.namedItem(name);

    if (!element || element.value === '') {
      return null;
    }

    const parsed = Number(element.value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  // Expose globally
  window.APP_COORDS = {
    isCoordinateValue,
    getInputValueAsCoordinateString,
    getSelectValueAsNumber,
    getInputValueAsNumber,
  };
})();
