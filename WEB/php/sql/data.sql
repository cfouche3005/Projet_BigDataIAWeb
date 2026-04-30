-- Generated SQL for lookup tables
BEGIN TRANSACTION;
PRAGMA foreign_keys=OFF;

-- etats
INSERT OR IGNORE INTO etats (libelle) VALUES ('ABATTU');
INSERT OR IGNORE INTO etats (libelle) VALUES ('EN PLACE');
INSERT OR IGNORE INTO etats (libelle) VALUES ('Essouché');
INSERT OR IGNORE INTO etats (libelle) VALUES ('Non essouché');
INSERT OR IGNORE INTO etats (libelle) VALUES ('REMPLACÉ');
INSERT OR IGNORE INTO etats (libelle) VALUES ('SUPPRIMÉ');

-- stades_developpement
INSERT OR IGNORE INTO stades_developpement (libelle) VALUES ('Adulte');
INSERT OR IGNORE INTO stades_developpement (libelle) VALUES ('Jeune');
INSERT OR IGNORE INTO stades_developpement (libelle) VALUES ('Senescent');
INSERT OR IGNORE INTO stades_developpement (libelle) VALUES ('Vieux/Dépérissant');

-- types_port
INSERT OR IGNORE INTO types_port (libelle) VALUES ('Couronne');
INSERT OR IGNORE INTO types_port (libelle) VALUES ('Libre');
INSERT OR IGNORE INTO types_port (libelle) VALUES ('Semi libre');
INSERT OR IGNORE INTO types_port (libelle) VALUES ('architecturé');
INSERT OR IGNORE INTO types_port (libelle) VALUES ('couronné');
INSERT OR IGNORE INTO types_port (libelle) VALUES ('cépée');
INSERT OR IGNORE INTO types_port (libelle) VALUES ('libre');
INSERT OR IGNORE INTO types_port (libelle) VALUES ('rideau');
INSERT OR IGNORE INTO types_port (libelle) VALUES ('réduit');
INSERT OR IGNORE INTO types_port (libelle) VALUES ('réduit relâché');
INSERT OR IGNORE INTO types_port (libelle) VALUES ('semi libre');
INSERT OR IGNORE INTO types_port (libelle) VALUES ('têtard');
INSERT OR IGNORE INTO types_port (libelle) VALUES ('têtard relâché');
INSERT OR IGNORE INTO types_port (libelle) VALUES ('tête de chat');
INSERT OR IGNORE INTO types_port (libelle) VALUES ('tête de chat relaché');
INSERT OR IGNORE INTO types_port (libelle) VALUES ('étêté');

-- types_pied
INSERT OR IGNORE INTO types_pied (libelle) VALUES ('Bac de plantation');
INSERT OR IGNORE INTO types_pied (libelle) VALUES ('Bande de terre');
INSERT OR IGNORE INTO types_pied (libelle) VALUES ('Revetement non permeable');
INSERT OR IGNORE INTO types_pied (libelle) VALUES ('Terre');
INSERT OR IGNORE INTO types_pied (libelle) VALUES ('bande de terre');
INSERT OR IGNORE INTO types_pied (libelle) VALUES ('fosse arbre');
INSERT OR IGNORE INTO types_pied (libelle) VALUES ('gazon');
INSERT OR IGNORE INTO types_pied (libelle) VALUES ('terre');
INSERT OR IGNORE INTO types_pied (libelle) VALUES ('toile tissée');
INSERT OR IGNORE INTO types_pied (libelle) VALUES ('végétation');

PRAGMA foreign_keys=ON;
COMMIT;
