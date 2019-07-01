#!/bin/sh
set -e

yarn install --no-cache

node --harmony cli.js productsworker
