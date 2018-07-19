FROM node:8.11.3

WORKDIR /opt/app

COPY package*.json ./

RUN npm run heroku-prebuild

COPY . .

RUN npm run build

RUN npm run heroku-postbuild

EXPOSE 3000

ENV MONGODB_URI mongodb://mongo-rs0-1,mongo-rs0-2,mongo-rs0-3/test?replicaSet=rs0
ENV SECRET secret
ENV REDIS_PORT 6379
ENV REDIS_HOST cache
ENV OPEN true
ENV NODE_ENV production

RUN npm install

CMD [ "npm", "start" ]
