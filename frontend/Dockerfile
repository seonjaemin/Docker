FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /frontend

COPY --chown=node:node package*.json ./
RUN npm install

COPY --chown=node:node . .

USER node
EXPOSE 8000
CMD ["node", "app.js"]
