#!/bin/bash
# ============================================================================
#  Galactic Neighborhood — Exoplanet Catalog Updater
#  Downloads confirmed exoplanet data from NASA Exoplanet Archive (TAP).
#  No bot-detection issues — NASA's TAP API is explicitly designed for
#  programmatic access with proper CORS headers.
#  Run: sudo bash update-exoplanets.sh
# ============================================================================
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
info() { echo -e "  ${YELLOW}→${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC}  $1"; }
fail() { echo -e "  ${RED}✗  ERROR:${NC} $1"; exit 1; }

if [ "$EUID" -ne 0 ]; then exec sudo bash "$0" "$@"; fi

DEST="/var/www/starmap/static/data/exoplanets.csv"
TMP="/tmp/exoplanets_download.csv"

mkdir -p /var/www/starmap/static/data

echo ""
echo -e "${BOLD}${CYAN}  ✦ Galactic Neighborhood — Exoplanet Catalog Updater${NC}"
echo -e "  Source: NASA Exoplanet Archive PSCompPars (TAP API)"
echo ""

# ── Internet check ────────────────────────────────────────────────────────────
info "Checking internet connection..."
curl -fsS --max-time 6 https://1.1.1.1 -o /dev/null \
    || fail "No internet connection."
ok "Internet OK"

# ── Build TAP query URL ───────────────────────────────────────────────────────
# Query: all confirmed planets where distance ≤ 120 ly (36.8 pc)
# Columns needed:
#   pl_name      — planet name (e.g. "Proxima Cen b")
#   pl_letter    — planet letter (b, c, d...)
#   hostname     — host star name
#   hd_name      — Henry Draper ID  (links to HYG)
#   hip_name     — Hipparcos ID     (links to HYG)
#   sy_dist      — distance in parsecs
#   pl_orbsmax   — semi-major axis (AU)
#   pl_orbper    — orbital period (days)
#   pl_orbeccen  — eccentricity
#   pl_rade      — planet radius (Earth radii)
#   pl_bmasse    — planet mass (Earth masses, best estimate)
#   pl_eqt       — equilibrium temperature (K)
#   discoverymethod
#   disc_year
#   ra,dec       — for cross-matching with HYG by position
#
# 120 ly = 36.8 pc — use 37 pc to include edge cases
QUERY="select+pl_name,pl_letter,hostname,hd_name,hip_name,sy_dist,pl_orbsmax,pl_orbper,pl_orbeccen,pl_rade,pl_bmasse,pl_eqt,discoverymethod,disc_year,ra,dec+from+pscomppars+where+sy_dist+%3C%3D+37+order+by+sy_dist,hostname,pl_letter"
URL="https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${QUERY}&format=csv"

info "Querying NASA Exoplanet Archive..."
info "(planets within 37 parsecs / 120 light-years)"
echo ""

rm -f "$TMP"
if ! curl -fsSL \
        --retry 3 \
        --retry-delay 2 \
        --max-time 60 \
        --progress-bar \
        "$URL" \
        -o "$TMP"; then
    fail "Download failed. NASA TAP API may be temporarily unavailable."
fi

echo ""

# ── Validate ──────────────────────────────────────────────────────────────────
ROWS=$(wc -l < "$TMP" 2>/dev/null || echo 0)
if [ "$ROWS" -lt 5 ]; then
    warn "Only $ROWS rows returned — response may be an error:"
    head -3 "$TMP"
    fail "Invalid response from NASA TAP API."
fi

if ! head -1 "$TMP" | grep -q "pl_name\|hostname"; then
    warn "Header: $(head -1 $TMP | cut -c1-80)"
    fail "Response doesn't look like exoplanet data."
fi

PLANET_COUNT=$((ROWS - 1))
ok "Downloaded: ${PLANET_COUNT} confirmed planets within 120 ly"

# ── Install ───────────────────────────────────────────────────────────────────
mv "$TMP" "$DEST"
chown www-data:www-data "$DEST"
chmod 644 "$DEST"
ok "Installed to $DEST"

echo ""
echo -e "  ${GREEN}${BOLD}Exoplanet catalog updated!${NC}"
echo ""
echo -e "  Planets in catalog : ${BOLD}${PLANET_COUNT}${NC}"
echo -e "  Installed at       : ${BOLD}$DEST${NC}"
echo ""
echo -e "  ${CYAN}Refresh your browser — planet indicators will appear on host stars.${NC}"
echo ""
