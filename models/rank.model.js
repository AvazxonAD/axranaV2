const mongoose = require('mongoose')

const rankSchema = new  mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    summa: {
        type: Number,
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, 
{timestamps: true}
)

module.exports = mongoose.model('Rank', rankSchema)