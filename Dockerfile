FROM node:18-alpine

WORKDIR /home/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

