#!/usr/bin/env bash
version=1.0
service=acamera_ui

docker rm $(docker stop $(docker ps -a -q --filter ancestor=$service:$version --format="{{.ID}}"))

docker build -f Dockerfile -t $service:$version .

docker run -it -d -p 3000:3000 -v acamera-vol:/data/images $service:$version
