# WEB Python CLI

This folder contains a small JSON-driven CLI that wraps the three tree models stored under `IA/`.

## File Layout

- `app.py` keeps the executable entrypoint.
- `cli.py` handles JSON parsing, routing, and response formatting.
- `common.py` stores shared paths and helpers.
- `height_classification.py`, `age_prediction.py`, and `storm_prevention.py` hold the model-specific prediction logic.
- `exceptions.py` defines the shared CLI exception.

## Usage

You can pass the payload as a command-line JSON string:

```bash
python3 app.py --json '{"client":"height_classification","num_clusters":2,"haut_tot":15,"tronc_diam":130,"age_estim":45,"fk_stadedev_encoded":0.0}'
```

You can also pipe JSON through stdin:

```bash
echo '{"client":"storm_prevention","haut_tronc":2.5,"haut_tot":15.0,"tronc_diam":45.0,"clc_nbr_diag":0}' | python3 app.py
```

The script always prints one JSON object to stdout so PHP can decode it directly.

## Model selection

- `height_classification` or `1` for the clustering model
- `age_prediction` or `2` for the age regression model
- `storm_prevention` or `3` for the storm-risk classification model

## PHP example

```php
$payload = [
    'client' => 'age_prediction',
    'haut_tronc' => 2.5,
    'haut_tot' => 15.0,
    'tronc_diam' => 45.0,
    'model' => 'RandomForestRegressor',
    'gridsearch' => false,
];

$command = 'python3 ' . escapeshellarg(__DIR__ . '/app.py') . ' --json ' . escapeshellarg(json_encode($payload));
$rawResponse = shell_exec($command);
$response = json_decode($rawResponse, true);
```

## Dependencies

The CLI uses the same core Python stack as the rest of the project: `joblib`, `numpy`, `pandas`, and `scikit-learn`.