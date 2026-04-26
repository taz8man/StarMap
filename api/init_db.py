#!/usr/bin/env python3
"""Initialize the worldbuilding SQLite database."""
import sqlite3, os, sys

DB_PATH = os.environ.get('WORLD_DB', '/var/www/starmap/data/world.db')
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

if os.path.exists(DB_PATH) and '--force' not in sys.argv:
    print(f"Database already exists at {DB_PATH}")
    print("Use --force to reinitialise (WILL DELETE ALL DATA)")
    sys.exit(0)

db = sqlite3.connect(DB_PATH)
db.executescript("""
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS eras (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    start_desc  TEXT DEFAULT '',
    end_desc    TEXT DEFAULT '',
    color       TEXT DEFAULT '#4488cc',
    notes       TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS civilizations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    species         TEXT DEFAULT '',
    homeworld_hip   INTEGER,
    homeworld_name  TEXT DEFAULT '',
    color           TEXT DEFAULT '#888888',
    symbol          TEXT DEFAULT '★',
    notes           TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS factions (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    civilization_id     INTEGER REFERENCES civilizations(id) ON DELETE SET NULL,
    name                TEXT NOT NULL,
    short_name          TEXT DEFAULT '',
    type                TEXT DEFAULT 'Other',
    era_founded         INTEGER REFERENCES eras(id) ON DELETE SET NULL,
    era_dissolved       INTEGER REFERENCES eras(id) ON DELETE SET NULL,
    capital_hip         INTEGER,
    capital_name        TEXT DEFAULT '',
    color               TEXT DEFAULT '#888888',
    notes               TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS wb_stars (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    hip                 INTEGER UNIQUE,
    hd                  INTEGER,
    fictional_only      INTEGER DEFAULT 0,
    fictional_name      TEXT DEFAULT '',
    common_name         TEXT DEFAULT '',
    gal_x               REAL,
    gal_y               REAL,
    gal_z               REAL,
    dist_ly             REAL,
    spect_override      TEXT,
    first_contact_era   INTEGER REFERENCES eras(id) ON DELETE SET NULL,
    significance        TEXT DEFAULT 'NONE',
    plot_notes          TEXT DEFAULT '',
    internal_notes      TEXT DEFAULT '',
    created_at          TEXT DEFAULT (datetime('now')),
    updated_at          TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS star_era_control (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    star_id         INTEGER NOT NULL REFERENCES wb_stars(id) ON DELETE CASCADE,
    era_id          INTEGER NOT NULL REFERENCES eras(id) ON DELETE CASCADE,
    faction_id      INTEGER REFERENCES factions(id) ON DELETE SET NULL,
    status          TEXT DEFAULT 'Claimed',
    population      TEXT DEFAULT '',
    military_tier   INTEGER DEFAULT 0,
    notes           TEXT DEFAULT '',
    UNIQUE(star_id, era_id)
);

CREATE TABLE IF NOT EXISTS wb_planets (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    star_id         INTEGER NOT NULL REFERENCES wb_stars(id) ON DELETE CASCADE,
    nasa_pl_name    TEXT,
    fictional_name  TEXT DEFAULT '',
    common_name     TEXT DEFAULT '',
    orbit_au        REAL,
    period_days     REAL,
    eccentricity    REAL DEFAULT 0,
    inclination     REAL DEFAULT 0,
    arg_peri        REAL DEFAULT 0,
    radius_earth    REAL,
    mass_earth      REAL,
    world_type      TEXT DEFAULT 'Rocky',
    size_class      TEXT DEFAULT 'Earth-like',
    gravity_class   TEXT DEFAULT 'Standard',
    atmosphere      TEXT DEFAULT 'Breathable',
    temperature     TEXT DEFAULT 'Temperate',
    day_length      TEXT DEFAULT '',
    habitable       INTEGER DEFAULT 0,
    mass_desc       TEXT DEFAULT '',
    native_life     TEXT DEFAULT 'None',
    significance    TEXT DEFAULT 'NONE',
    plot_notes      TEXT DEFAULT '',
    internal_notes  TEXT DEFAULT '',
    surface_map     TEXT DEFAULT '',
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS planet_era_state (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    planet_id       INTEGER NOT NULL REFERENCES wb_planets(id) ON DELETE CASCADE,
    era_id          INTEGER NOT NULL REFERENCES eras(id) ON DELETE CASCADE,
    faction_id      INTEGER REFERENCES factions(id) ON DELETE SET NULL,
    colonial_name   TEXT DEFAULT '',
    population      TEXT DEFAULT '',
    settlement_type TEXT DEFAULT 'None',
    terraformed     INTEGER DEFAULT 0,
    military_tier   INTEGER DEFAULT 0,
    notes           TEXT DEFAULT '',
    UNIQUE(planet_id, era_id)
);

CREATE TABLE IF NOT EXISTS tags (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT UNIQUE NOT NULL,
    color   TEXT DEFAULT '#888888'
);

CREATE TABLE IF NOT EXISTS tag_links (
    tag_id      INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id   INTEGER NOT NULL,
    PRIMARY KEY (tag_id, entity_type, entity_id)
);

-- Indices for common lookups
CREATE INDEX IF NOT EXISTS idx_wb_stars_hip ON wb_stars(hip);
CREATE INDEX IF NOT EXISTS idx_wb_stars_hd  ON wb_stars(hd);
CREATE INDEX IF NOT EXISTS idx_sec_star  ON star_era_control(star_id);
CREATE INDEX IF NOT EXISTS idx_sec_era   ON star_era_control(era_id);
CREATE INDEX IF NOT EXISTS idx_sec_fac   ON star_era_control(faction_id);
CREATE TABLE IF NOT EXISTS wb_moons (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    planet_id       INTEGER NOT NULL REFERENCES wb_planets(id) ON DELETE CASCADE,
    nasa_moon_name  TEXT,
    fictional_name  TEXT DEFAULT '',
    common_name     TEXT DEFAULT '',
    orbit_radii     REAL,
    period_days     REAL,
    eccentricity    REAL DEFAULT 0,
    inclination     REAL DEFAULT 0,
    radius_km       REAL,
    world_type      TEXT DEFAULT 'Rocky',
    atmosphere      TEXT DEFAULT 'None',
    significance    TEXT DEFAULT 'NONE',
    native_life     TEXT DEFAULT 'None',
    habitable       INTEGER DEFAULT 0,
    mass_earth      REAL,
    mass_desc       TEXT DEFAULT '',
    plot_notes      TEXT DEFAULT '',
    internal_notes  TEXT DEFAULT '',
    surface_map     TEXT DEFAULT '',
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS moon_era_state (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    moon_id         INTEGER NOT NULL REFERENCES wb_moons(id) ON DELETE CASCADE,
    era_id          INTEGER NOT NULL REFERENCES eras(id) ON DELETE CASCADE,
    faction_id      INTEGER REFERENCES factions(id) ON DELETE SET NULL,
    colonial_name   TEXT DEFAULT '',
    population      TEXT DEFAULT '',
    settlement_type TEXT DEFAULT 'None',
    terraformed     INTEGER DEFAULT 0,
    military_tier   INTEGER DEFAULT 0,
    notes           TEXT DEFAULT '',
    UNIQUE(moon_id, era_id)
);

CREATE INDEX IF NOT EXISTS idx_wbp_star  ON wb_planets(star_id);
CREATE INDEX IF NOT EXISTS idx_wbm_planet ON wb_moons(planet_id);
CREATE INDEX IF NOT EXISTS idx_pes_planet ON planet_era_state(planet_id);
CREATE INDEX IF NOT EXISTS idx_tl ON tag_links(entity_type, entity_id);
CREATE TABLE IF NOT EXISTS faction_connections (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    faction_id  INTEGER NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
    era_id      INTEGER NOT NULL REFERENCES eras(id) ON DELETE CASCADE,
    star_hip_a  INTEGER NOT NULL,
    star_hip_b  INTEGER NOT NULL,
    conn_type   TEXT DEFAULT 'Territory',
    notes       TEXT DEFAULT '',
    created_at  TEXT DEFAULT (datetime('now')),
    UNIQUE(faction_id, era_id, star_hip_a, star_hip_b)
);
CREATE INDEX IF NOT EXISTS idx_fc_faction ON faction_connections(faction_id);
CREATE INDEX IF NOT EXISTS idx_fc_era     ON faction_connections(era_id);
CREATE INDEX IF NOT EXISTS idx_fc_hip_a   ON faction_connections(star_hip_a);
CREATE INDEX IF NOT EXISTS idx_fc_hip_b   ON faction_connections(star_hip_b);

CREATE INDEX IF NOT EXISTS idx_mes_era  ON moon_era_state(era_id);
""")
db.commit()

# Seed one starter era so the UI isn't empty
db.execute("INSERT OR IGNORE INTO eras (name,order_index,start_desc,color) VALUES ('Era 1',1,'Year 0','#4488cc')")
db.commit()
db.close()
# Add mass_desc column if it doesn't exist (safe migration)
try:
    db.execute("ALTER TABLE wb_planets ADD COLUMN mass_desc TEXT DEFAULT ''")
    db.execute("ALTER TABLE wb_planets ADD COLUMN eccentricity REAL DEFAULT 0")
    db.execute("ALTER TABLE wb_planets ADD COLUMN inclination REAL DEFAULT 0")
    db.execute("ALTER TABLE wb_planets ADD COLUMN arg_peri REAL DEFAULT 0")
    db.execute("ALTER TABLE wb_planets ADD COLUMN radius_earth REAL")
    db.execute("ALTER TABLE wb_planets ADD COLUMN mass_earth REAL")
    db.commit()
except Exception:
    pass  # columns already exist

# Add wb_moons table if it doesn't exist (safe migration)
try:
    db2 = sqlite3.connect(DB_PATH)
    db2.execute('''CREATE TABLE IF NOT EXISTS wb_moons (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        planet_id       INTEGER NOT NULL REFERENCES wb_planets(id) ON DELETE CASCADE,
        nasa_moon_name  TEXT,
        fictional_name  TEXT DEFAULT '',
        common_name     TEXT DEFAULT '',
        orbit_radii     REAL,
        period_days     REAL,
        eccentricity    REAL DEFAULT 0,
        inclination     REAL DEFAULT 0,
        radius_km       REAL,
        mass_desc       TEXT DEFAULT '',
        world_type      TEXT DEFAULT 'Rocky',
        atmosphere      TEXT DEFAULT 'None',
        significance    TEXT DEFAULT 'NONE',
        plot_notes      TEXT DEFAULT '',
        internal_notes  TEXT DEFAULT '',
        created_at      TEXT DEFAULT (datetime('now')),
        updated_at      TEXT DEFAULT (datetime('now'))
    )''')
    db2.execute("CREATE INDEX IF NOT EXISTS idx_wbm_planet ON wb_moons(planet_id)")
    db2.commit()
    db2.close()
except Exception:
    pass  # table already exists
print(f"Database initialised at {DB_PATH}")
