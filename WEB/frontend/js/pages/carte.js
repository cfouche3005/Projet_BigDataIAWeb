/**
 * Map/Clustering Page - Logic for the "Carte" page
 */

(function () {
  async function initCartePage() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      return;
    }

    const status = document.getElementById('carte-api-status');
    const clusterButton = document.getElementById('btn-toggle-cluster');
    const legend = document.getElementById('legende-cluster');
    const mapConfig = window.APP_API.getConfig().mapbox || {
      accessToken: '',
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [3.287, 49.847],
      zoom: 14,
    };
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
            window.APP_API.apiRequest(window.APP_API.getConfig().endpoints.arbres),
            window.APP_DATA.loadReferences(),
          ]);

          const arbres = window.APP_DATA.asArray(trees);

          arbres.forEach((tree) => {
            const lat = Number(window.APP_DATA.getValue(tree, ['latitude']));
            const lng = Number(window.APP_DATA.getValue(tree, ['longitude']));

            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
              return;
            }

            const espece = referenceMaps.especes.find((item) =>
              String(window.APP_DATA.getValue(item, ['id_espece', 'id'])) === String(window.APP_DATA.getValue(tree, ['id_espece']))
            );
            const etat = referenceMaps.etats.find((item) =>
              String(window.APP_DATA.getValue(item, ['id_etat', 'id'])) === String(window.APP_DATA.getValue(tree, ['id_etat']))
            );
            const stade = referenceMaps.stadesDeveloppement.find((item) =>
              String(window.APP_DATA.getValue(item, ['id_stade', 'id'])) === String(window.APP_DATA.getValue(tree, ['id_stade']))
            );

            const popupHtml = `
              <div style="font-family: Arial, sans-serif; color: #333; min-width: 220px;">
                <h4 style="margin: 0 0 8px 0; color: #2b6e44;">Arbre #${window.APP_FORMAT.formatTreeValue(window.APP_DATA.getValue(tree, ['id_arbre', 'id']))}</h4>
                <div><strong>Espèce :</strong> ${window.APP_FORMAT.formatLabelFromLookup(espece) || '—'}</div>
                <div><strong>État :</strong> ${window.APP_FORMAT.formatLabelFromLookup(etat) || '—'}</div>
                <div><strong>Stade :</strong> ${window.APP_FORMAT.formatLabelFromLookup(stade) || '—'}</div>
                <div><strong>Hauteur :</strong> ${window.APP_FORMAT.formatTreeValue(window.APP_DATA.getValue(tree, ['hauteur_totale']))} m</div>
                <div><strong>Tronc :</strong> ${window.APP_FORMAT.formatTreeValue(window.APP_DATA.getValue(tree, ['hauteur_tronc']))} m</div>
                <div><strong>Diamètre :</strong> ${window.APP_FORMAT.formatTreeValue(window.APP_DATA.getValue(tree, ['diametre_tronc']))} cm</div>
                <div><strong>Latitude :</strong> ${window.APP_FORMAT.formatCoordinateValue(window.APP_DATA.getValue(tree, ['latitude']))}</div>
                <div><strong>Longitude :</strong> ${window.APP_FORMAT.formatCoordinateValue(window.APP_DATA.getValue(tree, ['longitude']))}</div>
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
            status.textContent = error.message || 'Impossible de charger la carte depuis l\'API.';
          }
        }
      });
    } else if (status) {
      status.textContent = 'Mapbox n\'est pas configuré.';
    }

    try {
      const trees = window.APP_DATA.asArray(await window.APP_API.apiRequest(window.APP_API.getConfig().endpoints.arbres));
      if (status) {
        status.textContent = `${trees.length} arbre(s) chargés depuis l\'API.`;
      }
    } catch (error) {
      if (status) {
        status.textContent = error.message || 'Impossible de charger les arbres depuis l\'API.';
      }
    }

    if (clusterButton) {
      clusterButton.addEventListener('click', async () => {
        if (status) {
          status.textContent = 'Calcul des clusters en cours...';
        }

        clusterButton.disabled = true;

        try {
          const trees = window.APP_DATA.asArray(await window.APP_API.apiRequest(window.APP_API.getConfig().endpoints.arbres));

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
            const treeId = window.APP_DATA.getValue(tree, ['id_arbre', 'id']);

            try {
              const clusterResult = await window.APP_API.apiRequest(window.APP_API.getConfig().endpoints.predictions, {
                method: 'POST',
                body: {
                  model: 'height_classification',
                  num_clusters: numClusters,
                  haut_tot: Number(window.APP_DATA.getValue(tree, ['hauteur_totale']) || 0),
                  tronc_diam: Number(window.APP_DATA.getValue(tree, ['diametre_tronc']) || 0),
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
            const referenceMaps = await window.APP_DATA.loadReferences();

            trees.forEach((tree) => {
              const lat = Number(window.APP_DATA.getValue(tree, ['latitude']));
              const lng = Number(window.APP_DATA.getValue(tree, ['longitude']));
              const treeId = window.APP_DATA.getValue(tree, ['id_arbre', 'id']);

              if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                return;
              }

              const clusterLabel = clusterMap[treeId] || 'Unknown';
              const markerColor = clusterColors[clusterLabel] || '#2b6e44';

              const espece = referenceMaps.especes.find((item) =>
                String(window.APP_DATA.getValue(item, ['id_espece', 'id'])) === String(window.APP_DATA.getValue(tree, ['id_espece']))
              );
              const etat = referenceMaps.etats.find((item) =>
                String(window.APP_DATA.getValue(item, ['id_etat', 'id'])) === String(window.APP_DATA.getValue(tree, ['id_etat']))
              );
              const stade = referenceMaps.stadesDeveloppement.find((item) =>
                String(window.APP_DATA.getValue(item, ['id_stade', 'id'])) === String(window.APP_DATA.getValue(tree, ['id_stade']))
              );

              const popupHtml = `
                <div style="font-family: Arial, sans-serif; color: #333; min-width: 220px;">
                  <h4 style="margin: 0 0 8px 0; color: #2b6e44;">Arbre #${window.APP_FORMAT.formatTreeValue(treeId)}</h4>
                  <div><strong>Cluster :</strong> ${clusterLabel}</div>
                  <div><strong>Espèce :</strong> ${window.APP_FORMAT.formatLabelFromLookup(espece) || '—'}</div>
                  <div><strong>État :</strong> ${window.APP_FORMAT.formatLabelFromLookup(etat) || '—'}</div>
                  <div><strong>Stade :</strong> ${window.APP_FORMAT.formatLabelFromLookup(stade) || '—'}</div>
                  <div><strong>Hauteur :</strong> ${window.APP_FORMAT.formatTreeValue(window.APP_DATA.getValue(tree, ['hauteur_totale']))} m</div>
                  <div><strong>Tronc :</strong> ${window.APP_FORMAT.formatTreeValue(window.APP_DATA.getValue(tree, ['hauteur_tronc']))} m</div>
                  <div><strong>Diamètre :</strong> ${window.APP_FORMAT.formatTreeValue(window.APP_DATA.getValue(tree, ['diametre_tronc']))} cm</div>
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

  // Expose globally
  window.APP_PAGES = window.APP_PAGES || {};
  window.APP_PAGES.initCartePage = initCartePage;
})();
