const express = require('express')
const router = express.Router()
const {get_patients, get_patient_from_phone, add_patients, delete_patient} = require('../controller/appControllers')

router.get('/get_patients', get_patients)
router.get('/get_patient_from_phone', get_patient_from_phone)
router.post('/add_patient', add_patients)
router.post('/delete_patient', delete_patient)

module.exports = router;