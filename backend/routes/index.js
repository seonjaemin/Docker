const express = require('express');
const bodyParser = require('body-parser');
const Message = require('./messages')

const router = express.Router();
router.use(bodyParser.json());

// Handles GET requests to /messages
router.get('/messages', async (req, res) => {
    console.log(`received request: ${req.method} ${req.url}`)

    try {
        // async/await 방식으로 변경
        const messages = await Message.messageModel.find({}).sort({ '_id': -1 }).lean().exec()
        console.log(`Found ${messages.length} messages`)
        
        let list = []
        if (messages && messages.length > 0) {
            messages.forEach((message) => {
                list.push({
                    'id': message._id.toString(),
                    'writer': message.writer,
                    'title': message.title,
                    'date': message.date,
                    'category': message.category,
                    'content': message.content,
                    'solution': message.solution,
                    'images': message.images || [],
                    'timestamp': message._id.getTimestamp()
                })
            });
        }
        
        console.log(`Returning ${list.length} messages`)
        res.status(200).json(list)
    } catch (error) {
        console.error('Error fetching messages:', error)
        res.status(500).json({ error: error.message, details: 'Failed to fetch messages' })
    }
});

// Handles POST requests to /messages
router.post('/messages', async (req, res) => {
    console.log('Received POST data:', req.body)
    try {
        const result = await Message.create({
            writer: req.body.writer,
            title: req.body.title,
            date: req.body.date,
            category: req.body.category,
            content: req.body.content || '',
            solution: req.body.solution || '',
            images: req.body.images || []
        })
        console.log('Message created successfully:', result._id)
        res.status(200).json({ success: true, id: result._id })
    } catch (err) {
        if (err.name == "ValidationError") {
            console.error('validation error: ' + err)
            res.status(400).json({ error: err.message })
        } else {
            console.error('could not save: ' + err)
            res.status(500).json({ error: err.message })
        }
    }
});

module.exports = router;