#!/bin/sh
# Runs `npm run backup` every day at 9 pm on this Mac (or as soon as it wakes,
# if it was asleep then), using macOS launchd.
#
#   scripts/schedule-backup.sh            install, or update after moving the
#                                         folder or changing Node versions
#   scripts/schedule-backup.sh --remove   stop the nightly backup
#
# Output goes to ~/Library/Logs/milk-manager-backup.log.
set -e

LABEL=com.milk-manager.backup
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/milk-manager-backup.log"
DIR=$(cd "$(dirname "$0")/.." && pwd)
NODE=$(command -v node)

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
if [ "$1" = "--remove" ]; then
  rm -f "$PLIST"
  echo "Nightly backup removed."
  exit 0
fi

mkdir -p "$HOME/Library/LaunchAgents"
cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array><string>$NODE</string><string>scripts/backup.ts</string></array>
  <key>WorkingDirectory</key><string>$DIR</string>
  <key>EnvironmentVariables</key>
  <dict><key>PATH</key><string>$(dirname "$NODE"):/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin</string></dict>
  <key>StartCalendarInterval</key>
  <dict><key>Hour</key><integer>21</integer><key>Minute</key><integer>0</integer></dict>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
</dict>
</plist>
PLIST
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Nightly backup scheduled for 9 pm. Log: $LOG"
