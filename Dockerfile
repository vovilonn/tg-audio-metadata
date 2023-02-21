FROM node:18-alpine

WORKDIR /home/app

RUN apk add ffmpeg 

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

CMD [ "yarn", "start:prod" ]


