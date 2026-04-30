# Exemples d'utilisation de l'API

Ce répertoire contient des exemples de code et de commandes curl pour utiliser l'API Arbres.

## Test rapide avec curl

### Tester la classification de hauteur

```bash
curl -X POST http://localhost/api/predictions \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "height_classification",
    "num_clusters": 2,
    "haut_tot": 15,
    "tronc_diam": 130,
    "age_estim": 45,
    "fk_stadedev_encoded": 0.0
  }'
```

### Tester la prédiction d'âge

```bash
curl -X POST http://localhost/api/predictions \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "age_prediction",
    "haut_tronc": 2.5,
    "haut_tot": 15.0,
    "tronc_diam": 45.0
  }'
```

### Tester la prévention des tempêtes

```bash
curl -X POST http://localhost/api/predictions \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "storm_prevention",
    "haut_tronc": 2.5,
    "haut_tot": 15.0,
    "tronc_diam": 45.0,
    "clc_nbr_diag": 0
  }'
```

### Obtenir toutes les espèces

```bash
curl http://localhost/api/especes
```

### Obtenir tous les arbres

```bash
curl http://localhost/api/arbres
```

### Obtenir un arbre unique

```bash
curl http://localhost/api/arbres/1
```

### Créer un nouvel arbre

```bash
curl -X POST http://localhost/api/arbres \
  -H 'Content-Type: application/json' \
  -d '{
    "id_espece": 1,
    "id_etat": 1,
    "latitude": 48.8566,
    "longitude": 2.3522,
    "hauteur_totale": 15.0,
    "hauteur_tronc": 2.5,
    "diametre_tronc": 45.0
  }'
```

### Mettre à jour un arbre

```bash
curl -X PATCH http://localhost/api/arbres/1 \
  -H 'Content-Type: application/json' \
  -d '{
    "hauteur_totale": 16.0,
    "diametre_tronc": 50.0
  }'
```

### Supprimer un arbre

```bash
curl -X DELETE http://localhost/api/arbres/1
```

## Utilisation du client PHP

Incluez le fichier `APIClient.php` dans votre application :

```php
require_once 'examples/APIClient.php';

$client = new TreeAPIClient('http://localhost/api');

// Prédire la classification de hauteur
$result = $client->predictHeightClassification(15, 130, 45, 0.0, 2);
echo json_encode($result, JSON_PRETTY_PRINT);

// Prédire l'âge
$result = $client->predictAge(2.5, 15.0, 45.0);
echo json_encode($result, JSON_PRETTY_PRINT);

// Obtenir toutes les espèces
$species = $client->listEspeces();
echo json_encode($species, JSON_PRETTY_PRINT);

// Créer un arbre
$tree = $client->createArbre([
    'id_espece' => 1,
    'latitude' => 48.8566,
    'longitude' => 2.3522,
    'hauteur_totale' => 15.0,
]);
echo json_encode($tree, JSON_PRETTY_PRINT);
```

## Formats de réponse attendus

### Prédiction réussie

```json
{
  "ok": true,
  "client": "height_classification",
  "input": {...},
  "result": {
    "cluster": 0,
    "cluster_label": "Grand",
    "num_clusters": 2
  }
}
```

### Récupération d'arbre réussie

```json
{
  "id_arbre": 1,
  "id_espece": 1,
  "id_etat": 1,
  "latitude": 48.8566,
  "longitude": 2.3522,
  "hauteur_totale": 15.0,
  "hauteur_tronc": 2.5,
  "diametre_tronc": 45.0
}
```

### Réponse d'erreur

```json
{
  "ok": false,
  "error": {
    "type": "BadRequest",
    "message": "Champ requis manquant : model"
  }
}
```
