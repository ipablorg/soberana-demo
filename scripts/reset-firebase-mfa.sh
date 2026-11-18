#!/usr/bin/env bash
# Reset Firebase TOTP MFA for a user so they can re-scan the QR on next login.
# Requires: gcloud auth login (Identity Platform admin on the target project).
#
# Usage:
#   ./scripts/reset-firebase-mfa.sh pablo@loopay.com
#   ./scripts/reset-firebase-mfa.sh pablo@loopay.com soberana-v2-test

set -euo pipefail

EMAIL="${1:?Usage: $0 <email> [project-id]}"
PROJECT_ID="${2:-soberana-v2-test}"

if ! gcloud auth print-access-token &>/dev/null; then
  echo "Run: gcloud auth login"
  exit 1
fi

TOKEN="$(gcloud auth print-access-token)"

LOOKUP="$(curl -s -X POST \
  "https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:lookup" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Goog-User-Project: ${PROJECT_ID}" \
  -d "{\"email\":[\"${EMAIL}\"]}")"

FIREBASE_UID="$(python3 -c "import json,sys; d=json.load(sys.stdin); u=d.get('users') or []; print(u[0]['localId'] if u else '')" <<<"${LOOKUP}")"

if [[ -z "${FIREBASE_UID}" ]]; then
  echo "No Firebase user found for ${EMAIL} in project ${PROJECT_ID}"
  exit 1
fi

curl -s -X POST \
  "https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:update" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Goog-User-Project: ${PROJECT_ID}" \
  -d "{\"localId\":\"${FIREBASE_UID}\",\"mfa\":{\"enrollments\":[]}}" \
  | python3 -m json.tool

echo ""
echo "MFA cleared for ${EMAIL} (${FIREBASE_UID}) in ${PROJECT_ID}."
echo "Next sign-in will show the QR enrollment screen again."
