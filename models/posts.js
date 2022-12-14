const mongoose = require('mongoose')
require('dotenv').config()

const chatSchema = new mongoose.Schema({
    userText: {
        type: String,
        required: [true, "must user text enter"]
    },
    image: {
        type: String,
        required: [true, "must image text enter"]
    },
    category: {
        type: String,
        required: [true, "must category text enter"]
    },
}, {
    timestamps: true,
});

const UserPost = mongoose.model("chatPost", chatSchema);

module.exports = UserPost;