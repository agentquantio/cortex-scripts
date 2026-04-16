#!/bin/bash
set -euo pipefail
BACKUP_DIR=~/cortex/backups
mkdir -p "$BACKUP_DIR"

# Keep 7 daily LanceDB snapshots
TIMESTAMP=$(date +%Y%m%d)
SNAPSHOT="$BACKUP_DIR/lance-${TIMESTAMP}.tar.gz"

tar -czf "$SNAPSHOT" -C ~/cortex lance cortex.db 2>/dev/null

# Prune snapshots older than 7 days
find "$BACKUP_DIR" -name "lance-*.tar.gz" -mtime +7 -delete

echo "Backup: $SNAPSHOT ($(du -h "$SNAPSHOT" | cut -f1))"
