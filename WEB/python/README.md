# WEB Python CLI

Ce dossier contient une petite interface en ligne de commande (CLI) pilotée par JSON qui encapsule les trois modèles d'arbres stockés sous `IA/`.

## Structure des fichiers

- `app.py` contient le point d'entrée exécutable.
- `cli.py` gère l'analyse JSON, le routage et le formatage des réponses.
- `common.py` stocke les chemins partagés et les fonctions d'aide.
- `height_classification.py`, `age_prediction.py` et `storm_prevention.py` contiennent la logique de prédiction spécifique à chaque modèle.
- `exceptions.py` définit les exceptions partagées de la CLI.

## Utilisation

Vous pouvez passer la charge utile sous forme de chaîne JSON en ligne de commande :

```bash
python3 app.py --json '{"client":"height_classification","num_clusters":2,"haut_tot":15,"tronc_diam":130,"age_estim":45,"fk_stadedev_encoded":0.0}'
```

Vous pouvez également transmettre le JSON via l'entrée standard (stdin) :

```bash
echo '{"client":"storm_prevention","haut_tronc":2.5,"haut_tot":15.0,"tronc_diam":45.0,"clc_nbr_diag":0}' | python3 app.py
```

Le script affiche toujours un objet JSON unique sur la sortie standard (stdout) afin que PHP puisse le décoder directement.

## Sélection du modèle

- `height_classification` ou `1` pour le modèle de clustering (classification par taille)
- `age_prediction` ou `2` pour le modèle de régression (prédiction de l'âge)
- `storm_prevention` ou `3` pour le modèle de classification des risques de tempête

## Exemple PHP

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

## Dépendances

La CLI utilise la même pile Python principale que le reste du projet : `joblib`, `numpy`, `pandas` et `scikit-learn`.