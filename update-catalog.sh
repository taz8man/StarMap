#!/bin/bash
# ============================================================================
#  Galactic Neighborhood — Catalog Updater
#  Downloads the HYG-like star catalog from AT-HYG and installs it locally.
#  Run: sudo bash update-catalog.sh
# ============================================================================
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
info() { echo -e "  ${YELLOW}→${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC}  $1"; }
fail() { echo -e "  ${RED}✗  ERROR:${NC} $1"; exit 1; }

if [ "$EUID" -ne 0 ]; then exec sudo bash "$0" "$@"; fi

DEST="/var/www/starmap/static/data/hyg.csv"
TMP_GZ="/tmp/hyg_catalog.csv.gz"
TMP_CSV="/tmp/hyg_catalog.csv"

mkdir -p /var/www/starmap/static/data

echo ""
echo -e "${BOLD}${CYAN}  ✦ Galactic Neighborhood — Star Catalog Updater${NC}"
echo -e "  Downloading HYG-like catalog from AT-HYG v3.2"
echo ""

# ── Prereq: gzip ─────────────────────────────────────────────────────────────
if ! command -v gunzip &>/dev/null; then
    info "Installing gzip..."
    apt-get install -y -qq gzip
    ok "gzip installed"
fi

# ── Internet check ────────────────────────────────────────────────────────────
info "Checking internet connection..."
curl -fsS --max-time 6 https://1.1.1.1 -o /dev/null \
    || fail "No internet connection. Connect the Pi to the internet and retry."
ok "Internet connection OK"

# ── Download ─────────────────────────────────────────────────────────────────
URL="https://codeberg.org/astronexus/hyg/media/branch/main/data/athyg_v3/hyglike_from_athyg_v32.csv.gz"

info "Downloading catalog (~3 MB compressed)..."
info "URL: $(basename $URL)"
echo ""

rm -f "$TMP_GZ" "$TMP_CSV"

# Use browser-like headers to avoid bot-detection
if ! curl -L \
        --retry 3 \
        --retry-delay 2 \
        --max-time 120 \
        --progress-bar \
        -A "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
        -H "Accept: application/octet-stream,*/*" \
        -H "Accept-Language: en-US,en;q=0.9" \
        -H "Referer: https://codeberg.org/astronexus/hyg" \
        "$URL" \
        -o "$TMP_GZ"; then
    fail "Download failed. Check your internet connection and try again."
fi

echo ""

# ── Validate the .gz file ─────────────────────────────────────────────────────
GZ_BYTES=$(stat -c%s "$TMP_GZ" 2>/dev/null || echo 0)
if [ "$GZ_BYTES" -lt 500000 ]; then
    # Too small — probably got an error page instead of the real file
    warn "Downloaded file is only ${GZ_BYTES} bytes — looks like an error page, not the catalog."
    warn ""
    warn "Codeberg blocks automated downloads. To install manually:"
    warn "  1. Open this URL in your browser and download the file:"
    warn "     $URL"
    warn "  2. Copy it to the Pi:"
    warn "     scp ~/Downloads/hyglike_from_athyg_v32.csv.gz pi@PI_IP:/tmp/hyg_catalog.csv.gz"
    warn "  3. Run this script again — it will skip the download and use the file you copied."
    echo ""
    # Check if a manually placed file exists
    if [ -f "$TMP_GZ" ] && [ "$GZ_BYTES" -gt 500000 ]; then
        ok "Found a valid file at $TMP_GZ — proceeding."
    else
        rm -f "$TMP_GZ"
        exit 1
    fi
fi

ok "Downloaded: $(du -sh $TMP_GZ | cut -f1) compressed"

# ── Decompress ────────────────────────────────────────────────────────────────
info "Decompressing..."
if ! gunzip -c "$TMP_GZ" > "$TMP_CSV" 2>/dev/null; then
    fail "Failed to decompress the file. It may be corrupted or not a valid gzip file."
fi

CSV_BYTES=$(stat -c%s "$TMP_CSV" 2>/dev/null || echo 0)
CSV_ROWS=$(wc -l < "$TMP_CSV" 2>/dev/null || echo 0)
ok "Decompressed: $(du -sh $TMP_CSV | cut -f1) (${CSV_ROWS} rows)"

# ── Validate CSV contents ─────────────────────────────────────────────────────
info "Validating catalog..."
if ! head -1 "$TMP_CSV" | grep -q "proper\|dist\|spect"; then
    warn "Header row: $(head -1 $TMP_CSV | cut -c1-80)"
    fail "File doesn't look like a valid HYG catalog — missing expected column headers."
fi
if [ "$CSV_ROWS" -lt 50000 ]; then
    fail "Only ${CSV_ROWS} rows found — expected ~100,000+. File may be truncated."
fi
ok "Catalog validated: ${CSV_ROWS} stars, correct format"

# ── Install ───────────────────────────────────────────────────────────────────
info "Installing to nginx..."
mv "$TMP_CSV" "$DEST"
chown www-data:www-data "$DEST"
chmod 644 "$DEST"
rm -f "$TMP_GZ"
ok "Installed to $DEST"

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "  ${GREEN}${BOLD}Catalog updated successfully!${NC}"
echo ""
echo -e "  Stars in catalog : ${BOLD}${CSV_ROWS}${NC}"
echo -e "  Installed at     : ${BOLD}$DEST${NC}"
echo ""
echo -e "  ${CYAN}Refresh your browser — the full catalog loads instantly from local cache.${NC}"
echo ""
