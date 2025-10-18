FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /frontend

COPY --chown=node:node package*.json ./
RUN npm install --omit=dev        # express 포함 설치

COPY --chown=node:node . .

USER node
EXPOSE 8000
CMD ["node", "app.js"]
