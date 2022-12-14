const mongoose = require('mongoose')
require('dotenv').config()


function connectDB (){
    try {
        mongoose.connect(process.env.DATABASE_URL);
        console.log('DB Connected')
    } catch (error) {
        console.log("DB not Connected");
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDB;

