const express = require('express')
const path = require('path');
const app = express();
const bodyParser = require('body-parser')
const axios = require('axios')

const GUESTBOOK_API_ADDR = process.env.GUESTBOOK_API_ADDR

const BACKEND_URI = `http://${GUESTBOOK_API_ADDR}/messages`

app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))

const router = express.Router()

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json()) // JSON 파싱 추가

app.use(router)

// Application will fail if environment variables are not set
if(!process.env.PORT) {
  const errMsg = "PORT environment variable is not defined"
  console.error(errMsg)
  throw new Error(errMsg)
}

if(!process.env.GUESTBOOK_API_ADDR) {
  const errMsg = "GUESTBOOK_API_ADDR environment variable is not defined"
  console.error(errMsg)
  throw new Error(errMsg)
}

// Starts an http server on the $PORT environment variable
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

// Handles GET request to /
router.get("/", (req, res) => {
    res.render("home")
});

// GET /messages - 백엔드에서 메시지 목록 가져오기
router.get("/messages", (req, res) => {
    console.log(`Fetching messages from ${BACKEND_URI}`)
    axios.get(BACKEND_URI)
      .then(response => {
        console.log(`response from ${BACKEND_URI}: ` + response.status)
        res.json(response.data)
      }).catch(error => {
        console.error('error fetching messages: ' + error)
        res.status(500).json({ error: 'Failed to fetch messages' })
    })
});

// POST /messages - 백엔드로 메시지 전송
router.post('/messages', (req, res) => {
  console.log(`received request: ${req.method} ${req.url}`)
  console.log('Request body:', req.body)

  // validate request
  const writer = req.body.writer
  const title = req.body.title
  const date = req.body.date
  const category = req.body.category
  const content = req.body.content
  const solution = req.body.solution
  const images = req.body.images

  if (!writer || writer.length == 0) {
    res.status(400).json({ error: "writer is not specified" })
    return
  }

  if (!title || title.length == 0) {
    res.status(400).json({ error: "title is not specified" })
    return
  }
  
  if (!date || date.length == 0) {
    res.status(400).json({ error: "date is not specified" })
    return
  }

  if (!category || category.length == 0) {
    res.status(400).json({ error: "category is not specified" })
    return
  }

  // send the new message to the backend
  console.log(`posting to ${BACKEND_URI}`)
  axios.post(BACKEND_URI, {
    writer: writer,
    title: title,
    date: date,
    category: category,
    content: content || '',
    solution: solution || '',
    images: images || []
  }).then(response => {
      console.log(`response from ${BACKEND_URI}: ` + response.status)
      res.status(200).json({ success: true })
  }).catch(error => {
      console.error('error posting message: ' + error)
      if (error.response) {
        console.error('Error response:', error.response.data)
        res.status(error.response.status).json({ error: error.response.data })
      } else {
        res.status(500).json({ error: 'Failed to save message' })
      }
  })
});

module.exports = app;