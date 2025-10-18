# backend/Dockerfile
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /backend
COPY package*.json ./
RUN npm install           # --omit=dev 옵션 제거
COPY . .
USER node
EXPOSE 8000
CMD ["node", "app.js"]
