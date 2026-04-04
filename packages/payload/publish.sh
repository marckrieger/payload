#!/bin/bash
# Publish @marckrieger/payload to npm
# Temporarily rewrites package.json for publishing, then restores it
set -e

cd "$(dirname "$0")"

# Verify dist exists
if [ ! -f "dist/index.js" ]; then
  echo "Error: dist/ not built. Run 'pnpm run build' from packages/payload first."
  exit 1
fi

# Backup original
cp package.json package.json.bak

# Use node to rewrite package.json for publishing:
# - Rename to @marckrieger/payload
# - Keep version at 3.81.0 to match other @payloadcms/* packages
# - Apply publishConfig.exports over exports
# - Apply publishConfig.main and publishConfig.types
# - Remove workspace:* devDependencies
# - Remove publishConfig (no longer needed in published version)
node -e "
const pkg = require('./package.json');
pkg.name = '@marckrieger/payloadcms';
pkg.version = '3.81.0';
if (pkg.publishConfig) {
  if (pkg.publishConfig.exports) pkg.exports = pkg.publishConfig.exports;
  if (pkg.publishConfig.main) pkg.main = pkg.publishConfig.main;
  if (pkg.publishConfig.types) pkg.types = pkg.publishConfig.types;
}
delete pkg.publishConfig;
// Remove workspace: devDependencies
if (pkg.devDependencies) {
  for (const [k, v] of Object.entries(pkg.devDependencies)) {
    if (typeof v === 'string' && v.includes('workspace:')) {
      delete pkg.devDependencies[k];
    }
  }
}
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

echo "Publishing @marckrieger/payloadcms@3.81.0..."
npm publish --access public

# Restore original
mv package.json.bak package.json

echo "Published successfully. Restored package.json."
