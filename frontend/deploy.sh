rm ./acamera_ui.zip

ssh-add ~/.ssh/newkey.cer

zip -rq --symlinks acamera_ui.zip . -x '*.git*' -x './node_modules/*' -x './.next/*'

scp ./acamera_ui.zip root@47.100.233.102:/root/deploy

ssh root@47.100.233.102 'rm -rf /root/ui; unzip -o /root/deploy/acamera_ui.zip -d /root/ui/; cd /root/ui; sh build.sh'

