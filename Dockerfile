FROM node:10-alpine

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn
RUN yarn add serve

COPY . .

EXPOSE 5000

RUN yarn build

CMD [ "yarn", "serve", "-s", "build" ]
