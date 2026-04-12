#!/bin/bash
set -euo pipefail
if ! command -v rclone &> /dev/null; then
  echo "rclone not installed. Run: brew install rclone"
  exit 1
fi
rclone sync ~/cortex/lance/ b2:cortex-backup/lance/ --progress
rclone copy ~/cortex/cortex.db b2:cortex-backup/db/cortex-$(date +%Y%m%d).db
