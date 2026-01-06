#!/bin/bash
set -euo pipefail

ROOT_DIR="$(pwd)"

PORTAL_PATH="$ROOT_DIR/packages/portal"
CUBE_PATH="$ROOT_DIR/packages/cube"
APPLICATION_PATH="$ROOT_DIR/packages/application"

echo "Installing portal..."
pip install -e "$PORTAL_PATH"

echo "Installing cube..."
pip install -e "$CUBE_PATH"

echo "Installing application..."
pip install -e "$APPLICATION_PATH"

echo "All done!"
