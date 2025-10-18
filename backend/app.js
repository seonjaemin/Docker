// backend/app.js
const express = require('express');
const path = require('path');
const Message = require('./routes/messages');
const indexRouter = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 8000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.json());

// 서버 시작 전에 **반드시 DB 연결 완료**
(async () => {
  try {
    const addr = process.env.GUESTBOOK_DB_ADDR || 'mongodb:27017';
    await Message.connectToMongoDB(addr, 'guestbook');
    console.log(`connected to mongodb://${addr}/guestbook`);

    // DB 연결된 후 라우터 장착
    app.use('/', indexRouter);

    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connect failed:', err);
    process.exit(1); // 초기화 실패 시 재시작되도록
  }
})();
