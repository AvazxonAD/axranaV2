const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Worker = require('../models/pasport.model')
const Contract = require('../models/contract.model')
const xlsx = require('xlsx')
const path = require("path")
const fs = require("fs")

// result page 
exports.result = asyncHandler(async (req, res, next) => {
    const contracts = await Contract.find({
        parent: req.user.id,
    }).sort({ createdAt: 1 }).select("-_id -parent -createdAt -updatedAt -__v");

    const promises = contracts.map(async (contract) => {
        const result = [];
        for (let id of contract.workers) {
            let worker = null
            if (req.query.query === 'uz') {
                worker = await Worker.findById(id.worker).select("-_id -FIOkril")
            }
            if (req.query.query === 'ru') {
                worker = await Worker.findById(id.worker).select("-_id -FIOlotin")
            }
            let FIO = null
            if (!worker.FIOkril) {
                FIO = worker.FIOlotin
            }
            if (!worker.FIOlotin) {
                FIO = worker.FIOkril
            }
            result.push({
                FIO,
                unvon: worker.selectRank,
                tuman: worker.selectRegion,
                otryad: worker.selectOtryad,
                shartnoma_N: contract.contractNumber,
                shartnoma_sanasi: contract.contractDate.toISOString().split('T')[0],
                shartnoma_summasi: contract.contractSumma,
                shartnoma_mazmuni: contract.content,
                xizmat_muddati: id.dayOrHour + " " + id.timeType,
                korxona_nomi: contract.name,
                inn: contract.inn,
                manzil: contract.address,
                raxbar: contract.boss,
                telefon: contract.phone
            });
        }
        return result;
    });

    const allResults = await Promise.all(promises);

    const result = allResults.flat();

    res.status(200).json({
        success: true,
        data: result
    });
})

// filter data 
exports.filter = asyncHandler(async (req, res, next) => {
    let { date1, date2 } = req.body
    if (!date1 || !date2) {
        return next(new ErrorResponse('sorovlar bosh qolishi mumkin emas', 403))
    }
    date1 = new Date(date1)
    date2 = new Date(date2)
    if (isNaN(date1) || isNaN(date2)) {
        return next(new ErrorResponse("sana formati notogri", 403))
    }
    const contracts = await Contract.find({
        parent: req.user.id,
        contractDate: { $gte: date1, $lte: date2 }
    }).sort({ createdAt: 1 }).select("-_id -parent -createdAt -updatedAt -__v");

    const promises = contracts.map(async (contract) => {
        const result = [];
        for (let id of contract.workers) {
            let worker = null
            if (req.query.query === 'uz') {
                worker = await Worker.findById(id.worker).select("-_id -FIOkril")
            }
            if (req.query.query === 'ru') {
                worker = await Worker.findById(id.worker).select("-_id -FIOlotin")
            }
            let FIO = null
            if (!worker.FIOkril) {
                FIO = worker.FIOlotin
            }
            if (!worker.FIOlotin) {
                FIO = worker.FIOkril
            }
            result.push({
                FIO,
                unvon: worker.selectRank,
                tuman: worker.selectRegion,
                otryad: worker.selectOtryad,
                shartnoma_N: contract.contractNumber,
                shartnoma_sanasi: contract.contractDate.toISOString().split('T')[0],
                shartnoma_summasi: contract.contractSumma,
                shartnoma_mazmuni: contract.content,
                xizmat_muddati: id.dayOrHour + " " + id.timeType,
                korxona_nomi: contract.name,
                inn: contract.inn,
                manzil: contract.address,
                raxbar: contract.boss,
                telefon: contract.phone
            });
        }
        return result;
    });

    const allResults = await Promise.all(promises);

    const result = allResults.flat();

    res.status(200).json({
        success: true,
        data: result
    });
})

exports.excelCreate = asyncHandler(async (req, res) => {
    const { data } = req.body;
    const filePath = path.join(__dirname, '..', 'public', 'uploads');

    // Fayl katalogining mavjudligini tekshirish va kerak bo'lsa yaratish
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
    }

    const worksheet = xlsx.utils.json_to_sheet(data);

    worksheet['!cols'] = [
        { wch: 25 }, // FIO
        { wch: 20 }, // unvon
        { wch: 20 }, // tuman
        { wch: 20 }, // otryad
        { wch: 20 }, // shartnoma_N
        { wch: 25 }, // shartnoma_sanasi
        { wch: 20 }, // shartnoma_summasi
        { wch: 45 }, // shartnoma_mazmuni
        { wch: 20 }, // xizmat_muddati
        { wch: 25 }, // korxona_nomi
        { wch: 20 }, // inn
        { wch: 35 }, // manzil
        { wch: 25 }, // raxbar
        { wch: 20 }  // telefon
    ];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Ma\'lumotlar');
    
    // Fayl nomini generatsiya qilish
    const filename = Date.now() + "_data.xlsx";
    const outputPath = path.join(filePath, filename);

    try {
        // Faylni yozish
        xlsx.writeFile(workbook, outputPath);

        return res.download(outputPath, filename, (err) => {
            if (err) {
                console.error('Faylni yuklab olishda xatolik:', err);
                res.status(500).send('Faylni yuklab olishda xatolik yuz berdi');
            } else {
                console.log('Fayl muvaffaqiyatli yuklab olindi');
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Faylni yaratishda xatolik yuz berdi",
            error: err.message
        });
    }
});

