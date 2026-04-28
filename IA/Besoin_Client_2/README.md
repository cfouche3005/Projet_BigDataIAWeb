# Système de Prédiction d'Âge d'Arbres - Besoin Client 2

## Description

Ce système utilise des modèles de **régression** pour estimer l'âge d'un arbre à partir de ses caractéristiques physiques (hauteur du tronc, hauteur totale, diamètre du tronc) et optionnellement son espèce.

### Fonctionnalités
- Prédiction d'âge avec modèles de régression (Random Forest, MLP Neural Network)
- Support des modèles entraînés avec GridSearchCV
- Prédictions basées sur l'espèce de l'arbre (nomfrancais)
- Normalisation automatique des données

## Installation

### Prérequis
- Python 3.8+
- pip ou conda

### Dépendances

Installez les dépendances requises :

```bash
pip install -r requirements.txt
```

## Utilisation

### Exécution du script

Le script utilise des arguments en ligne de commande :

```bash
python script_final.py --haut-tronc <valeur> --haut-tot <valeur> --tronc-diam <valeur> [OPTIONS]
```

### Arguments requis

- `--haut-tronc` : Hauteur du tronc (en mètres) - décimal
- `--haut-tot` : Hauteur totale de l'arbre (en mètres) - décimal
- `--tronc-diam` : Diamètre du tronc (en centimètres) - décimal

### Arguments optionnels

- `--model` : Modèle à utiliser (par défaut: `RandomForestRegressor`)
  - `RandomForestRegressor` : Forêt aléatoire
  - `MLPRegressor` : Réseau de neurones
  
- `--gridsearch` : Utilise le modèle entraîné avec GridSearchCV (plus précis mais plus lent)

- `--species` : Espèce de l'arbre (nom français)
  - Si fourni, utilise les modèles spécifiques à l'espèce

### Exemples d'utilisation

**Prédiction simple avec Random Forest :**

```bash
python script_final.py --haut-tronc 2.5 --haut-tot 15.0 --tronc-diam 45.0
```

**Prédiction avec GridSearchCV :**

```bash
python script_final.py --haut-tronc 2.5 --haut-tot 15.0 --tronc-diam 45.0 --gridsearch
```

**Prédiction avec réseau de neurones :**

```bash
python script_final.py --haut-tronc 2.5 --haut-tot 15.0 --tronc-diam 45.0 --model MLPRegressor
```

**Prédiction pour une espèce spécifique :**

```bash
python script_final.py --haut-tronc 2.5 --haut-tot 15.0 --tronc-diam 45.0 --species "PINNIG" --gridsearch
```

## Entraînement du modèle

Pour entraîner ou réentraîner les modèles, exécutez le notebook :

```bash
jupyter notebook ModelTraining.ipynb
```

Les modèles entraînés seront sauvegardés dans le dossier `models/` :
- `regression_RandomForestRegressor.pkl` - Baseline Random Forest
- `regression_MLPRegressor.pkl` - Baseline MLP
- `gridsearch_RandomForestRegressor.pkl` - Random Forest avec GridSearch
- `gridsearch_MLPRegressor.pkl` - MLP avec GridSearch
- `nomfrancais_baseline_*.pkl` - Modèles baseline par espèce
- `nomfrancais_gridsearch_*.pkl` - Modèles GridSearch par espèce

Les encodeurs seront sauvegardés dans le dossier `encoders/` :
- `scaler.pkl` - Normaliseur StandardScaler

## Structure des fichiers

```
Besoin_Client_2/
├── README.md                    # Cette documentation
├── requirements.txt             # Dépendances Python
├── ModelTraining.ipynb          # Notebook d'entraînement
├── script_final.py              # Script de prédiction
├── data/
│   └── BD_arbres_final_complet.csv
├── models/
│   ├── regression_RandomForestRegressor.pkl
│   ├── regression_MLPRegressor.pkl
│   ├── gridsearch_RandomForestRegressor.pkl
│   ├── gridsearch_MLPRegressor.pkl
│   ├── nomfrancais_baseline_*.pkl
│   └── nomfrancais_gridsearch_*.pkl
└── encoders/
    └── scaler.pkl
```

## Données

Le fichier `data/BD_arbres_final_complet.csv` contient les données d'entraînement avec les colonnes :
- `haut_tronc` - Hauteur du tronc
- `haut_tot` - Hauteur totale de l'arbre
- `tronc_diam` - Diamètre du tronc
- `nomfrancais` - Espèce de l'arbre (optionnel)
- `age_estim` - Âge estimé (cible)

## Notes

- Les modèles doivent être entraînés en premier via le notebook avant d'utiliser `script_final.py`
- Assurez-vous que tous les fichiers `.pkl` sont présents dans les dossiers `models/` et `encoders/`
- Les noms d'espèces sont normalisés automatiquement (majuscules, caractères spéciaux supprimés)
- Les modèles par espèce nécessitent l'argument `--species` et un fichier de modèle correspondant

## Troubleshooting

### Erreur : "Model file not found"
- Exécutez le notebook `ModelTraining.ipynb` pour générer les fichiers
- Vérifiez que le modèle demandé existe dans le dossier `models/`
- Utilisez `--gridsearch` ou omettez-le selon vos modèles disponibles

### Erreur : "Scaler file not found"
- Assurez-vous que `encoders/scaler.pkl` existe
- Réentraînez les modèles via le notebook

### Résultats incorrects
- Les valeurs d'entrée doivent être numériques
- Vérifiez que les unités correspondent (mètres, centimètres)
- Les valeurs doivent être réalistes pour les arbres
