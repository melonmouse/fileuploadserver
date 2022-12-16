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

PORT=$(( 1024 + RANDOM % 49152 ))
echo "Opening port [${PORT}]..."
ufw allow "${PORT}/tcp"
echo "Running..."
node dist/host.js --port "${PORT}" --ip "0.0.0.0"
echo "Node has exited."
echo "Closing port [${PORT}]..."
ufw delete allow "${PORT}/tcp"