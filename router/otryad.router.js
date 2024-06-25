const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {
    createOtryad,
    getAllOtryad,
    deleteOtryad,
    updateOtryad
} = require('../controller/otryad.controller')

router.get('/get', protect, getAllOtryad)
router.post('/create', protect,  createOtryad)
router.delete('/delete/:id', protect, deleteOtryad)
router.put("/update/:id", protect, updateOtryad)

module.exports = router

