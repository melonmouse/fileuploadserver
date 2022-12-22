#!/usr/bin/bash

set -e

if which shellcheck > /dev/null; then
    # This bash script lints itself if shellcheck is installed
    shellcheck clean.sh
fi

echo "Deleting build folders"
ls ../example_project/dist > /dev/null && rm -r ../example_project/dist
echo ""

echo "Deleting node install folders"
ls ../example_project/node_modules > /dev/null && rm -r ../example_project/node_modules
echo ""

echo "Contents of uploads folder:"
ls -lht uploads
echo ""

echo "Size of uploads folder:"
du -hd 0 uploads
echo ""

echo "Number of uploads:"
find uploads/* | wc -l
echo ""

echo "Please manualy delete uploads if needed."

exit 0