#!/usr/bin/env python3
"""
One-shot database migration script.
Run on the Pi to add missing columns to an existing world.db.
Usage: sudo python3 migrate_db.py
"""
import sqlite3, os, sys

DB_PATH = os.environ.get('WORLD_DB', '/var/www/starmap/data/world.db')

if not os.path.exists(DB_PATH):
    print(f"Database not found at {DB_PATH}")
    print("Run: sudo bash /var/www/starmap/api/install-api.sh")
    sys.exit(1)

db = sqlite3.connect(DB_PATH)
db.execute("PRAGMA foreign_keys = OFF")  # disable during migration

migrations = [
    # wb_stars new columns
    ("wb_stars",   "luminosity",        "ALTER TABLE wb_stars ADD COLUMN luminosity REAL"),
    ("wb_stars",   "hab_zone_inner",    "ALTER TABLE wb_stars ADD COLUMN hab_zone_inner REAL"),
    ("wb_stars",   "hab_zone_outer",    "ALTER TABLE wb_stars ADD COLUMN hab_zone_outer REAL"),
    # wb_planets new columns
    ("wb_planets", "mass_desc",         "ALTER TABLE wb_planets ADD COLUMN mass_desc TEXT DEFAULT ''"),
    ("wb_planets", "mass_earth",        "ALTER TABLE wb_planets ADD COLUMN mass_earth REAL"),
    ("wb_planets", "radius_earth",      "ALTER TABLE wb_planets ADD COLUMN radius_earth REAL"),
    ("wb_planets", "eccentricity",      "ALTER TABLE wb_planets ADD COLUMN eccentricity REAL DEFAULT 0"),
    ("wb_planets", "inclination",       "ALTER TABLE wb_planets ADD COLUMN inclination REAL DEFAULT 0"),
    ("wb_planets", "arg_peri",          "ALTER TABLE wb_planets ADD COLUMN arg_peri REAL DEFAULT 0"),
]

# Get existing columns for each table
def get_cols(table):
    rows = db.execute(f"PRAGMA table_info({table})").fetchall()
    return {r[1] for r in rows}

applied = 0
skipped = 0
for table, col, sql in migrations:
    existing = get_cols(table)
    if col in existing:
        print(f"  skip  {table}.{col} (already exists)")
        skipped += 1
    else:
        db.execute(sql)
        db.commit()
        print(f"  added {table}.{col}")
        applied += 1

db.execute("PRAGMA foreign_keys = ON")
db.close()

print()
print(f"Migration complete: {applied} columns added, {skipped} already existed.")
print("Restart the API: sudo systemctl restart starmap-api")
