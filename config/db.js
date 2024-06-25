const mongoose = require('mongoose')

const connectDB = async  () => {
    try {
        const connecting = await mongoose.connect(process.env.MONGO_URI)
        console.log(`mogodb connect to :  ${connecting.connection.host}`.bgBlue)
    } catch (error) {
        console.error(`MongoDB ga ulanishda xato yuz berdi: ${error.message}`.red);
    }
}

module.exports = connectDB