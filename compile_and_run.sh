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
cp src/fileuploadserver/*.js dist/fileuploadserver/

echo "Running..."
if which ufw &> /dev/null; then
    PORT=$(( 1024 + RANDOM % 49152 ))
    echo "Opening port [${PORT}]..."
    sudo ufw allow "${PORT}/tcp"
    echo "====== Ports open for TCP ======"
    sudo ufw status | grep "tcp"
    echo "================================"
    echo "Done! To close manually (after crash) run: #ufw delete allow "${PORT}/tcp""
    IP="0.0.0.0"
else
    echo "ufw not installed, running on localhost."
    PORT="3000"
    IP="localhost"
fi 

echo "Starting node..."
node dist/host.js --port "${PORT}" --ip "${IP}"
echo "Node has exited."
if which ufw &> /dev/null; then
    echo "Closing port [${PORT}]..."
    sudo ufw delete allow "${PORT}/tcp"
fi
