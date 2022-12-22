#!/usr/bin/bash

set -e

if which shellcheck > /dev/null; then
    # This bash script lints itself if shellcheck is installed
    shellcheck compile_and_run.sh
fi

ls node_modules > /dev/null || (echo "Installing NPM packages" && npm ci)

echo "Linting... (example_project)"
npx eslint src/*.ts

echo "Compiling... (example_project)"
tsc

echo "Creating upload folder..."
mkdir -p uploads

echo "Running..."
if which ufw &> /dev/null; then
    #PORT=$(( 1024 + RANDOM % (49152 - 1024) ))
    PORT=21096
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
node dist/example_project/src/host.js --port "${PORT}" --ip "${IP}"
echo "Node has exited."
if which ufw &> /dev/null; then
    echo "Closing port [${PORT}]..."
    sudo ufw delete allow "${PORT}/tcp"
fi
