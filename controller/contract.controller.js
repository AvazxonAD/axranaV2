const asyncHandler = require('../middleware/asyncHandler')
const ErrorResponse = require('../utils/errorResponse')
const Contract = require('../models/contract.model')
const Worker = require('../models/pasport.model')

// create conract 
exports.create = asyncHandler(async (req, res, next) => {
    const { contractDate, contractTurnOffDate, contractSumma, content, name, inn, address, accountNumber, bankName, workers, contractNumber, phone, boss } = req.body
    if (!contractDate || !contractTurnOffDate || !contractSumma || !content || !name || !inn || !address || !accountNumber || !bankName || !workers || workers.length < 1 || !contractNumber || !phone || !boss) {
        return next(new ErrorResponse('sorovlar bosh qolishi mumkin emas', 403))
    }
    if (req.query.query === 'ru') {
        for (let worker of workers) {
            const id = await Worker.findOne({ FIOkril: worker.worker }).select("_id")
            if(!id){
                return next(new ErrorResponse("server xatolik xodim topilmadi", 403))
            }
            worker.worker = id._id
        }
    }
    if(req.query.query === 'uz') {
        for (let worker of workers) {
            const id = await Worker.findOne({ FIOlotin: worker.worker }).select("_id")
            if(!id){
                return next(new ErrorResponse("server xatolik xodim topilmadi", 403))
            }
            worker.worker = id
        }
    }
    const newContract = await Contract.create({
        contractDate,
        contractTurnOffDate,
        contractSumma,
        content,
        name,
        inn,
        address,
        accountNumber,
        bankName,
        workers,
        contractNumber,
        phone,
        parent: req.user.id,
        boss
    })
    return res.status(200).json({
        success: true,
        data: newContract
    })
})

// get element by id 
exports.getById = asyncHandler(async (req, res, next) => {
    const contract = await Contract.findById(req.params.id).populate("workers.worker", "FIOlotin FIOkril")
    return res.status(200).json({
        success: true,
        data: contract
    })
})

// get all contract 
exports.getAllContract = asyncHandler(async (req, res, next) => {
    const contracts = await Contract.find({ parent: req.user.id }).populate("workers.worker", "FIOlotin FIOkril")
    return res.status(200).json({
        success: true,
        data: contracts
    })
})

// update contract
exports.update = asyncHandler(async (req, res, next) => {
    const { contractDate, contractTurnOffDate, contractSumma, content, name, inn, address, accountNumber, bankName, workers, contractNumber, phone } = req.body
    if (!contractDate || !contractTurnOffDate || !contractSumma || !content || !name || !inn || !address || !accountNumber || !bankName || !workers || workers.length < 1 || !contractNumber || !phone) {
        return next(new ErrorResponse('sorovlar bosh qolishi mumkin emas', 403))
    }
    for(let worker of workers){
        if(!worker.worker || !worker.dayOrHour || !worker.timeType){
            return next(new ErrorResponse('sorovlar bosh qolishi mumkin emas', 403))
        }
    }
    const updateContract = await Contract.findByIdAndUpdate(req.params.id, {
        contractDate: new Date(contractDate),
        contractTurnOffDate: new Date(contractTurnOffDate),
        contractSumma,
        content,
        name,
        inn,
        address,
        accountNumber,
        bankName,
        workers,
        contractNumber,
        phone
    }, { new: true })
    return res.status(200).json({
        success: true,
        data: updateContract
    })
})

// delete contract 
exports.deleteContract = asyncHandler(async (req, res, next) => {
    await Contract.findByIdAndDelete(req.params.id)
    return res.status(200).json({
        success: true,
        data: "Delete"
    })
})

// for page 
exports.forPage = asyncHandler(async (req, res, next) => {
    let workers = null
    if (req.query.query === "uz") {
        workers = await Worker.find({ parent: req.user.id }).select("-_id FIOlotin")
        return res.status(200).json({
            success: true,
            data: workers
        })
    }
    workers = await Worker.find({ parent: req.user.id }).select("-_id FIOkril")
    return res.status(200).json({
        success: true,
        data: workers
    })
})