import joblib
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

# --- Definitions et Modèles pour k=2 ---
# Charger les modèles sauvegardés
try:
    kmeans_loaded = joblib.load('./models/kmeans_model.pkl')
    scaler_loaded = joblib.load('./encoders/scaler.pkl')
    pca_loaded = joblib.load('./models/pca.pkl')
except FileNotFoundError:
    print("Erreur: Un ou plusieurs fichiers de modèle k=2 n'ont pas été trouvés. Assurez-vous d'exécuter les cellules précédentes pour sauvegarder les modèles.")
    kmeans_loaded = None
    scaler_loaded = None
    pca_loaded = None

def predict_tree_cluster(haut_tot, tronc_diam, age_estim, fk_stadedev_encoded):
    """
    Prédit le cluster d'un arbre donné ses spécificités, en utilisant le modèle k=2 avec PCA.

    Args:
        haut_tot (float): Hauteur totale de l'arbre.
        tronc_diam (float): Diamètre du tronc de l'arbre.
        age_estim (float): Âge estimé de l'arbre.
        fk_stadedev_encoded (float): Stade de développement encodé de l'arbre.

    Returns:
        int: Le cluster prédit pour l'arbre (0 ou 1).
             Retourne -1 si les modèles n'ont pas été chargés.
    """
    if kmeans_loaded is None or scaler_loaded is None or pca_loaded is None:
        return -1

    # Créer un tableau numpy avec les caractéristiques d'entrée
    tree_features_np = np.array([[haut_tot, tronc_diam, age_estim, fk_stadedev_encoded]])

    # Noms des caractéristiques utilisées pour l'entraînement
    features_names = ['haut_tot', 'tronc_diam', 'age_estim', 'fk_stadedev_encoded']

    # Convertir en DataFrame pour conserver les noms de colonnes
    tree_features_df = pd.DataFrame(tree_features_np, columns=features_names)

    # Appliquer le scaler et la PCA
    scaled_features = scaler_loaded.transform(tree_features_df)
    pca_features = pca_loaded.transform(scaled_features)
    cluster = kmeans_loaded.predict(pca_features)[0]

    return int(cluster)

# --- Definitions et Modèles pour k=3 ---
# Charger les modèles sauvegardés pour k=3
try:
    kmeans_loaded_k3 = joblib.load('./models/kmeans_model_k3.pkl')
    scaler_loaded_k3 = joblib.load('./encoders/scaler_k3.pkl')
    pca_loaded_k3 = joblib.load('./models/pca_k3.pkl')
except FileNotFoundError:
    print("Erreur: Un ou plusieurs fichiers de modèle k=3 n'ont pas été trouvés. Assurez-vous d'exécuter les cellules précédentes pour sauvegarder les modèles k=3.")
    kmeans_loaded_k3 = None
    scaler_loaded_k3 = None
    pca_loaded_k3 = None

def predict_tree_cluster_k3(haut_tot, tronc_diam, age_estim, fk_stadedev_encoded):
    """
    Prédit le cluster d'un arbre donné ses spécificités, en utilisant le modèle k=3 avec PCA.

    Args:
        haut_tot (float): Hauteur totale de l'arbre.
        tronc_diam (float): Diamètre du tronc de l'arbre.
        age_estim (float): Âge estimé de l'arbre.
        fk_stadedev_encoded (float): Stade de développement encodé de l'arbre.

    Returns:
        int: Le cluster prédit pour l'arbre (0, 1 ou 2).
             Retourne -1 si les modèles n'ont pas été chargés.
    """
    if kmeans_loaded_k3 is None or scaler_loaded_k3 is None or pca_loaded_k3 is None:
        return -1

    # Créer un tableau numpy avec les caractéristiques d'entrée
    tree_features_np = np.array([[haut_tot, tronc_diam, age_estim, fk_stadedev_encoded]])

    # Noms des caractéristiques utilisées pour l'entraînement du scaler k=3 (doit correspondre à 'catego')
    features_names_k3 = ['haut_tot', 'tronc_diam', 'age_estim', 'fk_stadedev_encoded']

    # Convertir en DataFrame pour conserver les noms de colonnes
    tree_features_df = pd.DataFrame(tree_features_np, columns=features_names_k3)

    # Appliquer le scaler et la PCA
    scaled_features = scaler_loaded_k3.transform(tree_features_df)
    pca_features = pca_loaded_k3.transform(scaled_features)
    cluster = kmeans_loaded_k3.predict(pca_features)[0]

    return int(cluster)

# --- Dynamic Prediction Function ---
def predict_tree_cluster_dynamic(num_clusters, haut_tot, tronc_diam, age_estim, fk_stadedev_encoded):
    """
    Prédit le cluster d'un arbre en choisissant dynamiquement entre les modèles k=2 et k=3.

    Args:
        num_clusters (int): Le nombre de clusters à utiliser (2 ou 3).
        haut_tot (float): Hauteur totale de l'arbre.
        tronc_diam (float): Diamètre du tronc de l'arbre.
        age_estim (float): Âge estimé de l'arbre.
        fk_stadedev_encoded (float): Stade de développement encodé de l'arbre.

    Returns:
        int: Le cluster prédit pour l'arbre.
             Retourne -1 si les modèles n'ont pas été chargés ou si num_clusters n'est pas 2 ou 3.
    """
    if num_clusters == 2:
        return predict_tree_cluster(haut_tot, tronc_diam, age_estim, fk_stadedev_encoded)
    elif num_clusters == 3:
        return predict_tree_cluster_k3(haut_tot, tronc_diam, age_estim, fk_stadedev_encoded)
    else:
        print("Erreur: num_clusters doit être 2 ou 3.")
        return -1


# Utilisation du modèle k=2
example_tree_small = {"haut_tot": 5, "tronc_diam": 40, "age_estim": 10, "fk_stadedev_encoded": 1.0} # Exemple avec 'Jeune' encodé à 1.0
cluster_dynamic_small_k2 = predict_tree_cluster_dynamic(2, **example_tree_small)
print(f"Arbre 1 (petit, k=2): {example_tree_small} -> Cluster: {cluster_dynamic_small_k2}")

example_tree_large = {"haut_tot": 15, "tronc_diam": 130, "age_estim": 45, "fk_stadedev_encoded": 0.0} # Exemple avec 'Adulte' encodé à 0.0
cluster_dynamic_large_k2 = predict_tree_cluster_dynamic(2, **example_tree_large)
print(f"Arbre 2 (grand, k=2): {example_tree_large} -> Cluster: {cluster_dynamic_large_k2}")

# Utilisation du modèle k=3
example_tree_k3_1 = {"haut_tot": 5, "tronc_diam": 40, "age_estim": 10, "fk_stadedev_encoded": 1.0}
cluster_dynamic_k3_1 = predict_tree_cluster_dynamic(3, **example_tree_k3_1)
print(f"Arbre 1 (k=3): {example_tree_k3_1} -> Cluster: {cluster_dynamic_k3_1}")

example_tree_k3_2 = {"haut_tot": 15, "tronc_diam": 130, "age_estim": 45, "fk_stadedev_encoded": 0.0}
cluster_dynamic_k3_2 = predict_tree_cluster_dynamic(3, **example_tree_k3_2)
print(f"Arbre 2 (k=3): {example_tree_k3_2} -> Cluster: {cluster_dynamic_k3_2}")

example_tree_k3_3 = {"haut_tot": 25, "tronc_diam": 200, "age_estim": 70, "fk_stadedev_encoded": 0.0}
cluster_dynamic_k3_3 = predict_tree_cluster_dynamic(3, **example_tree_k3_3)
print(f"Arbre 3 (k=3): {example_tree_k3_3} -> Cluster: {cluster_dynamic_k3_3}")



# PARTIE Demande à l'utilisateur
print("Veuillez entrer les informations de l'arbre pour la prédiction de cluster.")

# Demander à l'utilisateur d'entrer les valeurs
try:
    input_haut_tot = float(input("Entrez la hauteur totale de l'arbre en m (float): "))
    input_tronc_diam = float(input("Entrez le diamètre du tronc de l'arbre en cm (float): "))
    input_age_estim = float(input("Entrez l'âge estimé de l'arbre (float): "))

    # Pour 'fk_stadedev_encoded', l'utilisateur doit connaître l'encodage
    # Par exemple: 'Adulte': 0.0, 'Jeune': 1.0, 'Mature': 2.0, 'Semis': 3.0, 'Vieux': 4.0
    input_fk_stadedev_encoded = float(input("Entrez le stade de développement encodé de l'arbre (0.0 pour Adulte, 1.0 pour Jeune, etc.): "))

    input_num_clusters = int(input("Entrez le nombre de clusters à utiliser (2 ou 3): "))

    # Appeler la fonction de prédiction dynamique
    predicted_cluster = predict_tree_cluster_dynamic(
        num_clusters=input_num_clusters,
        haut_tot=input_haut_tot,
        tronc_diam=input_tronc_diam,
        age_estim=input_age_estim,
        fk_stadedev_encoded=input_fk_stadedev_encoded
    )

    if predicted_cluster != -1:
        print(f"Le cluster prédit pour l'arbre avec {input_num_clusters} clusters est : {predicted_cluster}")

        if input_num_clusters == 2:
            cluster_names_k2_map = {0: 'Grand', 1: 'Petit'}
            cluster_name = cluster_names_k2_map.get(predicted_cluster, 'Inconnu')
            print(f"Nom du cluster (k=2): {cluster_name}")
        elif input_num_clusters == 3:
            cluster_names_k3_map = {0: 'Petit', 1: 'Grand', 2: 'Moyen'}
            cluster_name = cluster_names_k3_map.get(predicted_cluster, 'Inconnu')
            print(f"Nom du cluster (k=3): {cluster_name}")


except ValueError:
    print("Erreur: Veuillez entrer des valeurs numériques valides pour toutes les caractéristiques.")
except Exception as e:
    print(f"Une erreur inattendue est survenue: {e}")