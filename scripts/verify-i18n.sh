#!/bin/bash

###############################################################################
# I18n Verification Script
# Ensures that all i18n catalogs are compiled before production build
###############################################################################

set -e

LOCALES=("en" "es" "pt" "fr" "de" "it" "ja")
MISSING_FILES=()

echo "🔍 Verifying i18n catalogs..."

for locale in "${LOCALES[@]}"; do
  FILE="src/shared/i18n/locales/$locale/messages.mjs"
  if [ ! -f "$FILE" ]; then
    MISSING_FILES+=("$FILE")
  fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
  echo "✅ All i18n catalogs are compiled"
  exit 0
else
  echo "❌ ERROR: Missing compiled i18n catalogs:"
  for file in "${MISSING_FILES[@]}"; do
    echo "   - $file"
  done
  echo ""
  echo "Run 'npm run i18n:compile' to fix this issue."
  exit 1
fi

