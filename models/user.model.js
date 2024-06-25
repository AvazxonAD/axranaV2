const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    adminStatus: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})



// JWT belgisini olish
userSchema.methods.jwtToken = function() {
    return jwt.sign({id: this._id, username: this.username, admin : this.adminStatus}, process.env.JWT_TOKEN_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};



module.exports = mongoose.model('User', userSchema)
