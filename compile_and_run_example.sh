#!/usr/bin/bash

set -e

if which shellcheck > /dev/null; then
    # This bash script lints itself if shellcheck is installed
    shellcheck compile_and_run_example.sh
fi

(cd module && ./compile.sh)
(cd example_project && ./compile_and_run.sh)