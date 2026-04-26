# Local Galactic Neighborhood — Star Map

**Version:** 1.4 &nbsp;|&nbsp; **License:** MIT &nbsp;|&nbsp; **Platform:** Raspberry Pi OS Bookworm (64-bit)

An interactive 3D star map of the local galactic neighborhood (120 light years) served as a local website from a Raspberry Pi. Built on real astronomical data (HYG v4.2, NASA Exoplanet Archive) with a full worldbuilding layer for science fiction writers and game masters.

**Features:**
- 3D WebGL star map with ~5,400 stars within 120 ly · real galactic coordinates
- Exoplanet system viewer · Solar system viewer · Moon system viewer · Multi-star system viewer
- Planet/moon surface map upload (equirectangular textures)
- Faction territory lines and smooth 3D territory blobs (server-side marching cubes)
- Worldbuilding database — stars, planets, moons, eras, civilizations, factions
- HYG v4.2 star catalog · NASA confirmed exoplanet rings

**Hardware:** Raspberry Pi 5 (8GB recommended) · Pi 4 also supported
**Tested on:** Raspberry Pi OS Bookworm (64-bit)

---

## What This Is

An interactive 3D star map rendered in WebGL (Three.js) showing every catalogued star within 120 light years of Sol in true galactic coordinates, served as a local website from a Raspberry Pi. Layered on top of real astronomical data is a full **worldbuilding system** for science fiction writers, game masters, and world-builders — annotate stars, create planets and moons, define civilizations, factions, eras, draw faction territory connections between star systems, and visualize claimed territory as smooth 3D blobs.

---

## Package Contents

```
starmap/
├── index.html                  ← Galactic neighborhood map (main app)
├── exoplanet-system.html       ← Planetary system 3D viewer
├── solar-system.html           ← Solar system viewer
├── planet-system.html          ← Moon system viewer (surface map, moon focus camera)
├── stellar-system.html         ← Multi-star system viewer
├── nginx.conf                  ← Web server configuration (32MB upload limit)
├── install.sh                  ← Full installer (7 steps)
├── uninstall.sh                ← Clean uninstaller
├── update.sh                   ← Deploy HTML updates to Pi
├── update-data.sh              ← Run all catalog updates (cron)
├── update-catalog.sh           ← Update HYG v4.2 star catalog
├── update-exoplanets.sh        ← Update NASA exoplanet catalog
├── kiosk-setup.sh              ← Optional full-screen kiosk mode
├── images/
│   └── Galactic.ico            ← App favicon (all viewers)
├── api/
│   ├── world_api.py            ← Flask worldbuilding REST API
│   ├── init_db.py              ← SQLite schema + migrations
│   ├── migrate_db.py           ← Safe migration for existing databases
│   ├── install-api.sh          ← API service installer
└── static/
    ├── css/worldbuilding.css
    └── js/
        ├── worldbuilding.js
        └── worldbuilding-panel.js
```

---

## Quick Install (Fresh Pi 5)

### Option A — Clone directly from GitHub (recommended)

SSH into your Pi, then:

```bash
# Install git if not already present
sudo apt-get install -y git

# Clone the repo
git clone https://github.com/taz8man/StarMap.git starmap
cd starmap

# Run the installer
sudo bash install.sh
```

### Option B — Download release tarball

```bash
# Download latest release
wget https://github.com/taz8man/StarMap/archive/refs/heads/master.tar.gz
tar -xzf master.tar.gz
cd StarMap-master
sudo bash install.sh
```

### Option C — Copy from another machine

```bash
scp starmap-raspberrypi-v1.4.tar.gz pi@<PI_IP>:~/
ssh pi@<PI_IP>
tar -xzf starmap-raspberrypi-v1.4.tar.gz
sudo bash starmap/install.sh
```

The installer runs **7 steps** — nginx, Three.js, fonts, HYG v4.2 star catalog, NASA exoplanet catalog, app files, and the worldbuilding API (includes numpy + scikit-image for territory mesh generation). Estimated time: 5–10 minutes depending on internet speed.

After install: `http://<PI_IP>/` or `http://<hostname>.local/`

---

## Updating an Existing Install

### From GitHub

```bash
cd ~/starmap          # or wherever you cloned it
git pull origin master
sudo bash update.sh
sudo python3 api/migrate_db.py
sudo nginx -t && sudo systemctl reload nginx
sudo systemctl restart starmap-api
```

### From tarball

```bash
scp starmap-raspberrypi-v1.4.tar.gz pi@<PI_IP>:~/
ssh pi@<PI_IP> "
  tar -xzf starmap-raspberrypi-v1.4.tar.gz
  sudo bash starmap/update.sh
  sudo python3 starmap/api/migrate_db.py
  sudo nginx -t && sudo systemctl reload nginx
  sudo systemctl restart starmap-api
"
```

---

## Restoring Worldbuilding Data

```bash
# Export from old Pi
curl http://localhost/api/world/backup > world_backup.json

# Import on new Pi
curl -X POST http://localhost/api/world/restore \
  -H "Content-Type: application/json" \
  -d @world_backup.json

# Also copy surface map images
scp -r pi@<OLD_PI>:/var/www/starmap/static/data/maps/ \
       /var/www/starmap/static/data/maps/
```

---

## Ring Color System

| Ring | Color | Condition |
|---|---|---|
| 🟢 Green | `#00dd88` | NASA confirmed + user-created planets |
| 🔵 Blue | `#1188ff` | NASA confirmed planets only |
| 🟣 Purple | `#aa66ff` | User-created planets only |
| 🟡 Amber | `#ffaa00` | Multi-star system, no planets |

---

## Faction Territory System

**Creating connections:** Any star's WB panel → Links tab → + Add Connection. Select era, faction, type (Territory/Trade Route/Military/Other), destination star.

**Viewing territory:** ☰ menu → ⬡ Faction Lines toggle. Select an era from the dropdown.

**What renders:**
- Thin lines between connected stars (colored by faction)
- Smooth translucent territory blobs computed server-side using marching cubes (Python/scikit-image)
- Blobs encompass all connected stars, fill triangle/pyramid interiors organically
- Territory expands to include all stars the faction controls in the selected era

**Tuning (in `index.html`):**
- `METABALL_R = 1.2` — star blob radius in ly
- `MC_R_LINE = 0.6` — tube radius between stars
- `MC_THRESHOLD = 0.40` — surface threshold (lower = larger blobs)
- `MESH_OPACITY = 0.20` — territory transparency

---

## Architecture

| Component | Technology | Location |
|---|---|---|
| Web server | nginx | `/etc/nginx/sites-available/starmap` |
| Galactic map | Three.js r128 | `/var/www/starmap/index.html` |
| Worldbuilding API | Flask + numpy + scikit-image | `/var/www/starmap/api/world_api.py` |
| Database | SQLite | `/var/www/starmap/data/world.db` |
| Star catalog | HYG v4.2 | `/var/www/starmap/static/data/hyg.csv` |
| Surface maps | PNG/JPG | `/var/www/starmap/static/data/maps/` |

---

## Version History

| Version | Description |
|---|---|
| 1.4 | Faction connection lines, territory blobs (marching cubes), Links WB tab, era-aware territory, convex hull interior fill |
| 1.3 | Moon camera focus, moon era state, surface map persistence, nginx upload fix |
| 1.2 | Planet/moon surface map upload, blue NASA ring, favicon |
| 1.1 | Multi-star system viewer, HYG v4.2, 4-color ring system |
| 1.0 | iOS 26 glass UI, unified button system, moon viewer, hab zone |
