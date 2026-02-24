const express = require('express');
const router = express.Router();
const { signup, login, get_patients, add_patient } = require('../controller/authController');
const { auth } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);

// Protected
router.get('/get_patients', auth, get_patients);
router.post('/add_patient', auth, add_patient);

module.exports = router;