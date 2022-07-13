FROM node:16.13.0-alpine
USER root
WORKDIR /app
COPY . /app
EXPOSE 3000
RUN npm i --registry https://registry.npm.taobao.org/
CMD npm run build && npm run start
