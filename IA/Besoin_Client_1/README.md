# Système de Clustering d'Arbres - Besoin Client 1

## Description

Ce système utilise l'algorithme **K-Means** combiné avec **PCA** (Principal Component Analysis) pour classifier les arbres en différents clusters selon leurs caractéristiques physiques.

### Fonctionnalités
- Clustering des arbres avec k=2 clusters (Petit/Grand)
- Clustering des arbres avec k=3 clusters (Petit/Moyen/Grand)
- Prédiction dynamique selon le nombre de clusters souhaité
- Normalisation des données et réduction dimensionnelle

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

```bash
python script_final.py
```

Le script interactif vous demandera :
- **Hauteur totale de l'arbre** (en mètres)
- **Diamètre du tronc** (en centimètres)
- **Âge estimé de l'arbre**
- **Stade de développement encodé** (0.0=Adulte, 1.0=Jeune, 2.0=Mature, 3.0=Semis, 4.0=Vieux)
- **Nombre de clusters** (2 ou 3)

### Exemple d'utilisation

```
Veuillez entrer les informations de l'arbre pour la prédiction de cluster.
Entrez la hauteur totale de l'arbre en m (float): 15
Entrez le diamètre du tronc de l'arbre en cm (float): 130
Entrez l'âge estimé de l'arbre (float): 45
Entrez le stade de développement encodé de l'arbre (0.0 pour Adulte, 1.0 pour Jeune, etc.): 0.0
Entrez le nombre de clusters à utiliser (2 ou 3): 2

Le cluster prédit pour l'arbre avec 2 clusters est : 1
Nom du cluster (k=2): Grand
```

## Entraînement du modèle

Pour réentraîner les modèles, exécutez le notebook :

```bash
jupyter notebook ModelTraining.ipynb
```

Les modèles entraînés seront sauvegardés dans le dossier `models/` :
- `kmeans_model.pkl` - Modèle K-Means (k=2)
- `pca.pkl` - Réduction PCA (k=2)
- `kmeans_model_k3.pkl` - Modèle K-Means (k=3)
- `pca_k3.pkl` - Réduction PCA (k=3)

Les encodeurs seront sauvegardés dans le dossier `encoders/` :
- `scaler.pkl` - Normaliseur StandardScaler (k=2)
- `scaler_k3.pkl` - Normaliseur StandardScaler (k=3)

## Structure des fichiers

```
Besoin_Client_1/
├── README.md                    # Cette documentation
├── requirements.txt             # Dépendances Python
├── ModelTraining.ipynb          # Notebook d'entraînement
├── script_final.py              # Script de prédiction
├── data/
│   └── BD_arbres_final_complet.csv
├── models/
│   ├── kmeans_model.pkl
│   ├── pca.pkl
│   ├── kmeans_model_k3.pkl
│   └── pca_k3.pkl
└── encoders/
    ├── scaler.pkl
    └── scaler_k3.pkl
```

## Données

Le fichier `data/BD_arbres_final_complet.csv` contient les données d'entraînement avec les colonnes :
- `haut_tot` - Hauteur totale de l'arbre
- `tronc_diam` - Diamètre du tronc
- `age_estim` - Âge estimé
- `fk_stadedev_encoded` - Stade de développement encodé

## Notes

- Les modèles doivent être entraînés en premier via le notebook avant d'utiliser `script_final.py`
- Assurez-vous que tous les fichiers `.pkl` sont présents dans les dossiers `models/` et `encoders/`
- Le scaler et la PCA doivent correspondre aux données d'entraînement

## Troubleshooting

### Erreur : "Fichiers de modèle introuvables"
- Exécutez le notebook `ModelTraining.ipynb` pour générer les fichiers
- Vérifiez que les dossiers `models/` et `encoders/` existent

### Résultats incorrects
- Assurez-vous que les valeurs d'entrée correspondent au format attendu
- Les valeurs doivent être numériques (entiers ou décimaux)
