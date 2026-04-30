/**
 * Add Tree Page - Logic for the "Ajouter un arbre" page
 */

(function () {
  async function initAjouterPage() {
    const form = document.getElementById('form-ajouter-arbre');
    if (!form) {
      return;
    }

    const submitButton = document.getElementById('btn-enregistrer');
    const referenceMaps = await window.APP_DATA.loadReferences();

    window.APP_UI.populateSelect(
      form.elements.namedItem('espece'),
      referenceMaps.especes,
      ['id_espece', 'id'],
      ['nom_commun', 'libelle', 'name'],
      'Choisir une espèce'
    );
    window.APP_UI.populateSelect(
      form.elements.namedItem('stade_developpement'),
      referenceMaps.stadesDeveloppement,
      ['id_stade', 'id'],
      ['libelle', 'name', 'label'],
      'Choisir un stade'
    );
    window.APP_UI.populateSelect(
      form.elements.namedItem('etat'),
      referenceMaps.etats,
      ['id_etat', 'id'],
      ['libelle', 'name', 'label'],
      'Choisir un état'
    );
    window.APP_UI.populateSelect(
      form.elements.namedItem('type_port'),
      referenceMaps.typesPort,
      ['id_port', 'id'],
      ['libelle', 'name', 'label'],
      'Choisir un type de port'
    );
    window.APP_UI.populateSelect(
      form.elements.namedItem('type_pied'),
      referenceMaps.typesPied,
      ['id_pied', 'id'],
      ['libelle', 'name', 'label'],
      'Choisir un type de pied'
    );

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const latitude = window.APP_COORDS.getInputValueAsCoordinateString(form, 'latitude');
      const longitude = window.APP_COORDS.getInputValueAsCoordinateString(form, 'longitude');

      if (latitude === null || longitude === null) {
        window.APP_UI.setNotification('La latitude et la longitude doivent contenir au plus 64 décimales.', 'error');
        return;
      }

      const payload = {
        hauteur_totale: window.APP_COORDS.getInputValueAsNumber(form, 'hauteur_totale'),
        hauteur_tronc: window.APP_COORDS.getInputValueAsNumber(form, 'hauteur_tronc'),
        diametre_tronc: window.APP_COORDS.getInputValueAsNumber(form, 'diametre_tronc'),
        latitude,
        longitude,
      };

      const espece = window.APP_COORDS.getSelectValueAsNumber(form, 'espece');
      const stade = window.APP_COORDS.getSelectValueAsNumber(form, 'stade_developpement');
      const etat = window.APP_COORDS.getSelectValueAsNumber(form, 'etat');
      const typePort = window.APP_COORDS.getSelectValueAsNumber(form, 'type_port');
      const typePied = window.APP_COORDS.getSelectValueAsNumber(form, 'type_pied');
      const remarquable = form.elements.namedItem('est_remarquable');

      if (espece !== null) {
        payload.id_espece = espece;
      }

      if (stade !== null) {
        payload.id_stade = stade;
      }

      if (etat !== null) {
        payload.id_etat = etat;
      }

      if (typePort !== null) {
        payload.id_port = typePort;
      }

      if (typePied !== null) {
        payload.id_pied = typePied;
      }

      if (remarquable && remarquable.value !== '') {
        payload.est_remarquable = remarquable.value === 'true' ? 1 : 0;
      }

      window.APP_UI.setLoading(submitButton, true);

      try {
        const result = await window.APP_API.apiRequest(window.APP_API.getConfig().endpoints.arbres, {
          method: 'POST',
          body: payload,
        });

        form.reset();
        window.APP_UI.setNotification(
          `Arbre enregistré avec l'ID ${window.APP_DATA.getValue(result, ['id_arbre', 'id'])}.`,
          'success'
        );
      } catch (error) {
        window.APP_UI.setNotification(error.message || 'Impossible d\'enregistrer l\'arbre.', 'error');
      } finally {
        window.APP_UI.setLoading(submitButton, false);
        window.APP_UI.populateSelect(
          form.elements.namedItem('espece'),
          referenceMaps.especes,
          ['id_espece', 'id'],
          ['nom_commun', 'libelle', 'name'],
          'Choisir une espèce'
        );
        window.APP_UI.populateSelect(
          form.elements.namedItem('stade_developpement'),
          referenceMaps.stadesDeveloppement,
          ['id_stade', 'id'],
          ['libelle', 'name', 'label'],
          'Choisir un stade'
        );
        window.APP_UI.populateSelect(
          form.elements.namedItem('etat'),
          referenceMaps.etats,
          ['id_etat', 'id'],
          ['libelle', 'name', 'label'],
          'Choisir un état'
        );
        window.APP_UI.populateSelect(
          form.elements.namedItem('type_port'),
          referenceMaps.typesPort,
          ['id_port', 'id'],
          ['libelle', 'name', 'label'],
          'Choisir un type de port'
        );
        window.APP_UI.populateSelect(
          form.elements.namedItem('type_pied'),
          referenceMaps.typesPied,
          ['id_pied', 'id'],
          ['libelle', 'name', 'label'],
          'Choisir un type de pied'
        );
      }
    });
  }

  // Expose globally
  window.APP_PAGES = window.APP_PAGES || {};
  window.APP_PAGES.initAjouterPage = initAjouterPage;
})();
