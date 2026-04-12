#!/bin/bash
cd ~/cortex/memories
git add -A
git commit -m "auto: $(date +%Y-%m-%d_%H:%M)" --allow-empty
git push origin main 2>&1

cd ~/cortex/server
git add -A
git commit -m "auto: $(date +%Y-%m-%d_%H:%M)" --allow-empty
git push origin main 2>&1

cd ~/cortex/scripts
git add -A
git commit -m "auto: $(date +%Y-%m-%d_%H:%M)" --allow-empty
git push origin main 2>&1
