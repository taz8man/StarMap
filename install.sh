#!/bin/bash
# ============================================================================
#  Galactic Neighborhood Star Map — Raspberry Pi Installer v1.0
#  Tested on: Raspberry Pi OS Bookworm (64-bit) & Bullseye (32/64-bit)
#  Run as: sudo bash install.sh
# ============================================================================
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

TOTAL_STEPS=7

step()  { echo -e "\n${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; \
          echo -e "${BOLD}${CYAN}  Step $1 / $TOTAL_STEPS — $2${NC}"; \
          echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }
ok()    { echo -e "  ${GREEN}✓${NC} $1"; }
info()  { echo -e "  ${YELLOW}→${NC} $1"; }
fail()  { echo -e "  ${RED}✗ ERROR:${NC} $1"; exit 1; }
warn()  { echo -e "  ${YELLOW}⚠${NC}  $1"; }
header(){ echo -e "\n${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; \
          echo -e "${BOLD}${CYAN}  $1${NC}"; \
          echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

INSTALL_DIR="/var/www/starmap"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

header "GALACTIC NEIGHBORHOOD STAR MAP — INSTALLER v1.0"
echo -e "  Install directory : ${BOLD}$INSTALL_DIR${NC}"
echo -e "  Source directory  : ${BOLD}$SCRIPT_DIR${NC}"

# ── Root check ───────────────────────────────────────────────────────────────
if [ "$EUID" -ne 0 ]; then
    warn "Not running as root — re-running with sudo..."
    exec sudo bash "$0" "$@"
fi

# ── Internet check ───────────────────────────────────────────────────────────
info "Checking internet connection..."
if ! curl -fsS --max-time 8 https://1.1.1.1 -o /dev/null; then
    fail "No internet connection. Connect the Pi to the internet and retry."
fi
ok "Internet connection confirmed"

# ── Step 1: nginx ─────────────────────────────────────────────────────────────
step 1 "Install nginx & dependencies"
apt-get update -qq
apt-get install -y -qq nginx curl python3 python3-pip
ok "nginx + python3 installed"

# Create directory structure
mkdir -p "$INSTALL_DIR/static/js"
mkdir -p "$INSTALL_DIR/static/css"
mkdir -p "$INSTALL_DIR/static/fonts"
mkdir -p "$INSTALL_DIR/static/data"
mkdir -p "$INSTALL_DIR/api"
mkdir -p "$INSTALL_DIR/data"
ok "Directory structure created"

# ── Step 2: Three.js ─────────────────────────────────────────────────────────
step 2 "Download Three.js r128"
THREEJS_URL="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
info "Downloading Three.js (~600 KB)..."
if curl -fsSL --retry 3 --retry-delay 2 "$THREEJS_URL" \
        -o "$INSTALL_DIR/static/js/three.min.js"; then
    SIZE=$(du -sh "$INSTALL_DIR/static/js/three.min.js" | cut -f1)
    ok "three.min.js ($SIZE)"
else
    fail "Could not download Three.js"
fi

# ── Step 3: Web Fonts ─────────────────────────────────────────────────────────
step 3 "Download Web Fonts (Orbitron, Space Mono)"

FONT_DIR="$INSTALL_DIR/static/fonts"
UA="Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

download_font(){
    local CSS_URL="$1"
    local PREFIX="$2"
    local CSS
    CSS=$(curl -fsSL -A "$UA" "$CSS_URL" 2>/dev/null || echo "")
    if [ -z "$CSS" ]; then warn "  Could not fetch CSS for $PREFIX"; return 1; fi
    local WOFF2_URL
    WOFF2_URL=$(echo "$CSS" | grep -oE 'https://fonts\.gstatic\.com/[^)]+\.woff2' | head -1)
    if [ -z "$WOFF2_URL" ]; then warn "  No woff2 URL found for $PREFIX"; return 1; fi
    if curl -fsSL --retry 3 "$WOFF2_URL" -o "$FONT_DIR/${PREFIX}.woff2" 2>/dev/null; then
        local SZ; SZ=$(du -sh "$FONT_DIR/${PREFIX}.woff2" | cut -f1)
        ok "  ${PREFIX}.woff2 ($SZ)"
    else
        warn "  Failed to download ${PREFIX}.woff2"; return 1
    fi
}

BASE="https://fonts.googleapis.com/css2"
download_font "${BASE}?family=Orbitron:wght@400"   "Orbitron-Regular"
download_font "${BASE}?family=Orbitron:wght@700"   "Orbitron-Bold"
download_font "${BASE}?family=Orbitron:wght@900"   "Orbitron-Black"
download_font "${BASE}?family=Space+Mono:wght@400" "SpaceMono-Regular"
download_font "${BASE}?family=Space+Mono:wght@700" "SpaceMono-Bold"

FONT_COUNT=$(ls "$FONT_DIR"/*.woff2 2>/dev/null | wc -l)
if [ "$FONT_COUNT" -gt 0 ]; then
    ok "$FONT_COUNT font file(s) downloaded"
else
    warn "Fonts unavailable — app will use system monospace (still functional)"
fi

# ── Step 4: HYG Star Catalog ──────────────────────────────────────────────────
step 4 "Download HYG Star Catalog (~14 MB)"

HYG_DEST="$INSTALL_DIR/static/data/hyg.csv"
HYG_DOWNLOADED=0
HYG_URL="https://codeberg.org/astronexus/hyg/media/branch/main/data/athyg_v3/hyglike_from_athyg_v32.csv.gz"
HYG_TMP_GZ="/tmp/hyg_install.csv.gz"

info "Downloading hyglike_from_athyg_v32.csv.gz (~3 MB compressed)..."
if curl -L --retry 2 --retry-delay 3 --max-time 120 --progress-bar \
        -A "$UA" \
        -H "Accept: application/octet-stream,*/*" \
        -H "Referer: https://codeberg.org/astronexus/hyg" \
        "$HYG_URL" -o "$HYG_TMP_GZ" 2>/dev/null; then
    GZ_BYTES=$(stat -c%s "$HYG_TMP_GZ" 2>/dev/null || echo 0)
    if [ "$GZ_BYTES" -gt 500000 ]; then
        info "Decompressing..."
        if gunzip -c "$HYG_TMP_GZ" > "$HYG_DEST" 2>/dev/null; then
            ROWS=$(wc -l < "$HYG_DEST")
            if [ "$ROWS" -gt 50000 ] && head -1 "$HYG_DEST" | grep -q "proper"; then
                ok "HYG catalog ready: $(du -sh $HYG_DEST | cut -f1) · ${ROWS} stars"
                HYG_DOWNLOADED=1
            else
                warn "Decompressed file invalid — skipping"; rm -f "$HYG_DEST"
            fi
        else
            warn "Decompression failed"; rm -f "$HYG_DEST"
        fi
    else
        warn "Downloaded file only ${GZ_BYTES} bytes — may be bot-blocked"; rm -f "$HYG_TMP_GZ"
    fi
else
    warn "Download failed"
fi
rm -f "$HYG_TMP_GZ"

if [ "$HYG_DOWNLOADED" -eq 0 ]; then
    warn "Could not download HYG catalog. App uses 133-star embedded catalog."
    warn "Run 'sudo bash update-catalog.sh' later to retry."
else
    chown www-data:www-data "$HYG_DEST"
fi

# ── Step 5: Exoplanet Catalog ─────────────────────────────────────────────────
step 5 "Download NASA Exoplanet Catalog"

EXO_DEST="$INSTALL_DIR/static/data/exoplanets.csv"
EXO_TMP="/tmp/exoplanets_install.csv"
EXO_DOWNLOADED=0

EXO_QUERY="select+pl_name,pl_letter,hostname,hd_name,hip_name,sy_dist,pl_orbsmax,pl_orbper,pl_orbeccen,pl_rade,pl_bmasse,pl_eqt,discoverymethod,disc_year,ra,dec+from+pscomppars+where+sy_dist+%3C%3D+37+order+by+sy_dist,hostname,pl_letter"
EXO_URL="https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${EXO_QUERY}&format=csv"

info "Querying NASA Exoplanet Archive (planets within 120 ly)..."
if curl -fsSL --retry 3 --retry-delay 2 --max-time 60 \
        "$EXO_URL" -o "$EXO_TMP" 2>/dev/null; then
    ROWS=$(wc -l < "$EXO_TMP" 2>/dev/null || echo 0)
    if [ "$ROWS" -gt 5 ] && head -1 "$EXO_TMP" | grep -q "pl_name\|hostname"; then
        mv "$EXO_TMP" "$EXO_DEST"
        chown www-data:www-data "$EXO_DEST"
        chmod 644 "$EXO_DEST"
        ok "Exoplanet catalog ready: $((ROWS-1)) confirmed planets"
        EXO_DOWNLOADED=1
    else
        warn "Invalid response from NASA TAP API — skipping"; rm -f "$EXO_TMP"
    fi
else
    warn "Could not reach NASA Exoplanet Archive — skipping"; rm -f "$EXO_TMP"
fi

if [ "$EXO_DOWNLOADED" -eq 0 ]; then
    warn "Exoplanet catalog not downloaded."
    warn "Run 'sudo bash update-exoplanets.sh' later to retry."
fi

# ── Step 6: App files & nginx config ─────────────────────────────────────────
step 6 "Install App Files & Configure nginx"

# HTML pages
for page in index.html solar-system.html exoplanet-system.html planet-system.html; do
    if [ -f "$SCRIPT_DIR/$page" ]; then
        cp "$SCRIPT_DIR/$page" "$INSTALL_DIR/$page"
        ok "$page installed"
    else
        warn "$page not found in source — skipping"
    fi
done

# Shared CSS and JS
mkdir -p "$INSTALL_DIR/static/css"
if [ -f "$SCRIPT_DIR/static/css/worldbuilding.css" ]; then
    cp "$SCRIPT_DIR/static/css/worldbuilding.css" "$INSTALL_DIR/static/css/worldbuilding.css"
    ok "worldbuilding.css installed"
fi
for jsfile in worldbuilding.js worldbuilding-panel.js; do
    if [ -f "$SCRIPT_DIR/static/js/$jsfile" ]; then
        cp "$SCRIPT_DIR/static/js/$jsfile" "$INSTALL_DIR/static/js/$jsfile"
        ok "$jsfile installed"
    fi
done

# Update scripts
for script in update-catalog.sh update-exoplanets.sh update-data.sh update.sh; do
    if [ -f "$SCRIPT_DIR/$script" ]; then
        cp "$SCRIPT_DIR/$script" "$INSTALL_DIR/$script"
        chmod +x "$INSTALL_DIR/$script"
    fi
done
ok "Update scripts installed"

chown -R www-data:www-data "$INSTALL_DIR"
chmod -R 755 "$INSTALL_DIR"
ok "Permissions set"

# nginx config
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
    ok "Default nginx site disabled"
fi

cp "$SCRIPT_DIR/nginx.conf" /etc/nginx/sites-available/starmap
ln -sf /etc/nginx/sites-available/starmap /etc/nginx/sites-enabled/starmap
nginx -t 2>/dev/null && ok "nginx config valid" || fail "nginx config invalid"
systemctl enable nginx --quiet
systemctl restart nginx
ok "nginx started and enabled on boot"

# ── Step 7: Worldbuilding API ─────────────────────────────────────────────────
step 7 "Install Worldbuilding API"

if [ -f "$SCRIPT_DIR/api/install-api.sh" ]; then
    bash "$SCRIPT_DIR/api/install-api.sh"
    ok "Worldbuilding API installed and running"
else
    warn "api/install-api.sh not found — skipping API setup"
    warn "Run 'sudo bash api/install-api.sh' manually to enable worldbuilding features"
fi

# ── Nightly cron ──────────────────────────────────────────────────────────────
header "Scheduling Nightly Catalog Updates"

mkdir -p /var/log/starmap
chown root:root /var/log/starmap
chmod 755 /var/log/starmap

CRON_JOB="0 2 * * * root bash $INSTALL_DIR/update-data.sh >> /var/log/starmap/update-data.log 2>&1"
echo "$CRON_JOB" > /etc/cron.d/starmap-update
chmod 644 /etc/cron.d/starmap-update
ok "Cron job installed: 2:00 AM nightly"
info "Logs: /var/log/starmap/update-data.log"

# ── Summary ───────────────────────────────────────────────────────────────────
header "INSTALLATION COMPLETE  ✓  (7 / 7 steps)"
IP4=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "unknown")
HOST=$(hostname)
echo ""
echo -e "  ${GREEN}${BOLD}The star map is running!${NC}"
echo ""
echo -e "  From this Pi     : ${CYAN}http://localhost/${NC}"
echo -e "  From your network: ${CYAN}http://$IP4/${NC}"
echo -e "  Via hostname     : ${CYAN}http://$HOST.local/${NC}"
echo ""
if [ "$HYG_DOWNLOADED" -eq 1 ]; then
    echo -e "  ${GREEN}✓ Full HYG catalog — ~3,500 stars${NC}"
else
    echo -e "  ${YELLOW}⚠  HYG catalog missing — run: sudo bash $INSTALL_DIR/update-catalog.sh${NC}"
fi
if [ "$EXO_DOWNLOADED" -eq 1 ]; then
    echo -e "  ${GREEN}✓ Exoplanet catalog — planet indicators active${NC}"
else
    echo -e "  ${YELLOW}⚠  Exoplanet catalog missing — run: sudo bash $INSTALL_DIR/update-exoplanets.sh${NC}"
fi
echo -e "  ${GREEN}✓ Nightly updates scheduled at 2:00 AM${NC}"
echo ""
echo -e "  ${YELLOW}Useful commands:${NC}"
echo -e "    sudo systemctl status starmap-api"
echo -e "    sudo bash $INSTALL_DIR/update-data.sh         — run all catalog updates now"
echo -e "    sudo bash $INSTALL_DIR/update-catalog.sh      — refresh star catalog only"
echo -e "    sudo bash $INSTALL_DIR/update-exoplanets.sh   — refresh exoplanet catalog only"
echo -e "    sudo journalctl -u starmap-api -f             — worldbuilding API logs"
echo -e "    cat /var/log/starmap/update-data.log          — catalog update logs"
echo ""
