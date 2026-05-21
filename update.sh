#!/bin/bash
set -e
cd "$(dirname "$0")"
MSG=${1:-"Update site $(date +%Y-%m-%d)"}
git add .
git commit -m "$MSG"
git pull --rebase
git push
echo "✓ Deployed: $MSG"
