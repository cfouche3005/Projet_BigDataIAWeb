# API Arbres (Implémentation PHP)

API PHP full-stack pour la base de données des arbres et les prédictions des modèles.

## Installation

### Prérequis

- PHP 7.4+
- SQLite 3+
- Python 3.8+ (pour les modèles CLI)

### Étapes d'installation

1. **Configuration de la base de données**

  Créez le fichier de base de données SQLite et les tables en utilisant le schéma fourni :

   ```bash
  mkdir -p ../data
  sqlite3 ../data/trees.sqlite < /chemin/vers/schema.sql
   ```

2. **Configuration PHP**

  Modifiez `../config.php` (à la racine `WEB/config.php`) ou définissez des variables d'environnement :

   ```bash
  export DB_PATH=/home/cfouche/Documents/Code/Projet_BigDataIAWeb/WEB/data/trees.sqlite
   export PYTHON_BIN=/chemin/vers/venv/bin/python
   ```

3. **Configuration du serveur web**

  Le routeur de l'API se trouve dans `php/api.php`. Vous pouvez l'appeler directement.

  Appelez les points de terminaison directement sur `php/api.php` avec `PATH_INFO` :

   ```bash
   curl http://localhost/php/api.php/arbres
   curl http://localhost/php/api.php/predictions
   ```

4. **Tester l'API**

   Appel direct :

   ```bash
   curl -X POST http://localhost/php/api.php/predictions \
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

## Points de terminaison de l'API

Tous les points de terminaison sont accessibles à l'adresse `/php/api.php/{endpoint}`.

### Prédictions

**POST /php/api.php/predictions**

Exécute une prédiction de modèle. Renvoie la sortie du modèle encapsulée dans un objet de réponse.

**Exemple :**

```bash
curl -X POST http://localhost/php/api.php/predictions \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "age_prediction",
    "haut_tronc": 2.5,
    "haut_tot": 15.0,
    "tronc_diam": 45.0
  }'
```

**Réponse :**

```json
{
  "ok": true,
  "client": "age_prediction",
  "input": { ... },
  "result": {
    "predicted_age": 27.52,
    "model_file": "regression_RandomForestRegressor.pkl",
    "model_name": "RandomForestRegressor",
    "gridsearch": false
  }
}
```

### Arbres

**GET /php/api.php/arbres**

Lister tous les arbres.

**GET /php/api.php/arbres/{id_arbre}**

Obtenir un arbre par ID.

**POST /php/api.php/arbres**

Créer un nouvel enregistrement d'arbre.

**Exemple :**

```bash
curl -X POST http://localhost/php/api.php/arbres \
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

**PATCH /php/api.php/arbres/{id_arbre}**

Mettre à jour un enregistrement d'arbre.

**DELETE /php/api.php/arbres/{id_arbre}**

Supprimer un enregistrement d'arbre.

### Données de référence

**GET /php/api.php/especes**

Lister toutes les espèces.

**GET /php/api.php/especes/{id_espece}**

Obtenir une espèce par ID.

**GET /php/api.php/etats**

Lister tous les états d'arbres.

**GET /php/api.php/stades-developpement**

Lister tous les stades de développement.

**GET /php/api.php/types-port**

Lister tous les types de port.

**GET /php/api.php/types-pied**

Lister tous les types de pied.

## Structure des fichiers

```
WEB/
├── .htaccess                          # Point d'entrée de configuration Apache
├── config.php                         # Configuration de déploiement racine
├── php/
│   ├── api.php                        # Point d'entrée et routeur
│   ├── models/
│   │   └── Database.php               # Couche d'abstraction de la base de données
│   ├── controllers/
│   │   ├── PredictionController.php   # Point de terminaison des prédictions
│   │   ├── ArbreController.php        # CRUD Arbres
│   │   └── ReferenceController.php    # Données de référence (tables de consultation)
│   ├── utils/
│   │   ├── Response.php               # Utilitaires de réponse HTTP
│   │   └── PythonCLI.php              # Wrapper CLI Python
│   └── README.md                      # Ce fichier
└── python/
  └── app.py                         # Point d'entrée CLI Python
```

## Gestion des erreurs

Toutes les erreurs sont renvoyées au format JSON avec la structure suivante :

```json
{
  "ok": false,
  "error": {
    "type": "ErrorType",
    "message": "Description de l'erreur lisible par l'homme"
  }
}
```

Codes d'erreur courants :
- `400 Bad Request` - Entrée invalide ou champs requis manquants
- `404 Not Found` - Ressource introuvable
- `500 Internal Server Error` - Erreur du serveur ou de la base de données

## Schéma de base de données

L'API s'attend à ce que les tables suivantes existent :

- `especes` - Table de référence des espèces
- `etats` - Table de référence de l'état de l'arbre
- `stades_developpement` - Table de référence des stades de développement
- `types_port` - Table de référence des types de port
- `types_pied` - Table de référence des types de pied
- `arbres` - Table principale du registre des arbres avec clés étrangères

Voir la spécification Swagger à `../docs/swagger.json` pour la documentation complète du schéma.

## Notes de sécurité

- Cette implémentation utilise des requêtes paramétrées pour empêcher les injections SQL.
- Toutes les entrées utilisateur sont validées avant traitement.
- La CLI Python est invoquée via l'exécution shell avec un échappement approprié.
- Envisagez d'ajouter une authentification/autorisation en production.
- Utilisez HTTPS dans les environnements de production.

## Dépannage

### CLI Python introuvable

Assurez-vous que les variables d'environnement `PYTHON_BIN` et `DB_PATH` ou la configuration pointent vers les chemins corrects :

```bash
export PYTHON_BIN=/home/cfouche/Documents/Code/Projet_BigDataIAWeb/.venv/bin/python
export DB_PATH=/home/cfouche/Documents/Code/Projet_BigDataIAWeb/WEB/data/trees.sqlite
```

### Échec de la connexion à la base de données

Vérifiez que le fichier SQLite existe et est accessible en écriture :

```bash
ls -l /home/cfouche/Documents/Code/Projet_BigDataIAWeb/WEB/data/trees.sqlite
```

### Erreurs 404

Assurez-vous que votre serveur web route correctement les requêtes vers `php/api.php`. Testez avec des appels directs :

```bash
curl http://localhost/php/api.php/arbres
```
