#!/usr/bin/bash

set -e

if which shellcheck > /dev/null; then
    # This bash script lints itself if shellcheck is installed
    shellcheck clean.sh
fi

echo "Deleting build folders"
ls ../module/client/dist > /dev/null && rm -r ../module/client/dist
ls ../module/host/dist > /dev/null && rm -r ../module/host/dist

echo "Deleting node install folders"
ls ../module/client/node_modules > /dev/null && rm -r ../module/client/node_modules
ls ../module/client/node_modules > /dev/null && rm -r ../module/host/node_modules
