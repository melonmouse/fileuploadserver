#!/usr/bin/bash

set -e

if which shellcheck > /dev/null; then
    # This bash script lints itself if shellcheck is installed
    shellcheck install.sh
fi

echo "This script will (re)install all NPM packages."

echo "Cleaning up module..."
(cd module && ./clean.sh)

echo "Installing NPM packages for the first time (client)..."
(cd module/client && npm install)
echo "Installing NPM packages for the first time (host)..."
(cd module/host && npm install)

echo "Cleaning up example project..."
(cd example_project && ./clean.sh)

echo "Installing NPM packages for the first time (example_project)..."
(cd example_project && npm install)

echo "Installation done!"
echo "Run ./compile_and_run_example.sh to compile and run the example project."

exit 0