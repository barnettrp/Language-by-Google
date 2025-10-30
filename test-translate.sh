#!/bin/bash
# Test translation API

echo "Testing Cloud Translation API..."
curl -s -X POST "https://translation.googleapis.com/language/translate/v2?key=AIzaSyAI2uCr1goMuO7SIOgzgmi7-RU4_yLWhY4" \
  -H "Content-Type: application/json" \
  -d '{"q":"hello","source":"en","target":"es","format":"text"}' | jq '.'

echo -e "\n\nIf you see a translation of 'hello' to 'hola', it's working!"
echo "If you see an error about SERVICE_DISABLED, wait 1-2 minutes and try again."
