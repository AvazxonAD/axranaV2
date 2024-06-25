const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Pasport = require('../models/pasport.model')
const Otryad = require('../models/otryad.model')
const Location = require('../models/location.model')
const Rank = require('../models/rank.model')
const xlsx = require('xlsx')
const fs = require('fs').promises
const path = require('path')
const User = require('../models/user.model')

// create new pasport danni 
exports.create = asyncHandler(async (req, res, next) => {
    const { workers } = req.body
    if (!workers || workers.length < 1) {
        return next(new ErrorResponse('sorovlar bosh qolishi mumkin emas', 403))
    }
    for (let worker of workers) {
        if (!worker.FIOlotin || !worker.FIOkril || !worker.selectRank || !worker.selectRankSumma || !worker.selectRegion || !worker.selectOtryad) {
            return next(new ErrorResponse('sorovlar bosh qolishi mumkin emas', 403))
        }
        const test = await Pasport.findOne({parent: req.user.id, FIOkril: worker.FIOkril, FIOlotin: worker.FIOlotin})
        if(test){
            return next(new ErrorResponse(`Bu xodim avval kiritilgan: ${test.FIOkril} ${test.FIOlotin}`, 403))
        }
    }
    const parent = await User.findById(req.user.id)
    if(!parent){
        return next(new ErrorResponse("server xatolik user topilmadi", 500))
    }
    for (let worker of workers) {
        await Pasport.create({
            FIOlotin: worker.FIOlotin,
            FIOkril: worker.FIOkril,
            selectRank: worker.selectRank,
            selectRankSumma: worker.selectRankSumma,
            selectRegion: worker.selectRegion,
            selectOtryad: worker.selectOtryad,
            parent: parent._id
        })
    }
    return res.status(201).json({
        success: true,
        data: "Kiritildi"
    })
})

// get all workers 
exports.getAllworker = asyncHandler(async (req, res, next) => {
    const workers = await Pasport.find({ parent: req.user.id })
    return res.status(200).json({
        success: true,
        data: workers
    })
})

// update worker 
exports.updateWorker = asyncHandler(async (req, res, next) => {
    const { FIOlotin, FIOkril, selectRank, selectRankSumma, selectRegion, selectOtryad } = req.body
    if (!FIOlotin || !FIOkril || !selectRank || !selectRankSumma || !selectRegion || !selectOtryad) {
        return next(new ErrorResponse('sorovlar bosh qolishi mumkin emas', 403))
    }
    const worker = await Pasport.findById(req.params.id)
    if(worker.FIOlotin !== FIOlotin && worker.FIOkril !== FIOkril){
        const test = await Pasport.findOne({parent: req.user.id,FIOkril, FIOlotin})
        if(test){
            return next(new ErrorResponse(`Bu xodim avval kiritilgan: ${test.FIOkril} ${test.FIOlotin}`, 403))
        }
    }
    const updateWorker = await Pasport.findByIdAndUpdate(req.params.id, {
        FIOlotin,
        FIOkril,
        selectRank,
        selectRankSumma,
        selectRegion,
        selectOtryad
    }, { new: true })
    return res.status(200).json({
        success: true,
        data: updateWorker
    })
})

// delete worker
exports.deleteWorker = asyncHandler(async (req, res, next) => {
    const worker = await Pasport.findByIdAndDelete(req.params.id)
    return res.status(200).json({
        success: true,
        data: "Delete"
    })
})

// for page 
exports.forPage = asyncHandler(async (req, res, next) => {
    const otryads = await Otryad.find({ parent: req.user.id })
    const ranks = await Rank.find({ parent: req.user.id })
    const locations = await Location.find({ parent: req.user.id })
    return res.status(200).json({
        success: true,
        otryads,
        ranks,
        locations
    })
})


// Excel faylini o'qish uchun handler
exports.createExcelData = asyncHandler(async (req, res, next) => {
    const filePath = path.resolve(__dirname, '..', req.file.path);
    await fs.access(filePath); 

    const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Birinchi qatorni sarlavha sifatida olish
        const jsonDataWithHeader = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        const headers = jsonDataWithHeader[0]; // Birinchi qator - sarlavhalar
        const dataRows = jsonDataWithHeader.slice(1); // Keyingi qatorlar - ma'lumotlar

        // Sarlavhalarni to'g'ri JavaScript obyektlariga o'zgartirish
        const jsObjects = dataRows.map(row => {
            let obj = {};
            row.forEach((value, index) => {
                obj[headers[index]] = value;
            });
            return obj;
        });
        for(let obj of jsObjects){
            const test = await Pasport.findOne({parent: req.user.id,FIOkril: obj.FIOkril})
            if(test){
                return next(new ErrorResponse(`Bu xodim avval kiritilgan excel filedagi ushbu malumotni togirlab qaytadan uring: ${test.FIOkril}`, 403))
            }
            const test2 = await Pasport.findOne({parent: req.user.id, FIOlotin: obj.FIOlotin})
            if(test2){
                return next(new ErrorResponse(`Bu xodim avval kiritilgan excel filedagi ushbu malumotni togirlab qaytadan uring: ${test.FIOlotin}`, 403))
            }
        }
        for(let obj of jsObjects){
            if(!obj.FIOlotin || !obj.FIOkril || !obj.unvon || !obj.summa || !obj.tuman || !obj.otryad){
                return next(new ErrorResponse("sorovlar bosh qolgan excel fileni tekshiring", 403))
            }
        }
         for(let obj of jsObjects){
            await Pasport.create({
                FIOlotin: obj.FIOlotin,
                FIOkril: obj.FIOkril,
                selectRank: obj.unvon,
                selectRankSumma: obj.summa,
                selectRegion: obj.tuman,
                selectOtryad: obj.otryad,
                parent: req.user.id
            })
        }
    res.status(200).json({
        success: true,
        data: "Kiritildi"
    });
})