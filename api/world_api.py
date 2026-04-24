#!/usr/bin/env python3
"""
Galactic Neighborhood — Worldbuilding API
A minimal Flask REST API serving the SQLite worldbuilding database.
Runs on localhost:5000, proxied by nginx at /api/world/

Install: pip3 install flask --break-system-packages
Run:     python3 /var/www/starmap/api/world_api.py
Service: managed by systemd (see install-api.sh)
"""

import sqlite3, json, os
from datetime import datetime
from flask import Flask, request, jsonify, g

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 32MB max upload

DB_PATH = os.environ.get('WORLD_DB', '/var/www/starmap/data/world.db')

# ── DB connection ─────────────────────────────────────────────────────────────
def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
        g.db.execute("PRAGMA journal_mode = WAL")
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    db = g.pop('db', None)
    if db: db.close()

def rows(cursor): return [dict(r) for r in cursor.fetchall()]
def now():        return datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')

# ── CORS for local dev ────────────────────────────────────────────────────────
@app.after_request
def cors(r):
    r.headers['Access-Control-Allow-Origin']  = '*'
    r.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    r.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return r

@app.route('/api/world/<path:p>', methods=['OPTIONS'])
def preflight(p): return '', 204

# ── ERAS ──────────────────────────────────────────────────────────────────────
@app.route('/api/world/eras')
def get_eras():
    return jsonify(rows(get_db().execute('SELECT * FROM eras ORDER BY order_index, id')))

@app.route('/api/world/eras', methods=['POST'])
def add_era():
    d = request.json
    db = get_db()
    cur = db.execute('INSERT INTO eras (name,order_index,start_desc,end_desc,color,notes) VALUES (?,?,?,?,?,?)',
        (d['name'], d.get('order_index',0), d.get('start_desc',''), d.get('end_desc',''), d.get('color','#4488cc'), d.get('notes','')))
    db.commit()
    # If INSERT was ignored (duplicate HIP), fetch the existing record's id
    row_id = cur.lastrowid
    if row_id == 0 and d.get('hip'):
        existing = db.execute('SELECT id FROM wb_stars WHERE hip=?', (d['hip'],)).fetchone()
        if existing:
            row_id = existing['id']
            return jsonify({'id': row_id}), 200  # 200 = already existed
    return jsonify({'id': row_id}), 201

@app.route('/api/world/eras/<int:eid>', methods=['PUT'])
def update_era(eid):
    d = request.json
    db = get_db()
    db.execute('UPDATE eras SET name=?,order_index=?,start_desc=?,end_desc=?,color=?,notes=? WHERE id=?',
        (d['name'], d.get('order_index',0), d.get('start_desc',''), d.get('end_desc',''), d.get('color','#4488cc'), d.get('notes',''), eid))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/world/eras/<int:eid>', methods=['DELETE'])
def delete_era(eid):
    db = get_db()
    db.execute('DELETE FROM eras WHERE id=?', (eid,))
    db.commit()
    return jsonify({'ok': True})

# ── CIVILIZATIONS ─────────────────────────────────────────────────────────────
@app.route('/api/world/civilizations')
def get_civs():
    return jsonify(rows(get_db().execute('SELECT * FROM civilizations ORDER BY name')))

@app.route('/api/world/civilizations', methods=['POST'])
def add_civ():
    d = request.json
    db = get_db()
    cur = db.execute('INSERT INTO civilizations (name,species,homeworld_hip,homeworld_name,color,symbol,notes) VALUES (?,?,?,?,?,?,?)',
        (d['name'], d.get('species',''), d.get('homeworld_hip'), d.get('homeworld_name',''), d.get('color','#888888'), d.get('symbol','★'), d.get('notes','')))
    db.commit()
    # If INSERT was ignored (duplicate HIP), fetch the existing record's id
    row_id = cur.lastrowid
    if row_id == 0 and d.get('hip'):
        existing = db.execute('SELECT id FROM wb_stars WHERE hip=?', (d['hip'],)).fetchone()
        if existing:
            row_id = existing['id']
            return jsonify({'id': row_id}), 200  # 200 = already existed
    return jsonify({'id': row_id}), 201

@app.route('/api/world/civilizations/<int:cid>', methods=['PUT'])
def update_civ(cid):
    d = request.json
    db = get_db()
    db.execute('UPDATE civilizations SET name=?,species=?,homeworld_hip=?,homeworld_name=?,color=?,symbol=?,notes=? WHERE id=?',
        (d['name'], d.get('species',''), d.get('homeworld_hip'), d.get('homeworld_name',''), d.get('color','#888888'), d.get('symbol','★'), d.get('notes',''), cid))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/world/civilizations/<int:cid>', methods=['DELETE'])
def delete_civ(cid):
    db = get_db()
    db.execute('DELETE FROM civilizations WHERE id=?', (cid,))
    db.commit()
    return jsonify({'ok': True})

# ── FACTIONS ──────────────────────────────────────────────────────────────────
@app.route('/api/world/factions')
def get_factions():
    q = '''SELECT f.*, c.name as civ_name, c.color as civ_color
           FROM factions f LEFT JOIN civilizations c ON f.civilization_id=c.id
           ORDER BY c.name, f.name'''
    return jsonify(rows(get_db().execute(q)))

@app.route('/api/world/factions', methods=['POST'])
def add_faction():
    d = request.json
    db = get_db()
    cur = db.execute('''INSERT INTO factions
        (civilization_id,name,short_name,type,era_founded,era_dissolved,capital_hip,capital_name,color,notes)
        VALUES (?,?,?,?,?,?,?,?,?,?)''',
        (d.get('civilization_id'), d['name'], d.get('short_name',''), d.get('type','Other'),
         d.get('era_founded'), d.get('era_dissolved'), d.get('capital_hip'), d.get('capital_name',''),
         d.get('color','#888888'), d.get('notes','')))
    db.commit()
    # If INSERT was ignored (duplicate HIP), fetch the existing record's id
    row_id = cur.lastrowid
    if row_id == 0 and d.get('hip'):
        existing = db.execute('SELECT id FROM wb_stars WHERE hip=?', (d['hip'],)).fetchone()
        if existing:
            row_id = existing['id']
            return jsonify({'id': row_id}), 200  # 200 = already existed
    return jsonify({'id': row_id}), 201

@app.route('/api/world/factions/<int:fid>', methods=['PUT'])
def update_faction(fid):
    d = request.json
    db = get_db()
    db.execute('''UPDATE factions SET civilization_id=?,name=?,short_name=?,type=?,
        era_founded=?,era_dissolved=?,capital_hip=?,capital_name=?,color=?,notes=? WHERE id=?''',
        (d.get('civilization_id'), d['name'], d.get('short_name',''), d.get('type','Other'),
         d.get('era_founded'), d.get('era_dissolved'), d.get('capital_hip'), d.get('capital_name',''),
         d.get('color','#888888'), d.get('notes',''), fid))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/world/factions/<int:fid>', methods=['DELETE'])
def delete_faction(fid):
    db = get_db()
    db.execute('DELETE FROM factions WHERE id=?', (fid,))
    db.commit()
    return jsonify({'ok': True})

# ── STARS ─────────────────────────────────────────────────────────────────────
@app.route('/api/world/stars')
def get_stars():
    q = '''SELECT s.*,
        GROUP_CONCAT(DISTINCT t.name) as tag_names
        FROM wb_stars s
        LEFT JOIN tag_links tl ON tl.entity_type='star' AND tl.entity_id=s.id
        LEFT JOIN tags t ON t.id=tl.tag_id
        GROUP BY s.id ORDER BY s.fictional_name, s.hip'''
    return jsonify(rows(get_db().execute(q)))

@app.route('/api/world/stars/by_hip/<int:hip>')
def get_star_by_hip(hip):
    db = get_db()
    star = db.execute('SELECT * FROM wb_stars WHERE hip=?', (hip,)).fetchone()
    if not star:
        return jsonify(None)
    s = dict(star)
    # Include era control rows
    s['era_control'] = rows(db.execute(
        '''SELECT sec.*, f.name as faction_name, f.color as faction_color, e.name as era_name
           FROM star_era_control sec
           LEFT JOIN factions f ON f.id=sec.faction_id
           LEFT JOIN eras e ON e.id=sec.era_id
           WHERE sec.star_id=?''', (s['id'],)))
    # Include planets
    s['planets'] = rows(db.execute('SELECT * FROM wb_planets WHERE star_id=?', (s['id'],)))
    # Include tags
    s['tags'] = rows(db.execute(
        '''SELECT t.* FROM tags t JOIN tag_links tl ON t.id=tl.tag_id
           WHERE tl.entity_type='star' AND tl.entity_id=?''', (s['id'],)))
    return jsonify(s)

@app.route('/api/world/stars', methods=['POST'])
def add_star():
    d = request.json
    db = get_db()
    cur = db.execute('''INSERT OR IGNORE INTO wb_stars
        (hip,hd,fictional_only,fictional_name,common_name,gal_x,gal_y,gal_z,dist_ly,
         spect_override,first_contact_era,significance,plot_notes,internal_notes)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
        (d.get('hip'), d.get('hd'), d.get('fictional_only',0),
         d.get('fictional_name',''), d.get('common_name',''),
         d.get('gal_x'), d.get('gal_y'), d.get('gal_z'), d.get('dist_ly'),
         d.get('spect_override'), d.get('first_contact_era') or None,
         d.get('significance','NONE'), d.get('plot_notes',''), d.get('internal_notes','')))
    db.commit()
    # If INSERT was ignored (duplicate HIP), fetch the existing record's id
    row_id = cur.lastrowid
    if row_id == 0 and d.get('hip'):
        existing = db.execute('SELECT id FROM wb_stars WHERE hip=?', (d['hip'],)).fetchone()
        if existing:
            row_id = existing['id']
            return jsonify({'id': row_id}), 200  # 200 = already existed
    return jsonify({'id': row_id}), 201

@app.route('/api/world/stars/<int:sid>', methods=['PUT'])
def update_star(sid):
    d = request.json
    db = get_db()
    db.execute('''UPDATE wb_stars SET hip=?,hd=?,fictional_name=?,common_name=?,
        spect_override=?,first_contact_era=?,significance=?,plot_notes=?,internal_notes=?,
        updated_at=? WHERE id=?''',
        (d.get('hip'), d.get('hd'), d.get('fictional_name',''), d.get('common_name',''),
         d.get('spect_override'), d.get('first_contact_era') or None,
         d.get('significance','NONE'), d.get('plot_notes',''), d.get('internal_notes',''),
         now(), sid))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/world/stars/<int:sid>', methods=['DELETE'])
def delete_star(sid):
    db = get_db()
    db.execute('DELETE FROM wb_stars WHERE id=?', (sid,))
    db.commit()
    return jsonify({'ok': True})

# ── STAR ERA CONTROL ──────────────────────────────────────────────────────────
@app.route('/api/world/stars/<int:sid>/control', methods=['POST'])
def add_control(sid):
    d = request.json
    db = get_db()
    # Upsert: replace existing control for this star+era
    db.execute('''INSERT OR REPLACE INTO star_era_control
        (star_id,era_id,faction_id,status,population,military_tier,notes)
        VALUES (?,?,?,?,?,?,?)''',
        (sid, d['era_id'], d.get('faction_id'), d.get('status','Claimed'),
         d.get('population',''), d.get('military_tier',0), d.get('notes','')))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/world/control/<int:cid>', methods=['DELETE'])
def delete_control(cid):
    db = get_db()
    db.execute('DELETE FROM star_era_control WHERE id=?', (cid,))
    db.commit()
    return jsonify({'ok': True})

# ── PLANETS ───────────────────────────────────────────────────────────────────
@app.route('/api/world/planets/by_star/<int:sid>')
def get_planets_for_star(sid):
    db = get_db()
    planets = rows(db.execute('SELECT * FROM wb_planets WHERE star_id=? ORDER BY orbit_au', (sid,)))
    for p in planets:
        p['era_states'] = rows(db.execute(
            '''SELECT pes.*, f.name as faction_name, e.name as era_name
               FROM planet_era_state pes
               LEFT JOIN factions f ON f.id=pes.faction_id
               LEFT JOIN eras e ON e.id=pes.era_id
               WHERE pes.planet_id=?''', (p['id'],)))
    return jsonify(planets)

@app.route('/api/world/planets', methods=['POST'])
def add_planet():
    d = request.json
    db = get_db()
    cur = db.execute('''INSERT INTO wb_planets
        (star_id,nasa_pl_name,fictional_name,common_name,orbit_au,period_days,
         eccentricity,inclination,arg_peri,
         radius_earth,mass_earth,
         world_type,size_class,gravity_class,atmosphere,temperature,day_length,
         mass_desc,habitable,native_life,significance,plot_notes,internal_notes)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
        (d['star_id'], d.get('nasa_pl_name'), d.get('fictional_name',''), d.get('common_name',''),
         d.get('orbit_au'), d.get('period_days'),
         d.get('eccentricity',0), d.get('inclination',0), d.get('arg_peri',0),
         d.get('radius_earth'), d.get('mass_earth'),
         d.get('world_type','Rocky'), d.get('size_class','Earth-like'),
         d.get('gravity_class','Standard'), d.get('atmosphere','Breathable'),
         d.get('temperature','Temperate'), d.get('day_length',''),
         d.get('mass_desc',''), d.get('habitable',0), d.get('native_life','None'),
         d.get('significance','NONE'), d.get('plot_notes',''), d.get('internal_notes','')))
    db.commit()
    # If INSERT was ignored (duplicate HIP), fetch the existing record's id
    row_id = cur.lastrowid
    if row_id == 0 and d.get('hip'):
        existing = db.execute('SELECT id FROM wb_stars WHERE hip=?', (d['hip'],)).fetchone()
        if existing:
            row_id = existing['id']
            return jsonify({'id': row_id}), 200  # 200 = already existed
    return jsonify({'id': row_id}), 201

@app.route('/api/world/planets/<int:pid>', methods=['PUT'])
def update_planet(pid):
    d = request.json
    db = get_db()
    db.execute('''UPDATE wb_planets SET fictional_name=?,common_name=?,orbit_au=?,period_days=?,
        eccentricity=?,inclination=?,arg_peri=?,
        radius_earth=?,mass_earth=?,
        world_type=?,size_class=?,gravity_class=?,atmosphere=?,temperature=?,day_length=?,
        mass_desc=?,habitable=?,native_life=?,significance=?,plot_notes=?,internal_notes=?,updated_at=?
        WHERE id=?''',
        (d.get('fictional_name',''), d.get('common_name',''), d.get('orbit_au'), d.get('period_days'),
         d.get('eccentricity',0), d.get('inclination',0), d.get('arg_peri',0),
         d.get('radius_earth'), d.get('mass_earth'),
         d.get('world_type','Rocky'), d.get('size_class','Earth-like'),
         d.get('gravity_class','Standard'), d.get('atmosphere','Breathable'),
         d.get('temperature','Temperate'), d.get('day_length',''),
         d.get('mass_desc',''), d.get('habitable',0), d.get('native_life','None'),
         d.get('significance','NONE'), d.get('plot_notes',''), d.get('internal_notes',''),
         now(), pid))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/world/planets/<int:pid>', methods=['DELETE'])
def delete_planet(pid):
    db = get_db()
    db.execute('DELETE FROM wb_planets WHERE id=?', (pid,))
    db.commit()
    return jsonify({'ok': True})

# ── PLANET SURFACE MAP ───────────────────────────────────────────────────────
import base64, re as _re

MAPS_DIR = '/var/www/starmap/static/data/maps'
import os as _startup_os
_startup_os.makedirs(MAPS_DIR, exist_ok=True)  # ensure exists on startup

@app.route('/api/world/planets/<int:pid>/surface_map', methods=['POST'])
def upload_surface_map(pid):
    """Accept base64-encoded image, save to disk, record filename in DB."""
    d = request.json
    data_url = d.get('data_url','')
    if not data_url:
        return jsonify({'error':'no data_url'}), 400
    # Strip data:image/...;base64, prefix
    m = _re.match(r'data:image/(\w+);base64,(.+)', data_url, _re.DOTALL)
    if not m:
        return jsonify({'error':'invalid data_url'}), 400
    ext = m.group(1).lower()
    if ext not in ('png','jpg','jpeg','webp'): ext = 'jpg'
    raw = base64.b64decode(m.group(2))
    import os as _os
    _os.makedirs(MAPS_DIR, exist_ok=True)
    fname = f'planet_{pid}.{ext}'
    fpath = _os.path.join(MAPS_DIR, fname)
    with open(fpath, 'wb') as f:
        f.write(raw)
    db = get_db()
    db.execute('UPDATE wb_planets SET surface_map=?,updated_at=? WHERE id=?',
               (fname, now(), pid))
    db.commit()
    return jsonify({'ok': True, 'surface_map': fname})

@app.route('/api/world/planets/<int:pid>/surface_map', methods=['GET'])
def get_surface_map(pid):
    import os as _os
    db = get_db()
    row = db.execute('SELECT surface_map FROM wb_planets WHERE id=?', (pid,)).fetchone()
    if not row or not row['surface_map']:
        return jsonify({'url': None})
    fname = row['surface_map']
    fpath = _os.path.join(MAPS_DIR, fname)
    if not _os.path.exists(fpath):
        return jsonify({'url': None})
    return jsonify({'url': f'/static/data/maps/{fname}'})

@app.route('/api/world/planets/<int:pid>/surface_map', methods=['DELETE'])
def delete_surface_map(pid):
    import os as _os
    db = get_db()
    row = db.execute('SELECT surface_map FROM wb_planets WHERE id=?', (pid,)).fetchone()
    if row and row['surface_map']:
        fpath = _os.path.join(MAPS_DIR, row['surface_map'])
        if _os.path.exists(fpath):
            _os.remove(fpath)
    db.execute("UPDATE wb_planets SET surface_map='',updated_at=? WHERE id=?", (now(), pid))
    db.commit()
    return jsonify({'ok': True})

# ── TAGS ──────────────────────────────────────────────────────────────────────
@app.route('/api/world/tags')
def get_tags():
    return jsonify(rows(get_db().execute('SELECT * FROM tags ORDER BY name')))

@app.route('/api/world/tags', methods=['POST'])
def add_tag():
    d = request.json
    db = get_db()
    cur = db.execute('INSERT OR IGNORE INTO tags (name,color) VALUES (?,?)',
        (d['name'], d.get('color','#888888')))
    db.commit()
    tag = db.execute('SELECT * FROM tags WHERE name=?', (d['name'],)).fetchone()
    return jsonify(dict(tag)), 201

@app.route('/api/world/tags/link', methods=['POST'])
def link_tag():
    d = request.json
    db = get_db()
    db.execute('INSERT OR IGNORE INTO tag_links (tag_id,entity_type,entity_id) VALUES (?,?,?)',
        (d['tag_id'], d['entity_type'], d['entity_id']))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/world/tags/unlink', methods=['POST'])
def unlink_tag():
    d = request.json
    db = get_db()
    db.execute('DELETE FROM tag_links WHERE tag_id=? AND entity_type=? AND entity_id=?',
        (d['tag_id'], d['entity_type'], d['entity_id']))
    db.commit()
    return jsonify({'ok': True})

# ── SEARCH ────────────────────────────────────────────────────────────────────
@app.route('/api/world/search')
def search():
    q = '%' + request.args.get('q','') + '%'
    db = get_db()
    stars   = rows(db.execute("SELECT 'star' as type, id, fictional_name as name, hip FROM wb_stars WHERE fictional_name LIKE ? OR common_name LIKE ? LIMIT 10", (q,q)))
    factions= rows(db.execute("SELECT 'faction' as type, id, name, short_name as hip FROM factions WHERE name LIKE ? OR short_name LIKE ? LIMIT 10", (q,q)))
    return jsonify(stars + factions)

# ── HIP NUMBERS WITH USER PLANETS (for map ring indicators) ──────────────────
# Returns a lightweight list of HIP numbers that have wb_planets records.
# The galactic map calls this once after buildStars() to colour rings blue/green.
@app.route('/api/world/stars/with_planets')
def stars_with_planets():
    db = get_db()
    rows_data = db.execute(
        '''SELECT DISTINCT s.hip
           FROM wb_stars s
           JOIN wb_planets p ON p.star_id = s.id
           WHERE s.hip IS NOT NULL'''
    ).fetchall()
    return jsonify([r[0] for r in rows_data])

# ── ALL PLANETS FOR EXOPLANET VIEWER ─────────────────────────────────────────
# Returns all wb_planets for a star identified by HIP number.
# The exoplanet viewer calls this to merge user/imported planets into the scene.
# Returns [] gracefully if the star has no WB record yet.
@app.route('/api/world/allplanets/<int:hip>')
def get_all_planets(hip):
    db = get_db()
    star = db.execute('SELECT * FROM wb_stars WHERE hip=?', (hip,)).fetchone()
    if not star:
        return jsonify([])
    planets = rows(db.execute(
        'SELECT * FROM wb_planets WHERE star_id=? ORDER BY orbit_au NULLS LAST',
        (star['id'],)
    ))
    return jsonify(planets)

# ── MOONS ─────────────────────────────────────────────────────────────────────
@app.route('/api/world/moons/by_planet/<int:pid>')
def get_moons(pid):
    db = get_db()
    moons = rows(db.execute(
        'SELECT * FROM wb_moons WHERE planet_id=? ORDER BY orbit_radii NULLS LAST', (pid,)
    ))
    return jsonify(moons)

@app.route('/api/world/moons', methods=['POST'])
def add_moon():
    d = request.json
    db = get_db()
    cur = db.execute('''INSERT INTO wb_moons
        (planet_id,nasa_moon_name,fictional_name,common_name,
         orbit_radii,period_days,eccentricity,inclination,
         radius_km,mass_earth,mass_desc,world_type,atmosphere,
         native_life,habitable,significance,plot_notes,internal_notes)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
        (d['planet_id'], d.get('nasa_moon_name'), d.get('fictional_name',''),
         d.get('common_name',''), d.get('orbit_radii'), d.get('period_days'),
         d.get('eccentricity',0), d.get('inclination',0),
         d.get('radius_km'), d.get('mass_earth'),
         d.get('mass_desc',''), d.get('world_type','Rocky'), d.get('atmosphere','None'),
         d.get('native_life','None'), d.get('habitable',0),
         d.get('significance','NONE'), d.get('plot_notes',''),
         d.get('internal_notes','')))
    db.commit()
    return jsonify({'id': cur.lastrowid}), 201

@app.route('/api/world/moons/<int:mid>', methods=['PUT'])
def update_moon(mid):
    d = request.json
    db = get_db()
    db.execute('''UPDATE wb_moons SET fictional_name=?,common_name=?,
        orbit_radii=?,period_days=?,eccentricity=?,inclination=?,
        radius_km=?,mass_earth=?,mass_desc=?,world_type=?,atmosphere=?,
        native_life=?,habitable=?,significance=?,plot_notes=?,internal_notes=?,updated_at=?
        WHERE id=?''',
        (d.get('fictional_name',''), d.get('common_name',''),
         d.get('orbit_radii'), d.get('period_days'),
         d.get('eccentricity',0), d.get('inclination',0),
         d.get('radius_km'), d.get('mass_earth'),
         d.get('mass_desc',''), d.get('world_type','Rocky'), d.get('atmosphere','None'),
         d.get('native_life','None'), d.get('habitable',0),
         d.get('significance','NONE'), d.get('plot_notes',''),
         d.get('internal_notes',''), now(), mid))
    db.commit()
    return jsonify({'ok': True})

# ── MOON SURFACE MAP ──────────────────────────────────────────────────────────
@app.route('/api/world/moons/<int:mid>/surface_map', methods=['POST'])
def upload_moon_surface_map(mid):
    """Accept base64-encoded image, save to disk, record filename in DB."""
    import base64 as _b64, re as _re, os as _os
    d = request.json
    data_url = d.get('data_url','')
    if not data_url:
        return jsonify({'error':'no data_url'}), 400
    m = _re.match(r'data:image/(\w+);base64,(.+)', data_url, _re.DOTALL)
    if not m:
        return jsonify({'error':'invalid data_url'}), 400
    ext = m.group(1).lower()
    if ext not in ('png','jpg','jpeg','webp'): ext = 'jpg'
    raw = _b64.b64decode(m.group(2))
    _os.makedirs(MAPS_DIR, exist_ok=True)
    fname = f'moon_{mid}.{ext}'
    fpath = _os.path.join(MAPS_DIR, fname)
    with open(fpath, 'wb') as f:
        f.write(raw)
    db = get_db()
    db.execute('UPDATE wb_moons SET surface_map=?,updated_at=? WHERE id=?',
               (fname, now(), mid))
    db.commit()
    return jsonify({'ok': True, 'surface_map': fname})

@app.route('/api/world/moons/<int:mid>/surface_map', methods=['GET'])
def get_moon_surface_map(mid):
    import os as _os
    db = get_db()
    row = db.execute('SELECT surface_map FROM wb_moons WHERE id=?', (mid,)).fetchone()
    if not row or not row['surface_map']:
        return jsonify({'url': None})
    fname = row['surface_map']
    fpath = _os.path.join(MAPS_DIR, fname)
    if not _os.path.exists(fpath):
        return jsonify({'url': None})
    return jsonify({'url': f'/static/data/maps/{fname}'})

@app.route('/api/world/moons/<int:mid>/surface_map', methods=['DELETE'])
def delete_moon_surface_map(mid):
    import os as _os
    db = get_db()
    row = db.execute('SELECT surface_map FROM wb_moons WHERE id=?', (mid,)).fetchone()
    if row and row['surface_map']:
        fpath = _os.path.join(MAPS_DIR, row['surface_map'])
        if _os.path.exists(fpath): _os.remove(fpath)
    db.execute("UPDATE wb_moons SET surface_map='',updated_at=? WHERE id=?", (now(), mid))
    db.commit()
    return jsonify({'ok': True})

# ── MOON ERA STATE ────────────────────────────────────────────────────────────
@app.route('/api/world/moons/<int:mid>/era_states')
def get_moon_era_states(mid):
    db = get_db()
    return jsonify(rows(db.execute(
        '''SELECT mes.*, e.name era_name, f.name faction_name, f.color faction_color
           FROM moon_era_state mes
           LEFT JOIN eras e ON e.id=mes.era_id
           LEFT JOIN factions f ON f.id=mes.faction_id
           WHERE mes.moon_id=? ORDER BY e.order_index''', (mid,)
    )))

@app.route('/api/world/moons/<int:mid>/era_states', methods=['POST'])
def upsert_moon_era_state(mid):
    d = request.json
    db = get_db()
    db.execute('''INSERT INTO moon_era_state
        (moon_id,era_id,faction_id,colonial_name,population,
         settlement_type,terraformed,military_tier,notes)
        VALUES (?,?,?,?,?,?,?,?,?)
        ON CONFLICT(moon_id,era_id) DO UPDATE SET
        faction_id=excluded.faction_id, colonial_name=excluded.colonial_name,
        population=excluded.population, settlement_type=excluded.settlement_type,
        terraformed=excluded.terraformed, military_tier=excluded.military_tier,
        notes=excluded.notes''',
        (mid, d['era_id'], d.get('faction_id'),
         d.get('colonial_name',''), d.get('population',''),
         d.get('settlement_type','None'), d.get('terraformed',0),
         d.get('military_tier',0), d.get('notes','')))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/world/moons/<int:mid>', methods=['DELETE'])
def delete_moon(mid):
    db = get_db()
    db.execute('DELETE FROM wb_moons WHERE id=?', (mid,))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/world/allmoons/<int:planet_id>')
def get_all_moons(planet_id):
    """All wb_moons for a planet — used by planet-system.html."""
    db = get_db()
    moons = rows(db.execute(
        'SELECT * FROM wb_moons WHERE planet_id=? ORDER BY orbit_radii NULLS LAST',
        (planet_id,)
    ))
    return jsonify(moons)

# ── BACKUP ────────────────────────────────────────────────────────────────────
@app.route('/api/world/backup')
def backup():
    """Return the full DB as a JSON dump for easy backup."""
    db = get_db()
    tables = ['eras','civilizations','factions','wb_stars','star_era_control',
              'wb_planets','wb_moons','planet_era_state','moon_era_state','tags','tag_links']
    dump = {}
    for t in tables:
        dump[t] = rows(db.execute(f'SELECT * FROM {t}'))
    return jsonify(dump)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
