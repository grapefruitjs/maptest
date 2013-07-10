#!/usr/bin/env bash

cd ../grapefruit &&
grunt build &&
cp build/gf.js ../maptest/js/vendor/gf.js