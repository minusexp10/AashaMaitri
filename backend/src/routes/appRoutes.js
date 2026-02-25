const express = require('express')
const router = express.Router()
const {get_patient_from_phone, delete_patient, receiveOCR} = require('../controller/appControllers')
const { uploadController } = require('../controller/ML_AppControllers');

// Multer setup (MUST be here or in a separate middleware file)
const multer = require("multer");
const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage });

// router.get('/get_patients', auth, get_patients)
router.get('/get_patient_from_phone', get_patient_from_phone)
// router.post('/add_patient', auth, add_patients)
router.post('/delete_patient', delete_patient)
router.post('/upload', uploadMiddleware.array('report'), uploadController);
router.post('/receive_ocr', receiveOCR)

module.exports = router;