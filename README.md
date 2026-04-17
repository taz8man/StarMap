# Local Galactic Neighborhood — Star Map

**Version:** 1.2
**Tested on:** Raspberry Pi OS Bookworm (64-bit), Bullseye (32 & 64-bit)
**Hardware:** Raspberry Pi 3B+, 4, 5 · Pi 4 or 5 recommended for smooth WebGL

---

## What This Is

An interactive 3D star map rendered in WebGL (Three.js) showing every catalogued star within 120 light years of Sol in true galactic coordinates, served as a local website from a Raspberry Pi. Layered on top of real astronomical data is a full **worldbuilding system** — a creative tool for science fiction writers, game masters, and world-builders to annotate stars, create fictional planets and moons, define civilizations, factions, and eras, and view planetary and moon systems in dedicated 3D orbital viewers.

---

## Package Contents

```
starmap/
├── index.html                  ← Galactic neighborhood map (main app)
├── exoplanet-system.html       ← Planetary system 3D viewer
├── solar-system.html           ← Solar system viewer
├── planet-system.html          ← Moon system viewer (with surface map upload)
├── stellar-system.html         ← Multi-star system viewer
├── nginx.conf                  ← Web server configuration
├── install.sh                  ← Full installer (7 steps)
├── uninstall.sh                ← Clean uninstaller
├── update.sh                   ← Deploy HTML updates to Pi
├── update-data.sh              ← Run all catalog updates (called by cron)
├── update-catalog.sh           ← Update HYG star catalog only
├── update-exoplanets.sh        ← Update NASA exoplanet catalog only
├── kiosk-setup.sh              ← Optional full-screen kiosk mode
├── images/
│   └── Galactic.ico            ← App favicon
├── api/
│   ├── world_api.py            ← Flask worldbuilding REST API
│   ├── init_db.py              ← SQLite schema + migrations
│   └── install-api.sh          ← API service installer
└── static/
    ├── css/
    │   └── worldbuilding.css   ← Shared glass panel styles
    └── js/
        ├── worldbuilding.js    ← Shared WB panel logic
        └── worldbuilding-panel.js ← WB panel HTML injection
```

---

## Quick Install

```bash
scp starmap-raspberrypi-v1.2.tar.gz pi@<PI_IP>:~/
ssh pi@<PI_IP>
tar -xzf starmap-raspberrypi-v1.2.tar.gz
sudo bash starmap/install.sh
```

The installer runs **7 steps** with progress shown throughout:

| Step | Description |
|---|---|
| 1 / 7 | Install nginx & dependencies |
| 2 / 7 | Download Three.js r128 |
| 3 / 7 | Download Web Fonts (Orbitron, Space Mono) |
| 4 / 7 | Download HYG v4.2 Star Catalog (~14 MB) |
| 5 / 7 | Download NASA Exoplanet Catalog |
| 6 / 7 | Install App Files & Configure nginx |
| 7 / 7 | Install Worldbuilding API |

After install, open a browser to `http://<PI_IP>/` or `http://<hostname>.local/`

---

## Updating

**Full update from a new package:**
```bash
scp starmap-raspberrypi-v1.2.tar.gz pi@<PI_IP>:~/
ssh pi@<PI_IP> "
  cd ~ && tar -xzf starmap-raspberrypi-v1.2.tar.gz
  sudo bash starmap/update.sh
"
```

`update.sh` handles all HTML pages, shared CSS/JS, and the images folder in one shot.

---

## Planet Surface Map (Moon Viewer)

The moon viewer supports equirectangular surface map textures for the central planet body. Click the planet in the moon viewer to open its detail panel, then use **🌍 Upload Map** to load a PNG or JPG texture. NASA's Solar System texture maps work perfectly. The planet will slowly spin on its axis while moons orbit normally. Use **✕ Remove texture** to revert to the flat color.

Textures are session-only and not persisted between page loads.

---

## Ring Color System

| Ring | Color | Condition |
|---|---|---|
| 🟢 Green | `#00dd88` | NASA confirmed + user-created planets |
| 🔵 Blue | `#1188ff` | NASA confirmed planets only |
| 🟣 Purple | `#aa66ff` | User-created planets only |
| 🟡 Amber | `#ffaa00` | Multi-star system, no planets |

---

## Star Catalog

As of v1.1 the app uses **HYG v4.2** — the original HYG catalog (Hipparcos + Yale + Gliese) with ~120,000 stars and robust Gliese companion data needed for multi-star system detection.

---

## Architecture

| Component | Technology | Location |
|---|---|---|
| Web server | nginx | `/etc/nginx/sites-available/starmap` |
| Galactic map | Three.js r128 (WebGL) | `/var/www/starmap/index.html` |
| Planetary viewer | Three.js r128 | `/var/www/starmap/exoplanet-system.html` |
| Solar system | Three.js r128 | `/var/www/starmap/solar-system.html` |
| Moon viewer | Three.js r128 | `/var/www/starmap/planet-system.html` |
| Stellar system viewer | Three.js r128 | `/var/www/starmap/stellar-system.html` |
| Worldbuilding API | Flask (Python) | `/var/www/starmap/api/world_api.py` |
| Database | SQLite | `/var/www/starmap/data/world.db` |
| Star catalog | HYG v4.2 | `/var/www/starmap/static/data/hyg.csv` |
| Exoplanet catalog | NASA Exoplanet Archive | `/var/www/starmap/static/data/exoplanets.csv` |

---

## Useful Commands

```bash
sudo systemctl status starmap-api
sudo journalctl -u starmap-api -f
sudo systemctl restart starmap-api
curl http://localhost/api/world/backup > world_backup.json
sudo bash /var/www/starmap/update-data.sh    # run catalog updates now
cat /var/log/starmap/update-data.log         # view update log
```

---

## Version History

| Version | Description |
|---|---|
| 1.2 | Planet surface map upload in moon viewer, blue NASA ring, favicon |
| 1.1 | Multi-star system viewer, HYG v4.2 catalog, 4-color ring system, label improvements |
| 1.0 | iOS 26 glass UI redesign, unified button system, moon viewer, hab zone |
| 0.9.6 | Moon viewer (planet-system.html), wb_moons DB, WB Moons tab |
| 0.9.5 | Habitable zone in exo viewer, bolometric corrections, star DP redesign |
| 0.9.4 | Shared CSS/JS, full WB panel in exo viewer, bug fixes |
