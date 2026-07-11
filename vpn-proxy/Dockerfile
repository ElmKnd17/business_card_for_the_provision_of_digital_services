# syntax=docker/dockerfile:1

FROM node:22-alpine

RUN apk add --no-cache ca-certificates curl unzip \
  && curl -fL https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip -o /tmp/xray.zip \
  && unzip /tmp/xray.zip -d /tmp/xray \
  && install -m 0755 /tmp/xray/xray /usr/local/bin/xray \
  && rm -rf /tmp/xray /tmp/xray.zip

WORKDIR /app

COPY package.json ./
COPY entrypoint.js ./

EXPOSE 1080

CMD ["npm", "start"]
