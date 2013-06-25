#!/usr/bin/env bash

cd ../grapefruit &&
grunt build &&
cp build/gf.js ../isotest/js/vendor/gf.js