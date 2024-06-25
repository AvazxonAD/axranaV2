const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {createWorker, login, update, getLogin, getProfile} = require('../controller/auth.controller')

router.post('/create', protect, createWorker)
router.post('/login', login)
router.get("/login/for", getLogin)
router.put('/update',protect, update)
router.get('/get', protect, getProfile)

module.exports = router
