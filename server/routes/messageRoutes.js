const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

router.get('/', requireAuth, messageController.listConversations);
router.get('/:id/messages', requireAuth, messageController.getMessages);

module.exports = router;
