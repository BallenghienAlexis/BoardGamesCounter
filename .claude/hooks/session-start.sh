#!/bin/bash
# Installe les dépendances au démarrage d'une session Claude Code web,
# pour que lint, typecheck et tests soient disponibles. Ne fait rien en local.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"
if [ ! -d node_modules ]; then
  npm ci --no-audit --no-fund
fi
