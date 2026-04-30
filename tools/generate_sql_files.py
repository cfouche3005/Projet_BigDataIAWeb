import csv
import argparse
import os
import random

def escape_sql(value):
    """Escapes a string for SQL insertion."""
    if value is None or str(value).strip() == "":
        return "NULL"
    # Escape single quotes by doubling them
    safe_value = str(value).replace("'", "''")
    return f"'{safe_value}'"

def create_sql_scripts(trees_csv_path, species_csv_path, output_dir, limit=50):
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Process Species
    species_map = {}
    especes_sql = ["-- Insertion des espèces (id_espece is AUTOINCREMENT)"]
    try:
        with open(species_csv_path, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader, start=1):
                code = row.get('Code_Technique')
                nom_fr = row.get('Nom_Francais_Lisible')
                nom_lat = row.get('Nom_Latin_Lisible')
                
                if not code or code.strip() == "NULL":
                    continue
                    
                species_map[code] = i
                
                # Omitting id_espece to let AUTOINCREMENT handle it
                especes_sql.append(
                    f"INSERT INTO especes (nom_code, nom_commun, nom_scientifique) "
                    f"VALUES ({escape_sql(code)}, {escape_sql(nom_fr)}, {escape_sql(nom_lat)});"
                )
    except FileNotFoundError:
        print(f"Error: The file {species_csv_path} was not found.")
        return

    # 2. Process Trees & Extract Lookups
    etats_map = {}
    stades_map = {}
    ports_map = {}
    pieds_map = {}
    
    def get_lookup_id(val, lookup_dict):
        val = str(val).strip() if val else ""
        if not val:
            return "NULL"
        if val not in lookup_dict:
            lookup_dict[val] = len(lookup_dict) + 1
        return lookup_dict[val]

    arbres_sql = [f"-- Insertion de {limit} arbres (id_arbre is AUTOINCREMENT)"]
    try:
        with open(trees_csv_path, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            all_rows = list(reader)
            
            if limit > 0 and limit < len(all_rows):
                sampled_rows = random.sample(all_rows, limit)
            else:
                sampled_rows = all_rows
                
            for count, row in enumerate(sampled_rows):
                
                id_espece = species_map.get(row.get('nomfrancais', '').strip(), "NULL")
                id_etat = get_lookup_id(row.get('fk_arb_etat'), etats_map)
                id_stade = get_lookup_id(row.get('fk_stadedev'), stades_map)
                id_port = get_lookup_id(row.get('fk_port'), ports_map)
                id_pied = get_lookup_id(row.get('fk_pied'), pieds_map)
                
                est_remarquable = '1' if row.get('remarquable') == 'Oui' else '0'
                haut_tot = row.get('haut_tot') or 'NULL'
                haut_tronc = row.get('haut_tronc') or 'NULL'
                diam_tronc = row.get('tronc_diam') or 'NULL'
                lat = escape_sql(row.get('Latitude'))
                lon = escape_sql(row.get('Longitude'))

                # Omitting id_arbre to let AUTOINCREMENT handle it
                sql = (f"INSERT INTO arbres (id_espece, id_etat, id_stade, id_port, id_pied, "
                       f"est_remarquable, hauteur_totale, hauteur_tronc, diametre_tronc, latitude, longitude) "
                       f"VALUES ({id_espece}, {id_etat}, {id_stade}, {id_port}, {id_pied}, "
                       f"{est_remarquable}, {haut_tot}, {haut_tronc}, {diam_tronc}, {lat}, {lon});")
                arbres_sql.append(sql)
                
    except FileNotFoundError:
        print(f"Error: The file {trees_csv_path} was not found.")
        return

    # 3. Generate Lookups SQL
    lookups_sql = ["-- Insertion des tables de référence (IDs auto-incrémentés)"]
    
    for table, mapping in [("etats", etats_map), 
                           ("stades_developpement", stades_map), 
                           ("types_port", ports_map), 
                           ("types_pied", pieds_map)]:
        lookups_sql.append(f"\n-- {table}")
        for val, idx in sorted(mapping.items(), key=lambda item: item[1]):
            lookups_sql.append(f"INSERT INTO {table} (libelle) VALUES ({escape_sql(val)});")

    # 4. Write SQL files
    output_files = [('especes.sql', especes_sql), ('lookups.sql', lookups_sql), ('data.sql', arbres_sql)]
    
    for filename, lines in output_files:
        filepath = os.path.join(output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write("\n".join(lines) + "\n")
        print(f"Generated {filepath}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate SQL files from tree CSVs.")
    parser.add_argument('--trees-csv', default='/home/cfouche/Documents/Code/Projet_BigDataIAWeb/IA/Besoin_Client_1/data/BD_arbres_final_complet.csv', help='Path to the tree CSV')
    parser.add_argument('--species-csv', default='/home/cfouche/Documents/Code/Projet_BigDataIAWeb/tools/Traduction_Especes_Arbres.csv', help='Path to the species CSV')
    parser.add_argument('--output-dir', default='/home/cfouche/Documents/Code/Projet_BigDataIAWeb/tools', help='Directory to output SQL files')
    parser.add_argument('--limit', type=int, default=50, help='Number of trees to process')
    args = parser.parse_args()

    create_sql_scripts(args.trees_csv, args.species_csv, args.output_dir, limit=args.limit)
