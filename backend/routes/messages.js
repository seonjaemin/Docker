// routes/messages.js
// MongoDB 8 호환: Mongoose v8 사용 (내부 드라이버가 최신 프로토콜 사용)
const mongoose = require('mongoose');

function buildMongoUri() {
  // MONGODB_URI가 있으면 그대로 사용
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

  // 레거시 환경변수 호환: host:port 형태(GUESTBOOK_DB_ADDR) → DB명 명시
  const addr = process.env.GUESTBOOK_DB_ADDR || 'mongodb:27017';
  return `mongodb://${addr}/guestbook`;
}

const mongoURI = buildMongoUri();
const db = mongoose.connection;

// 로그 & 오류 핸들러
db.on('error', (err) => {
  console.error(`Unable to connect to ${mongoURI}:`, err);
});
db.on('disconnected', () => {
  console.error(`Disconnected from ${mongoURI}`);
});
db.once('open', () => {
  console.log(`Connected to ${mongoURI}`);
});

// MongoDB 8 + Mongoose v8 권장 옵션으로 접속
async function connectToMongoDB() {
  // mongoose v8: 예전 옵션(useNewUrlParser, useUnifiedTopology, reconnectTries 등) 제거
  // 타임아웃만 필요 시 설정
  await mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000, // 선택 (응답 지연 시 빨리 실패)
  });
}

// --- 스키마/모델 ---
// 7개 필드 모두 포함 (필수/기본값 지정)
const messageSchema = new mongoose.Schema(
  {
    writer: { type: String, required: [true, 'Writer is required'] },
    title: { type: String, required: [true, 'Title is required'] },
    date: { type: String, required: [true, 'Date is required'] },
    category: { type: String, required: [true, 'Category is required'] },
    content: { type: String, default: '' },
    solution: { type: String, default: '' },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

const messageModel = mongoose.model('Message', messageSchema);

// 전달받은 params로 문서 생성
function construct(params) {
  return new messageModel({
    writer: params.writer,
    title: params.title,
    date: params.date,
    category: params.category,
    content: params.content || '',
    solution: params.solution || '',
    images: Array.isArray(params.images) ? params.images : [],
  });
}

// 저장
async function save(message) {
  console.log('saving message...');
  await message.save(); // 실패시 throw
  console.log('message saved successfully');
}

// 생성 + 저장(검증 포함)
async function create(params) {
  const msg = construct(params);
  const validationError = msg.validateSync();
  if (validationError) {
    console.error('validation error:', validationError);
    throw validationError;
  }
  await save(msg);
  return msg;
}

module.exports = {
  create,
  messageModel,
  connectToMongoDB,
};
