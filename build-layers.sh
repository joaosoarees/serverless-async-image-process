#!/bin/bash

function create_sharp_layer() {
  echo "Creating sharp directories started: $(date)."
  mkdir -p layers/sharp/nodejs
  echo "Creating sharp directories finished: $(date)."

  echo "Installing sharp dependencies started: $(date)."
  SHARP_VERSION=$(node -e "console.log(require('./package.json').dependencies.sharp)")
  cd layers/sharp/nodejs
  export NODE_ENV=production
  npm init -y
  npm i --cpu=arm64 --os=linux --libc=glibc sharp@$SHARP_VERSION
  rm -rf package.json package-lock.json
  echo "Installing sharp dependencies finished: $(date)."
}

echo "Cleaning the workspace started: $(date)."
rm -rf layers
echo "Cleaning the workspace finished: $(date)."

create_sharp_layer

echo "Layers successfully generated at: $(date)."
