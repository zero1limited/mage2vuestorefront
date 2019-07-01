#!/bin/sh
set -e

yarn install --no-cache

node --harmony webapi.js
