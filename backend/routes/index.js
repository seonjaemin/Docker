// backend/routes/index.js
const express = require('express');
const bodyParser = require('body-parser');
const Message = require('./messages');

const router = express.Router();
router.use(bodyParser.json({ limit: '50mb' }));

// GET /messages
router.get('/messages', async (req, res) => {
  console.log(`received request: ${req.method} ${req.url}`);
  let messages = [];

  try {
    // 결과가 undefined/null일 수 있으니 방어 + 정렬
    messages = await Message.messageModel
      .find({}, null, { sort: { _id: -1 } })
      .lean();

    if (!Array.isArray(messages)) messages = [];
    console.log(`Found ${messages.length} messages`);
  } catch (err) {
    console.error('Error fetching messages:', err);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }

  const list = messages.map((m) => ({
    id: m?._id?.toString?.() ?? '',
    writer: m?.writer ?? '',
    title: m?.title ?? '',
    date: m?.date ?? '',
    category: m?.category ?? '',
    content: m?.content ?? '',
    solution: m?.solution ?? '',
    images: Array.isArray(m?.images) ? m.images : [],
    timestamp: m?._id?.getTimestamp?.() ?? null,
  }));

  return res.status(200).json(list);
});

// POST /messages
router.post('/messages', async (req, res) => {
  console.log('Received POST data:', req.body);
  try {
    const result = await Message.create({
      writer: req.body.writer,
      title: req.body.title,
      date: req.body.date,
      category: req.body.category,
      content: req.body.content || '',
      solution: req.body.solution || '',
      images: Array.isArray(req.body.images) ? req.body.images : [],
    });
    console.log('Message created:', result._id);
    return res.status(200).json({ success: true, id: result._id });
  } catch (err) {
    console.error('Create message error:', err);
    const code = err?.name === 'ValidationError' ? 400 : 500;
    return res.status(code).json({ error: err.message || 'save failed' });
  }
});

module.exports = router;
