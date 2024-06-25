const {Router} = require('express')
const router = Router()

const {protect} = require('../middleware/auth')

const {
    create,
    getAllworker,
    updateWorker,
    deleteWorker,
    forPage,
    createExcelData
} = require('../controller/pasport.controller')

const upload = require('../utils/upload')

router.post('/create', protect, create)
router.get('/get', protect, getAllworker)
router.put('/update/:id', protect, updateWorker)
router.delete("/delete/:id", protect, deleteWorker)
router.get('/for/page', protect, forPage)
router.post('/create/excel', protect,  upload.single('file'), createExcelData)

module.exports = router

