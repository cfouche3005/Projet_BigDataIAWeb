# Projet_BigDataIAWeb

Bienvenue dans le Projet BigData IA Web.

Ce projet fournit une interface web et une API pour l'analyse et la prédiction de caractéristiques d'arbres à l'aide de modèles d'Intelligence Artificielle.

Il comprend :
- [Un système de classification par hauteur (Clustering) - Besoin Client 1](IA/Besoin_Client_1/README.md)
- [Un système de prédiction d'âge - Besoin Client 2](IA/Besoin_Client_2/README.md)
- [Un système d'alerte tempête - Besoin Client 3](IA/Besoin_Client_3/README.md)

## Interface Web et API

Toute la partie web (Frontend, Backend PHP, et lien Python) se trouve dans le répertoire `WEB/`.
👉 **[Consultez la documentation de l'Interface Web et API](WEB/README.md)**

## Déploiement

Le déploiement se fait via Docker. Les fichiers de configuration se trouvent désormais dans le répertoire `WEB/`. 
Pour déployer facilement l'application :

```bash
cd WEB
docker-compose up -d --build
```

L'application sera alors accessible sur le port 3000 ([http://localhost:3000](http://localhost:3000)).