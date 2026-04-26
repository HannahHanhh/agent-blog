#!/usr/bin/env bash
# Usage: ./scripts/set-password.sh
# Generates SHA-256 hash of your password and updates interviews.js

set -e

echo -n "Enter your interview password: "
read -s PASSWORD
echo

HASH=$(echo -n "$PASSWORD" | shasum -a 256 | awk '{print $1}')
echo "Generated hash: $HASH"

JS_FILE="assets/js/interviews.js"
sed -i.bak "s|REPLACE_WITH_YOUR_SHA256_HASH|$HASH|g" "$JS_FILE"
rm -f "${JS_FILE}.bak"

echo "✓ Password hash written to $JS_FILE"
echo "✓ Commit and push to deploy."
