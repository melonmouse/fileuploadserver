#!/usr/bin/bash

set -e

if which shellcheck > /dev/null; then
    # This bash script lints itself if shellcheck is installed
    shellcheck compile_and_run.sh
fi


echo "Deleting build folders"
ls ../module/client/dist && rm -r ../module/client/dist
ls ../module/host/dist && rm -r ../module/host/dist

echo "Deleting node install folders"
rm -r ../module/client/node_modules
rm -r ../module/host/node_modules

echo "Reinstalling client node modules"
(cd client && npm ci)

echo "Reinstalling host node modules"
(cd host && npm ci)


echo "Please delete the uploads folder manually if needed."