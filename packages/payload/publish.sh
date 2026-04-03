#!/bin/bash
# Publish @marckrieger/payload to npm
# Temporarily renames the package, publishes, then restores the original name
set -e

cd "$(dirname "$0")"

# Verify dist exists
if [ ! -f "dist/index.js" ]; then
  echo "Error: dist/ not built. Run 'pnpm -w run build:core' from the monorepo root first."
  exit 1
fi

# Temporarily rename for publishing
sed -i 's/"name": "payload"/"name": "@marckrieger\/payload"/' package.json

# Publish
npm publish --access public

# Restore original name
sed -i 's/"name": "@marckrieger\/payload"/"name": "payload"/' package.json

echo "Published successfully. Restored package.json."
