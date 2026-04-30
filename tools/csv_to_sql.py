#!/usr/bin/env python3
import csv
import sys
import os

if len(sys.argv) < 3:
    print("Usage: csv_to_sql.py input.csv output.sql")
    sys.exit(2)

input_path = sys.argv[1]
output_path = sys.argv[2]

os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(input_path, newline='', encoding='utf-8-sig') as csvfile:
    reader = csv.DictReader(csvfile)
    rows = list(reader)

with open(output_path, 'w', encoding='utf-8') as out:
    out.write('-- SQL data dump generated from CSV\n')
    out.write('BEGIN TRANSACTION;\n')
    for r in rows:
        code = (r.get('Code_Technique') or r.get('Code_Technique').strip()) if 'Code_Technique' in r else ''
        fr = r.get('Nom_Francais_Lisible', '')
        latin = r.get('Nom_Latin_Lisible', '')
        # Normalize and escape single quotes
        code = (code or '').strip()
        fr = (fr or '').strip().replace("'", "''")
        latin = (latin or '').strip().replace("'", "''")
        if not code and not fr and not latin:
            continue
        sql = "INSERT OR IGNORE INTO especes (nom_code, nom_commun, nom_scientifique) VALUES ('{code}', '{fr}', '{latin}');\n".format(code=code, fr=fr, latin=latin)
        out.write(sql)
    out.write('COMMIT;\n')

print(f'Wrote {len(rows)} rows to {output_path}')
