FROM node:7
WORKDIR /data
ADD package.json /data/package.json
RUN npm install
ADD . /data
