# Interface Web et API (Dossier WEB)

Ce dossier contient l'intégralité du code source de l'interface utilisateur et de l'API permettant d'interagir avec les modèles d'Intelligence Artificielle.

## Structure du dossier

- `index.html` : Point d'entrée de l'application web (Accueil).
- `frontend/` : Contient les autres pages de l'application (Ajouter, Carte, Inventaire), les scripts JavaScript (JS), les styles (CSS) et les images.
- `php/` : Contient le backend PHP de l'API. 👉 [Voir la documentation de l'API PHP](php/README.md)
- `python/` : Contient l'interface en ligne de commande (CLI) Python faisant le lien avec l'IA. 👉 [Voir la documentation Python](python/README.md)
- `Dockerfile` & `docker-compose.yml` : Configuration Docker pour le déploiement.

## Déploiement

Pour déployer le projet depuis ce dossier, exécutez la commande suivante :
```bash
docker-compose up -d --build
```
Le site web sera alors accessible à l'adresse [http://localhost:3000](http://localhost:3000).
