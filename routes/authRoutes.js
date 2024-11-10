const express = require('express');
const { registerUser, authUser } = require('../controllers/authController');
const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', authUser);

module.exports = router;
