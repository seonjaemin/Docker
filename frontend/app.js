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

// ★ JSON과 urlencoded 둘 다 50MB로 상향
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

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

// ★ 글 등록 프록시 - JSON 그대로 전달
app.post('/messages', async (req, res) => {
  try {
    console.log('[Frontend Proxy] Received body keys:', Object.keys(req.body));
    console.log('[Frontend Proxy] Images length:', req.body.images?.length);
    
    // JSON으로 받았으면 JSON으로 그대로 전달
    await axios.post(`${API}/messages`, req.body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000, // 이미지 있을 수 있으니 타임아웃 늘림
      maxContentLength: 50 * 1024 * 1024,
      maxBodyLength: 50 * 1024 * 1024,
    });
    return res.json({ ok: true }); // JSON 응답으로 변경
  } catch (e) {
    console.error('POST /messages proxy failed:', e.response?.data || e.message);
    return res.status(502).json({ error: 'Failed to save message' });
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