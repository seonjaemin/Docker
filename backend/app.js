// app.js
const express = require('express');
const app = express();
const routes = require('./routes');
const PORT = process.env.PORT || 8000;

// Mongo 라우트/연결 유틸
const messages = require('./routes/messages');

// 바디 파서 (POST JSON 받기)
app.use(express.json());

// 기본 라우트
app.use('/', routes);

// 환경변수 점검: MONGODB_URI 우선, 없으면 GUESTBOOK_DB_ADDR(host:port)
if (!process.env.MONGODB_URI && !process.env.GUESTBOOK_DB_ADDR) {
  const errMsg =
    'MongoDB 접속 정보가 없습니다. MONGODB_URI 또는 GUESTBOOK_DB_ADDR 둘 중 하나를 설정하세요.';
  console.error(errMsg);
  throw new Error(errMsg);
}

// Mongo 연결 후 서버 시작 (MongoDB 8 호환)
messages
  .connectToMongoDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`App listening on port ${PORT}`);
      console.log('Press Ctrl+C to quit.');
    });
  })
  .catch((err) => {
    console.error('Mongo connect failed:', err);
    process.exit(1);
  });

module.exports = app;
