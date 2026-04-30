/**
 * Main Initialization - Load all modules and initialize page
 */

document.addEventListener('DOMContentLoaded', () => {
  window.APP_PAGES = window.APP_PAGES || {};

  if (window.APP_PAGES.initAjouterPage) {
    window.APP_PAGES.initAjouterPage();
  }

  if (window.APP_PAGES.initInventairePage) {
    window.APP_PAGES.initInventairePage();
  }

  if (window.APP_PAGES.initCartePage) {
    window.APP_PAGES.initCartePage();
  }
});
