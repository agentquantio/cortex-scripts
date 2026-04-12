#!/bin/bash
# Cortex Quick Capture
# Usage:
#   cx "thought"                     → journal entry
#   cx -s "query"                    → search
#   cx -d "title" "ctx" "dec" "con"  → decision
#   cx -r "title" "body"             → research note
#   cx -db                           → dashboard

set -e
TOKEN=$(grep CORTEX_API_TOKEN ~/cortex/server/.env | cut -d'=' -f2)
PORT=$(grep HTTP_PORT ~/cortex/server/.env | cut -d'=' -f2)
PORT=${PORT:-3210}
BASE="http://localhost:$PORT"
AUTH="Authorization: Bearer $TOKEN"
CT="Content-Type: application/json"

case "${1:-}" in
  -s|--search)
    shift
    Q=$(python3 -c 'import urllib.parse,sys; print(urllib.parse.quote(" ".join(sys.argv[1:])))' "$@")
    curl -sS "$BASE/api/search?q=$Q&limit=5" -H "$AUTH" | python3 -m json.tool
    ;;
  -d|--decide)
    shift
    BODY=$(python3 -c 'import json,sys
t,c,d,con = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
body = f"## Context\n{c}\n\n## Decision\n{d}\n\n## Consequences\n{con}"
print(json.dumps({"type":"decision","title":t,"body":body,"source":"cli"}))' "$@")
    curl -sS -X POST "$BASE/api/memory" -H "$AUTH" -H "$CT" -d "$BODY" | python3 -m json.tool
    ;;
  -r|--research)
    shift
    BODY=$(python3 -c 'import json,sys
print(json.dumps({"type":"research","title":sys.argv[1],"body":sys.argv[2],"source":"cli"}))' "$@")
    curl -sS -X POST "$BASE/api/memory" -H "$AUTH" -H "$CT" -d "$BODY" | python3 -m json.tool
    ;;
  -db|--dashboard)
    curl -sS "$BASE/api/dashboard" -H "$AUTH" | python3 -m json.tool
    ;;
  -h|--help|"")
    echo "cx \"thought\"                    → journal"
    echo "cx -s \"query\"                   → search"
    echo "cx -d \"title\" \"ctx\" \"dec\" \"con\" → decision"
    echo "cx -r \"title\" \"body\"             → research"
    echo "cx -db                           → dashboard"
    ;;
  *)
    BODY=$(python3 -c 'import json,sys
print(json.dumps({"content":" ".join(sys.argv[1:]),"source":"cli"}))' "$@")
    curl -sS -X POST "$BASE/api/journal" -H "$AUTH" -H "$CT" -d "$BODY" | python3 -m json.tool
    ;;
esac
