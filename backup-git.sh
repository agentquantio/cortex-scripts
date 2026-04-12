#!/bin/bash
set -euo pipefail
cd ~/cortex/memories
if [ ! -d .git ]; then
  echo "Not a git repo. Run: cd ~/cortex/memories && git init && git remote add origin <url>"
  exit 1
fi
git add -A
git commit -m "auto: $(date +%Y-%m-%d_%H:%M)" --allow-empty
git push origin main 2>&1 || echo "Push failed (remote may not be configured yet)"
