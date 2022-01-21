#!/bin/bash

# work dir
work_dir=$(realpath .)

export https_proxy=http://fwdproxy:8080

# npm version
version=$(node --version)
rgx='v([0-9]+)'
[[ $version =~ $rgx ]]
version="${BASH_REMATCH[1]}"
if [ "$version" -lt 16 ]; then
  echo "Error: Minimum version required for nodejs is: >=16.x"
  exit 1
fi

# install deps
cd $work_dir/client
npm install
npm run build
cd $work_dir/server
npm install
npm start

