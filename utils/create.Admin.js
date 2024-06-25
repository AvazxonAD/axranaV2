const User = require('../models/user.model')

async function createAdmin(){
    const test = await User.findOne({adminStatus: true})
    if(!test){
        await User.create({
            username: "Respublika", 
            password: '123', 
            adminStatus: true
        })
        return;
    }
    return;
}

module.exports = createAdmin
