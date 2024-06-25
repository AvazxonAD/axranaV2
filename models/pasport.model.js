const mongoose = require('mongoose')

const pasportSchema = new  mongoose.Schema({
    FIOlotin: {
        type: String,
        required: true
    },
    FIOkril: {
        type: String,
        required: true
    },
    selectRank: {
        type: String,
        required: true
    },
    selectRankSumma: {
        type: Number,
        required: true
    },
    selectRegion: {
        type: String,
        required: true
    },
    selectOtryad: {
        type: String,
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, 
{timestamps: true}
)

module.exports = mongoose.model('Pasport', pasportSchema)
