const mongoose = require("mongoose");


mongoose.connect("mongodb://127.0.0.1:27017/RagistrationData")
.then((e)=>{
    console.log("Database is connected");
})
.catch((e)=>{
    console.log("Error occured", e);
});

