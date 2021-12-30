FROM node:16

RUN mkdir -p /home/app
WORKDIR /home/app
COPY . /home/app

RUN npm install
RUN npm run build

RUN apt-get update && apt-get install -y bash
RUN npm run db:client:generate

CMD [ "npm", "start" ]
