-- Database schema for the Tree API (SQLite)
-- This file defines all the tables needed by the application

PRAGMA foreign_keys = ON;

-- Species reference table
CREATE TABLE IF NOT EXISTS especes (
    id_espece INTEGER PRIMARY KEY AUTOINCREMENT,
    nom_code VARCHAR(50) NOT NULL UNIQUE,
    nom_commun VARCHAR(150) NOT NULL,
    nom_scientifique VARCHAR(150) NOT NULL
);

-- Tree states (e.g., "EN PLACE", "ESSOUC", "REMPLACE", "ABATTU")
CREATE TABLE IF NOT EXISTS etats (
    id_etat INTEGER PRIMARY KEY AUTOINCREMENT,
    libelle VARCHAR(50) NOT NULL
);

-- Development stages (e.g., "Jeune", "Adulte", "Mature", "Semis", "Vieux")
CREATE TABLE IF NOT EXISTS stades_developpement (
    id_stade INTEGER PRIMARY KEY AUTOINCREMENT,
    libelle VARCHAR(50) NOT NULL
);

-- Port types (tree form/canopy type)
CREATE TABLE IF NOT EXISTS types_port (
    id_port INTEGER PRIMARY KEY AUTOINCREMENT,
    libelle VARCHAR(50) NOT NULL
);

-- Pied types (tree base/root type)
CREATE TABLE IF NOT EXISTS types_pied (
    id_pied INTEGER PRIMARY KEY AUTOINCREMENT,
    libelle VARCHAR(50) NOT NULL
);

-- Main trees table
CREATE TABLE IF NOT EXISTS arbres (
    id_arbre INTEGER PRIMARY KEY AUTOINCREMENT,
    id_espece INTEGER,
    id_etat INTEGER,
    id_stade INTEGER,
    id_port INTEGER,
    id_pied INTEGER,
    est_remarquable INTEGER DEFAULT 0,
    hauteur_totale REAL,
    hauteur_tronc REAL,
    diametre_tronc REAL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    FOREIGN KEY (id_espece) REFERENCES especes(id_espece) ON DELETE SET NULL,
    FOREIGN KEY (id_etat) REFERENCES etats(id_etat) ON DELETE SET NULL,
    FOREIGN KEY (id_stade) REFERENCES stades_developpement(id_stade) ON DELETE SET NULL,
    FOREIGN KEY (id_port) REFERENCES types_port(id_port) ON DELETE SET NULL,
    FOREIGN KEY (id_pied) REFERENCES types_pied(id_pied) ON DELETE SET NULL
);

-- Indexes for common queries
CREATE INDEX idx_arbres_latitude_longitude ON arbres(latitude, longitude);
CREATE INDEX idx_arbres_id_espece ON arbres(id_espece);
CREATE INDEX idx_arbres_id_etat ON arbres(id_etat);
CREATE INDEX idx_especes_nom_code ON especes(nom_code);
