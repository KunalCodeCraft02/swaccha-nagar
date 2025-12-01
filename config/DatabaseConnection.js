// const mongoose = require("mongoose");


// mongoose.connect("mongodb+srv://kunal:kunal1234@kunal.zq3ycoj.mongodb.net/SwatchBharatDB")
// .then((e)=>{
//     console.log("Database is connected");
// })
// .catch((e)=>{
//     console.log("Error occured", e);
// });

const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://kunal:kunal1234@kunal.zq3ycoj.mongodb.net/SwatchBharatDB")
.then(() => console.log("Database is connected"))
.catch((e) => console.log("Error occured", e));
