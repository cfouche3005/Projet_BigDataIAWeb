#!/usr/bin/env python3
"""
Extract unique lookup values from a CSV and produce one .sql import file.

Usage:
    python3 tools/extract_lookups.py /path/to/BD_arbres_final_complet.csv WEB/php/sql/data.sql

Generates one file containing INSERTs for:
    - etats (from fk_arb_etat)
    - stades_developpement (from fk_stadedev)
    - types_port (from fk_port)
    - types_pied (from fk_pied)

The output file uses `INSERT OR IGNORE` so it can be safely re-run.
"""
import csv
import os
import sys

LOOKUP_MAP = {
    'fk_arb_etat': 'etats',
    'fk_stadedev': 'stades_developpement',
    'fk_port': 'types_port',
    'fk_pied': 'types_pied',
}


def normalize(val: str) -> str:
    if val is None:
        return ''
    v = val.strip()
    # treat empty-like values as empty
    if v == '' or v.upper() in ('NA', 'N/A', 'NULL'):
        return ''
    return v


def sql_escape(val: str) -> str:
    return val.replace("'", "''")


def main(csv_path: str, out_path: str):
    if not os.path.isfile(csv_path):
        print('CSV file not found:', csv_path, file=sys.stderr)
        sys.exit(2)
    out_dir = os.path.dirname(out_path)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    uniques = {k: set() for k in LOOKUP_MAP.keys()}

    with open(csv_path, newline='') as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            for col in LOOKUP_MAP.keys():
                val = normalize(row.get(col, ''))
                if val:
                    uniques[col].add(val)

    with open(out_path, 'w') as out:
        out.write('-- Generated SQL for lookup tables\n')
        out.write('BEGIN TRANSACTION;\n')
        out.write('PRAGMA foreign_keys=OFF;\n\n')

        for col, table in LOOKUP_MAP.items():
            values = sorted(uniques[col])
            out.write('-- {}\n'.format(table))
            for v in values:
                out.write("INSERT OR IGNORE INTO {} (name) VALUES ('{}');\n".format(table, sql_escape(v)))
            out.write('\n')

        out.write('PRAGMA foreign_keys=ON;\n')
        out.write('COMMIT;\n')

    print('Wrote', out_path)


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Usage: python3 tools/extract_lookups.py input.csv output_sql_file', file=sys.stderr)
        sys.exit(2)
    main(sys.argv[1], sys.argv[2])
