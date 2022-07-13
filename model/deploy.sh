#!/usr/bin/env bash

rm ca_model.zip

ssh-add ~/.ssh/newkey.cer

zip -rq --symlinks ca_model.zip . -x '*.git*' -x './__pycache__/*'

scp ./ca_model.zip root@47.100.233.102:/root/deploy


ssh root@47.100.233.102 'rm -rf /root/model; unzip -o /root/deploy/ca_model.zip -d /root/model/; cd /root/model; sh build.sh'

