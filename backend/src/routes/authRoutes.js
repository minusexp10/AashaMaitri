const express = require('express')
const router = express.Router()
const {signup, login, get_patients, add_patients} = require('../controller/authController')

// const {auth} = require('../middlewares/authMiddleware')

router.post('/signup' , signup)
router.post('/login', login)


module.exports = router;