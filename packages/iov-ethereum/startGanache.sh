#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

function startupGanache() {
  # shellcheck disable=SC2009
  GANACHE_SEARCH=$(ps -ef | grep "[g]anache" || true)
  GANACHE_PID=$(echo "${GANACHE_SEARCH}" | awk '{print $2}')
  if [ "$GANACHE_PID" != "" ]
  then
    echo "Killing existing Ganache CLI process $GANACHE_PID"
    kill -9 "$GANACHE_PID"
  fi
  ./node_modules/.bin/ganache-cli -p 7545 -i 5777 -m "$GANACHE_MNEMONIC" > /dev/null &
  GANACHE_PID=$!
  echo "Started new Ganache CLI as process $GANACHE_PID"
}

startupGanache
