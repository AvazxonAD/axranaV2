const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {
    create,
    getById,
    getAllContract,
    update,
    deleteContract,
    forPage
} = require('../controller/contract.controller')

router.post('/create', protect,  create)
router.get('/get/:id', protect, getById)
router.get("/get", protect, getAllContract)
router.put('/update/:id', protect, update)
router.delete("/delete/:id", protect, deleteContract)
router.get('/for/page', protect, forPage)

module.exports = router

