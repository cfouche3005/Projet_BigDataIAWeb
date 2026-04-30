-- Generated SQL for lookup tables
BEGIN TRANSACTION;
PRAGMA foreign_keys=OFF;

-- etats
INSERT OR IGNORE INTO etats (name) VALUES ('ABATTU');
INSERT OR IGNORE INTO etats (name) VALUES ('EN PLACE');
INSERT OR IGNORE INTO etats (name) VALUES ('Essouché');
INSERT OR IGNORE INTO etats (name) VALUES ('Non essouché');
INSERT OR IGNORE INTO etats (name) VALUES ('REMPLACÉ');
INSERT OR IGNORE INTO etats (name) VALUES ('SUPPRIMÉ');

-- stades_developpement
INSERT OR IGNORE INTO stades_developpement (name) VALUES ('Adulte');
INSERT OR IGNORE INTO stades_developpement (name) VALUES ('Jeune');
INSERT OR IGNORE INTO stades_developpement (name) VALUES ('Senescent');
INSERT OR IGNORE INTO stades_developpement (name) VALUES ('Vieux/Dépérissant');

-- types_port
INSERT OR IGNORE INTO types_port (name) VALUES ('Couronne');
INSERT OR IGNORE INTO types_port (name) VALUES ('Libre');
INSERT OR IGNORE INTO types_port (name) VALUES ('Semi libre');
INSERT OR IGNORE INTO types_port (name) VALUES ('architecturé');
INSERT OR IGNORE INTO types_port (name) VALUES ('couronné');
INSERT OR IGNORE INTO types_port (name) VALUES ('cépée');
INSERT OR IGNORE INTO types_port (name) VALUES ('libre');
INSERT OR IGNORE INTO types_port (name) VALUES ('rideau');
INSERT OR IGNORE INTO types_port (name) VALUES ('réduit');
INSERT OR IGNORE INTO types_port (name) VALUES ('réduit relâché');
INSERT OR IGNORE INTO types_port (name) VALUES ('semi libre');
INSERT OR IGNORE INTO types_port (name) VALUES ('têtard');
INSERT OR IGNORE INTO types_port (name) VALUES ('têtard relâché');
INSERT OR IGNORE INTO types_port (name) VALUES ('tête de chat');
INSERT OR IGNORE INTO types_port (name) VALUES ('tête de chat relaché');
INSERT OR IGNORE INTO types_port (name) VALUES ('étêté');

-- types_pied
INSERT OR IGNORE INTO types_pied (name) VALUES ('Bac de plantation');
INSERT OR IGNORE INTO types_pied (name) VALUES ('Bande de terre');
INSERT OR IGNORE INTO types_pied (name) VALUES ('Revetement non permeable');
INSERT OR IGNORE INTO types_pied (name) VALUES ('Terre');
INSERT OR IGNORE INTO types_pied (name) VALUES ('bande de terre');
INSERT OR IGNORE INTO types_pied (name) VALUES ('fosse arbre');
INSERT OR IGNORE INTO types_pied (name) VALUES ('gazon');
INSERT OR IGNORE INTO types_pied (name) VALUES ('terre');
INSERT OR IGNORE INTO types_pied (name) VALUES ('toile tissée');
INSERT OR IGNORE INTO types_pied (name) VALUES ('végétation');

PRAGMA foreign_keys=ON;
COMMIT;
