FROM node:8.11.3

WORKDIR /opt/app

COPY package*.json ./

RUN npm install --silent

COPY . .

RUN npm run build

RUN find src/ -maxdepth 6 -name \"*.js\" -type f -delete && cp -rfv build/src/ ./

ENV MONGODB_URI mongodb://mongo-rs0-1,mongo-rs0-2,mongo-rs0-3/test?replicaSet=rs0
ENV SECRET secret
ENV REDIS_PORT 6379
ENV REDIS_HOST cache
ENV OPEN true
ENV NODE_ENV production

CMD [ "npm", "start" ]
