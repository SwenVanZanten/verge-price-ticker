FROM node:8.11
WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/package.json
COPY ./yarn.lock /usr/src/app/yarn.lock
RUN yarn

COPY . .
EXPOSE 3003
