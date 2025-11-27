const mongoose = require("mongoose");

const userModel = mongoose.Schema({
    email: String,
    password: String,
    teamname: String,
    phoneno: Number,

    teamCreated: {
        type: Boolean,
        default: false
    },

    taskSubmissions: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
});

module.exports = mongoose.model("users", userModel);