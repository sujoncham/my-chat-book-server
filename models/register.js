const mongoose = require('mongoose')
require('dotenv').config()

const registerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "must user text enter"],
    },
    email: {
        type: String,
        required: [true, "must user text enter"], 
        unique: [true, "this mail already exists"],
    },
    password: {
        type: String,
        required: [true, "must user text enter"],
        // minLength: [6, "not less than 6 characters"],
        // maxLength: [10, "not mone than 10 characters"],
    },
    confirmPass: {
        type: String,
        required: [true, "must user text enter"]
    },
});

const UserRegister = mongoose.model("register", registerSchema);

module.exports = UserRegister;