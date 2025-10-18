const express = require('express');
const bodyParser = require('body-parser');
const Message = require('./messages');

const router = express.Router();
router.use(bodyParser.json());

// Handles GET requests to /messages
router.get('/messages', async (req, res) => {
  console.log(`received request: ${req.method} ${req.url}`);

  let messages = [];
  try {
    // messageModel.find() 결과를 정렬해 가져오고, 배열이 아니면 빈 배열로 처리
    messages = await Message.messageModel.find({}, null, { sort: { _id: -1 } }).lean();
    if (!Array.isArray(messages)) {
      messages = [];
    }
    console.log(`Found ${messages.length} messages`);
  } catch (error) {
    // 쿼리 실패 시 500 반환
    console.error('Error fetching messages:', error);
    return res.status(500).json({ error: error.message, details: 'Failed to fetch messages' });
  }

  // 응답 데이터 가공
  const list = [];
  messages.forEach((message) => {
    list.push({
      id: message._id.toString(),
      writer: message.writer,
      title: message.title,
      date: message.date,
      category: message.category,
      content: message.content,
      solution: message.solution,
      images: Array.isArray(message.images) ? message.images : [],
      timestamp: message._id.getTimestamp(),
    });
  });

  console.log(`Returning ${list.length} messages`);
  res.status(200).json(list);
});

// Handles POST requests to /messages
router.post('/messages', async (req, res) => {
  console.log('Received POST data:', req.body);
  try {
    // 유효성 검사를 포함한 메시지 생성
    const result = await Message.create({
      writer: req.body.writer,
      title: req.body.title,
      date: req.body.date,
      category: req.body.category,
      content: req.body.content || '',
      solution: req.body.solution || '',
      images: Array.isArray(req.body.images) ? req.body.images : [],
    });
    console.log('Message created successfully:', result._id);
    res.status(200).json({ success: true, id: result._id });
  } catch (err) {
    // ValidationError와 기타 오류를 구분해 처리
    if (err.name === 'ValidationError') {
      console.error('validation error:', err);
      res.status(400).json({ error: err.message });
    } else {
      console.error('could not save:', err);
      res.status(500).json({ error: err.message });
    }
  }
});

module.exports = router;
