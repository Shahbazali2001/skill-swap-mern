const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const matchController = require('../controllers/matchController');

router.get('/', requireAuth, matchController.getMatches);

module.exports = router;
