#!/bin/bash
# Este script usa gcloud para habilitar Identity Platform MFA y TOTP en el proyecto de producción (automations-466716)

PROJECT_ID="automations-466716"

echo "Verificando que estás autenticado en Google Cloud..."
if ! gcloud auth print-access-token &> /dev/null; then
    echo "❌ No estás autenticado. Por favor, corre 'gcloud auth login' primero."
    exit 1
fi

echo "Configurando proyecto activo a $PROJECT_ID..."
gcloud config set project $PROJECT_ID

echo "Habilitando Identity Platform y TOTP MFA para $PROJECT_ID..."

curl -X PATCH "https://identitytoolkit.googleapis.com/admin/v2/projects/$PROJECT_ID/config?updateMask=mfa" \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "Content-Type: application/json" \
    -H "X-Goog-User-Project: $PROJECT_ID" \
    -d '{
        "mfa": {
          "state": "ENABLED",
          "providerConfigs": [{
            "state": "ENABLED",
            "totpProviderConfig": {
              "adjacentIntervals": 5
            }
          }]
       }
    }'

echo ""
echo "✅ Si el JSON anterior muestra '\"state\": \"ENABLED\"' debajo de '\"mfa\":', entonces quedó configurado correctamente."
