#!/usr/bin/bash

# TODO: switch to https://github.com/microsoft/TypeScript-Node-Starter

set -e

if which shellcheck > /dev/null; then
    # This bash script lints itself if shellcheck is installed
    shellcheck compile_and_run.sh
fi

echo "Linting..."
npx eslint src/*.ts
#npx eslint src/fileuploadserver/*.ts

echo "Compiling..."
tsc
cp src/*.html dist/
mkdir -p dist/fileuploadserver
cp src/fileuploadserver/*.html dist/fileuploadserver/

echo "Running..."
node dist/host.js