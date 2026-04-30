-- Insertion des tables de référence (IDs auto-incrémentés)

-- etats
INSERT INTO etats (libelle) VALUES ('EN PLACE');
INSERT INTO etats (libelle) VALUES ('SUPPRIMÉ');
INSERT INTO etats (libelle) VALUES ('Essouché');

-- stades_developpement
INSERT INTO stades_developpement (libelle) VALUES ('Jeune');
INSERT INTO stades_developpement (libelle) VALUES ('Adulte');

-- types_port
INSERT INTO types_port (libelle) VALUES ('architecturé');
INSERT INTO types_port (libelle) VALUES ('réduit relâché');
INSERT INTO types_port (libelle) VALUES ('semi libre');
INSERT INTO types_port (libelle) VALUES ('étêté');
INSERT INTO types_port (libelle) VALUES ('réduit');
INSERT INTO types_port (libelle) VALUES ('cépée');
INSERT INTO types_port (libelle) VALUES ('rideau');
INSERT INTO types_port (libelle) VALUES ('tête de chat relaché');

-- types_pied
INSERT INTO types_pied (libelle) VALUES ('gazon');
INSERT INTO types_pied (libelle) VALUES ('fosse arbre');
INSERT INTO types_pied (libelle) VALUES ('Revetement non permeable');
INSERT INTO types_pied (libelle) VALUES ('Bande de terre');
