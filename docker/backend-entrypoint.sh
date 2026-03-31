#!/bin/sh
set -eu

if [ -n "${START_FILE:-}" ]; then
  exec node "${START_FILE}"
fi

if [ -z "${APP_PATH:-}" ]; then
  echo "APP_PATH is required"
  exit 1
fi

APP_NAME="$(basename "${APP_PATH}")"
PRIMARY="${APP_PATH}/dist/main.js"
SECONDARY="${APP_PATH}/dist/apps/${APP_NAME}/src/main.js"

if [ -f "${PRIMARY}" ]; then
  exec node "${PRIMARY}"
fi

if [ -f "${SECONDARY}" ]; then
  exec node "${SECONDARY}"
fi

echo "No startup file found for ${APP_PATH}"
echo "Checked:"
echo "  - ${PRIMARY}"
echo "  - ${SECONDARY}"
exit 1

