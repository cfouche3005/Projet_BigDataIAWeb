(function () {
  function getConfig() {
    return window.APP_CONFIG || { apiBaseUrl: '../php/api.php', endpoints: {} };
  }

  function getMapConfig() {
    const config = getConfig();
    return config.mapbox || {
      accessToken: '',
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [3.287, 49.847],
      zoom: 14,
    };
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

  function setNotification(message, type = 'success') {
    const zone = document.getElementById('notification-zone');
    const content = document.getElementById('notif-content');
    const text = document.getElementById('notif-message');

    if (!zone || !content || !text) {
      return;
    }

    text.textContent = message;
    content.className = type === 'error' ? 'notif-error' : 'notif-success';
    zone.classList.remove('hidden');

    window.clearTimeout(window.__treeNotifTimer);
    window.__treeNotifTimer = window.setTimeout(() => {
      zone.classList.add('hidden');
    }, 3500);
  }

  function setLoading(button, isLoading) {
    if (!button) {
      return;
    }

    button.classList.toggle('chargement', isLoading);

    const spinner = button.querySelector('.spinner');
    const label = button.querySelector('#text-enregistrer') || button.querySelector('[data-role="button-label"]');

    if (spinner) {
      spinner.classList.toggle('hidden', !isLoading);
    }

    if (label) {
      label.textContent = isLoading ? 'Enregistrement...' : 'Enregistrer';
    }

    button.disabled = isLoading;
  }

  function populateSelect(select, items, valueKeys, labelKeys, placeholder) {
    if (!select) {
      return;
    }

    const currentValue = select.value;
    select.innerHTML = '';

    const option = document.createElement('option');
    option.value = '';
    option.disabled = true;
    option.selected = true;
    option.hidden = true;
    option.textContent = placeholder || 'Choisir une valeur';
    select.appendChild(option);

    for (const item of items) {
      const value = getValue(item, valueKeys);
      const label = getValue(item, labelKeys);

      if (value === '' || label === '') {
        continue;
      }

      const opt = document.createElement('option');
      opt.value = String(value);
      opt.textContent = String(label);
      select.appendChild(opt);
    }

    if (currentValue) {
      select.value = currentValue;
    }
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
    const config = getConfig();
    const endpoints = config.endpoints;

    const [especes, etats, stadesDeveloppement, typesPort, typesPied] = await Promise.all([
      apiRequest(endpoints.especes),
      apiRequest(endpoints.etats),
      apiRequest(endpoints.stadesDeveloppement),
      apiRequest(endpoints.typesPort),
      apiRequest(endpoints.typesPied),
    ]);

    return buildReferenceMaps({
      especes,
      etats,
      stadesDeveloppement,
      typesPort,
      typesPied,
    });
  }

  function formatLabelFromLookup(item) {
    return getValue(item, ['nom_commun', 'libelle', 'name', 'label']);
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

  function parsePredictionAge(payload) {
    const result = payload && payload.result ? payload.result : payload;
    const age = getValue(result, ['predicted_age', 'age', 'age_brut']);
    return age === '' ? '—' : age;
  }

  async function initAjouterPage() {
    const form = document.getElementById('form-ajouter-arbre');
    if (!form) {
      return;
    }

    const submitButton = document.getElementById('btn-enregistrer');
    const referenceMaps = await loadReferences();

    populateSelect(form.elements.namedItem('espece'), referenceMaps.especes, ['id_espece', 'id'], ['nom_commun', 'libelle', 'name'], 'Choisir une espèce');
    populateSelect(form.elements.namedItem('stade_developpement'), referenceMaps.stadesDeveloppement, ['id_stade', 'id'], ['libelle', 'name', 'label'], 'Choisir un stade');
    populateSelect(form.elements.namedItem('etat'), referenceMaps.etats, ['id_etat', 'id'], ['libelle', 'name', 'label'], 'Choisir un état');
    populateSelect(form.elements.namedItem('type_port'), referenceMaps.typesPort, ['id_port', 'id'], ['libelle', 'name', 'label'], 'Choisir un type de port');
    populateSelect(form.elements.namedItem('type_pied'), referenceMaps.typesPied, ['id_pied', 'id'], ['libelle', 'name', 'label'], 'Choisir un type de pied');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const latitude = getInputValueAsCoordinateString(form, 'latitude');
      const longitude = getInputValueAsCoordinateString(form, 'longitude');

      if (latitude === null || longitude === null) {
        setNotification('La latitude et la longitude doivent contenir au plus 64 décimales.', 'error');
        return;
      }

      const payload = {
        hauteur_totale: getInputValueAsNumber(form, 'hauteur_totale'),
        hauteur_tronc: getInputValueAsNumber(form, 'hauteur_tronc'),
        diametre_tronc: getInputValueAsNumber(form, 'diametre_tronc'),
        latitude,
        longitude,
      };

      const espece = getSelectValueAsNumber(form, 'espece');
      const stade = getSelectValueAsNumber(form, 'stade_developpement');
      const etat = getSelectValueAsNumber(form, 'etat');
      const typePort = getSelectValueAsNumber(form, 'type_port');
      const typePied = getSelectValueAsNumber(form, 'type_pied');
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

      setLoading(submitButton, true);

      try {
        const result = await apiRequest(getConfig().endpoints.arbres, {
          method: 'POST',
          body: payload,
        });

        form.reset();
        setNotification(`Arbre enregistré avec l'ID ${getValue(result, ['id_arbre', 'id'])}.`, 'success');
      } catch (error) {
        setNotification(error.message || 'Impossible d’enregistrer l’arbre.', 'error');
      } finally {
        setLoading(submitButton, false);
        populateSelect(form.elements.namedItem('espece'), referenceMaps.especes, ['id_espece', 'id'], ['nom_commun', 'libelle', 'name'], 'Choisir une espèce');
        populateSelect(form.elements.namedItem('stade_developpement'), referenceMaps.stadesDeveloppement, ['id_stade', 'id'], ['libelle', 'name', 'label'], 'Choisir un stade');
        populateSelect(form.elements.namedItem('etat'), referenceMaps.etats, ['id_etat', 'id'], ['libelle', 'name', 'label'], 'Choisir un état');
        populateSelect(form.elements.namedItem('type_port'), referenceMaps.typesPort, ['id_port', 'id'], ['libelle', 'name', 'label'], 'Choisir un type de port');
        populateSelect(form.elements.namedItem('type_pied'), referenceMaps.typesPied, ['id_pied', 'id'], ['libelle', 'name', 'label'], 'Choisir un type de pied');
      }
    });
  }

  function renderInventaireRow(tree, index, referenceMaps) {
    const espece = referenceMaps.especes.find((item) => String(getValue(item, ['id_espece', 'id'])) === String(getValue(tree, ['id_espece'])));
    const etat = referenceMaps.etats.find((item) => String(getValue(item, ['id_etat', 'id'])) === String(getValue(tree, ['id_etat'])));
    const stade = referenceMaps.stadesDeveloppement.find((item) => String(getValue(item, ['id_stade', 'id'])) === String(getValue(tree, ['id_stade'])));
    const typePort = referenceMaps.typesPort.find((item) => String(getValue(item, ['id_port', 'id'])) === String(getValue(tree, ['id_port'])));
    const typePied = referenceMaps.typesPied.find((item) => String(getValue(item, ['id_pied', 'id'])) === String(getValue(tree, ['id_pied'])));

    const row = document.createElement('tr');
    if (index % 2 === 1) {
      row.classList.add('row-alt');
    }

    row.innerHTML = `
      <td><strong>${formatTreeValue(getValue(tree, ['id_arbre', 'id']))}</strong></td>
      <td>${formatTreeValue(getValue(tree, ['hauteur_totale']))}</td>
      <td>${formatTreeValue(getValue(tree, ['hauteur_tronc']))}</td>
      <td>${formatTreeValue(getValue(tree, ['diametre_tronc']))}</td>
      <td>${formatLabelFromLookup(espece) || formatTreeValue(getValue(tree, ['id_espece']))}</td>
      <td>${formatLabelFromLookup(stade) || formatTreeValue(getValue(tree, ['id_stade']))}</td>
      <td>${formatLabelFromLookup(etat) || formatTreeValue(getValue(tree, ['id_etat']))}</td>
      <td>${formatLabelFromLookup(typePort) || formatTreeValue(getValue(tree, ['id_port']))}</td>
      <td>${formatLabelFromLookup(typePied) || formatTreeValue(getValue(tree, ['id_pied']))}</td>
      <td>${String(getValue(tree, ['est_remarquable'])) === '1' ? 'Oui' : 'Non'}</td>
      <td>${formatCoordinateValue(getValue(tree, ['latitude']))}</td>
      <td>${formatCoordinateValue(getValue(tree, ['longitude']))}</td>
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
        const prediction = await apiRequest(getConfig().endpoints.predictions, {
          method: 'POST',
          body: {
            client: 'age_prediction',
            gridsearch: true,
            haut_tronc: Number(getValue(tree, ['hauteur_tronc']) || 0),
            haut_tot: Number(getValue(tree, ['hauteur_totale']) || 0),
            tronc_diam: Number(getValue(tree, ['diametre_tronc']) || 0),
          },
        });

        cell.textContent = formatTreeValue(parsePredictionAge(prediction));
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
        apiRequest(getConfig().endpoints.arbres),
        loadReferences(),
      ]);

      const arbres = asArray(trees);
      tbody.innerHTML = '';

      if (arbres.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13">Aucun arbre disponible dans l’API.</td></tr>';
        return;
      }

      arbres.forEach((tree, index) => {
        tbody.appendChild(renderInventaireRow(tree, index, referenceMaps));
      });
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="13">${error.message || 'Impossible de charger l’inventaire.'}</td></tr>`;
    }
  }

  async function initCartePage() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      return;
    }

    const status = document.getElementById('carte-api-status');
    const clusterButton = document.getElementById('btn-toggle-cluster');
    const legend = document.getElementById('legende-cluster');
    const mapConfig = getMapConfig();
    let map = null; // Declare in outer scope for access in event handler

    if (typeof mapboxgl !== 'undefined' && mapConfig.accessToken) {
      mapboxgl.accessToken = mapConfig.accessToken;

      map = new mapboxgl.Map({
        container: 'map',
        style: mapConfig.style,
        center: mapConfig.center,
        zoom: mapConfig.zoom,
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.on('load', async () => {
        try {
          const [trees, referenceMaps] = await Promise.all([
            apiRequest(getConfig().endpoints.arbres),
            loadReferences(),
          ]);

          const arbres = asArray(trees);

          arbres.forEach((tree) => {
            const lat = Number(getValue(tree, ['latitude']));
            const lng = Number(getValue(tree, ['longitude']));

            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
              return;
            }

            const espece = referenceMaps.especes.find((item) => String(getValue(item, ['id_espece', 'id'])) === String(getValue(tree, ['id_espece'])));
            const etat = referenceMaps.etats.find((item) => String(getValue(item, ['id_etat', 'id'])) === String(getValue(tree, ['id_etat'])));
            const stade = referenceMaps.stadesDeveloppement.find((item) => String(getValue(item, ['id_stade', 'id'])) === String(getValue(tree, ['id_stade'])));

            const popupHtml = `
              <div style="font-family: Arial, sans-serif; color: #333; min-width: 220px;">
                <h4 style="margin: 0 0 8px 0; color: #2b6e44;">Arbre #${formatTreeValue(getValue(tree, ['id_arbre', 'id']))}</h4>
                <div><strong>Espèce :</strong> ${formatLabelFromLookup(espece) || '—'}</div>
                <div><strong>État :</strong> ${formatLabelFromLookup(etat) || '—'}</div>
                <div><strong>Stade :</strong> ${formatLabelFromLookup(stade) || '—'}</div>
                <div><strong>Hauteur :</strong> ${formatTreeValue(getValue(tree, ['hauteur_totale']))} m</div>
                <div><strong>Tronc :</strong> ${formatTreeValue(getValue(tree, ['hauteur_tronc']))} m</div>
                <div><strong>Diamètre :</strong> ${formatTreeValue(getValue(tree, ['diametre_tronc']))} cm</div>
                <div><strong>Latitude :</strong> ${formatCoordinateValue(getValue(tree, ['latitude']))}</div>
                <div><strong>Longitude :</strong> ${formatCoordinateValue(getValue(tree, ['longitude']))}</div>
              </div>
            `;

            new mapboxgl.Marker({ color: '#000000' })
              .setLngLat([lng, lat])
              .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml))
              .addTo(map);
          });

          if (status) {
            status.textContent = `${arbres.length} arbre(s) affichés sur la carte.`;
          }
        } catch (error) {
          if (status) {
            status.textContent = error.message || 'Impossible de charger la carte depuis l’API.';
          }
        }
      });
    } else if (status) {
      status.textContent = 'Mapbox n’est pas configuré.';
    }

    try {
      const trees = asArray(await apiRequest(getConfig().endpoints.arbres));
      if (status) {
        status.textContent = `${trees.length} arbre(s) chargés depuis l’API.`;
      }
    } catch (error) {
      if (status) {
        status.textContent = error.message || 'Impossible de charger les arbres depuis l’API.';
      }
    }

    if (clusterButton) {
      clusterButton.addEventListener('click', async () => {
        if (status) {
          status.textContent = 'Calcul des clusters en cours...';
        }

        clusterButton.disabled = true;

        try {
          const trees = asArray(await apiRequest(getConfig().endpoints.arbres));
          
          if (trees.length === 0) {
            if (status) {
              status.textContent = 'Aucun arbre disponible pour le clustering.';
            }
            clusterButton.disabled = false;
            return;
          }

          // Appeler l'API de clustering pour chaque arbre
          const clusterMap = {};
          const predictions = [];
          const numClusters = 3;

          for (const tree of trees) {
            const treeId = getValue(tree, ['id_arbre', 'id']);
            
            try {
              const clusterResult = await apiRequest(getConfig().endpoints.predictions, {
                method: 'POST',
                body: {
                  model: 'height_classification',
                  num_clusters: numClusters,
                  haut_tot: Number(getValue(tree, ['hauteur_totale']) || 0),
                  tronc_diam: Number(getValue(tree, ['diametre_tronc']) || 0),
                  age_estim: 0, // default if not available
                  fk_stadedev_encoded: 0, // default if not available
                },
              });

              const result = clusterResult.result || clusterResult;
              const clusterLabel = result.cluster_label || result.cluster || 0;
              
              clusterMap[treeId] = clusterLabel;
              predictions.push({
                id_arbre: treeId,
                cluster: result.cluster || 0,
                cluster_label: clusterLabel,
              });
            } catch (error) {
              // Si prédiction échoue pour un arbre, utiliser cluster par défaut
              clusterMap[treeId] = 'Unknown';
              predictions.push({
                id_arbre: treeId,
                cluster: 0,
                cluster_label: 'Unknown',
              });
            }
          }

          // Compter les clusters et mapper aux couleurs
          const clusterSizes = {};
          Object.values(clusterMap).forEach((label) => {
            clusterSizes[label] = (clusterSizes[label] || 0) + 1;
          });

          // Couleurs fixes pour les trois clusters (Petit, Moyen, Grand)
          const clusterColors = {
            'Petit': '#90EE90',    // Vert
            'Moyen': '#FFC300',    // Orange
            'Grand': '#FF5733',    // Rouge
            'Unknown': '#808080'   // Gris
          };

          // Mettre à jour les marqueurs sur la carte
          if (typeof mapboxgl !== 'undefined' && map) {
            // Supprimer les anciens marqueurs
            const markers = document.querySelectorAll('.mapboxgl-marker');
            markers.forEach((m) => m.remove());

            // Ajouter les nouveaux marqueurs avec les couleurs de cluster
            const referenceMaps = await loadReferences();
            
            trees.forEach((tree) => {
              const lat = Number(getValue(tree, ['latitude']));
              const lng = Number(getValue(tree, ['longitude']));
              const treeId = getValue(tree, ['id_arbre', 'id']);

              if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                return;
              }

              const clusterLabel = clusterMap[treeId] || 'Unknown';
              const markerColor = clusterColors[clusterLabel] || '#2b6e44';

              const espece = referenceMaps.especes.find((item) => String(getValue(item, ['id_espece', 'id'])) === String(getValue(tree, ['id_espece'])));
              const etat = referenceMaps.etats.find((item) => String(getValue(item, ['id_etat', 'id'])) === String(getValue(tree, ['id_etat'])));
              const stade = referenceMaps.stadesDeveloppement.find((item) => String(getValue(item, ['id_stade', 'id'])) === String(getValue(tree, ['id_stade'])));

              const popupHtml = `
                <div style="font-family: Arial, sans-serif; color: #333; min-width: 220px;">
                  <h4 style="margin: 0 0 8px 0; color: #2b6e44;">Arbre #${formatTreeValue(treeId)}</h4>
                  <div><strong>Cluster :</strong> ${clusterLabel}</div>
                  <div><strong>Espèce :</strong> ${formatLabelFromLookup(espece) || '—'}</div>
                  <div><strong>État :</strong> ${formatLabelFromLookup(etat) || '—'}</div>
                  <div><strong>Stade :</strong> ${formatLabelFromLookup(stade) || '—'}</div>
                  <div><strong>Hauteur :</strong> ${formatTreeValue(getValue(tree, ['hauteur_totale']))} m</div>
                  <div><strong>Tronc :</strong> ${formatTreeValue(getValue(tree, ['hauteur_tronc']))} m</div>
                  <div><strong>Diamètre :</strong> ${formatTreeValue(getValue(tree, ['diametre_tronc']))} cm</div>
                </div>
              `;

              new mapboxgl.Marker({ color: markerColor })
                .setLngLat([lng, lat])
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml))
                .addTo(map);
            });
          }

          // Afficher la légende
          if (legend) {
            legend.classList.remove('masque');
            
            // Mettre à jour les couleurs dans la légende
            const legendItems = legend.querySelectorAll('.legende-liste li');
            const clusterLabels = ['Petit', 'Moyen', 'Grand'];
            
            legendItems.forEach((item, index) => {
              const cercle = item.querySelector('.cercle-legende');
              if (cercle && clusterLabels[index]) {
                cercle.style.backgroundColor = clusterColors[clusterLabels[index]];
              }
            });
          }

          if (status) {
            status.textContent = `Clustering réalisé : ${Object.keys(clusterSizes).length} cluster(s) identifié(s).`;
          }
        } catch (error) {
          if (status) {
            status.textContent = error.message || 'Impossible de calculer les clusters.';
          }
        } finally {
          clusterButton.disabled = false;
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initAjouterPage();
    initInventairePage();
    initCartePage();
  });
})();
