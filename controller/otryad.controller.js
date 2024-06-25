const asyncHandler = require('../middleware/asyncHandler')
const ErrorResponse = require('../utils/errorResponse')
const Otryad= require('../models/otryad.model')

// create otryad
exports.createOtryad = asyncHandler(async (req, res, next) => {
    const {otryads} = req.body
    if(!otryads || otryads.length < 1){
        return next(new ErrorResponse('Sorovlar bosh qolishi mumkin emas', 403))
    }
    for(let otryad of otryads){
        if(!otryad.name){
            return next(new ErrorResponse('Sorovlar bosh qolmasligi kerak', 403))
        }
        const test = await Otryad.findOne({name : otryad.name.trim(), parent : req.user.id})
        if(test){
            return next(new ErrorResponse(`Bu rayon avval kiritilgan : ${test.name}`, 403))
        }
    }
    for(let otryad of otryads){

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Oylarda 0 dan boshlanganligi uchun 1 qo'shamiz
        const day = String(now.getDate()).padStart(2, '0');
        const createDate = `${year}-${month}-${day}`;

        const newOtryad = await Otryad.create({
            name : otryad.name,
            parent : req.user.id,
            date : createDate
        })
    }
    return res.status(200).json({success: true, data: "Kiritildi"})
})

//get all otryad 
exports.getAllOtryad = asyncHandler(async (req, res, next) => {
    const otryads = await Otryad.find({parent : req.user.id}).sort({name : 1})

    return res.status(200).json({success : true, data : otryads})
})

// delete otryad 
exports.deleteOtryad = asyncHandler(async (req, res, next) => {
    await Otryad.findByIdAndDelete(req.params.id)
    
    return res.status(200).json({success : true, data : "Delete"})
})

// update otryad 
exports.updateOtryad = asyncHandler(async (req, res, next) => {
    if(!req.body.name){
        return next(new ErrorResponse('sorovlar bosh qolmasligi kerak', 403))
    }
    const otryad = await Otryad.findById(req.params.id)
    if(otryad.name !== req.body.name.trim()){
        const test = await Otryad.findOne({name: req.body.name, parent: req.user.id})
        if(test){
            return next(new ErrorResponse(`bu rayon oldin kiritilgan boshqa nomdan foydalaning : ${test.name}`))
        }
    }
    const updateOtryad = await Otryad.findByIdAndUpdate(req.params.id, {
        name : req.body.name || otryad.name
    }, {new : true})
    return res.status(200).json({success : true, data : updateOtryad})
})