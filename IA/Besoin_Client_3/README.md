# Système d'Alerte Tempête d'Arbres - Besoin Client 3

## Description

Ce système utilise un **modèle de classification** pour prédire si un arbre présente un risque de chute lors de tempêtes. Le modèle classe les arbres en deux catégories :
- **SÛR** : Arbre en place et sans danger immédiat
- **DANGER** : Arbre en danger (essouché, remplacé, abattu, etc.)

### Fonctionnalités
- Prédiction du risque de chute d'arbres
- Indice de fiabilité (probabilité) de la prédiction
- Interface interactive en ligne de commande
- Normalisateur et encodeur intégrés

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
- **Hauteur du tronc** (en mètres) - ex: 2.5
- **Hauteur totale de l'arbre** (en mètres) - ex: 15.0
- **Diamètre du tronc** (en centimètres) - ex: 45.0
- **Nombre de diagnostics de l'arbre** - ex: 0, 1, 2...

### Exemple d'exécution

```
SYSTÈME D'ALERTE TEMPÊTE

Chargement...
--- Veuillez saisir les caractéristiques de l'arbre ---
👉 Hauteur du tronc (en mètres) : 2.5
👉 Hauteur totale de l'arbre (en mètres) : 15.0
👉 Diamètre du tronc (en centimètres) : 45.0
👉 Nombre de diagnostics de l'arbre : 0

RÉSULTAT DE L'ANALYSE :
✅ État prévu de l'arbre : SÛR
📊 Indice de fiabilité : 87.35 %
```

## Entraînement du modèle

Pour entraîner ou réentraîner le modèle, exécutez le notebook :

```bash
jupyter notebook ModelTraining.ipynb
```

Le notebook va :
1. Charger les données depuis `data/BD_arbres_final_complet.csv`
2. Nettoyer et préparer les données
3. Séparer les arbres en deux classes (SÛR/DANGER)
4. Entraîner un modèle Random Forest avec GridSearchCV
5. Évaluer le modèle sur l'ensemble de test
6. Sauvegarder les modèles

Les fichiers suivants seront générés :
- `models/modele_tempete.pkl` - Modèle de classification
- `encoders/preprocessor_tempete.pkl` - Préprocesseur (normalisateur + encodeur)

## Structure des fichiers

```
Besoin_Client_3/
├── README.md                        # Cette documentation
├── requirements.txt                 # Dépendances Python
├── ModelTraining.ipynb              # Notebook d'entraînement
├── script_final.py                  # Script de prédiction
├── data/
│   └── BD_arbres_final_complet.csv
├── models/
│   └── modele_tempete.pkl          # Modèle entraîné
└── encoders/
    └── preprocessor_tempete.pkl    # Préprocesseur
```

## Données

Le fichier `data/BD_arbres_final_complet.csv` contient les données d'entraînement avec les colonnes :
- `haut_tronc` - Hauteur du tronc (en mètres)
- `haut_tot` - Hauteur totale de l'arbre (en mètres)
- `tronc_diam` - Diamètre du tronc (en centimètres)
- `clc_nbr_diag` - Nombre de diagnostics de l'arbre
- `fk_arb_etat` - État de l'arbre (cible) : "EN PLACE" ou autre état

### Prétraitement des données

Les données sont automatiquement prétraitées :
- Valeurs numériques normalisées avec `StandardScaler`
- Valeurs catégories encodées avec `OneHotEncoder`
- Valeurs manquantes supprimées

## Interprétation des résultats

### État prévu
- **SÛR** : L'arbre est en place et stable
- **DANGER** : L'arbre présente un risque de chute (essouché, remplacé, abattu, etc.)

### Indice de fiabilité
- Représente la probabilité que la prédiction soit correcte
- Entre 0% et 100%
- **> 80%** : Très fiable
- **70-80%** : Fiable
- **< 70%** : À vérifier manuellement

## Notes importantes

- ⚠️ **Version de scikit-learn** : Le modèle doit être réentraîné si vous changez de version de scikit-learn (voir section Troubleshooting)
- Les modèles doivent être entraînés en premier via le notebook avant d'utiliser `script_final.py`
- Assurez-vous que tous les fichiers `.pkl` sont présents dans les dossiers `models/` et `encoders/`
- Les valeurs d'entrée doivent être numériques (utiliser `.` comme séparateur décimal, pas `,`)

## Troubleshooting

### Erreur : "InconsistentVersionWarning" ou "AttributeError"
Ce problème survient si les fichiers `.pkl` ont été créés avec une version différente de scikit-learn.

**Solution :**
1. Réentraînez le modèle via le notebook `ModelTraining.ipynb`
2. Ou downgrade scikit-learn à la version compatible avec vos fichiers `.pkl`

### Erreur : "Fichiers modèles introuvables"
- Exécutez d'abord le notebook `ModelTraining.ipynb` pour générer les fichiers
- Vérifiez que les dossiers `models/` et `encoders/` existent et contiennent les fichiers `.pkl`

### Le script demande un nombre lors d'une saisie
- Vérifiez que vous avez saisi uniquement des nombres
- Utilisez `.` comme séparateur décimal, pas `,` (le script accepte les deux)
- Les valeurs doivent être réalistes pour les arbres

### Résultats incorrects ou peu fiables
- Vérifiez que les données d'entrée correspondent à la réalité
- Si l'indice de fiabilité est faible, il peut y avoir des valeurs aberrantes
- Vérifiez que le modèle a bien appris sur des données similaires

## Améliorations possibles

- [ ] Ajouter plus de caractéristiques (ex: espèce, localisation, historique des tempêtes)
- [ ] Implémenter un interface web ou API
- [ ] Ajouter une validation croisée plus robuste
- [ ] Exporter les résultats en CSV ou JSON
- [ ] Implémenter une prédiction batch (plusieurs arbres à la fois)
