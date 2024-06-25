const asyncHandler = require('../middleware/asyncHandler')
const ErrorResponse = require('../utils/errorResponse')
const Location = require('../models/location.model')

// create location
exports.createLocation = asyncHandler(async (req, res, next) => {
    const {locations} = req.body
    if(!locations || locations.length < 1){
        return next(new ErrorResponse('Sorovlar bosh qolishi mumkin emas', 403))
    }
    for(let location of locations){
        if(!location.name){
            return next(new ErrorResponse('Sorovlar bosh qolmasligi kerak', 403))
        }
        const test = await Location.findOne({name : location.name.trim(), parent : req.user.id})
        if(test){
            return next(new ErrorResponse(`Bu rayon avval kiritilgan : ${test.name}`, 403))
        }
    }
    for(let location of locations){
        const now = new Date();
        // Hozirgi yil, oy va kunni olish
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Oylarda 0 dan boshlanganligi uchun 1 qo'shamiz
        const day = String(now.getDate()).padStart(2, '0');
        const createDate = `${year}-${month}-${day}`;

        const newLocation = await Location.create({
            name : location.name,
            parent : req.user.id,
            date : createDate
        })
    }
    return res.status(200).json({success: true, data: "Kiritildi"})
})

//get all location 
exports.getAllLocation = asyncHandler(async (req, res, next) => {
    const locations = await Location.find({parent : req.user.id}).sort({name : 1})
    return res.status(200).json({success : true, data : locations})
})

// delete locations 
exports.deleteLocation = asyncHandler(async (req, res, next) => {
    await Location.findByIdAndDelete(req.params.id)
    
    return res.status(200).json({success : true, data : "Delete"})
})

// update location 
exports.updateLocation = asyncHandler(async (req, res, next) => {
    if(!req.body.name){
        return next(new ErrorResponse('sorovlar bosh qolmasligi kerak', 403))
    }
    const location = await Location.findById(req.params.id)
    if(location.name !== req.body.name.trim()){
        const test = await Location.findOne({name: req.body.name, parent: req.user.id})
        if(test){
            return next(new ErrorResponse(`bu rayon oldin kiritilgan boshqa nomdan foydalaning : ${test.name}`))
        }
    }
    const updateLocation = await Location.findByIdAndUpdate(req.params.id, {
        name : req.body.name || location.name
    }, {new : true})
    return res.status(200).json({success : true, data : updateLocation})
})