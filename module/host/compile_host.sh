#!/usr/bin/bash

set -e

if which shellcheck > /dev/null; then
    # This bash script lints itself if shellcheck is installed
    shellcheck compile_host.sh
fi

echo "Linting... (server)"
npx eslint src/*.ts

echo "Compiling... (server)"
tsc