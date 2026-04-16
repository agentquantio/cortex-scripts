#!/bin/bash
set -euo pipefail
PERIOD="${1:-week}"
cd ~/cortex/server
npx tsx -e "import('./src/reflection/agent.js').then(m => m.runReflection({ scope: 'all', period: '${PERIOD}' })).then(r => { console.log(JSON.stringify(r, null, 2)); process.exit(0); }).catch(e => { console.error(e); process.exit(1); })"
