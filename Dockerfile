FROM node:10-alpine

RUN mkdir -p /home/samaj64/Desktop/test_myshop/node_modules && chown -R node:node /home/samaj64/Desktop/test_myshop

RUN ["chmod", "+x", "/usr/local/bin/docker-entrypoint.sh"]

WORKDIR /home/samaj64/Desktop/test_myshop

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 3000

CMD [ "node", "app.js" ]