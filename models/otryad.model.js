const mongoose = require('mongoose')

const otryadSchema = new  mongoose.Schema({
    name: {
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

module.exports = mongoose.model('Otryad', otryadSchema)
