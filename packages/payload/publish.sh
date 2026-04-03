#!/bin/bash
# Publish @marckrieger/payload to npm
# Temporarily renames the package, removes workspace refs, publishes, then restores
set -e

cd "$(dirname "$0")"

# Verify dist exists
if [ ! -f "dist/index.js" ]; then
  echo "Error: dist/ not built. Run 'pnpm install && pnpm -w run build:core' from the monorepo root first."
  exit 1
fi

# Backup original
cp package.json package.json.bak

# Rename for publishing
sed -i 's/"name": "payload"/"name": "@marckrieger\/payload"/' package.json

# Remove workspace:* devDependencies (not needed at runtime)
sed -i '/"@payloadcms\/eslint-config": "workspace:\*"/d' package.json

# Publish
npm publish --access public

# Restore original
mv package.json.bak package.json

echo "Published successfully. Restored package.json."
