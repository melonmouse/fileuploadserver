#!/usr/bin/bash

set -e

if which shellcheck > /dev/null; then
    # This bash script lints itself if shellcheck is installed
    shellcheck compile.sh
fi

echo "Building..."
(cd client && ./compile_client.sh)
(cd host && ./compile_host.sh)

exit 0