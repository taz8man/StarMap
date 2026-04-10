#!/bin/bash
# ============================================================================
#  OPTIONAL: Kiosk Mode Setup
#  Configures the Pi to auto-boot into a full-screen browser showing the
#  star map. Ideal for a dedicated display. Run AFTER install.sh.
# ============================================================================
set -e
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RESET='\033[0m'
if [ "$EUID" -ne 0 ]; then exec sudo bash "$0" "$@"; fi

KIOSK_USER="${SUDO_USER:-pi}"
HOME_DIR=$(eval echo "~$KIOSK_USER")

echo -e "\n${YELLOW}Setting up kiosk mode for user: ${KIOSK_USER}${RESET}\n"

# Install Chromium if not present
if ! command -v chromium-browser &>/dev/null && ! command -v chromium &>/dev/null; then
    echo "Installing Chromium..."
    apt-get install -y -qq chromium-browser
fi

# Install unclutter (hides mouse cursor after idle)
apt-get install -y -qq unclutter 2>/dev/null || true

# Create autostart directory
mkdir -p "$HOME_DIR/.config/autostart"

# Create the kiosk autostart entry
BROWSER_CMD=$(command -v chromium-browser 2>/dev/null || command -v chromium 2>/dev/null || echo "chromium-browser")

cat > "$HOME_DIR/.config/autostart/starmap-kiosk.desktop" << DESKTOP
[Desktop Entry]
Type=Application
Name=Galactic Neighborhood Kiosk
Exec=bash -c 'sleep 5 && $BROWSER_CMD --kiosk --incognito --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state --noerrdialogs --disable-translate --no-first-run --fast --fast-start --disable-features=TranslateUI http://localhost/'
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
DESKTOP

# Also hide the cursor after 5 seconds of inactivity
cat > "$HOME_DIR/.config/autostart/unclutter.desktop" << DESKTOP
[Desktop Entry]
Type=Application
Name=Unclutter
Exec=unclutter -idle 5 -root
Hidden=false
X-GNOME-Autostart-enabled=true
DESKTOP

# Disable screen blanking and screensaver
XINITRC="$HOME_DIR/.xinitrc"
if [ ! -f "$XINITRC" ] || ! grep -q "s off" "$XINITRC"; then
    cat >> "$XINITRC" << XSETTINGS
# Disable screen blanking for kiosk
xset s off
xset s noblank
xset -dpms
XSETTINGS
fi

chown -R "$KIOSK_USER:$KIOSK_USER" "$HOME_DIR/.config" "$XINITRC" 2>/dev/null || true

echo -e "${GREEN}✓ Kiosk mode configured for user '$KIOSK_USER'${RESET}"
echo ""
echo -e "  ${YELLOW}What was set up:${RESET}"
echo -e "    • Chromium will launch automatically after desktop loads"
echo -e "    • Full-screen mode with no browser chrome (--kiosk)"
echo -e "    • Mouse cursor hides after 5 seconds of inactivity"
echo -e "    • Screen blanking/screensaver disabled"
echo ""
echo -e "  ${YELLOW}To exit kiosk mode:${RESET}  Press Alt+F4 or Ctrl+W"
echo -e "  ${YELLOW}To disable kiosk:${RESET}     Delete ~/.config/autostart/starmap-kiosk.desktop"
echo ""
echo -e "  ${CYAN}Reboot the Pi to activate kiosk mode:  sudo reboot${RESET}"
