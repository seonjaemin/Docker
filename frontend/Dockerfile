FROM node:20-alpine
WORKDIR /frontend

# package*.json만 먼저 복사 → 의존성 설치
COPY package*.json ./
RUN npm ci --omit=dev   # (= prod만 설치)

# 앱 소스 복사
COPY . .

ENV PORT=8000
EXPOSE 8000
CMD ["node", "app.js"]
