const express = require('express');
const { registerUser, loginUser, getCurrentUser, toggleFollowCreator } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.post('/follow/:creatorId', protect, toggleFollowCreator);

module.exports = router;
