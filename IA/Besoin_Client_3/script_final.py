import joblib
import pandas as pd
import numpy as np
import os

# --- CONFIGURATION DES FICHIERS ---
DOSSIER_ACTUEL = os.path.dirname(os.path.abspath(__file__))
CHEMIN_PREPROCESSOR = os.path.join(DOSSIER_ACTUEL, 'models/preprocessor_tempete.pkl')
CHEMIN_MODELE = os.path.join(DOSSIER_ACTUEL, 'models/modele_tempete.pkl')

def main():
    print(" SYSTÈME D'ALERTE TEMPÊTE")

    # 1. Vérification de la présence des fichiers
    if not os.path.exists(CHEMIN_PREPROCESSOR) or not os.path.exists(CHEMIN_MODELE):
        print("\n ERREUR : Fichiers modèles introuvables !")
        print(f"Assurez-vous que 'preprocessor_tempete.pkl' et 'modele_tempete.pkl' sont bien dans le dossier :\n{DOSSIER_ACTUEL}/models")
        return

    # 2. Chargement de l'IA
    print("\nChargement...")
    preprocessor = joblib.load(CHEMIN_PREPROCESSOR)
    modele = joblib.load(CHEMIN_MODELE)

    # 3. Mode Interactif : Poser les questions à l'utilisateur
    print("--- Veuillez saisir les caractéristiques de l'arbre ---")
    try:
        haut_tronc = float(input("👉 Hauteur du tronc (en mètres) : ").replace(',', '.'))
        haut_tot = float(input("👉 Hauteur totale de l'arbre (en mètres) : ").replace(',', '.'))
        tronc_diam = float(input("👉 Diamètre du tronc (en centimètres) : ").replace(',', '.'))
        clc_nbr_diag = float(input("👉 Nombre de diagnostics de l'arbre : ").replace(',', '.'))

    except ValueError:
        print("\n ERREUR : Vous devez saisir uniquement des nombres. Relancez le script.")
        return

    # 4. Formatage des données pour l'IA
    donnees_utilisateur = pd.DataFrame({
        "haut_tronc": [haut_tronc],
        "haut_tot": [haut_tot],
        "tronc_diam": [tronc_diam],
        "clc_nbr_diag": [clc_nbr_diag]  # NOUVELLE DONNÉE AJOUTÉE 👇
    })

    # 5. Prédiction et Probabilité
    try:
        donnees_transformees = preprocessor.transform(donnees_utilisateur)
        
        prediction = modele.predict(donnees_transformees)[0]
        probabilites = modele.predict_proba(donnees_transformees)[0]
        
        index_classe = np.where(modele.classes_ == prediction)[0][0]
        confiance = probabilites[index_classe] * 100

        # 6. Affichage final

        print(" RÉSULTAT DE L'ANALYSE :")
        print(f" État prévu de l'arbre : {prediction.upper()}")
        print(f" Indice de fiabilité : {confiance:.2f} %")

    except Exception as e:
        print(f"\n  erreur survenue lors du calcul : {e}")

if __name__ == "__main__":
    main()
    input("\n'Entrée' pour quitter le programme...")
