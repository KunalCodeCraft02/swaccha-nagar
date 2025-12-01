const mongoose = require("mongoose");

const userModel = mongoose.Schema({
    email: String,
    password: String,
    teamname: String,
    phoneno: Number,

    // Optional city for leaderboard display
    city: {
        type: String,
        default: ""
    },

    // Optional track type (Solo / Team) for leaderboard
    trackType: {
        type: String,
        enum: ["Solo", "Team"],
        default: "Team"
    },

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