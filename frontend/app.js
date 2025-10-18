// frontend/app.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// docker-compose: GUESTBOOK_API_ADDR=http://backend:8000  (http:// 꼭!)
const RAW_API = process.env.GUESTBOOK_API_ADDR || 'http://backend:8000';
const API = RAW_API.startsWith('http') ? RAW_API : `http://${RAW_API}`;

// pug 사용 중이면 그대로 동작
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ------- 중요: 프록시 라우트들 (catch-all 보다 '위에') -------

// 목록 JSON 프록시 (브라우저가 fetch('/messages') 호출)
app.get('/messages', async (req, res) => {
  try {
    const r = await axios.get(`${API}/messages`, { timeout: 5000 });
    return res.json(r.data);
  } catch (e) {
    console.error('GET /messages proxy failed:', e.response?.data || e.message);
    return res.status(502).json([]); // JSON 보장
  }
});

// 글 등록 프록시 (폼 제출)
app.post('/messages', async (req, res) => {
  try {
    const params = new URLSearchParams(req.body); // urlencoded 그대로 전달
    await axios.post(`${API}/messages`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 5000,
    });
    return res.redirect('/'); // 등록 후 홈으로 (클라이언트 스크립트가 다시 /messages 를 GET)
  } catch (e) {
    console.error('POST /messages proxy failed:', e.response?.data || e.message);
    return res.status(502).send('Failed to save message');
  }
});

// (선택) 서버 렌더 홈 - 템플릿이 서버에서 목록을 바로 쓰는 경우 대비
app.get('/', async (_req, res) => {
  try {
    const r = await axios.get(`${API}/messages`, { timeout: 5000 });
    return res.render('home', { items: r.data, messages: r.data, posts: r.data, list: r.data });
  } catch (e) {
    return res.render('home', { items: [], messages: [], posts: [], list: [] });
  }
});

// -------------------------------------------------------------

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend listening on ${PORT}, proxy -> ${API}`);
});
