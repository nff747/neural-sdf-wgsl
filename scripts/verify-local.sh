#!/usr/bin/env bash
# Local verification launcher for Neural Sdf WGSL
set -euo pipefail

echo "=========================================================="
echo " Running Local Verification for Neural Sdf WGSL"
echo "=========================================================="

if [ -f "tools/verify.mjs" ]; then
  node tools/verify.mjs
elif [ -d "tests" ]; then
  node --test tests/*.test.mjs
fi

echo "All tests verified successfully!"
