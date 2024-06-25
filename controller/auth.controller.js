const asyncHandler = require('../middleware/asyncHandler.js')
const ErrorResponse = require('../utils/errorResponse.js')
const User = require('../models/user.model.js')

// for login page 
exports.getLogin = asyncHandler(async (req, res, next) => {
    const usernames = await User.find().select("username -_id").sort({createdAt : 1})
    return res.status(200).json({success : true, data : usernames})
})

//create worker  
exports.createWorker = asyncHandler(async (req, res, next) => {
    if(!req.user.admin){
        return next(new ErrorResponse('Siz uchun bu funksiya ruhsat berilmagan '))
    }
    const parent = await User.findById(req.user.id)

    const {username, password} = req.body
    if(!username || !password){
        return next(new ErrorResponse('Sorovlar bosh qolishi mumkin emas', 403))
    }
    const test = await User.findOne({username : username.trim()})
    if(test){
        return next(new ErrorResponse(`Bu nomga ega ishchi  bor iltimos boshqa nomdan foydalaning : ${username}`,403 ))
    }
    //if(password.length < 6){
    //    return next(new ErrorResponse('Password belgilari 6 tadan kam bolmasligi kerak'))
    //}
    const newUser = await User.create({username, password})

    return res.status(200).json({success : true, data : newUser})
})

// login 
exports.login = asyncHandler(async (req, res, next) => {
    const {username, password} = req.body
    if(!username || !password){
        return next(new ErrorResponse("Sorovlar bosh qolmasligi kerak", 403))
    }
    const user = await User.findOne({username : username.trim()})
    if(!user){
        return next(new ErrorResponse('Username yoki password hato kiritildi', 403))
    }
    if(user){
        if(!user.password === password.trim()){
            return next(new ErrorResponse('Username yoki password hato kiritildi', 403))
        }
    }
    const token = user.jwtToken()
    return res.status(200).json({success : true, data : user, token})
})

// // update password 
exports.update = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    if(!user){
        return next(new ErrorResponse("server xatolik", 500))
    }
    const {oldPassword, newPassword, username} = req.body
    if(!oldPassword || !newPassword, !username){
        return next(new ErrorResponse('Sorovlar bosh qolmasligi kerak', 403))
    }
    if(user.username !== username){
        const test = await User.findOne({username: username.trim()})
        if(test){
            return next(new ErrorResponse(`Bu usernamega ega user bor iltimos boshqa nomdan foydalaning: ${test.username}`, 403))
        }
    }
    if(user.password !== oldPassword){
        return next(new ErrorResponse('Password xato kiritildi', 403))
    }
    // if(newPassword.length < 6 ){
    //     return next(new ErrorResponse('Yangi password belgilar soni 6 tadan kam bolmasligi kerak',403))
    // }
    user.password = newPassword
    user.username = username
    await user.save()
    return res.status(200).json({success : true, data : user})
})

// get profile 
exports.getProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    if(user.adminStatus){
        const users = await User.find({adminStatus: false})
        return res.status(200).json({
            success: true,
            data: user,
            users
        })
    }
    return res.status(200).json({success: true, data: user})
})