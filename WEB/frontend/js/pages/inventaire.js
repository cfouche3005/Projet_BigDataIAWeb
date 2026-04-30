/**
 * Inventory Page - Logic for the "Inventaire" page
 */

(function () {
  function renderInventaireRow(tree, index, referenceMaps) {
    const espece = referenceMaps.especes.find((item) =>
      String(window.APP_DATA.getValue(item, ['id_espece', 'id'])) === String(window.APP_DATA.getValue(tree, ['id_espece']))
    );
    const etat = referenceMaps.etats.find((item) =>
      String(window.APP_DATA.getValue(item, ['id_etat', 'id'])) === String(window.APP_DATA.getValue(tree, ['id_etat']))
    );
    const stade = referenceMaps.stadesDeveloppement.find((item) =>
      String(window.APP_DATA.getValue(item, ['id_stade', 'id'])) === String(window.APP_DATA.getValue(tree, ['id_stade']))
    );
    const typePort = referenceMaps.typesPort.find((item) =>
      String(window.APP_DATA.getValue(item, ['id_port', 'id'])) === String(window.APP_DATA.getValue(tree, ['id_port']))
    );
    const typePied = referenceMaps.typesPied.find((item) =>
      String(window.APP_DATA.getValue(item, ['id_pied', 'id'])) === String(window.APP_DATA.getValue(tree, ['id_pied']))
    );

    const row = document.createElement('tr');
    if (index % 2 === 1) {
      row.classList.add('row-alt');
    }

    row.innerHTML = `
      <td><strong>${window.APP_FORMAT.formatTreeValue(window.APP_DATA.getValue(tree, ['id_arbre', 'id']))}</strong></td>
      <td>${window.APP_FORMAT.formatTreeValue(window.APP_DATA.getValue(tree, ['hauteur_totale']))}</td>
      <td>${window.APP_FORMAT.formatTreeValue(window.APP_DATA.getValue(tree, ['hauteur_tronc']))}</td>
      <td>${window.APP_FORMAT.formatTreeValue(window.APP_DATA.getValue(tree, ['diametre_tronc']))}</td>
      <td>${window.APP_FORMAT.formatLabelFromLookup(espece) || window.APP_FORMAT.formatTreeValue(window.APP_DATA.getValue(tree, ['id_espece']))}</td>
      <td>${window.APP_FORMAT.formatLabelFromLookup(stade) || window.APP_FORMAT.formatTreeValue(window.APP_DATA.getValue(tree, ['id_stade']))}</td>
      <td>${window.APP_FORMAT.formatLabelFromLookup(etat) || window.APP_FORMAT.formatTreeValue(window.APP_DATA.getValue(tree, ['id_etat']))}</td>
      <td>${window.APP_FORMAT.formatLabelFromLookup(typePort) || window.APP_FORMAT.formatTreeValue(window.APP_DATA.getValue(tree, ['id_port']))}</td>
      <td>${window.APP_FORMAT.formatLabelFromLookup(typePied) || window.APP_FORMAT.formatTreeValue(window.APP_DATA.getValue(tree, ['id_pied']))}</td>
      <td>${String(window.APP_DATA.getValue(tree, ['est_remarquable'])) === '1' ? 'Oui' : 'Non'}</td>
      <td>${window.APP_FORMAT.formatCoordinateValue(window.APP_DATA.getValue(tree, ['latitude']))}</td>
      <td>${window.APP_FORMAT.formatCoordinateValue(window.APP_DATA.getValue(tree, ['longitude']))}</td>
      <td>
        <button class="btn-predire-petit" type="button" data-role="predict-age">Prédire</button>
      </td>
    `;

    const predictButton = row.querySelector('[data-role="predict-age"]');
    predictButton.addEventListener('click', async () => {
      const cell = predictButton.parentElement;
      predictButton.disabled = true;
      predictButton.textContent = '...';

      try {
        const prediction = await window.APP_API.apiRequest(window.APP_API.getConfig().endpoints.predictions, {
          method: 'POST',
          body: {
            client: 'age_prediction',
            gridsearch: true,
            haut_tronc: Number(window.APP_DATA.getValue(tree, ['hauteur_tronc']) || 0),
            haut_tot: Number(window.APP_DATA.getValue(tree, ['hauteur_totale']) || 0),
            tronc_diam: Number(window.APP_DATA.getValue(tree, ['diametre_tronc']) || 0),
          },
        });

        cell.textContent = window.APP_FORMAT.formatTreeValue(window.APP_FORMAT.parsePredictionAge(prediction));
      } catch (error) {
        cell.innerHTML = `<span>${error.message || 'Erreur de prédiction'}</span>`;
      }
    });

    return row;
  }

  async function initInventairePage() {
    const tbody = document.getElementById('inventaire-table-body');
    if (!tbody) {
      return;
    }

    try {
      const [trees, referenceMaps] = await Promise.all([
        window.APP_API.apiRequest(window.APP_API.getConfig().endpoints.arbres),
        window.APP_DATA.loadReferences(),
      ]);

      const arbres = window.APP_DATA.asArray(trees);
      tbody.innerHTML = '';

      if (arbres.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13">Aucun arbre disponible dans l\'API.</td></tr>';
        return;
      }

      arbres.forEach((tree, index) => {
        tbody.appendChild(renderInventaireRow(tree, index, referenceMaps));
      });
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="13">${error.message || 'Impossible de charger l\'inventaire.'}</td></tr>`;
    }
  }

  // Expose globally
  window.APP_PAGES = window.APP_PAGES || {};
  window.APP_PAGES.initInventairePage = initInventairePage;
})();
