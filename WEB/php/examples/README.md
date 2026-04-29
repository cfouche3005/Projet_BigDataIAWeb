# API Usage Examples

This directory contains example code and curl commands for using the Tree API.

## Quick Test with curl

### Test Height Classification

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

### Test Age Prediction

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

### Test Storm Prevention

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

### Get All Species

```bash
curl http://localhost/api/especes
```

### Get All Trees

```bash
curl http://localhost/api/arbres
```

### Get a Single Tree

```bash
curl http://localhost/api/arbres/1
```

### Create a New Tree

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

### Update a Tree

```bash
curl -X PATCH http://localhost/api/arbres/1 \
  -H 'Content-Type: application/json' \
  -d '{
    "hauteur_totale": 16.0,
    "diametre_tronc": 50.0
  }'
```

### Delete a Tree

```bash
curl -X DELETE http://localhost/api/arbres/1
```

## Using the PHP Client

Include the `APIClient.php` file in your application:

```php
require_once 'examples/APIClient.php';

$client = new TreeAPIClient('http://localhost/api');

// Predict height classification
$result = $client->predictHeightClassification(15, 130, 45, 0.0, 2);
echo json_encode($result, JSON_PRETTY_PRINT);

// Predict age
$result = $client->predictAge(2.5, 15.0, 45.0);
echo json_encode($result, JSON_PRETTY_PRINT);

// Get all species
$species = $client->listEspeces();
echo json_encode($species, JSON_PRETTY_PRINT);

// Create a tree
$tree = $client->createArbre([
    'id_espece' => 1,
    'latitude' => 48.8566,
    'longitude' => 2.3522,
    'hauteur_totale' => 15.0,
]);
echo json_encode($tree, JSON_PRETTY_PRINT);
```

## Expected Response Formats

### Successful Prediction

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

### Successful Tree Retrieval

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

### Error Response

```json
{
  "ok": false,
  "error": {
    "type": "BadRequest",
    "message": "Missing required field: model"
  }
}
```
