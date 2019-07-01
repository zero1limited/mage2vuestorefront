FROM node:10-alpine

ADD ./ /var/www

WORKDIR /var/www/src

COPY package.json /var/www/package.json

RUN apk add --no-cache --virtual .build-deps ca-certificates wget && \
    yarn install --no-cache && \
    apk del .build-deps

COPY docker/worker/entrypoint.sh /usr/local/bin/worker

CMD ["worker"]