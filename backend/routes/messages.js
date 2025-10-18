// backend/routes/messages.js
const mongoose = require('mongoose');

let messageModel; // 연결 후 할당

const messageSchema = new mongoose.Schema({
  writer:   { type: String, required: true },
  title:    { type: String, required: true },
  date:     { type: String, required: true },
  category: { type: String, default: '' },
  content:  { type: String, default: '' },
  solution: { type: String, default: '' },
  images:   { type: [String], default: [] },
}, { versionKey: false });

async function connectToMongoDB(hostPort, dbName) {
  const mongoURI = `mongodb://${hostPort}/${dbName}`;

  // 이미 연결돼 있으면 재사용
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 이벤트 핸들러: **절대 throw 하지 말 것**
  mongoose.connection.on('connected', () => {
    console.log(`connected to ${mongoURI}`);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn(`disconnected from ${mongoURI} (will keep retrying)`);
  });
  mongoose.connection.on('error', (err) => {
    console.error('mongoose connection error:', err);
  });

  // 연결 시도 (Mongoose v6+는 자동 재연결)
  await mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 10000,
    heartbeatFrequencyMS: 10000,
  });

  // 모델 바인딩
  messageModel = mongoose.models.Message || mongoose.model('Message', messageSchema);
  return mongoose.connection;
}

async function create(doc) {
  if (!messageModel) throw new Error('messageModel not initialized');
  return messageModel.create(doc);
}

module.exports = {
  connectToMongoDB,
  // messageModel 접근 시 초기화 여부 검사
  messageModel: new Proxy({}, {
    get(_, prop) {
      if (!messageModel) throw new Error('messageModel not initialized');
      return messageModel[prop];
    }
  }),
  create,
};
