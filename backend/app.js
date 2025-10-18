// backend/app.js
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 8000;

// MongoDB 8 호환 최신 드라이버 방식
const DB_NAME = process.env.MONGO_DB_NAME || 'guestbook';
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://mongodb:27017/?directConnection=true&appName=guestbook';

// 파서
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 목록
app.get('/messages', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const items = await db
      .collection('messages')
      .find({})
      .sort({ _id: -1 })
      .toArray();
    return res.json(items);
  } catch (e) {
    console.error('GET /messages error:', e);
    return res.status(500).send('Failed to load');
  }
});

// 등록
app.post('/messages', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const payload = {
      writer: req.body.writer || '',
      title: req.body.title || '',
      date: req.body.date || new Date().toISOString().slice(0, 10),
      category: req.body.category || '',
      content: req.body.content || '',
      solution: req.body.solution || '',
      images: Array.isArray(req.body.images) ? req.body.images : [],
      createdAt: new Date(),
    };
    const r = await db.collection('messages').insertOne(payload);
    console.log('saved message id =', r.insertedId);
    return res.status(201).json({ ok: true, id: r.insertedId });
  } catch (e) {
    console.error('POST /messages save error:', e);
    return res.status(500).send('Failed to save message');
  }
});

// Mongo 연결 성공 후에만 listen (초기 실패 시 재시작으로 복구)
(async () => {
  try {
    const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    const db = client.db(DB_NAME);
    await db.command({ ping: 1 });
    console.log(`Connected to ${MONGO_URI} (${DB_NAME})`);
    app.locals.db = db;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`App listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Mongo connect failed:', err);
    process.exit(1);
  }
})();
