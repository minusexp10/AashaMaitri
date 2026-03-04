const express = require('express');
const router = express.Router();
const { signup, login, get_patients, add_patient, upload_patient, receive_risk, high_risk} = require('../controller/authController');
const { auth, upload } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);

// Protected
router.get('/get_patients', auth, get_patients);
router.post('/add_patient', auth, add_patient);
router.post('/upload_patient', upload, upload_patient);
router.post("/receive_risk",upload, receive_risk)
router.get('/high_risk', auth, high_risk)

module.exports = router;