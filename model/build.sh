#!/usr/bin/env bash
version=1.0
service=ca_model

set -e

docker build -f Dockerfile -t $service:$version .

docker run -it -d -p 3001:3001 -v acamera-vol:/storage  $service:$version