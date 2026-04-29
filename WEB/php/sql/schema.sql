-- Database schema for the Tree API
-- This file defines all the tables needed by the application

-- Species reference table
CREATE TABLE IF NOT EXISTS especes (
    id_espece SERIAL PRIMARY KEY,
    nom_code VARCHAR(50) NOT NULL UNIQUE,
    nom_commun VARCHAR(150) NOT NULL,
    nom_scientifique VARCHAR(150) NOT NULL
);

-- Tree states (e.g., "EN PLACE", "ESSOUC", "REMPLACE", "ABATTU")
CREATE TABLE IF NOT EXISTS etats (
    id_etat SERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL
);

-- Development stages (e.g., "Jeune", "Adulte", "Mature", "Semis", "Vieux")
CREATE TABLE IF NOT EXISTS stades_developpement (
    id_stade SERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL
);

-- Port types (tree form/canopy type)
CREATE TABLE IF NOT EXISTS types_port (
    id_port SERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL
);

-- Pied types (tree base/root type)
CREATE TABLE IF NOT EXISTS types_pied (
    id_pied SERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL
);

-- Main trees table
CREATE TABLE IF NOT EXISTS arbres (
    id_arbre SERIAL PRIMARY KEY,
    id_espece INTEGER REFERENCES especes(id_espece),
    id_etat INTEGER REFERENCES etats(id_etat),
    id_stade INTEGER REFERENCES stades_developpement(id_stade),
    id_port INTEGER REFERENCES types_port(id_port),
    id_pied INTEGER REFERENCES types_pied(id_pied),
    est_remarquable BOOLEAN DEFAULT FALSE,
    hauteur_totale NUMERIC(5,2),
    hauteur_tronc NUMERIC(5,2),
    diametre_tronc NUMERIC(5,2),
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_arbres_latitude_longitude ON arbres(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_arbres_id_espece ON arbres(id_espece);
CREATE INDEX IF NOT EXISTS idx_arbres_id_etat ON arbres(id_etat);
CREATE INDEX IF NOT EXISTS idx_especes_nom_code ON especes(nom_code);
