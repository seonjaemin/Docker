FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /backend

COPY --chown=node:node package*.json ./
RUN npm install --omit=dev

COPY --chown=node:node . .

USER node
EXPOSE 8000
CMD ["node", "app.js"]
