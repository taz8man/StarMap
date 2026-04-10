#!/bin/bash
# ============================================================================
#  Galactic Neighborhood — Nightly Data Updater
#  Runs both catalog updates sequentially. Called by cron at 2:00 AM.
#  Can also be run manually: sudo bash update-data.sh
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/var/log/starmap"
LOG="$LOG_DIR/update-data.log"
STAMP=$(date '+%Y-%m-%d %H:%M:%S')

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

if [ "$EUID" -ne 0 ]; then exec sudo bash "$0" "$@"; fi

mkdir -p "$LOG_DIR"

log() { echo "[$STAMP] $1" | tee -a "$LOG"; }

echo ""
echo -e "${BOLD}${CYAN}  ✦ Galactic Neighborhood — Nightly Data Update${NC}"
echo -e "  Log: $LOG"
echo ""

log "=== Nightly data update started ==="

# ── Internet check ─────────────────────────────────────────────────────────
if ! curl -fsS --max-time 8 https://1.1.1.1 -o /dev/null 2>/dev/null; then
    log "ERROR: No internet connection — aborting update"
    echo -e "  ${RED}✗${NC} No internet connection — aborting"
    exit 1
fi
log "Internet OK"

EXIT_CODE=0

# ── Step 1: Star catalog ───────────────────────────────────────────────────
echo -e "  ${YELLOW}→${NC} Updating HYG star catalog..."
log "Starting HYG catalog update"
if bash "$SCRIPT_DIR/update-catalog.sh" >> "$LOG" 2>&1; then
    log "HYG catalog update: SUCCESS"
    echo -e "  ${GREEN}✓${NC} HYG star catalog updated"
else
    log "HYG catalog update: FAILED (exit $?)"
    echo -e "  ${YELLOW}⚠${NC}  HYG catalog update failed — check $LOG"
    EXIT_CODE=1
fi

# ── Step 2: Exoplanet catalog ──────────────────────────────────────────────
echo -e "  ${YELLOW}→${NC} Updating exoplanet catalog..."
log "Starting exoplanet catalog update"
if bash "$SCRIPT_DIR/update-exoplanets.sh" >> "$LOG" 2>&1; then
    log "Exoplanet catalog update: SUCCESS"
    echo -e "  ${GREEN}✓${NC} Exoplanet catalog updated"
else
    log "Exoplanet catalog update: FAILED (exit $?)"
    echo -e "  ${YELLOW}⚠${NC}  Exoplanet catalog update failed — check $LOG"
    EXIT_CODE=1
fi

log "=== Nightly data update finished (exit $EXIT_CODE) ==="
echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "  ${GREEN}${BOLD}All catalogs updated successfully.${NC}"
else
    echo -e "  ${YELLOW}⚠  One or more updates failed — check $LOG${NC}"
fi
echo ""

exit $EXIT_CODE
