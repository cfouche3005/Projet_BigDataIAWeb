# PROJET : ANALYSE ET CARTOGRAPHIE DU PATRIMOINE ARBORÉ

# --- CHARGEMENT DES BIBLIOTHÈQUES ---
library(dplyr)
library(ggplot2)
library(tidyr)
library(stringr)
library(corrplot)
library(sf)      # Pour la conversion des coordonnées
library(leaflet) # Pour la carte interactive

# ==============================================================================
# --- 1. CHARGEMENT ET NETTOYAGE ---
# ==============================================================================
BD <- read.csv("Patrimoine_Arboré_data.csv", na.strings = "\\N", stringsAsFactors = FALSE)

# --- 1.1. CHARGEMENT ET NETTOYAGE DE BASE ---
BD_clean <- BD %>%
  # Suppression des colonnes inutiles
  select(-created_user, -src_geo, -fk_nomtech, -last_edited_user,
         -villeca, -nomlatin, -Creator, -EditDate, -Editor, -CreationDate, -created_date) %>%
  
  # Suppression des possibles doublons sur OBJECTID
  distinct(OBJECTID, .keep_all = TRUE) %>%
  
  # Conversion en masse des colonnes numériques
  mutate(across(
   c(OBJECTID, id_arbre, haut_tot, tronc_diam, age_estim, fk_prec_estim, clc_nbr_diag),
    as.numeric
  )) %>%
  mutate(haut_tronc = as.numeric(haut_tronc))

# Calcul diff moyenne entre hauteur_tot et hauteur_tronc
diff_moy <- BD_clean %>%
  filter(!is.na(haut_tot), !(is.na(haut_tronc) | haut_tronc==0)) %>%
  mutate(diff = haut_tot - haut_tronc) %>%
  summarise(moyenne = mean(diff, na.rm = TRUE)) %>%
  pull(moyenne)


# --- 1.2. NETTOYAGE AVANCÉ : STADES, QUARTIERS, ABERRANTS ---
BD_clean <- BD_clean %>%
  # Regroupement des stades de développement
  mutate(stade_temp = str_trim(str_to_lower(fk_stadedev))) %>%
  mutate(fk_stadedev = case_when(
    stade_temp %in% c("adulte", "adultes") ~ "Adulte",
    stade_temp %in% c("jeune", "jeunes") ~ "Jeune",
    stade_temp %in% c("vieux", "vieillissant", "dépérissant") ~ "Vieux/Dépérissant",
    stade_temp == "" | is.na(stade_temp) ~ NA_character_,
    TRUE ~ str_to_title(stade_temp)
  )) %>%
  select(-stade_temp) %>%
  
  # Correction des quartiers (Vides ou OMISSY -> Hors Commune)
  mutate(clc_quartier = case_when(
    is.na(clc_quartier) | trimws(clc_quartier) == "" ~ "Hors Commune",
    toupper(trimws(clc_quartier)) %in% c("OMISSY", "HARLY", "ROUVROY") ~ "Hors Commune",
    TRUE ~ clc_quartier
  )) %>%

  mutate(haut_tot = ifelse(haut_tot <= 0 | haut_tot > 40, NA, haut_tot)) %>%
  
  # Remplacement des valeurs vides de hauteur_tronc
    mutate(
      haut_tronc = ifelse(
        (is.na(haut_tronc) | haut_tronc==0) & !is.na(haut_tot),
        pmax(haut_tot - diff_moy, 0.5),
        haut_tronc
      )
    ) %>%
  
  #  Valeurs aberrantes (Outliers) et lignes essentielles
  filter(haut_tot > 0 & haut_tot <= 40) %>%
  filter(tronc_diam > 0 & tronc_diam <= 600) %>%
  filter(!is.na(haut_tot) & !is.na(tronc_diam) & !is.na(fk_stadedev)) #%>%
  #filter(age_estim !=2010)

# --- 1.3 CONVERSION DES COORDONNÉES (CC49 vers WGS84) ---
# On crée un objet spatial pour transformer les coordonnées X/Y
BD_geo <- BD_clean %>% filter(!is.na(X) & !is.na(Y))

BD_sf <- st_as_sf(BD_geo, coords = c("X", "Y"), crs = 3949) # Projection CC49
BD_sf <- st_transform(BD_sf, crs = 4326) # Projection GPS standard

# Extraction et réintégration des coordonnées Long/Lat
coords <- st_coordinates(BD_sf)
BD_clean <- BD_geo %>%
  mutate(Longitude = coords[, "X"],
         Latitude  = coords[, "Y"])

# ==============================================================================
# --- 2. GRAPHIQUES D'EXPLORATION (Fonctionnalité 2) ---
# ==============================================================================

# 1. Graphique : Distribution de la hauteur
ggplot(BD_clean, aes(x = haut_tot)) +
  geom_histogram(binwidth = 2, fill = "forestgreen", color = "black", alpha = 0.7) +
  theme_minimal() +
  labs(title = "Distribution de la hauteur des arbres", 
       subtitle = "Après suppression des valeurs aberrantes",
       x = "Hauteur (m)", y = "Nombre d'arbres")

# 2. Relation quantitative : Diamètre vs Hauteur
ggplot(BD_clean, aes(x = tronc_diam, y = haut_tot)) +
  geom_point(alpha = 0.4, color = "darkgreen") +
  geom_smooth(method = "lm", color = "red", se = FALSE) +
  theme_minimal() +
  labs(title = "Relation entre le diamètre du tronc et la hauteur",
       x = "Diamètre du tronc (cm)", y = "Hauteur totale (m)")

# 3. Relation qualitative/quantitative : Hauteur selon le stade de développement
ggplot(BD_clean, aes(x = fk_stadedev, y = haut_tot, fill = fk_stadedev)) +
  geom_boxplot(alpha = 0.8) +
  theme_minimal() +
  labs(title = "Hauteur des arbres selon leur stade de développement",
       x = "Stade de développement", y = "Hauteur (m)") +
  theme(legend.position = "none", 
        axis.text.x = element_text(angle = 45, hjust = 1))

# 4. État des arbres (Comptage simple)
ggplot(BD_clean, aes(x = fk_arb_etat)) + 
  geom_bar(fill = "steelblue") +
  theme_minimal() +
  labs(title = "Nombre d'arbres par état", x = "État de l'arbre", y = "Quantité") +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

# 5. Répartition des quartiers
ggplot(BD_clean, aes(x = clc_quartier)) +
  geom_bar(fill = "coral") +
  theme_minimal() +
  labs(title = "Quantité d'arbres par quartier", x = "Quartier", y = "Nombre d'arbres") +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

# 6. Age estimé des arbres (AVEC LA VARIABLE D'ORIGINE)
ggplot(BD_clean, aes(x = age_estim)) +
  geom_histogram(bins = 30, fill = "purple", color = "black", alpha = 0.7) +
  theme_minimal() +
  labs(title = "Distribution de l'âge des arbres", x = "Âge estimé (années)", y = "Fréquence")

# 7. Arbre selon l'état vs Âge (AVEC LA VARIABLE D'ORIGINE)
ggplot(BD_clean %>% filter(!is.na(fk_arb_etat)), aes(x = age_estim, fill = fk_arb_etat)) +
  geom_histogram(position = "dodge", bins = 30) +
  theme_minimal() +
  labs(title = "Âge des arbres en fonction de leur état", 
       x = "Âge estimé (années)", y = "Nombre d'arbres", fill = "État")

# ==============================================================================
# --- 3. CORRELATIONS ET ESTIMATIONS ---
# ==============================================================================

# --- 3.1. STATISTIQUES DESCRIPTIVES ET CORRÉLATIONS ---
cat("Nombre d'arbres après nettoyage et conversion :", nrow(BD_clean), "\n")

# Matrice de corrélation
num_vars <- BD_clean %>% select(age_estim, haut_tot, haut_tronc, tronc_diam)
cor_matrix <- cor(num_vars, use = "complete.obs")
corrplot(cor_matrix, method = "circle", title = "Matrice de corrélation", mar=c(0,0,1,0))

# Analyse État vs Stade (Chi-2 et Barres 100%)
table_etat_stade <- table(BD_clean$fk_arb_etat, BD_clean$fk_stadedev)
print("Test du Chi-2 :")
print(chisq.test(table_etat_stade))

ggplot(BD_clean %>% filter(!is.na(fk_arb_etat)),
       aes(x = fk_stadedev, fill = fk_arb_etat)) +
  geom_bar(position = "fill", color = "white") +
  scale_y_continuous(labels = scales::percent) +
  scale_fill_viridis_d(option = "mako") +
  theme_minimal() +
  labs(title = "Répartition de l'état selon le stade de développement",
       x = "Stade", y = "Pourcentage", fill = "État")

# --- MOSAICPLOT : État vs Stade ---
mosaicplot(table_etat_stade, 
           main = "Mosaïque de l'état selon le stade de développement",
           color = TRUE, 
           las = 1)

# --- 3.2. ESTIMATION DE L'ÂGE (RÉGRESSION MULTIPLE) ---
# Modèle : Age = f(Diamètre + Hauteur)
train_data <- BD_clean %>% filter(!is.na(age_estim), age_estim > 0, age_estim != 2010)
modele_age <- lm(age_estim ~ tronc_diam + haut_tot, data = train_data)

summary(modele_age)

BD_clean <- BD_clean %>%
  mutate(
    age_predit = round(predict(modele_age, newdata = .)),
    age_final = case_when(
      is.na(age_estim) ~ age_predit,
      age_estim == 2010 ~ age_predit,
      age_estim <= 0    ~ age_predit,
      TRUE              ~ age_estim
    ),
    age_final = pmax(age_final, 1) # Sécurité : âge minimum = 1
  )

# --- 3.3. PREDICTION DES ABATTAGES ---

# On considère qu'un arbre doit être abattu (1) s'il est noté comme "ABBATU" ou "Essouché" ou "SUPPRIMÉ"
# OU si son état est "Vieux". Sinon (0).
BD_clean <- BD_clean %>%
  mutate(a_abattre = ifelse(str_to_lower(fk_arb_etat) %in% c("abbatu", "essouché", "supprimé")  #| 
                            #  fk_stadedev == "Vieux/Dépérissant"
                            , 1, 0))

# Modèle de régression logistique
modele_logis_complet <- glm(a_abattre ~ age_estim + tronc_diam + haut_tot + clc_nbr_diag + fk_stadedev , 
                            data = BD_clean, 
                            family = "binomial")
# Affichage des résultats
summary(modele_logis_complet)
# 1. On récupère uniquement les données que le modèle a pu utiliser
donnees_utilisees <- modele_logis_complet$model

# 2. On calcule les probabilités sur ces données
prob_predites <- predict(modele_logis_complet, type = "response")

# 3. On transforme en décision (0 ou 1)
decisions_predites <- ifelse(prob_predites > 0.5, 1, 0)

# 4. On crée la matrice avec la colonne 'a_abattre' issue des donnees_utilisees
matrice <- table(Reel = donnees_utilisees$a_abattre, 
                 Prediction = decisions_predites)

print(matrice)

# 5. Calcul de la précision
precision <- sum(diag(matrice)) / sum(matrice)
cat("Précision du modèle :", round(precision * 100, 2), "%\n")
# --- 3.4. POLITIQUE URBAINE : OÙ PLANTER ? ---
quartiers_prioritaires <- BD_clean %>%
  group_by(clc_quartier) %>%
  summarise(
    total_arbres = n(),
    # Note : Assurez-vous que la colonne 'a_abattre' existe dans votre CSV d'origine
    arbres_a_remplacer = sum(age_final > 80 | fk_stadedev == "Vieux/Dépérissant", na.rm = TRUE),
    taux_priorite = round((arbres_a_remplacer / total_arbres) * 100, 1)
  ) %>%
  arrange(desc(taux_priorite))

ggplot(head(quartiers_prioritaires, 10), aes(x = reorder(clc_quartier, -taux_priorite), y = taux_priorite)) +
  geom_col(fill = "darkorange") +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1)) +
  labs(title = "Top 10 des quartiers prioritaires pour la plantation",
       x = "Quartier", y = "% d'arbres à enjeux (Vieux/Dépérissants)")


# ==============================================================================
# --- 4. CARTOGRAPHIE ---
# ==============================================================================

# --- 4.1. CARTOGRAPHIE INTERACTIVE (LEAFLET)  ---

# Préparation des données spécifiques à la carte
BD_map <- BD_clean %>%
  mutate(
    couleur_point = ifelse(clc_quartier == "Hors Commune", "red", "blue"),
    label_quartier = ifelse(clc_quartier == "Hors Commune",
                            "<span style='color:red;'><b>Hors Commune</b></span>",
                            clc_quartier)
  )

tree_map <- leaflet(data = BD_map) %>%
  addTiles() %>%
  addCircleMarkers(
    lng = ~Longitude,
    lat = ~Latitude,
    radius = 4,
    color = ~couleur_point,
    stroke = FALSE,
    fillOpacity = 0.7,
    popup = ~paste(
      "<b>Espèce:</b>", nomfrancais, "<br>",
      "<b>Quartier:</b>", label_quartier, "<br>",
      "<b>Âge estimé:</b>", age_final, "ans<br>",
      "<b>Hauteur:</b>", haut_tot, "m"
    )
  )

# Affichage de la carte globale
tree_map


# --- 4.2. CARTOGRAPHIE DES ARBRES REMARQUABLES ---

# Filtrer les arbres remarquables
BD_remarquables <- BD_clean %>%
  filter(!is.na(remarquable) & str_to_lower(trimws(remarquable)) == "oui")

# Créer la carte
map_remarquables <- leaflet(data = BD_remarquables) %>%
  addProviderTiles(providers$CartoDB.Positron) %>%
  addCircleMarkers(
    lng = ~Longitude, 
    lat = ~Latitude,
    radius = 7,
    color = "gold",
    stroke = TRUE, 
    weight = 2,
    fillOpacity = 0.9,
    popup = ~paste(
      "<b>Arbre Remarquable</b><br>",
      "<b>Espèce :</b>", nomfrancais, "<br>",
      "<b>Quartier :</b>", clc_quartier, "<br>",
      "<b>Hauteur :</b>", haut_tot, "m"
    )
  ) %>%
  addControl("<b>Localisation des Arbres Remarquables</b>", position = "topright")

# Afficher la carte
map_remarquables


# --- 4.3. QUANTITÉ D'ARBRES PAR QUARTIER (CERCLES PROPORTIONNELS) ---

# Calculer les statistiques par quartier (Nombre d'arbres et centre du quartier)
stats_quartiers <- BD_clean %>%
  group_by(clc_quartier) %>%
  summarise(
    nb_arbres = n(),
    lat_centre = mean(Latitude, na.rm = TRUE),
    lon_centre = mean(Longitude, na.rm = TRUE)
  ) %>%
  filter(clc_quartier != "Hors Commune")

# Créer la carte de densité
map_quantite <- leaflet(data = stats_quartiers) %>%
  addTiles() %>%
  addCircles(
    lng = ~lon_centre, 
    lat = ~lat_centre,
    weight = 1,
    radius = ~sqrt(nb_arbres) * 15,
    color = "darkgreen",
    fillColor = "forestgreen",
    fillOpacity = 0.6,
    popup = ~paste(
      "<b>Quartier :</b>", clc_quartier, "<br>",
      "<b>Nombre d'arbres :</b>", nb_arbres
    )
  ) %>%
  addControl("<b>Quantité d'arbres par Quartier</b>", position = "topright")

# Afficher la carte
map_quantite

# --- Représentation Graphique Complémentaire (Bar Chart) ---
ggplot(BD_clean %>% count(clc_quartier) %>% filter(clc_quartier != "Hors Commune"), 
       aes(x = reorder(clc_quartier, n), y = n)) +
  geom_col(fill = "forestgreen") +
  coord_flip() +
  theme_minimal() +
  labs(
    title = "Quantité d'arbres par quartier (Saint-Quentin)",
    x = "Quartier",
    y = "Nombre d'arbres"
  )



# ==============================================================================
# --- 5. EXPORT ---
# ==============================================================================
write.csv(BD_clean, "BD_arbres_final_complet.csv", row.names = FALSE)