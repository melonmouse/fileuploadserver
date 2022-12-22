#!/usr/bin/bash

set -e

if which shellcheck > /dev/null; then
    # This bash script lints itself if shellcheck is installed
    shellcheck compile_client.sh
fi

ls node_modules > /dev/null || (echo "Installing NPM packages" && npm ci)

echo "Linting... (client)"
npx eslint src/*.ts

#echo "Compiling... (client RELEASE MODE)"
#(cd src/client && npm run build)
echo "Compiling... (client DEBUG MODE)"
npm run debug
