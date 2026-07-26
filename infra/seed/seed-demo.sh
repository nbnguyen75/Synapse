#!/bin/bash
set -e

AUTH_URL="http://localhost:8000/api/auth"

echo "Creating demo account..."
curl -s -X POST "$AUTH_URL/sign-up/email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@synapse.dev",
    "password": "Demo@12345",
    "name": "Demo User"
  }'

echo "Done. Login with demo@synapse.dev / Demo@12345"